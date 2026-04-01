---
phase: 01-monorepo-foundation
plan: 02
subsystem: core
tags: [tax-core, tax-data, typescript, extraction]

requires:
  - phase: 01-01
    provides: pnpm monorepo scaffold with packages/
provides:
  - 30 calculator modules extracted to packages/tax-core/src/
  - 6 reference data modules extracted to packages/tax-data/src/
  - Fixed non-pure imports (FOUND-05, FOUND-07)
affects: [01-03, 01-04, 02-backend, 03-mobile, 04-calculator-screens]

tech-stack:
  added: [vitest]
  patterns: [pure-function-calculators, constant-based-config]

key-files:
  created:
    - packages/tax-core/src/taxCalculator.ts
    - packages/tax-core/src/grossNetCalculator.ts
    - packages/tax-core/src/bonusCalculator.ts
    - packages/tax-core/src/esopCalculator.ts
    - packages/tax-core/src/securitiesTaxCalculator.ts
    - packages/tax-core/src/cryptoTaxCalculator.ts
    - packages/tax-core/src/vatCalculator.ts
    - packages/tax-core/src/withholdingTaxCalculator.ts
    - packages/tax-core/src/index.ts
    - packages/tax-data/src/taxLawHistory.ts
    - packages/tax-data/src/taxTreatyData.ts
    - packages/tax-data/src/index.ts

key-decisions:
  - "Moved MAX_MONTHLY_INCOME constant into taxCalculator.ts (FOUND-05 fix)"
  - "Replaced formatNumber import with inline implementation in calculators (FOUND-07 fix)"

patterns-established:
  - "All calculators are pure functions — no side effects, no UI imports"
  - "Re-export barrel pattern in index.ts for clean public API"

requirements-completed: [FOUND-03, FOUND-04, FOUND-05, FOUND-07]

duration: 30min
completed: 2026-04-01
---

# Plan 01-02: Extract tax-core and tax-data modules

**30 pure calculator modules extracted to @taxvn/tax-core, 6 reference data modules to @taxvn/tax-data, with non-pure imports fixed**

## Performance

- **Duration:** ~30 min
- **Tasks:** 4
- **Files modified:** 36

## Accomplishments
- Extracted all 30 calculator modules from `src/lib/` to `packages/tax-core/src/`
- Extracted 6 reference data modules to `packages/tax-data/src/`
- Fixed MAX_MONTHLY_INCOME non-pure import (FOUND-05)
- Fixed formatNumber React dependency (FOUND-07)

## Files Created/Modified
- `packages/tax-core/src/*.ts` — 30 calculator modules
- `packages/tax-data/src/*.ts` — 6 data modules
- `packages/tax-core/src/index.ts` — barrel re-export

## Decisions Made
- Calculators remain pure functions — no UI framework dependencies
- Constants co-located with their calculators instead of shared constants file

## Deviations from Plan
None — plan executed as specified.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Pure calculator modules ready for flag cleanup (Plan 01-03) and testing (Plan 01-04)

---
*Phase: 01-monorepo-foundation*
*Completed: 2026-04-01*
