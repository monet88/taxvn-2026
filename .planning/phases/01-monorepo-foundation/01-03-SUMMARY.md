---
phase: 01-monorepo-foundation
plan: 03
subsystem: core
tags: [isSecondHalf2026, bracket-fix, law-109-2025, deductions]

requires:
  - phase: 01-02
    provides: extracted calculator modules in packages/tax-core/src/
provides:
  - isSecondHalf2026 flag removed from all files
  - New law deductions applied uniformly for all of 2026
  - Snapshot types updated with optional deprecated field for backward compat
affects: [01-04, all-calculator-screens]

tech-stack:
  added: []
  patterns: [date-aware-tax-config, backward-compat-deprecation]

key-files:
  modified:
    - packages/tax-core/src/foreignerTaxCalculator.ts
    - packages/tax-core/src/multiSourceIncomeCalculator.ts
    - packages/tax-core/src/taxCalculator.ts
    - packages/tax-core/src/incomeSummaryCalculator.ts
    - src/lib/snapshotTypes.ts
    - src/lib/taxDocumentGenerator.ts
    - src/components/TaxDocumentGenerator/TaxDocumentGenerator.tsx
    - src/components/ForeignerTaxCalculator/ForeignerTaxCalculator.tsx
    - src/components/MultiSourceIncome/MultiSourceIncome.tsx

key-decisions:
  - "isSecondHalf2026 kept as optional deprecated field in snapshot types for URL backward compat"
  - "getDeductionAmounts() now derives from year alone — new law applies for all of 2026"

patterns-established:
  - "Deprecated snapshot fields: mark optional + @deprecated JSDoc, remove from defaults"
  - "Tax law effective dates handled by year >= 2026, not month-based flags"

requirements-completed: [FOUND-06]

duration: 20min
completed: 2026-04-01
---

# Plan 01-03: Fix isSecondHalf2026 flag and bracket inconsistency

**Removed deprecated isSecondHalf2026 flag from all 7+ files — Law 109/2025/QH15 deductions apply uniformly from 01/01/2026**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Removed `isSecondHalf2026` flag from all calculator logic
- Updated `getDeductionAmounts()` to derive from year alone
- Made snapshot type field optional+deprecated for backward compatibility
- Build verified clean, all 127 tests still passing

## Files Created/Modified
- `packages/tax-core/src/foreignerTaxCalculator.ts` — removed flag, comment documenting removal
- `packages/tax-core/src/multiSourceIncomeCalculator.ts` — removed flag, comment documenting removal
- `src/lib/snapshotTypes.ts` — 3 interfaces updated: field made optional+@deprecated, removed from defaults
- `src/lib/taxDocumentGenerator.ts` — `getDeductionAmounts()` simplified to year-only
- `src/components/TaxDocumentGenerator/TaxDocumentGenerator.tsx` — removed isSecondHalf2026 computation

## Decisions Made
- Kept `isSecondHalf2026` as `?` optional in snapshot interfaces — existing saved URLs with this field won't break

## Deviations from Plan
None.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Calculator logic now uses uniform deductions for 2026
- Ready for golden-output test validation (Plan 01-04)

---
*Phase: 01-monorepo-foundation*
*Completed: 2026-04-01*
