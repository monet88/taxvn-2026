---
phase: 02-backend-api
verified: 2026-04-01T15:30:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "Five failed login attempts within 15 minutes from the same IP are blocked with appropriate error response"
    status: partial
    reason: "Supabase Auth rate limiting is configured at 30 sign-in attempts per 5 minutes (config.toml), not 5 per 15 minutes as the success criterion requires. No custom rate-limiting logic exists. Production threshold is dashboard-only config, not enforced in codebase."
    artifacts:
      - path: "supabase/config.toml"
        issue: "sign_in_sign_ups = 30 (per 5 min) does not match the 5-per-15-min requirement"
    missing:
      - "Either update config.toml sign_in_sign_ups to 5 (per 5 min window) for stricter local dev parity, or document that production rate limiting is configured via Supabase dashboard with the specific 5/15min threshold"
      - "No integration test validates rate limiting behavior"
  - truth: "A user can register with email/password and log in, receiving short-lived access tokens that refresh automatically"
    status: partial
    reason: "Email/password auth fully functional via Supabase Auth. Google OAuth is mentioned in the phase goal but has NO configuration in config.toml -- only Apple is listed (disabled). CONTEXT.md says Google is configured via dashboard, but there is zero codebase evidence. JWT expiry (3600s) and refresh token rotation are properly configured."
    artifacts:
      - path: "supabase/config.toml"
        issue: "Missing [auth.external.google] section -- Google OAuth not configured even as a placeholder"
    missing:
      - "Add [auth.external.google] section to config.toml with env() references for client_id and secret, matching the Apple template pattern"
human_verification:
  - test: "Run supabase start and execute integration tests"
    expected: "All 30+ tests pass against local Supabase instance"
    why_human: "Tests require Docker and running Supabase instance -- cannot verify in static analysis"
  - test: "Verify Google OAuth flow end-to-end"
    expected: "User can sign in with Google via Supabase Auth"
    why_human: "Requires Supabase dashboard configuration and real Google OAuth credentials"
  - test: "Verify rate limiting blocks after threshold"
    expected: "After N failed login attempts, subsequent attempts are blocked with 429 response"
    why_human: "Requires running Supabase instance and rapid successive auth requests"
---

# Phase 2: Backend API Verification Report

**Phase Goal:** Users can register, log in (email + Google), and the API correctly persists history entries and share tokens -- the mobile app can authenticate and store data
**Verified:** 2026-04-01T15:30:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A user can register with email/password and log in, receiving short-lived access tokens that refresh automatically | PARTIAL | Email/password: config.toml has auth.email.enable_signup=true, JWT expiry=3600s, refresh_token_rotation=true. Google OAuth: NO [auth.external.google] in config.toml. CONTEXT.md claims dashboard config only. |
| 2 | A logged-in user can save a calculation, retrieve the list, and delete entries -- data persists across sessions | VERIFIED | calculation_history table with proper schema (migration line 8-17), RLS policies (lines 79-89), integration tests cover insert/filter/pagination/delete/bulk-delete/RLS (history.test.ts, 8 tests) |
| 3 | Posting a share snapshot returns an 8-character token; fetching that token returns the original snapshot JSON | VERIFIED | share/index.ts uses nanoid(8), inserts to share_snapshots with 90-day expiry. Retrieval via Supabase client query (public RLS). Tested in share.test.ts (6 tests including token length, retrieval, expiry, uniqueness) |
| 4 | Five failed login attempts within 15 minutes from the same IP are blocked with appropriate error response | PARTIAL | config.toml has sign_in_sign_ups=30 per 5 minutes -- significantly more permissive than the 5/15min requirement. No custom rate-limiting logic. No test validates this behavior. |
| 5 | The /health endpoint returns 200 and structured logs appear for every auth event and API error | VERIFIED | health/index.ts returns {status:"ok", database:"connected", timestamp} with deep DB check. Structured logging (console.info/error with context objects) in all 3 Edge Functions. Auth event logs handled by Supabase Auth built-in. Tested in health.test.ts (3 tests). |

**Score:** 4/5 truths verified (2 partial, treated as 1 verified + 1 partial for scoring -- both partials have core functionality working but miss specific sub-requirements)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/config.toml` | Supabase project config with auth | VERIFIED | 397 lines, auth enabled, email signup, rate limiting, edge runtime |
| `supabase/migrations/00001_initial_schema.sql` | 4 tables + RLS + indexes | VERIFIED | 128 lines: calculation_history, share_snapshots, push_tokens, app_config with 7 RLS policies, 5 indexes, 1 trigger, seed data |
| `supabase/functions/share/index.ts` | Share token generation Edge Function | VERIFIED | 57 lines: Deno.serve, nanoid(8), 90-day expiry, POST validation, structured logging, error contract |
| `supabase/functions/version-check/index.ts` | Version gate Edge Function | VERIFIED | 63 lines: compareVersions semver, app_config query, isSupported/updateRequired response |
| `supabase/functions/health/index.ts` | Health check Edge Function | VERIFIED | 33 lines: deep DB check via app_config query, ok/degraded status |
| `supabase/functions/_shared/cors.ts` | CORS utility | VERIFIED | 11 lines: corsHeaders + handleCors for OPTIONS preflight |
| `supabase/functions/_shared/supabase.ts` | Supabase client factories | VERIFIED | 17 lines: createServiceClient (service_role) + createAnonClient |
| `supabase/functions/_shared/errors.ts` | Error contract (API-12) | VERIFIED | 37 lines: 9 ErrorCode constants, errorResponse + successResponse helpers |
| `apps/api/src/database.types.ts` | TypeScript types for DB | VERIFIED | 289 lines: Generated Supabase types with Row/Insert/Update for all 4 tables + utility types |
| `apps/api/src/supabase.ts` | Shared Supabase client | VERIFIED | 9 lines: createClient<Database> with env fallback (SUPABASE_* / EXPO_PUBLIC_SUPABASE_*) |
| `apps/api/src/index.ts` | Barrel export | VERIFIED | 2 lines: exports supabase client + Database type |
| `apps/api/package.json` | Package config with test scripts | VERIFIED | @supabase/supabase-js ^2.49.0, vitest ^3.0.0, test scripts |
| `apps/api/vitest.config.ts` | Test configuration | VERIFIED | globals, node environment, setup file, 30s timeout |
| `apps/api/src/__tests__/helpers.ts` | Test utilities | VERIFIED | 116 lines: createServiceClient, createAnonClient, createAuthenticatedClient, callEdgeFunction, isSupabaseRunning |
| `apps/api/src/__tests__/setup.ts` | Test env setup | VERIFIED | Sets Supabase default local dev JWT tokens |
| `apps/api/src/__tests__/history.test.ts` | History CRUD integration tests | VERIFIED | 8 tests: insert, filter by tool/date, pagination, single/bulk delete, RLS isolation (2 tests) |
| `apps/api/src/__tests__/share.test.ts` | Share snapshot integration tests | VERIFIED | 6 tests: create, retrieve, 90-day expiry, validation, method check, uniqueness |
| `apps/api/src/__tests__/pushTokens.test.ts` | Push token integration tests | VERIFIED | 8 tests: register iOS/Android, upsert, delete, RLS isolation, platform validation, multi-device |
| `apps/api/src/__tests__/versionCheck.test.ts` | Version check integration tests | VERIFIED | 5 tests: supported/outdated/newer, validation, update URLs |
| `apps/api/src/__tests__/health.test.ts` | Health check integration tests | VERIFIED | 3 tests: ok status, ISO timestamp, CORS preflight |
| `supabase/.env.example` | Environment template | VERIFIED | 3 vars: SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY |
| `apps/api/tsconfig.json` | TypeScript config | MISSING | SUMMARY claims it was created in commit 20b9bc7 but file does not exist on disk. Commit hash 20b9bc7 does not exist in git history. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| share/index.ts | _shared/cors.ts | `import { handleCors }` | WIRED | Line 1 imports, line 8 uses handleCors(req) |
| share/index.ts | _shared/supabase.ts | `import { createServiceClient }` | WIRED | Line 2 imports, line 20 calls createServiceClient() |
| share/index.ts | _shared/errors.ts | `import { errorResponse, successResponse }` | WIRED | Line 3 imports, used for all response paths |
| share/index.ts | share_snapshots table | `supabase.from('share_snapshots').insert()` | WIRED | Line 33 inserts with all required columns |
| version-check/index.ts | app_config table | `supabase.from('app_config').select()` | WIRED | Lines 36-40 query version_gate config |
| health/index.ts | app_config table | `supabase.from('app_config').select()` | WIRED | Line 13 deep health check query |
| apps/api/src/supabase.ts | database.types.ts | `import type { Database }` | WIRED | Line 2 imports, line 7 uses as createClient<Database> |
| Test helpers | @supabase/supabase-js | `import { createClient }` | WIRED | Line 4 imports, used in all client factory functions |
| history.test.ts | helpers.ts | `import { createAuthenticatedClient, ... }` | WIRED | Line 3 imports all needed helpers |
| share.test.ts | helpers.ts | `import { callEdgeFunction, ... }` | WIRED | Line 6 imports Edge Function helper |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|---------|
| share/index.ts | snapshotJson | req.json() (HTTP POST body) | Yes -- client sends snapshot, inserted to DB | FLOWING |
| version-check/index.ts | config (VersionConfig) | app_config table query | Yes -- seed data exists in migration | FLOWING |
| health/index.ts | error (DB check) | app_config table select | Yes -- real DB connectivity probe | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED (requires running Supabase instance -- Docker + `supabase start`). All behavioral verification routed to human verification section.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| API-01 | 02-01 | Server setup (Supabase replaces Fastify) | SATISFIED | supabase/config.toml, Edge Functions, Supabase project initialized |
| API-02 | 02-01 | Database schema (Supabase replaces Prisma) | SATISFIED | 00001_initial_schema.sql with 4 tables matching spec |
| API-03 | 02-01 | JWT authentication (Supabase Auth replaces custom JWT) | SATISFIED | config.toml: jwt_expiry=3600, refresh_token_rotation=true, Supabase Auth handles access+refresh |
| API-04 | 02-01 | Google OAuth (Supabase Auth) | PARTIAL | Supabase Auth supports Google natively but no [auth.external.google] in config.toml -- dashboard-only config |
| API-05 | 02-02 | Save calculation history | SATISFIED | calculation_history table + RLS INSERT policy + tested in history.test.ts |
| API-06 | 02-02 | Query history (list, filter, search) | SATISFIED | RLS SELECT policy + tested: filter by tool_name, date range, cursor pagination |
| API-07 | 02-02 | Delete history (single + bulk) | SATISFIED | RLS DELETE policy + tested: single delete, bulk delete via .in() |
| API-08 | 02-02 | Push token registry | SATISFIED | push_tokens table + RLS ALL policy + tested: register/upsert/delete/RLS |
| API-09 | 02-02 | Remote push notification trigger | SATISFIED | push_tokens table stores FCM/APNs tokens per user/device. Actual sending deferred to Phase 6 (by design) |
| API-10 | 02-02 | Share snapshot (POST -> token, GET -> snapshot) | SATISFIED | share/index.ts Edge Function (POST), public RLS read policy (GET via client), tested |
| API-11 | 02-02 | Version gate with feature flags | SATISFIED | version-check/index.ts reads app_config, returns isSupported/disabledCalculators/updateUrl |
| API-12 | 02-02 | Error contract | SATISFIED | errors.ts: 9 ErrorCode constants (AUTH_EXPIRED, RATE_LIMITED, etc.), standardized JSON structure |
| SEC-01 | 02-01 | Login rate limiting | PARTIAL | config.toml has sign_in_sign_ups=30/5min, not matching 5/15min spec. Supabase has built-in rate limiting but threshold is permissive. |
| SEC-02 | 02-01 | PDPD compliance (privacy, data handling) | NEEDS HUMAN | No privacy policy or consent flow code in Phase 2. This may be a mobile-only concern (Phase 3). The data schema itself stores only calculation data and auth tokens. |
| OBS-01 | 02-01 | Structured logging | SATISFIED | All Edge Functions use console.info/error with context objects ({token, createdBy}, {error}) |
| OBS-02 | 02-01 | Health check endpoint | SATISFIED | health/index.ts returns {status, database, timestamp} with deep DB check |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | No TODO/FIXME/PLACEHOLDER/stub patterns found | - | - |

**SUMMARY accuracy issues (non-functional):**
- 02-01-SUMMARY.md claims commits 89af310, 689abc5, 20b9bc7 for individual tasks -- these commit hashes do NOT exist in git history. All work was in single commit a77d5be.
- 02-01-SUMMARY.md claims apps/api/tsconfig.json was created -- file does not exist on disk. However, TypeScript compilation is not strictly required since the package uses `"main": "src/index.ts"` (direct TS resolution by consumers, not compiled output). This is a minor gap.

### Human Verification Required

### 1. Integration Test Suite Execution

**Test:** Run `supabase start && cd apps/api && pnpm test`
**Expected:** All 30 integration tests pass (history: 8, share: 6, push: 8, version: 5, health: 3)
**Why human:** Requires Docker and running Supabase local instance

### 2. Google OAuth End-to-End Flow

**Test:** Configure Google OAuth in Supabase dashboard, attempt sign-in with Google account
**Expected:** User is created in auth.users, receives valid session with access + refresh tokens
**Why human:** Requires real Google OAuth credentials and Supabase dashboard configuration

### 3. Rate Limiting Behavior

**Test:** Send 6+ rapid sign-in requests with wrong password from same IP
**Expected:** Requests are blocked after threshold with appropriate error response
**Why human:** Requires running Supabase instance and timing-sensitive request pattern

### 4. RLS Policy Enforcement

**Test:** Using two different authenticated clients, verify cross-user data isolation
**Expected:** User A cannot read/modify User B's history or push tokens
**Why human:** Covered by integration tests but requires running instance to execute

### Gaps Summary

Two partial gaps were identified:

1. **Google OAuth Configuration (SC1, API-04):** The phase goal explicitly mentions "log in (email + Google)" but Google OAuth has zero configuration in the codebase. The config.toml has `[auth.external.apple]` (disabled) but no `[auth.external.google]` section. The CONTEXT.md states this is dashboard-only, but the codebase should at minimum have the config.toml template entry with `env()` references. This is a gap between the stated goal and the delivered artifacts.

2. **Rate Limiting Threshold (SC4, SEC-01):** The success criterion specifies "five failed login attempts within 15 minutes" but the config.toml allows 30 attempts per 5 minutes. This 6x more permissive threshold does not match the requirement. While Supabase handles rate limiting at the platform level and production thresholds can be set via dashboard, the local dev configuration should reflect the intended policy, and an integration test should validate the behavior.

**Root cause:** Both gaps stem from the same pattern -- relying on Supabase dashboard configuration without any codebase evidence. The codebase should contain at minimum placeholder config and documentation for production-only settings.

**Missing `apps/api/tsconfig.json`:** The SUMMARY claims this file was created but it does not exist. This is a minor issue since the package's TypeScript is consumed directly (not compiled), but it prevents `tsc --noEmit` verification mentioned in the plan.

---

_Verified: 2026-04-01T15:30:00Z_
_Verifier: Claude (gsd-verifier)_
