# Phase 1: Monorepo Foundation - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Extract the proven tax calculation logic from the existing Next.js codebase into a standalone, tested @taxvn/tax-core package within a pnpm monorepo. Fix pre-existing bugs (isSecondHalf2026 flag, bracket inconsistency, non-pure imports). Establish 120+ test cases covering all 40+ calculators. Verify GROSS↔NET round-trip accuracy and cross-engine compatibility (Node.js + Hermes).

</domain>

<decisions>
## Implementation Decisions

### Agent's Discretion
All implementation choices are at the agent's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/` — 40+ TypeScript calculator modules (taxCalculator, grossNetCalculator, bonusCalculator, esopCalculator, etc.)
- `src/lib/taxCalculator.ts` — Central: OLD_TAX_BRACKETS (7 bậc), NEW_TAX_BRACKETS (5 bậc), deductions, insurance rates
- `src/lib/grossNetCalculator.ts` — GROSS↔NET via binary search (precision: 1,000₫, max 50 iterations)

### Established Patterns
- Pure TypeScript calculation functions with no React dependencies (except 2 non-pure imports to fix)
- Date-aware tax config via EFFECTIVE_DATES and getTaxConfigForDate()
- Static export constants for brackets, rates, and deductions

### Integration Points
- `@/*` path alias maps to `./src/*` (tsconfig.json)
- Existing build: Next.js 16 static export
- Target: pnpm workspace with packages/tax-core, packages/tax-data, packages/config

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — discuss phase skipped.

</deferred>
