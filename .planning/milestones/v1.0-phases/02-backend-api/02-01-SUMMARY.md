---
phase: 02-backend-api
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, typescript, auth]

requires:
  - phase: none
    provides: greenfield setup
provides:
  - Supabase project structure (config.toml, migrations dir, functions dir)
  - SQL schema with 4 custom tables and RLS policies
  - Shared @taxvn/supabase client package with typed Database interface
  - Root package.json scripts for Supabase CLI
affects: [02-backend-api, 03-mobile-foundation, 05-history-push]

tech-stack:
  added: [@supabase/supabase-js ^2.49.0]
  patterns: [Supabase Auth with RLS, typed Database interface (Row/Insert/Update), env fallback for server + Expo]

key-files:
  created:
    - supabase/config.toml
    - supabase/migrations/00001_initial_schema.sql
    - supabase/.env.example
    - supabase/functions/.gitkeep
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/api/src/database.types.ts
    - apps/api/src/supabase.ts
    - apps/api/src/index.ts
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Used Supabase config.toml with Google OAuth env references for local dev parity"
  - "Database types hand-written as placeholder — regenerate with supabase gen types typescript --local after supabase start"
  - "Added tsconfig.json to apps/api for TypeScript compilation (not in plan, Rule 3 auto-fix)"

patterns-established:
  - "Supabase migration naming: 00001_initial_schema.sql (sequential 5-digit prefix)"
  - "RLS pattern: user-scoped via auth.uid() for private data, public read for shared/config"
  - "Database types: Row (full), Insert (optional id/timestamps), Update (partial Insert)"
  - "Supabase client env fallback: SUPABASE_* || EXPO_PUBLIC_SUPABASE_*"

requirements-completed: [API-01, API-02, API-03, API-04, SEC-01, SEC-02, OBS-01, OBS-02]

duration: 3min
completed: 2026-04-01
---

# Phase 02 Plan 01: Supabase Project Setup & Database Schema Summary

**Supabase project initialized with 4-table PostgreSQL schema (calculation_history, share_snapshots, push_tokens, app_config), RLS policies, and typed @taxvn/supabase client package**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-01T07:05:48Z
- **Completed:** 2026-04-01T07:09:30Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Supabase project structure with config.toml (local dev: auth, studio, Google OAuth)
- SQL migration with 4 custom tables, 5 indexes, 7 RLS policies, 1 trigger function, and version_gate seed data
- @taxvn/supabase client package with fully typed Database interface (Row/Insert/Update per table)

## Task Commits

Each task was committed atomically:

1. **Task 01-01: Initialize Supabase project** - `89af310` (chore)
2. **Task 01-02: SQL migration: custom tables with RLS** - `689abc5` (feat)
3. **Task 01-03: Supabase client package for shared usage** - `20b9bc7` (feat)

## Files Created/Modified
- `supabase/config.toml` - Supabase local dev config (API, DB, Auth, Studio, Google OAuth)
- `supabase/.env.example` - Required environment variables template
- `supabase/functions/.gitkeep` - Placeholder for Edge Functions directory
- `supabase/migrations/00001_initial_schema.sql` - 4 tables, indexes, RLS, trigger, seed data
- `apps/api/package.json` - @taxvn/supabase package with @supabase/supabase-js dependency
- `apps/api/tsconfig.json` - TypeScript strict config for api package
- `apps/api/src/database.types.ts` - Typed Database interface for all 4 tables
- `apps/api/src/supabase.ts` - Supabase client with env fallback
- `apps/api/src/index.ts` - Barrel export
- `package.json` - Added supabase:start/stop/reset/migrate/functions scripts
- `.gitignore` - Added supabase/.temp/

## Decisions Made
- Used hand-written Database types as placeholder; should regenerate with `supabase gen types typescript --local` after running `supabase start`
- Configured Google OAuth in config.toml via `env()` references, actual credentials configured in Supabase dashboard
- Supabase client reads both `SUPABASE_*` and `EXPO_PUBLIC_SUPABASE_*` env vars for server and mobile compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added tsconfig.json to apps/api**
- **Found during:** Task 01-03 (Supabase client package)
- **Issue:** Plan verification mentions `tsc --noEmit` but no tsconfig.json was specified in the plan
- **Fix:** Created apps/api/tsconfig.json with strict mode, ESNext module, bundler resolution
- **Files modified:** apps/api/tsconfig.json
- **Verification:** File exists with correct configuration
- **Committed in:** 20b9bc7 (Task 01-03 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for TypeScript compilation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Local Supabase dev requires Docker and `supabase start`.

## Next Phase Readiness
- Database schema ready for Plan 02-02 (Edge Functions: share tokens, version gate, health check)
- @taxvn/supabase client package ready for mobile app integration (Phase 3)
- After running `supabase start`, regenerate types with `supabase gen types typescript --local > apps/api/src/database.types.ts`

## Self-Check: PASSED

All 9 created files verified on disk. All 3 task commits (89af310, 689abc5, 20b9bc7) verified in git log.

---
*Phase: 02-backend-api*
*Completed: 2026-04-01*
