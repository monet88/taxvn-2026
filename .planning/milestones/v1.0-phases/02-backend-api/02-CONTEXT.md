# Phase 2: Backend API - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning
**Revised:** 2026-04-01 — Switched from Prisma+Fastify+tRPC to Supabase

<domain>
## Phase Boundary

Set up Supabase as the backend platform for authentication (email/password + Google OAuth), calculation history persistence, share snapshot storage, push notification token registry, and tax-core version gating. Custom logic handled via Supabase Edge Functions. Mobile app uses `@supabase/supabase-js` client directly — NO custom API server needed.

Deliverables: Supabase project with SQL migrations (5 tables + RLS policies), Supabase Auth configured (email + Google), Edge Functions for share tokens and version gate, structured logging via Edge Function logs.

</domain>

<decisions>
## Implementation Decisions

### Backend Platform
- **Supabase** replaces Prisma + Fastify + tRPC — built-in auth, database, auto-generated API
- Free tier: 500MB DB, 50,000 MAU, unlimited API requests
- Supabase client SDK (`@supabase/supabase-js`) used directly from mobile app
- Edge Functions (Deno) for custom logic: share tokens, version gate
- No custom API server — eliminates deployment and hosting costs

### Authentication Flow (Supabase Auth)
- Email/password registration and login — built into Supabase Auth
- Google OAuth — configured via Supabase dashboard, SDK handles flow
- Session management — Supabase handles JWT access + refresh tokens automatically
- Rate limiting — Supabase Auth has built-in rate limiting on auth endpoints
- Biometric auth (Phase 3) — mobile stores Supabase session in secure storage, biometric unlocks it

### Data Model & Security
- 4 custom tables: `calculation_history`, `share_snapshots`, `push_tokens`, `app_config`
- Users managed by Supabase Auth (`auth.users` — built-in, not custom)
- Sessions managed by Supabase Auth (`auth.sessions` — built-in, not custom)
- Row Level Security (RLS) on all custom tables — users can only access their own data
- Share snapshots: NanoID 8-char tokens, 90-day expiration, public read via RLS policy
- `app_config` table for version gate config (replaces hardcoded version endpoint)

### Share Tokens
- Edge Function: `POST /functions/v1/share` — generates NanoID 8-char token, inserts snapshot
- Share retrieval via direct Supabase client query (public RLS policy on share_snapshots by token)
- 90-day expiration, pg_cron for cleanup (or Supabase scheduled function)

### Version Gate
- Edge Function: `POST /functions/v1/version-check` — reads app_config table, compares client version
- Returns: `{ isSupported, latestVersion, minimumVersion, updateRequired, disabledCalculators }`
- Config stored in `app_config` table (editable via Supabase dashboard)

### Observability
- Supabase Dashboard provides: query logs, auth event logs, real-time monitoring
- Edge Function logs for custom logic (share, version gate)
- Health check: Supabase status endpoint + custom Edge Function `/functions/v1/health`

### Agent's Discretion
No items deferred to agent discretion — all grey areas resolved.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/tax-core` — 30+ pure calculator modules (runs client-side, not on server)
- `packages/tax-data` — 6 static reference data modules
- Existing `docker-compose.yml` — can add Supabase local dev (supabase CLI)
- `pnpm-workspace.yaml` — already includes `apps/*` glob

### Established Patterns
- TypeScript strict mode
- camelCase for files/functions, SCREAMING_SNAKE_CASE for constants
- Pure function pattern in lib files

### Integration Points
- Mobile app (Phase 3) imports `@supabase/supabase-js` and uses Supabase Auth + client queries
- Share snapshot format compatible with existing `snapshotCodec.ts` (lz-string compressed JSON)
- Supabase Edge Functions deployed via `supabase functions deploy`

</code_context>

<specifics>
## Specific Ideas

- Use Supabase CLI for local development (`supabase init`, `supabase start`)
- SQL migrations in `supabase/migrations/` — version controlled
- RLS policies ensure data isolation per user
- Share snapshots have a public read policy (anyone with token can read)
- Edge Functions use Deno runtime — TypeScript, no Node.js

</specifics>

<deferred>
## Deferred Ideas

- Push notification sending (Phase 6) — will use Supabase Edge Functions + FCM/APNs
- Offline sync (v2) — Supabase has realtime subscriptions but full offline sync is deferred

</deferred>
