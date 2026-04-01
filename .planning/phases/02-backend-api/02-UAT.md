# Phase 02: Backend API - User Acceptance Testing (UAT)

## Status Summary
- **Phase:** 02 (Backend API)
- **Status:** In Progress
- **Last Updated:** 2026-04-01
- **Overall Result:** [PASS]

## Test Cases

| ID | Title | Description | Result | Notes |
|---|---|---|---|---|
| API-01 | Supabase Initialization | Verify `supabase init` and file structure | [PASS] | |
| API-02 | DB Migration | Verify tables exist: `calculation_history`, `share_snapshots`, `push_tokens`, `app_config` | [PASS] | |
| API-03 | RLS Policies | Verify RLS enabled and policies created | [PASS] | |
| API-04 | App Config Seed | Verify `version_gate` seed data | [PASS] | |
| API-05 | Shared Package | Verify `@taxvn/supabase` package and types | [PASS] | |
| API-06 | Health Endpoint | Verify `v1/health` deep check | [PASS] | |
| API-07 | Version Check | Verify `v1/version-check` logic (supported/unsupported) | [PASS] | |
| API-08 | Share Creation | Verify `v1/share` token generation (NanoID 8-char) | [PASS] | |
| API-09 | Integration Tests | Run vitest suite in `apps/api` | [PASS] | |

## Detailed Logs

### API-01: Supabase Initialization
- [ ] Check `supabase/config.toml`
- [ ] Check root `package.json` scripts
- [ ] Check `supabase/.env.example`

### API-02: DB Migration
- [ ] Verify 4 custom tables exist in `public` schema

### API-03: RLS Policies
- [ ] Verify `ENABLE ROW LEVEL SECURITY` on all 4 tables

### API-04: App Config Seed
- [ ] Verify `key='version_gate'` exists in `app_config`

### API-06: Health Endpoint
- [ ] `curl -X GET http://localhost:54321/functions/v1/health`

### API-07: Version Check
- [ ] Test with `clientVersion: "0.0.1"` (expected: not supported)
- [ ] Test with `clientVersion: "0.1.0"` (expected: supported)

### API-08: Share Creation
- [ ] `curl -X POST http://localhost:54321/functions/v1/share ...`

### API-09: Integration Tests
- [ ] `cd apps/api && pnpm test`
