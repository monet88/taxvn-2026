---
phase: 04-calculator-screens
plan: 03
type: execute
status: completed
---

## Execution Summary
- Replaced 17 generic previews in the `RUNTIME_CONFIGS` registry of `runtimeCatalog.tsx` with full domain-specific functionality using core calculators.
- Updated the barrel file `apps/mobile/lib/taxCore.ts` to expose `calculateBaseRate`, `calculateSeveranceTax`, `calculateHouseholdBusinessTax`, `getIncomeTaxRate2026`, and others.
- Implemented specific configurations for Bonus, ESOP, Foreigner, Securities, Rental, Region Compare, Household Business, Real Estate, Pension, Severance, VAT, Withholding Tax, Multi-source Income, Crypto Tax, Income Summary, Monthly Planner, Mortgage, and Inheritance/Gift tax tools.
- Tested and verified execution correctness via the `npx tsc --noEmit` build check.
- `GENERIC_WAVE_3_SLUGS` arrays and associated stub code patterns removed.
