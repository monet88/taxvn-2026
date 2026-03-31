# Codebase Concerns

**Analysis Date:** 2026-03-31

---

## Tech Debt

**Monolithic page.tsx state manager (40 tab states in one component):**
- Issue: `src/app/tinh-thue/page.tsx` (1,147 lines) declares 22 `useState` calls for individual tab states, all lifted into the single route component. Every tab state change causes the parent to re-render, which re-evaluates all 40+ `useMemo`/`useCallback` dependencies.
- Files: `src/app/tinh-thue/page.tsx` lines 162–192
- Impact: Adding a new tab requires editing this file in five places: import, `useState`, `handleLoadSnapshot`, `handleGoHome`, and the `currentSnapshot` `useMemo`. The `currentSnapshot` dependency array at line 482 is already 22 items long.
- Fix approach: Introduce a `useReducer` with a `tabsReducer`, or move per-tab state into a context provider (e.g., `CalculatorStateContext`) so individual tabs subscribe only to their own slice.

**`handleGoHome` manual reset — brittle default duplication:**
- Issue: `handleGoHome` (lines 514–551) manually resets 22 state variables by repeating every default constant. Any new tab whose default state is not added here will silently keep its previous values after reset.
- Files: `src/app/tinh-thue/page.tsx` lines 514–551
- Impact: Bug-prone on every new tab addition; no compile-time enforcement.
- Fix approach: Replace with a single `dispatch({ type: 'RESET_ALL' })` action once the reducer pattern is adopted.

**`handleLoadSnapshot` optional-chaining guard pattern — inconsistent:**
- Issue: Lines 206–260 load tab states from a snapshot. Most tabs use `if (snapshot.tabs.X)` guards, but the first four tabs (`employerCost`, `freelancer`, `salaryComparison`, `yearlyComparison`) are set unconditionally. If an older snapshot is missing those fields it could set state to `undefined`.
- Files: `src/app/tinh-thue/page.tsx` lines 201–261
- Impact: Silent state corruption when loading older shared URLs.
- Fix approach: Apply the same optional guard to all four unconditional assignments, or rely on `mergeSnapshotWithDefaults` output guaranteed to contain all fields.

**`snapshotCodec.ts` `removeDefaults` — hardcoded duplicate of default constants:**
- Issue: `src/lib/snapshotCodec.ts` lines 179–309 re-implements default value comparisons manually (e.g., `s.grossIncome !== 30_000_000`, pension defaults as literals). These must be kept in sync with `snapshotTypes.ts` DEFAULT_* constants manually.
- Files: `src/lib/snapshotCodec.ts` lines 171–312, `src/lib/snapshotTypes.ts`
- Impact: When a default value changes (e.g., pension `contributionYears` default), the codec silently starts encoding or dropping fields incorrectly, breaking URL state sharing.
- Fix approach: Replace manual comparisons with a deep-equality check against the imported DEFAULT constants.

---

## Known Bugs

**`IncomeSummaryDashboard` uses wrong 2026 tax brackets:**
- Symptoms: The income-summary tab calculates income tax with brackets `[5%, 10%, 15%, 20%, 25%]` with bracket boundaries `[0, 10M, 30M, 60M, 120M, ∞]`. The authoritative 2026 new law brackets in `taxCalculator.ts` are `[5%, 10%, 20%, 30%, 35%]` with boundaries `[0, 10M, 30M, 60M, 100M, ∞]`. The summary dashboard uses 5 brackets but entirely different rates and top-bracket threshold.
- Files: `src/lib/incomeSummaryCalculator.ts` lines 241–247 vs `src/lib/taxCalculator.ts` lines 59–65
- Trigger: Opening the `income-summary` tab and entering salary income > 30M/month.
- Workaround: None; the dashboard quietly returns lower tax figures than the canonical calculator.

**`TaxDocumentGenerator` applies 2026 new deductions only when `isSecondHalf2026 === true`:**
- Symptoms: `getDeductionAmounts(year, isSecondHalf2026)` in `src/lib/taxDocumentGenerator.ts` lines 445–459 gates the 15.5M/6.2M deductions on `isSecondHalf2026`, but per the law's transitional clause (confirmed in `annualSettlementCalculator.ts` line 192: "Luật mới áp dụng từ tháng 1") the new deductions apply for the full 2026 year. The document generator will produce incorrect low-deduction figures for H1 2026 documents.
- Files: `src/lib/taxDocumentGenerator.ts` lines 445–459, `src/components/TaxDocumentGenerator/TaxDocumentGenerator.tsx` lines 67–68
- Trigger: Generating a tax document for January–June 2026.

**`MultiSourceIncomeCalculator` `isSecondHalf2026` flag treated as meaningful but documented deprecated in foreigner calculator:**
- Symptoms: `src/lib/foreignerTaxCalculator.ts` line 146 marks `isSecondHalf2026` as `// Deprecated: Luật mới áp dụng từ 01/01/2026 cho toàn năm`, yet `src/lib/multiSourceIncomeCalculator.ts` line 179 still declares and uses this field at line 298 to branch calculation logic. The two calculators operate inconsistently for the same tax year.
- Files: `src/lib/foreignerTaxCalculator.ts` line 146, `src/lib/multiSourceIncomeCalculator.ts` lines 179, 298, `src/lib/snapshotTypes.ts` lines 59, 69, 134, 140

---

## Security Considerations

**No Content-Security-Policy header:**
- Risk: The `_headers` file (`public/_headers`) sets `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` but omits a `Content-Security-Policy`. A CSP would prevent XSS from injected scripts or third-party content.
- Files: `public/_headers`
- Current mitigation: `X-Content-Type-Options: nosniff` reduces MIME-sniffing attacks; no inline scripts are evident in source.
- Recommendations: Add `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` (unsafe-inline required for Tailwind inline styles or can be hashed).

**No `Strict-Transport-Security` (HSTS) header:**
- Risk: Without HSTS, browsers can be redirected from HTTPS to HTTP on the first connection.
- Files: `public/_headers`
- Current mitigation: None in the static export headers.
- Recommendations: Add `Strict-Transport-Security: max-age=63072000; includeSubDomains` to `public/_headers`.

**`localStorage` save data not validated on read:**
- Risk: `src/lib/snapshotStorage.ts` parses `localStorage` with `JSON.parse` and performs a migration path (lines 39–80) but relies on `isValidSnapshot` which only checks for presence of top-level keys (`version`, `sharedState`, `activeTab`, `tabs`, `meta`). Maliciously crafted storage values could inject unexpected numeric types into calculator state (e.g., `grossIncome: NaN`).
- Files: `src/lib/snapshotStorage.ts`, `src/lib/snapshotTypes.ts` lines 763–779
- Current mitigation: `formatCurrency` in `taxCalculator.ts` guards against non-finite numbers; `??` null-coalescing guards in `calculateAllowancesBreakdown`. Coverage is partial.
- Recommendations: Add numeric type validation inside `isValidSnapshot` for critical fields like `grossIncome`, `dependents`, `region`.

---

## Performance Bottlenecks

**`currentSnapshot` useMemo re-serializes all 22 tab states on every keystroke:**
- Problem: The `useMemo` at `src/app/tinh-thue/page.tsx` line 451 reconstructs the full snapshot object (all 22 tab states) whenever any piece of state changes. This object is then passed to the 500ms debounced URL encoder. For complex tabs like `salaryComparison` (with arrays of company offers) this object can be substantial.
- Files: `src/app/tinh-thue/page.tsx` lines 451–482
- Cause: No per-tab memoization; the snapshot always includes every tab regardless of which one is active.
- Improvement path: Only serialize the currently active tab's state into the URL, or split the snapshot into a "shared" part and a "per-tab" part that is computed lazily.

**`calculateTaxRange` generates data points synchronously on the main thread:**
- Problem: `src/lib/taxCalculator.ts` lines 642–660 iterates from `minIncome` to `maxIncome` in `step` increments, calling `calculateOldTax` and `calculateNewTax` for each point. `TaxChart` invokes this for chart rendering with a range that could be several hundred iterations.
- Files: `src/lib/taxCalculator.ts` lines 642–660, `src/components/TaxChart.tsx`
- Cause: Synchronous loop on the rendering thread; no Web Worker or memoization.
- Improvement path: Memoize chart data based on `[dependents, step]` inputs; the chart data only needs to change when dependents changes.

**`recharts` and `html2canvas/jspdf` included in initial bundle:**
- Problem: `recharts` is used in `TaxChart` which is lazy-loaded, but `html2canvas` and `jspdf` are imported in `src/components/PDFExport/PDFExportButton.tsx` and `src/components/SalarySlip/SalarySlipPDF.tsx`. These libraries are heavyweight (~600KB combined unminified). Both are lazy-loaded components; however, `html2canvas` and `jspdf` are top-level imports within those files, meaning they are included in the respective chunks eagerly once the lazy component itself is loaded.
- Files: `src/components/PDFExport/PDFExportButton.tsx`, `src/components/SalarySlip/SalarySlipPDF.tsx`
- Cause: Static top-level imports of large libraries inside lazy components.
- Improvement path: Use dynamic `import('html2canvas')` and `import('jspdf')` inside the click handler so the libraries are only fetched when the user actually clicks export.

---

## Fragile Areas

**`snapshotCodec.ts` KEY_MAP key collision risk:**
- Files: `src/lib/snapshotCodec.ts` lines 13–124
- Why fragile: All struct field names across 22+ different tab state types are mapped to short 1–3 character keys in a single flat `KEY_MAP`. Multiple types use the same field names (e.g., `type`, `id`, `name`, `region`). The `type` field in `OvertimeEntry` is explicitly aliased to `'tp'` (line 116) specifically to avoid collision with the `activeTab` key, but the comment acknowledges the ambiguity. Adding a new tab state whose fields collide with existing short keys will silently corrupt encoded/decoded data.
- Safe modification: When adding new fields to any tab state, always check the full KEY_MAP for short key conflicts before assigning.
- Test coverage: No unit tests cover roundtrip encoding/decoding.

**Hash navigation with `setTimeout` to clear `isLoadingFromURL` flag:**
- Files: `src/app/tinh-thue/page.tsx` lines 277, 300
- Why fragile: `setIsLoadingFromURL(false)` is called after a hardcoded `setTimeout(..., 600)`. This prevents the auto-URL-update effect from firing during state load. If React batches state updates or the browser is slow, the 600ms guard may expire before all state setters from `handleLoadSnapshot` have committed, causing the URL to be overwritten with partial state.
- Safe modification: Replace the timeout with a `useEffect` that watches `isLoadingFromURL` and clears it only after a render cycle confirms all states are set (e.g., by tracking a counter of pending updates).

**`IncomeSummaryDashboard` and `TaxDeadlineManager` have no shared state integration:**
- Files: `src/app/tinh-thue/page.tsx` lines 1065–1080, `src/components/IncomeSummaryDashboard/index.ts`, `src/components/TaxDeadlineManager/index.ts`
- Why fragile: These components receive no `sharedState` or `onStateChange` props. They are fully self-contained with internal state. If the user updates income in the main calculator and then navigates to income-summary, the dashboard will not reflect their current inputs.
- Test coverage: None.

---

## Scaling Limits

**`CalculatorSnapshot` version field is `1` with no upgrade path:**
- Current capacity: One snapshot version.
- Limit: When new tab states are added (e.g., `mortgageState` was recently added), the `mergeSnapshotWithDefaults` function handles missing fields via spread defaults. However, if a field is *removed* or *renamed* from an existing tab state, old shared URLs will fail silently or apply wrong defaults.
- Scaling path: Introduce a `migrateSnapshot(v1 → v2)` function pattern similar to the existing `migrateOldHistory` in `snapshotStorage.ts`, and bump `STORAGE_VERSION` when breaking changes occur.

**`localStorage` save cap at 50 items:**
- Current capacity: `MAX_SAVES = 50` in `src/lib/snapshotStorage.ts` line 11.
- Limit: Browser `localStorage` is typically capped at 5–10MB. A single snapshot with a full `monthlyPlanner` (12 entries) or `salaryComparison` (multiple companies) can serialize to several KB. At 50 saves this is unlikely to be a practical problem, but no error handling exists for `localStorage` quota exceeded exceptions.
- Scaling path: Wrap all `localStorage.setItem` calls in try/catch and surface a user-visible warning when quota is exceeded.

---

## Dependencies at Risk

**`next` version pinned to `^16.0.10` (non-existent release):**
- Risk: The `package.json` specifies `"next": "^16.0.10"`. As of early 2026, Next.js stable is in the 15.x range; version 16 is not yet released. This may resolve to a prerelease or canary channel package via npm, introducing unstable APIs.
- Files: `package.json`
- Impact: Unpredictable upgrade behavior; CI could install a different Next.js minor on each run.
- Migration plan: Pin to the latest stable `15.x` release explicitly until Next.js 16 reaches GA.

**`react` and `react-dom` pinned to `^19.2.3`:**
- Risk: React 19 is a major release with breaking changes to server actions, `use()` hook, and ref forwarding. The codebase uses `'use client'` throughout (no server components or server actions), which mitigates some risks, but `@types/react` and `@types/react-dom` at `^19.0.0` may lag behind the runtime version.
- Files: `package.json`
- Impact: Type errors possible if React 19 APIs evolve between minor releases.

---

## Missing Critical Features

**No unit tests for any calculation logic:**
- Problem: The entire `src/lib/` directory (18,757 lines across 30+ calculator files) has zero test files. No `.test.ts` or `.spec.ts` files exist anywhere in the repository. Tax calculation accuracy is the core value proposition of this application.
- Blocks: Confident refactoring of any calculator; regression detection when law constants change.
- Priority: High — the `IncomeSummaryDashboard` bracket bug (documented above) would be caught immediately by a unit test.

**No input validation / sanitization on `grossIncome` before calculation:**
- Problem: `TaxInput.tsx` uses `parseCurrency` from `taxCalculator.ts` which strips non-digits and returns 0 for empty input. However, there is no upper-bound validation before calling `calculateNewTax`. Extremely large inputs (e.g., `Number.MAX_SAFE_INTEGER`) would be passed to the bracket loop.
- Files: `src/lib/taxCalculator.ts` lines 633–639, `src/components/TaxInput.tsx`
- Blocks: Input values above `9_007_199_254_740_991` would cause the loop to iterate past bracket boundaries producing technically correct but meaningless results. The `parseCurrency` function caps at `Number.MAX_SAFE_INTEGER` but does not enforce a domain-appropriate maximum (e.g., 1 billion VND/month).

---

## Test Coverage Gaps

**Core calculator functions — zero test coverage:**
- What's not tested: `calculateNewTax`, `calculateOldTax`, `calculateTaxWithBrackets`, `calculateInsuranceDetailed`, `calculateOtherIncomeTax`, and all 30+ specialized calculators in `src/lib/`.
- Files: All files in `src/lib/`
- Risk: A changed constant (e.g., a 2027 law amendment) or arithmetic bug will not be detected before production.
- Priority: High

**Snapshot codec roundtrip — zero test coverage:**
- What's not tested: `encodeSnapshot`→`decodeSnapshot` roundtrip for all tab states; KEY_MAP collision detection; `mergeSnapshotWithDefaults` for partial inputs.
- Files: `src/lib/snapshotCodec.ts`, `src/lib/snapshotTypes.ts`
- Risk: Silent URL corruption when new tab states are added.
- Priority: High

**URL hash navigation state restoration — zero test coverage:**
- What's not tested: Hash parsing in `handleHashNavigation`; legacy `#s=` format decoding; the `setTimeout` race condition in `isLoadingFromURL`.
- Files: `src/app/tinh-thue/page.tsx` lines 265–315, 486–511
- Risk: Shared URLs silently load wrong state after any codec change.
- Priority: Medium

---

*Concerns audit: 2026-03-31*
