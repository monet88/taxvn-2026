# Domain Pitfalls

**Domain:** Vietnamese personal income tax calculator — React Native mobile + Node.js backend
**Researched:** 2026-03-31
**Confidence:** HIGH (critical pitfalls verified via official docs and multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

---

### Pitfall 1: Calculation Divergence Between Mobile and Backend

**What goes wrong:** The existing `src/lib/` calculators are ported to both the React Native client and the Node.js backend independently. Over time the two copies drift — a constant gets updated in one place but not the other, a rounding step is added on the backend but missed in the mobile preview. Users see different totals depending on which path executes.

**Why it happens:** Without a single authoritative source for calculation logic, duplicated modules diverge on every law change. The current codebase already has this problem: `IncomeSummaryDashboard` uses `[5%, 10%, 15%, 20%, 25%]` while `taxCalculator.ts` uses `[5%, 10%, 20%, 30%, 35%]`. Porting rather than sharing amplifies this.

**Consequences:** Users lose trust in the app's accuracy. For a tax compliance tool this is fatal. The bug documented in CONCERNS.md (wrong 2026 brackets in `incomeSummaryCalculator.ts`) would be multiplied across two runtimes instead of one.

**Prevention:**
- **Do not copy `src/lib/` to both client and backend.** Extract the 40+ calculator modules into a single shared `@taxvn/calculator` package (workspace package in a monorepo) consumed by both the React Native app and the Node.js backend.
- The backend is the authoritative compute engine. The mobile app sends inputs, the backend returns results. Mobile only formats and displays.
- If any offline/preview calculations are needed on mobile, they must import the same shared package — not a parallel copy.

**Warning signs:**
- Two separate copies of `taxCalculator.ts` exist in the repo
- Backend and mobile calculator outputs diverge in testing
- Law constants (`NEW_DEDUCTIONS`, `OLD_TAX_BRACKETS`) appear in more than one package

**Phase mapping:** Must be resolved in the initial architecture phase before any calculator port begins.

---

### Pitfall 2: Floating-Point Precision Errors in Tax Calculations

**What goes wrong:** JavaScript's IEEE 754 floats cannot represent many VND amounts exactly. The existing codebase does arithmetic like `grossIncome * 0.08` (BHXH) in native JS Number. On a single calculation the error is imperceptible; across iterative binary-search gross/net conversion (currently 50+ iterations), the accumulated error causes the mobile result to differ from the web result by 1–5 VND, or occasionally by thousands on large salaries.

**Why it happens:** The web version coincidentally runs in a desktop V8 environment where float errors rarely surface in displayed output. Mobile JS engines (Hermes) use the same IEEE 754 standard but the error can manifest differently when the binary search halts at a different iteration.

**Consequences:** The PROJECT.md constraint "results must match 100% with web" is violated. The gross/net binary search that currently converges in `grossNetCalculator.ts` may oscillate between two values and never converge in Hermes.

**Prevention:**
- Audit the binary search in `grossNetCalculator.ts` for the convergence threshold. Use an explicit epsilon guard (e.g., `Math.abs(result - target) < 1`) rather than exact equality.
- For all VND arithmetic that feeds final displayed results, round to the nearest integer VND before display (VND has no subunit).
- Consider `Decimal.js` or integer-VND arithmetic for the gross/net binary search specifically — this is the highest-risk iterative path.
- Add unit tests for binary search convergence across the income range 0–500M VND before migrating.

**Warning signs:**
- Binary search result differs by ≥1 VND between Node.js and React Native Hermes
- `calculateGrossFromNet` returns inconsistent results when called multiple times with the same input
- `Math.abs(net - result) > epsilon` loop runs more than 100 iterations

**Phase mapping:** Address in the calculator extraction/shared package phase. Add convergence tests before the Node.js API layer is built.

---

### Pitfall 3: Monolithic State Architecture Ported Directly to Mobile

**What goes wrong:** The web's single 1,147-line `page.tsx` with 22 `useState` declarations is ported as-is to React Native — either as a single screen or split naively into tabs. On mobile, every keystroke in any calculator tab triggers re-renders across all 40+ `useMemo`/`useCallback` hooks. The JS thread drops frames. The keyboard input lags by 200–400ms. Users on mid-range Android devices abandon the app.

**Why it happens:** The CONCERNS.md already flags this as the highest-priority tech debt. Migrating to mobile without fixing it first transplants the performance problem into an environment with a weaker JS thread and no requestIdleCallback safety net.

**Consequences:** Laggy number input on a calculator app is catastrophic UX. The existing `handleGoHome` brittle reset and the 22-item dependency array in `currentSnapshot` useMemo become even harder to maintain with 40+ tabs.

**Prevention:**
- Redesign state before porting, not after. Replace the monolithic `useState` block with per-tab isolated state slices.
- Recommended pattern: Zustand store with one slice per calculator tab. Only the active tab's slice is subscribed by the visible screen. Inactive tabs do not re-render.
- The `handleGoHome` reset becomes `store.reset()` — a single action with compile-time safety.
- Apply `React.memo` to every calculator screen component so inactive tabs in a tab navigator never re-render on another tab's state change.

**Warning signs:**
- Any component file with more than 5 `useState` calls managing cross-tab state
- The `currentSnapshot` pattern (serializing all tab states on each keystroke) is carried over to mobile
- `console.time` shows >16ms per keystroke in any input handler

**Phase mapping:** State architecture redesign must precede UI development. Budget a full phase for this refactor.

---

### Pitfall 4: snapshotCodec / lz-string URL Sharing Has No Direct Mobile Equivalent

**What goes wrong:** The current URL sharing relies on lz-string compression of the full snapshot into a query parameter (`?s=<compressed>`). Mobile apps do not have browser URLs. The team builds a deep link scheme (`taxvn://share?s=<compressed>`) and discovers that:
1. URL length limits on iOS Universal Links truncate large snapshots
2. The `KEY_MAP` flat namespace (already documented as fragile in CONCERNS.md) causes silent corruption when accessed from a different codec version
3. QR codes generated from long compressed strings are too dense to scan reliably on low-end phones

**Why it happens:** The codec was designed for web URLs without mobile constraints. The CONCERNS.md already flags zero test coverage for roundtrip encoding and the KEY_MAP collision risk.

**Consequences:** Shared links break silently. Users report "wrong values when opening a shared link." The team wastes weeks debugging codec edge cases under mobile URL constraints.

**Prevention:**
- Replace URL-encoded snapshots with server-side share tokens. POST the snapshot to the backend, receive a short 8-character token, share `https://taxvn.app/share/ABC12345`. The backend reconstructs state on deep link open.
- This eliminates URL length limits, makes sharing work before the recipient has the app installed (falls back to web), and makes codec changes safe (server always has the canonical serializer).
- Before migration, write the roundtrip unit tests for `snapshotCodec.ts` that CONCERNS.md flags as missing. These tests will define the contract for the server-side equivalent.

**Warning signs:**
- lz-string compressed strings exceed 2,000 characters for `salaryComparison` or `monthlyPlanner` tabs
- Deep links fail on iOS when the query string exceeds the Universal Link limit
- QR codes generated from long snapshots fail to scan on a budget Android device

**Phase mapping:** Share token API is a backend Phase 1 deliverable. Codec migration plan must be drafted before URL sharing is built on mobile.

---

### Pitfall 5: PDF Generation — html2canvas/jsPDF Do Not Work on React Native

**What goes wrong:** The existing `PDFExportButton.tsx` and `SalarySlipPDF.tsx` use `html2canvas` + `jsPDF` — a DOM-screenshot approach that captures rendered HTML as a canvas image and embeds it in a PDF. React Native has no DOM. `html2canvas` requires `document`, `window`, and `canvas` APIs that do not exist in Hermes or the React Native bridge. Calling these on mobile crashes with `ReferenceError: document is not defined`.

**Why it happens:** Web developers assume "it's just JavaScript" — but html2canvas walks the DOM tree, which only exists in a browser.

**Consequences:** The PDF export feature (currently prominent in the web UI) is completely broken on the first mobile build. Replacing it requires rebuilding the PDF layout from scratch using mobile-compatible primitives.

**Prevention:**
- Use `@react-pdf/renderer` for structured PDF generation (tax breakdowns, salary slips) — it uses its own layout engine with no DOM dependency.
- For simpler HTML-to-PDF needs, use `expo-print` which renders an HTML string on-device via a native WebView print pipeline.
- Plan for a **full rewrite** of all PDF templates using `@react-pdf/renderer` `<View>`, `<Text>`, and `<Page>` primitives. Existing component markup cannot be reused.
- Budget 2–3 days per PDF template for this rewrite.

**Warning signs:**
- `import html2canvas from 'html2canvas'` or `import jsPDF from 'jspdf'` appearing in any React Native file
- PDF export feature deferred to "later" without an explicit replacement plan
- `document` or `window` references in any shared lib module

**Phase mapping:** PDF feature must be rebuilt in the mobile UI phase. Do not carry it over from the web implementation.

---

## Moderate Pitfalls

---

### Pitfall 6: Keyboard Covering Numeric Inputs on Android

**What goes wrong:** The app has 40+ calculator screens, each with multiple currency input fields. On Android, the software keyboard covers inputs at the bottom of the screen. With Expo SDK 53+, edge-to-edge display is enabled by default, and the previous `KeyboardAvoidingView` behavior (`adjustResize`) no longer works correctly — it causes black bars or the keyboard still covers submit buttons. Mid-range Android devices from some manufacturers do not expose the keyboard height API at all, so `KeyboardAvoidingView` falls back to zero adjustment.

**Why it happens:** The web had no keyboard — inputs were always fully visible. Android keyboard handling is notoriously inconsistent across OEMs.

**Consequences:** Users cannot see the input or confirm button while typing amounts. Currency inputs in the middle of a form scroll out of view and cannot be reached. This is tested last and discovered after the main UI is complete, requiring rework of every calculator screen.

**Prevention:**
- Use `react-native-keyboard-controller` instead of the built-in `KeyboardAvoidingView`. It provides cross-platform consistency with far fewer OEM edge cases.
- Wrap all calculator screens in `KeyboardAwareScrollView` from `react-native-keyboard-aware-scroll-view` so inputs scroll into view on focus.
- Set `softwareKeyboardLayoutMode: "resize"` in `app.json` for Expo SDK 53+ Android compatibility.
- Test on a real Android device (not emulator) from multiple screen sizes early in development. Mid-range 6-inch Android devices in Vietnam (the target market) are the most common failure case.

**Warning signs:**
- `KeyboardAvoidingView` with `behavior="height"` on Android
- Submit/calculate buttons below the last input field
- No real-device Android testing until late in the project

**Phase mapping:** Address in the UI component library phase before building any calculator screens.

---

### Pitfall 7: Push Notification Token Staleness and iOS Permission Refusal

**What goes wrong:** Tax deadline notifications are implemented with push tokens stored in the database at registration. Six months later, 30–40% of tokens are stale (users uninstalled and reinstalled, OS rolled the token). Deadline notifications silently fail for these users. On iOS, the push permission prompt is shown at first launch without explanation — users deny it, and there is no second chance to ask.

**Why it happens:** Mobile push tokens are not permanent. iOS requires explicit user consent with a single native prompt; if refused, the app can never ask again via the OS (only via a custom in-app prompt leading to Settings).

**Consequences:** The core "tax deadline reminder" value proposition fails silently for a large fraction of users.

**Prevention:**
- Register a token refresh listener (`addPushTokenListener`) on app startup to detect and re-upload rolled tokens immediately.
- Show a custom in-app explanation screen ("We'll remind you before March 31 tax deadline — want to enable notifications?") before triggering the native OS permission prompt.
- Store permission state in the backend; if a user's token returns a `DeviceNotRegistered` error from APNs/FCM, mark it invalid and prompt again in-app.
- For tax deadlines specifically, use **scheduled local notifications** in addition to server push. Local notifications do not require a server round-trip and work even if the backend push delivery fails.

**Warning signs:**
- Push tokens stored once at registration with no refresh mechanism
- Native permission prompt appears on first app open with no context
- No fallback for users who denied push permission

**Phase mapping:** Notification architecture decisions belong in the backend API phase. Local notification fallback belongs in the mobile feature phase.

---

### Pitfall 8: AsyncStorage Is Not a Drop-in Replacement for localStorage

**What goes wrong:** The existing `snapshotStorage.ts` uses synchronous `localStorage.getItem/setItem` with a `JSON.parse` migration path. On mobile, AsyncStorage is asynchronous. A direct port where the async calls are not awaited causes the app to render with undefined state on first load, then silently overwrite the user's saved history with empty defaults a few hundred milliseconds later.

**Why it happens:** Web developers assume storage is synchronous. The async/await wrapper is forgotten in the migration because the code "seems to work" on first test (the async write wins the race by luck).

**Consequences:** User's saved calculation history is silently deleted on app upgrade. The `MAX_SAVES = 50` cap and quota-exceeded edge cases (currently unhandled per CONCERNS.md) become even more dangerous when the storage call is fire-and-forget.

**Prevention:**
- All storage calls must be `async/await` with explicit error handling wrapping.
- Consider `react-native-mmkv` as a synchronous alternative to AsyncStorage for frequently accessed preferences. MMKV is 10–30x faster and supports synchronous reads.
- For calculation history (the equivalent of the current `localStorage` save list), migrate to the backend database on first authenticated launch. Do not rely on device storage as the authoritative store.
- Wrap all storage operations in try/catch and surface quota-exceeded errors to the user (this was already flagged as missing in CONCERNS.md).

**Warning signs:**
- Any storage read without `await`
- `JSON.parse(AsyncStorage.getItem(key))` without awaiting the result
- History that appears on first render then disappears on re-render

**Phase mapping:** Storage migration strategy must be defined in the backend API phase before any history feature is implemented.

---

### Pitfall 9: Calculator Library Importing Node.js or Browser-Only APIs

**What goes wrong:** The `src/lib/` modules are intended as pure TypeScript, but some may have accumulated implicit dependencies on browser globals (`window`, `document`, `localStorage`) or Node.js built-ins (`Buffer`, `process`). When the shared `@taxvn/calculator` package is imported by the React Native app, Metro bundler throws at runtime for any non-Hermes-compatible import.

**Why it happens:** "Pure TypeScript" libraries in a Next.js project can quietly depend on browser globals because `'use client'` components make them available. The dependency is invisible until the code runs in a different runtime.

**Consequences:** Calculator modules that "worked in the browser" silently break on mobile. The team discovers this late because unit tests run in Node.js (not Hermes).

**Prevention:**
- Before extracting `src/lib/` into a shared package, run a systematic audit: `grep -r 'window\|document\|localStorage\|sessionStorage\|navigator\|location' src/lib/` and resolve every hit.
- Write unit tests for every calculator that run in both Node.js and the React Native test environment (Jest with Hermes preset).
- The `snapshotCodec.ts` use of `lz-string`'s `compressToEncodedURIComponent` must be checked — lz-string has browser-specific and Node.js-specific entry points.

**Warning signs:**
- Any `window.*` or `document.*` usage in `src/lib/`
- `lz-string` imported without verifying which bundle entry point is used
- Tests pass in Jest (Node.js) but the feature crashes at runtime on device

**Phase mapping:** Audit and fix during shared package extraction. Run Metro bundler on the extracted package before committing to the architecture.

---

### Pitfall 10: Inactive Tab Re-renders Stalling the JS Thread

**What goes wrong:** The app implements a bottom tab bar with categories of calculators. React Navigation renders all previously visited tab screens in memory. Any Zustand/Context state update (e.g., user changes shared `region` setting) triggers re-renders across all mounted tabs. With 10+ mounted calculator tabs, each with its own `useMemo` for calculation output, a single keystroke causes 10x the expected computation on the JS thread.

**Why it happens:** React Navigation's tab navigator keeps screens mounted by default for fast switching. The web had one page at a time; mobile has all visited tabs alive.

**Consequences:** The app becomes progressively slower as the user visits more tabs in a session. On mid-range devices, input response degrades to 200ms+ within 5 minutes of use.

**Prevention:**
- Apply `React.memo` to all calculator screen components.
- Use focus-aware rendering: only subscribe to state updates when the screen is focused. The `useFocusEffect` hook from React Navigation can be used to pause expensive subscriptions on blur.
- Enable `detachInactiveScreens` on tab navigators to unmount screens after they lose focus (trade-off: slower re-activation vs. continuous memory/CPU use).
- Use Zustand's selector pattern so each screen only re-renders when its own slice changes, not when any global state changes.

**Warning signs:**
- `useSelector` selecting the full global store rather than a specific slice
- No `React.memo` on any calculator screen
- Frame rate drops noticeably when more than 3 tabs have been visited

**Phase mapping:** Address during state architecture design, before building individual calculator screens.

---

## Minor Pitfalls

---

### Pitfall 11: Tailwind Class Strings Cannot Be Used in React Native

**What goes wrong:** The entire web codebase uses Tailwind CSS classes (`className="flex-1 py-2 text-primary-600"`). React Native uses a `StyleSheet` API (or NativeWind, which provides a Tailwind-like layer). Developers copy component markup from the web and expect classes to work — they don't. The `min-h-[44px]` touch targets and `primary-*` custom tokens must be rebuilt.

**Prevention:** Do not attempt to copy JSX from web components. Treat the mobile UI as a rewrite of the visual layer only. The business logic (calculations) is reused; the presentation layer is not. Use NativeWind v4 if Tailwind class syntax is strongly preferred by the team, but budget setup time for `tailwind.config.ts` port and native-specific utilities.

**Phase mapping:** Establish the component library and design tokens in Phase 1 of mobile UI before any calculator screen is built.

---

### Pitfall 12: isSecondHalf2026 Flag Inconsistency Will Surface in API Layer

**What goes wrong:** CONCERNS.md documents that `foreignerTaxCalculator.ts` deprecates `isSecondHalf2026` but `multiSourceIncomeCalculator.ts` still uses it to branch logic. When the Node.js API exposes these calculators, clients will receive inconsistent results for the same H1 2026 inputs depending on which endpoint they call.

**Prevention:** Resolve the `isSecondHalf2026` inconsistency across all calculator modules before exposing them as API endpoints. The correct behavior (new deductions apply for all of 2026 per the transitional clause) must be enforced uniformly. Add a regression test that asserts January 2026 and July 2026 return equivalent deduction amounts.

**Phase mapping:** Resolve during shared package extraction, before API layer is built.

---

### Pitfall 13: No Calculator Unit Tests Means No Regression Safety Net for the Migration

**What goes wrong:** CONCERNS.md confirms zero test files exist in `src/lib/`. The migration involves porting 18,757 lines of calculation logic to a new runtime, a new architecture, and a new API layer. Without a golden-output test suite, there is no way to verify that the mobile results match the web results. A changed constant in the shared package silently breaks every downstream consumer.

**Prevention:** Before the first line of mobile code is written, establish a golden-output test suite for the 10 most critical calculator functions: `calculateNewTax`, `calculateOldTax`, `calculateGrossFromNet`, `calculateNetFromGross`, `calculateBonus`, and at least 5 specialized calculators. Each test should assert exact VND outputs for a known set of inputs. This suite is the regression safety net for all future changes.

**Phase mapping:** This is a prerequisite for all other phases. Block the migration until at least the core tax and gross/net tests exist.

---

### Pitfall 14: Firebase Dynamic Links Is Deprecated — Do Not Use

**What goes wrong:** Teams building React Native apps in 2025/2026 reach for Firebase Dynamic Links as the solution for share links and deep links. Firebase Dynamic Links was officially deprecated in August 2025 and shut down. Any implementation using it will cease to function.

**Prevention:** Use Expo's built-in deep linking with Universal Links (iOS) and App Links (Android), or a service like Branch.io. For share link generation, the server-side token approach described in Pitfall 4 is the recommended alternative.

**Warning signs:** Any reference to `firebase-dynamic-links` or `@react-native-firebase/dynamic-links` in `package.json`.

**Phase mapping:** Architecture decision — document the chosen deep link strategy before building any share features.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Shared calculator package extraction | Browser/Node globals in `src/lib/`, diverging copies | Audit globals before extraction; enforce monorepo single-source |
| Backend API for calculators | Floating-point drift, `isSecondHalf2026` inconsistency | Unit test suite with golden outputs; resolve deprecated flags first |
| Mobile state architecture | Monolithic state port, inactive tab re-renders | Zustand per-tab slices; `React.memo`; establish patterns before screens |
| Mobile UI - calculator screens | Keyboard covering inputs, Tailwind class incompatibility | `react-native-keyboard-controller`; NativeWind or StyleSheet; real Android testing |
| URL sharing / deep links | lz-string URL limits, Firebase DLs deprecated | Server-side share tokens; Expo Universal Links |
| PDF export | html2canvas / jsPDF incompatible with RN | Full rewrite with `@react-pdf/renderer` or `expo-print` |
| Push notifications | Stale tokens, iOS permission refusal | Token refresh listener; in-app pre-prompt; local notification fallback |
| Data persistence / history | AsyncStorage async pitfalls, no encryption | MMKV for sync reads; backend as authoritative store; explicit error handling |

---

## Sources

- [React Native Migration from Web — AgileSoftLabs 2026](https://www.agilesoftlabs.com/blog/2026/03/react-native-new-architecture-migration)
- [Expo: From Web to Native with React](https://expo.dev/blog/from-web-to-native-with-react)
- [Sharing TypeScript Code Between Web and React Native — Atomic Object](https://spin.atomicobject.com/typescript-web-react-native/)
- [Dealing with Monetary Values in React Native — implementationDetails.dev](https://implementationdetails.dev/blog/2019/01/31/dealing-with-monetary-values-react-native/)
- [Calculation Handling in Financial Applications — Medium](https://medium.com/@muhebullah.diu/calculation-handling-in-a-financial-application-using-javascript-frontend-and-backend-examples-966628a87d1d)
- [Dinero.js — Store and Retrieve Precise Monetary Values — LogRocket](https://blog.logrocket.com/store-retrieve-precise-monetary-values-javascript-dinero-js/)
- [The State Management Trap Killing React Native Apps in 2025 — Medium](https://medium.com/@md.alishanali/the-state-management-trap-killing-your-react-native-apps-in-2025-69ef47a51e4f)
- [React Native State Management Tips & Pitfalls — TheOneTechnologies](https://theonetechnologies.com/blog/post/optimizing-state-management-in-react-native-pitfalls-and-best-practices)
- [React Native Navigation Performance (40+ screens) — November Five](https://novemberfive.co/blog/react-performance-navigation-animations)
- [Optimize Memory with react-native-screens — React Navigation 2.x](https://reactnavigation.org/docs/2.x/react-native-screens/)
- [PDF Generation for React Native in 2025 — APITemplate.io](https://apitemplate.io/blog/how-to-generate-pdfs-in-react-native-using-html-and-css/)
- [JS PDF Generation Libraries Comparison 2025](https://dmitriiboikov.com/posts/2025/01/pdf-generation-comarison/)
- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Push Notifications Troubleshooting — Expo](https://docs.expo.dev/push-notifications/faq/)
- [AsyncStorage Guide — LogRocket](https://blog.logrocket.com/guide-react-natives-asyncstorage/)
- [KeyboardAvoidingView — React Native Docs](https://reactnative.dev/docs/keyboardavoidingview)
- [Fixing KeyboardAvoidingView with Expo SDK 53 — Medium](https://medium.com/@gligor99/fixing-keyboardavoidingview-issues-on-android-with-expo-sdk-53-29626fa9d9ce)
- [Deep Linking in React Native 2026 — Smler](https://app.smler.io/blogs/deep-linking/react-native/deep-linking-in-react-native-complete-guide-2026)
- [react-native-native-lzstring — GitHub](https://github.com/swittk/react-native-native-lzstring)
- [Monorepo Setup for React Native — Callstack](https://www.callstack.com/blog/a-practical-guide-to-react-native-monorepo-with-yarn-workspaces)
- [Package Hoisting Conflicts in RN Monorepos — DEV Community](https://dev.to/pgomezec/setting-up-react-native-monorepo-with-yarn-workspaces-2025-a29)
- [React Native in 2026: Enterprise Choice — DEV Community](https://dev.to/amiryala/react-native-in-2026-should-your-enterprise-choose-it-part-1-243p)
