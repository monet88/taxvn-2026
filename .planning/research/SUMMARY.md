# Project Research Summary

**Project:** TaxVN Mobile — React Native + Node.js backend
**Domain:** Vietnamese personal income tax calculator (mobile-first, cross-platform)
**Researched:** 2026-03-31
**Confidence:** HIGH

## Executive Summary

TaxVN Mobile is a migration of a proven Next.js tax calculator (40+ tools, 18,757 lines of pure TypeScript logic) into a mobile-first React Native app with a supporting Node.js backend. The core strategic advantage of this project is already built: the existing `src/lib/` modules are zero-dependency pure TypeScript and can be extracted verbatim into a shared `@taxvn/tax-core` package consumed by both the backend API and — optionally — the mobile client. The recommended approach is a pnpm + Turborepo monorepo with three workspaces: `packages/tax-core` (the extracted logic), `apps/api` (Fastify + PostgreSQL), and `apps/mobile` (Expo SDK 55). Calculations are authoritative on the backend; the mobile app is a thin UI layer that sends inputs and displays results.

The dominant design decision is that the mobile app must NEVER perform tax calculations independently of the backend. Calculation correctness is a legal compliance requirement, and the existing codebase already contains documented constant drift between modules. A backend-authoritative model — where mobile calls the API and the API calls `tax-core` — guarantees bit-for-bit identical results across all surfaces and makes tax law updates a single-point change. The entire technology stack (Expo SDK 55, Fastify 5, Prisma 7, TanStack Query v5, Zustand 5) is current as of March 2026, with verified npm versions and official documentation backing each choice.

The key risks are execution risks, not architectural unknowns. The existing `src/lib/` codebase has zero tests, documented constant inconsistencies (`isSecondHalf2026` flag, wrong 2026 brackets in `incomeSummaryCalculator.ts`), and no convergence guards in the gross/net binary search. These pre-existing defects must be corrected and test-covered before any migration begins — otherwise, they are transplanted into a two-runtime architecture where they become harder to find and fix. Additionally, the web's monolithic 1,147-line `page.tsx` with 22 `useState` declarations must not be ported to mobile: it must be redesigned as isolated per-tab Zustand slices before any calculator UI is built.

---

## Key Findings

### Recommended Stack

The stack is a modern TypeScript-first monorepo on established, well-documented tools. Expo SDK 55 (React Native 0.83, New Architecture only) is the correct managed-workflow choice for iOS + Android without native module complexity. Fastify 5 over Express gives 2-3x JSON throughput advantage — meaningful for an app whose every interaction is a JSON tax computation. Prisma 7 (TypeScript engine, no binary) simplifies deployment. The entire stack avoids third-party auth providers in favor of DIY JWT + Google OAuth via `expo-auth-session`, which is the right call for a Vietnamese-market app where data residency simplicity matters.

**Core technologies:**
- **Expo SDK 55 + React Native 0.83:** Mobile runtime — New Architecture only, Managed Workflow eliminates native config complexity
- **Expo Router v5:** File-based navigation — maps naturally to the 40+ calculator tab structure, automatic deep linking
- **NativeWind v4.2.x:** Tailwind-compatible styling — team already knows Tailwind from the web app; v5 preview is not stable
- **Zustand 5:** UI state per domain slice — replaces the monolithic `useState` block; zero dependencies
- **TanStack Query v5:** Server state and API caching — React Native-native offline persistence via AsyncStorage persister
- **Fastify 5:** HTTP API framework — 2-3x Express throughput, TypeScript-first, built-in schema validation
- **Prisma 7:** Database ORM — strongest TypeScript types, no binary build step, Postgres-first
- **PostgreSQL 16:** Primary database — ACID guarantees for financial data; relational model fits fixed-schema tax history
- **tRPC v11:** API protocol — end-to-end type safety; `tax-core` types flow to mobile screens without code generation
- **Turborepo + pnpm workspaces:** Monorepo tooling — official Expo reference implementation uses this combination

### Expected Features

The 40+ calculators are the product — the auth, history, and push notification features are the stated milestone additions. Most tools exist as pure logic in `src/lib/`; the port effort is mechanical but large. The primary competitor (eTax Mobile, 12M+ users) is a filing tool, not a calculator. TaxVN's differentiator is calculation depth, not filing capability.

**Must have (table stakes):**
- All 40+ calculator tools on mobile — the core product; if these don't work, nothing else matters
- Real-time recalculation (no "calculate" button) — already works on web; preserve the pattern
- Gross-Net converter — most Vietnamese workers reason in NET; every HR tool has this
- Old vs new tax law comparison (Luat 109/2025) — actively relevant in 2026; users need the delta
- Biometric auth (Face ID / Touch ID) — financial app without biometrics feels unsafe; non-negotiable
- Native Share Sheet — replaces URL sharing; table stakes on mobile
- Input auto-save / draft persistence — form data must survive app-switch or phone call
- VND formatting on numeric inputs — already in `inputSanitizers.ts`; needs React Native keyboard handling

**Should have (competitive differentiators):**
- Calculation history per account — the stated new milestone feature; requires auth + backend
- Push notifications for tax deadlines — the stated new milestone feature; local notifications sufficient for v1
- PDF export of results — rewrite required (html2canvas is DOM-only; use `@react-pdf/renderer`)
- Law-change push alerts — high value but requires backend admin trigger; Tier 2 push
- History search and filter — useful once history exceeds 10 entries
- In-app notification settings screen — toggle per category

**Defer to v2+:**
- Offline mode with conflict resolution — complex; AsyncStorage draft persistence is sufficient for v1
- Dark mode — explicitly out of scope in PROJECT.md
- Admin dashboard — explicitly out of scope
- Social benchmarking, AI chatbot, actual tax filing/submission — anti-features by design

### Architecture Approach

The architecture is a three-layer monorepo where `packages/tax-core` is the single source of truth for all calculation logic, `apps/api` is the authoritative compute engine and persistence layer, and `apps/mobile` is a thin display client. The existing `src/` (Next.js) is frozen in place and deprecated after mobile launches. tRPC over HTTP connects mobile to backend with full TypeScript type safety flowing end-to-end from `tax-core` types to mobile screen props. The existing Expo `src/` directory is kept untouched; all new work lives in `apps/` and `packages/`.

**Major components:**
1. `packages/tax-core` — All 40+ calculator modules migrated from `src/lib/`; zero dependencies; consumed by API and optionally mobile
2. `apps/api` — Fastify server with tRPC router; owns authentication, history persistence (Postgres/Prisma), push notification dispatch, rate limiting; delegates all calculations to `tax-core`
3. `apps/mobile` — Expo Router UI with Zustand auth/settings store and TanStack Query server state; calls API via tRPC; no direct tax calculation logic
4. `packages/config` — Shared `tsconfig.base.json` and ESLint config across all workspaces

**Key patterns:**
- Raw TypeScript exports from `tax-core` (no compile step) — Metro and tsx consume `.ts` directly; avoids CommonJS/ESM conflicts
- Route-group auth guard in Expo Router `(tabs)/_layout.tsx` — applies to all deep-linked navigation including push notification taps
- Zustand per-domain slices (`useAuthStore`, `useSettingsStore`, `useTaxInputStore`) — prevents cross-tab re-renders
- `node-linker=hoisted` in `.npmrc` — required for React Native packages that assume hoisted `node_modules`
- Server-side share tokens (POST snapshot → receive 8-char token) — replaces fragile lz-string URL encoding

### Critical Pitfalls

1. **Calculation divergence (two copies of tax logic)** — Extract `src/lib/` into a single shared `@taxvn/tax-core` package before writing a single line of mobile or API code. Never duplicate calculator modules. Backend is authoritative; mobile displays only.

2. **Zero tests on 18,757 lines of calculation logic** — Establish a golden-output test suite for `calculateNewTax`, `calculateOldTax`, `calculateGrossFromNet`, and the 5-7 highest-risk specialized calculators before migration begins. This is the only regression safety net for the entire project.

3. **Monolithic state ported to mobile causes frame drops** — The 1,147-line `page.tsx` with 22 `useState` declarations MUST be redesigned as Zustand per-tab slices before any calculator UI is built. On mid-range Android devices this is not a performance concern — it is an abandonment driver.

4. **Floating-point precision in gross/net binary search** — The `calculateGrossFromNet` binary search must use an explicit epsilon guard (`Math.abs(result - target) < 1`) rather than equality. Hermes (React Native's JS engine) may halt the loop at a different iteration than V8, producing 1-5 VND divergence.

5. **html2canvas / jsPDF are DOM-only — will crash on React Native** — PDF export requires a full template rewrite using `@react-pdf/renderer` or `expo-print`. Plan 2-3 days per template. Do not carry over any existing PDF component code.

6. **`isSecondHalf2026` flag inconsistency across calculator modules** — Must be resolved before API layer is built. The correct behavior (new deductions for all of 2026) must be enforced uniformly across all 40 modules.

---

## Implications for Roadmap

The build order is dictated by hard dependencies: `tax-core` must exist before the API, the API must exist before mobile auth, mobile auth must exist before history, and history must exist before push notifications that deep-link into saved calculations. Each phase is independently testable before the next begins.

### Phase 1: Monorepo Foundation + tax-core Migration

**Rationale:** Everything else depends on this. `packages/tax-core` must be extracted, audited, and tested before any API or mobile work begins. This phase has no prerequisites and validates the most critical architectural decision.
**Delivers:** pnpm + Turborepo monorepo scaffold; `packages/tax-core` with all 40+ modules; golden-output test suite; resolved constant inconsistencies (`isSecondHalf2026`, wrong 2026 brackets); NativeWind design token setup in `packages/config`
**Addresses:** Calculator completeness (all 40 tools available as tested functions)
**Avoids:** Pitfalls 1 (divergence), 2 (float precision), 13 (no tests), 12 (`isSecondHalf2026`), 9 (browser globals in lib)
**Research flag:** Standard patterns — well-documented monorepo setup (official Expo guide + `byCedric/expo-monorepo-example`)

### Phase 2: Backend API (Auth + Calculator Endpoints)

**Rationale:** The API must be built and testable via HTTP before mobile development begins. Auth (JWT + Google OAuth) is the dependency for history, which is the dependency for push notification deep links. Build and verify the backend independently.
**Delivers:** Fastify + Prisma + PostgreSQL setup; JWT auth with access/refresh tokens; tRPC router exposing all 40+ calculator procedures; `calculation_history` table schema; share token endpoint; rate limiting
**Uses:** Fastify 5, Prisma 7, PostgreSQL 16, tRPC v11, Zod, jsonwebtoken, bcrypt
**Implements:** `apps/api` component boundary
**Avoids:** Pitfall 4 (share link URL limits — server-side tokens built here), Pitfall 8 (storage migration strategy defined here)
**Research flag:** Standard patterns — well-documented Fastify + tRPC + Prisma setup

### Phase 3: Mobile Foundation (Auth + Navigation Shell)

**Rationale:** The Expo Router skeleton, Zustand store architecture, tRPC client wiring, and auth screens form the foundation every subsequent mobile phase depends on. Getting these patterns right before building 40 calculator screens prevents expensive rework.
**Delivers:** Expo SDK 55 app scaffold; Expo Router with `(auth)` and `(tabs)` route groups; auth guard in `_layout.tsx`; `useAuthStore` Zustand slice; tRPC client configured; `expo-secure-store` for tokens; biometric auth (Face ID / Touch ID); sign-in / sign-up / Google OAuth screens
**Avoids:** Pitfall 3 (monolithic state — per-domain Zustand slices established here), Pitfall 3 (AsyncStorage for tokens — SecureStore used instead)
**Research flag:** Standard patterns — Expo Router auth guard is canonical and well-documented

### Phase 4: Mobile UI — Calculator Screens (All 40+ Tools)

**Rationale:** This is the core product. The largest single phase by screen count. Must be preceded by Phase 3 (auth shell) and Phase 1 (tax-core tested) to avoid rework. Keyboard handling and state architecture patterns must be locked in at the start of this phase, not discovered mid-way.
**Delivers:** All 40+ calculator screens as Expo Router tabs; per-tab Zustand state slices; `React.memo` on all screens; VND input formatting; real-time recalculation; native Share Sheet; real Android device testing from day one
**Addresses:** All 40 tools from FEATURES.md table stakes; old vs new law comparison; gross/net converter; salary slip generator; exemption checker
**Avoids:** Pitfall 6 (keyboard covering inputs — `react-native-keyboard-controller` + `KeyboardAwareScrollView` from start), Pitfall 10 (inactive tab re-renders — `React.memo` + `useFocusEffect` + per-slice Zustand), Pitfall 11 (Tailwind class incompatibility — NativeWind v4 configured in Phase 1)
**Research flag:** May need phase research — 40 screens is large scope; component library patterns and performance baseline for mid-range Android should be validated early

### Phase 5: Calculation History

**Rationale:** Requires Phase 2 (history API endpoint + DB schema) and Phase 3 (auth + user identity). Can be built entirely as a mobile feature once both prerequisites exist.
**Delivers:** History list screen (date, tool, income, tax total); tap to restore full calculator state; search by tool/amount; filter by tool type and date range; swipe-to-delete; fire-and-forget save on calculation completion
**Addresses:** "Calculation history per account" differentiator from FEATURES.md
**Uses:** TanStack Query `history.list` paginated query; tRPC `history.save` background mutation
**Research flag:** Standard patterns — paginated list with TanStack Query is well-documented

### Phase 6: Push Notifications

**Rationale:** Requires Phase 2 (push token registry in backend), Phase 3 (app installed + permission flow), and Phase 5 (history exists so deadline notification can deep-link to a relevant calculator). Last phase because it depends on the most other components.
**Delivers:** Tier 1 local notifications for March 31 / April 30 / quarterly dates; Tier 2 remote notifications for law-change alerts; token refresh listener; in-app pre-prompt before native OS permission dialog; in-app notification settings toggle screen
**Addresses:** "Push notifications for tax deadlines" from FEATURES.md v1 milestone
**Avoids:** Pitfall 7 (stale tokens — refresh listener + fallback local notifications), Pitfall 14 (Firebase Dynamic Links deprecated — use Expo Universal Links)
**Research flag:** Needs phase research — FCM v1 credential setup, APNs certificates, EAS push notification service configuration have project-specific setup steps

### Phase Ordering Rationale

- Phases 1 and 2 can be parallelized after Phase 1's `tax-core` package is stable (API can start once calculator functions are testable, before full test suite is complete)
- Phase 3 is blocked on Phase 2's auth endpoints
- Phase 4 is blocked on Phase 3's navigation shell and Phase 1's tested `tax-core`
- Phase 5 is blocked on Phase 2's history API and Phase 4's calculator screens (history is only valuable once calculators save results)
- Phase 6 is the final integration phase with the most external service dependencies

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 4 (Calculator Screens):** Performance baseline for mid-range Android (Redmi, Samsung A-series) needs concrete benchmarks; `react-native-keyboard-controller` setup with Expo SDK 55 edge cases; NativeWind v4 performance with 40+ screens may need profiling
- **Phase 6 (Push Notifications):** EAS push notification service vs. self-managed FCM v1 trade-off; APNs certificate provisioning steps; `node-cron` vs. BullMQ for deadline job scheduling at scale

Phases with standard patterns (skip research-phase):
- **Phase 1:** Turborepo + pnpm monorepo is the official Expo reference — no unknown territory
- **Phase 2:** Fastify + tRPC + Prisma is a well-documented stack with official guides
- **Phase 3:** Expo Router auth guard pattern is the canonical approach per official docs
- **Phase 5:** TanStack Query paginated list + background mutation is a standard pattern

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major versions verified against npm and official changelogs as of 2026-03-31. NativeWind v4.2.x stable confirmed; v5 explicitly excluded. |
| Features | HIGH (stack) / MEDIUM (market) | Expo/RN feature patterns verified against official docs. Vietnamese-market specifics (eTax competitor, TNCN deadline dates) based on App Store listing and MoF-adjacent sources — accurate but could shift with regulatory changes. |
| Architecture | HIGH | Monorepo structure matches official Expo guide and canonical reference implementation. tRPC + React Native compatibility confirmed. Auth pattern is canonical Expo Router. |
| Pitfalls | HIGH | Critical pitfalls (divergence, float precision, state architecture) verified across multiple sources. Platform-specific issues (keyboard on Android, push token staleness) confirmed against official docs and community reports. |

**Overall confidence:** HIGH

### Gaps to Address

- **NativeWind v4.2.x + Expo SDK 55 compatibility:** NativeWind v4 was primarily verified against SDK 54. Community reports indicate compatibility with SDK 55, but the configuration steps (Metro config, Babel plugin) should be validated with a minimal test scaffold at the start of Phase 4 before building 40 screens on top of it.

- **tRPC v11 + Fastify adapter maturity:** tRPC's Fastify adapter (`@trpc/server/adapters/fastify`) is documented but less battle-tested than the Express adapter. A basic smoke test of the adapter in Phase 2's first PR will surface any version incompatibilities early.

- **iOS App Store and Google Play compliance for financial data handling:** FEATURES.md explicitly defers to Phase 2+ a formal review of Vietnamese data residency requirements. If the app collects user salary data (which it does), there may be PDPD (Personal Data Protection Decree, effective 2023) notification requirements that affect the privacy policy and data handling flows.

- **EAS Build configuration for pnpm monorepo:** The `node-linker=hoisted` workaround is confirmed but `eas.json` custom install commands for pnpm have historically had version-specific quirks. Validate EAS build pipeline early in Phase 3 before the full UI is complete.

---

## Sources

### Primary (HIGH confidence)
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55) — SDK versions, New Architecture, breaking changes
- [React Native 0.83 Blog](https://reactnative.dev/blog/2025/12/10/react-native-0.83) — RN version, Hermes
- [Expo Monorepo Documentation](https://docs.expo.dev/guides/monorepos/) — pnpm + Turborepo setup
- [byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example) — canonical monorepo reference
- [Expo Router Authentication Patterns](https://docs.expo.dev/router/advanced/authentication-rewrites/) — route guard pattern
- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/) — notification architecture
- [TanStack Query React Native Docs](https://tanstack.com/query/latest/docs/framework/react/react-native) — offline persistence
- [Fastify npm (v5.8.4)](https://www.npmjs.com/package/fastify) — version verification
- [Prisma npm (v7.6.0)](https://www.npmjs.com/package/prisma) — version verification
- [Zustand npm (v5.0.12)](https://www.npmjs.com/package/zustand) — version verification

### Secondary (MEDIUM confidence)
- [Fastify vs Express vs Hono — BetterStack](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/) — throughput comparison
- [React Native Tech Stack 2025 — Galaxies.dev](https://galaxies.dev/article/react-native-tech-stack-2025) — community consensus
- [NativeWind Expo SDK Compatibility Discussion](https://github.com/nativewind/nativewind/discussions/1604) — SDK 54/55 compatibility
- [Auth Providers Compared (Clerk vs Auth0 vs Supabase)](https://designrevision.com/blog/auth-providers-compared) — DIY auth rationale
- [Sharing TypeScript Between Web and React Native — Atomic Object](https://spin.atomicobject.com/typescript-web-react-native/) — shared package pattern
- [PDF Generation for React Native — APITemplate.io](https://apitemplate.io/blog/how-to-generate-pdfs-in-react-native-using-html-and-css/) — @react-pdf/renderer recommendation
- [eTax Mobile App Store listing](https://apps.apple.com/vn/app/etax-mobile/id1589750682) — competitive context
- [TNCN deadline guide — meinvoice.vn](https://www.meinvoice.vn/tin-tuc/39997/huong-dan-quyet-toan-thue-tncn-tren-etax-mobile/) — Vietnamese tax deadline dates

### Tertiary (LOW confidence)
- [NativeWind v5 preview status](https://nativewind.dev) — explicitly excluded; not stable as of March 2026

---

*Research completed: 2026-03-31*
*Ready for roadmap: yes*
