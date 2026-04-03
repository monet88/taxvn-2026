---
phase: 01-monorepo-foundation
plan: 01
subsystem: infra
tags: [pnpm, turborepo, monorepo, typescript]

requires:
  - phase: none
    provides: existing Next.js app with tax calculators
provides:
  - pnpm workspace with 3 packages (tax-core, tax-data, config)
  - Turborepo build orchestration
  - Shared TypeScript base config
affects: [01-02, 01-03, 01-04, 02-backend, 03-mobile]

tech-stack:
  added: [pnpm-workspace, turborepo]
  patterns: [monorepo-package-structure]

key-files:
  created:
    - pnpm-workspace.yaml
    - turbo.json
    - packages/tax-core/package.json
    - packages/tax-core/tsconfig.json
    - packages/tax-data/package.json
    - packages/tax-data/tsconfig.json
    - packages/config/tsconfig.base.json
  modified:
    - package.json
    - .npmrc

key-decisions:
  - "Keep Next.js app in root — don't move to apps/web yet"
  - "Three packages: tax-core (pure calculators), tax-data (static reference), config (shared tsconfig)"

patterns-established:
  - "Package naming: @taxvn/tax-core, @taxvn/tax-data, @taxvn/config"
  - "Monorepo layout: packages/ for shared libs, root for Next.js app"

requirements-completed: [FOUND-01, FOUND-02]

duration: 15min
completed: 2026-04-01
---

# Plan 01-01: Scaffold pnpm monorepo with Turborepo

**pnpm monorepo with Turborepo orchestration and 3 shared packages (tax-core, tax-data, config)**

## Performance

- **Duration:** ~15 min
- **Tasks:** 5
- **Files modified:** 10

## Accomplishments
- Created pnpm workspace with `packages/tax-core`, `packages/tax-data`, `packages/config`
- Configured Turborepo for build pipeline orchestration
- Established shared TypeScript base config

## Files Created/Modified
- `pnpm-workspace.yaml` — workspace definition
- `turbo.json` — build pipeline configuration
- `packages/tax-core/package.json` — calculator package manifest
- `packages/tax-data/package.json` — static data package manifest
- `packages/config/tsconfig.base.json` — shared TS config
- `.npmrc` — pnpm settings

## Decisions Made
- Kept Next.js app in root (not yet moved to apps/web) to minimize disruption

## Deviations from Plan
None — plan executed as specified.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Monorepo structure ready for module extraction (Plan 01-02)

---
*Phase: 01-monorepo-foundation*
*Completed: 2026-04-01*
