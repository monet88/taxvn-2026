# Phase 2: Backend API - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Node.js backend API that handles authentication (email/password + Google OAuth), calculation history persistence, share snapshot storage, push notification token registry, and tax-core version gating. The API lives at `apps/api/` in the monorepo and exposes tRPC procedures — NO calculator endpoints (tax-core runs client-side in mobile).

Deliverables: Fastify server with tRPC router, PostgreSQL database with Prisma ORM, JWT auth with refresh rotation, rate limiting, structured logging, health checks, and a defined error contract consumable by the mobile app.

</domain>

<decisions>
## Implementation Decisions

### API Infrastructure & Deployment
- API app lives at `apps/api/` — consistent with pnpm-workspace.yaml `apps/*` pattern already configured
- Fastify v5 + tRPC v11 — latest stable, smoke test adapter early per STATE.md blocker note
- Local dev via `pnpm dev` using turbo pipeline — adds `apps/api` as workspace with `dev` script
- Docker Compose PostgreSQL 16 for local dev — extend existing `docker-compose.yml` with a `db` service

### Authentication Flow
- Bcrypt with 12 rounds — secure default (~250ms on modern hardware)
- Refresh token storage in database `sessions` table per REQUIREMENTS.md API-02 schema — simpler infra, no Redis in v1
- Google OAuth via `@fastify/oauth2` — native Fastify plugin, handles redirect flow with mobile deep link callback
- Rate limiting via `@fastify/rate-limit` plugin — per-IP tracking with in-memory store (no Redis in v1)

### Data Model & API Design
- Share tokens: NanoID 8-char — URL-safe, collision-resistant, dependency-free generation
- Calculation history: full JSON blob in `input_json` + `result_json` columns — matches REQUIREMENTS.md API-02 schema, enables full state restoration
- API versioning: URL prefix `/api/v1/` — simple, explicit, easy to add v2 later
- Share snapshot expiration: 90 days — balances storage with usability, background cleanup job

### Observability & Error Handling
- Structured logging with `pino` — Fastify's built-in logger, JSON format, low overhead
- Health checks: shallow `/health` (app alive) + deep `/health/ready` (DB connected) — OBS-02 compliance
- tRPC error codes mapped to API-12 error contract as custom `TRPC_ERROR_CODE` with `cause` field for consumer details
- Request validation via tRPC input validators with `zod` schemas — colocated with procedure definitions

### Agent's Discretion
No items deferred to agent discretion — all grey areas resolved by user accepting recommended defaults.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/tax-core` — 30+ pure calculator modules, already extracted and tested (127 golden-output tests)
- `packages/tax-data` — 6 static reference data modules (tax law history, treaty data, exemption checker, deadline manager, pension constants)
- `packages/config` — shared Turborepo configuration
- Existing `docker-compose.yml` and `Dockerfile` — can extend for API + Postgres services
- `turbo.json` — pipeline already configured for build/test/lint/dev
- `pnpm-workspace.yaml` — already includes `apps/*` glob

### Established Patterns
- TypeScript strict mode with ES2017 target
- camelCase for files/functions, SCREAMING_SNAKE_CASE for constants
- Pure function pattern: export named functions + typed interfaces, no default exports in lib files
- Comprehensive type definitions with interfaces for data shapes
- `@/*` path alias for internal imports

### Integration Points
- `apps/api/` will be a new workspace consuming `packages/tax-core` types (for snapshot validation) and `packages/tax-data` (for version info)
- Mobile app (Phase 3) will consume tRPC client generated from this API's router type
- Share snapshot format must be compatible with existing `snapshotCodec.ts` (lz-string compressed JSON)
- tax-core version endpoint needs to know package versions from `packages/tax-core/package.json`

</code_context>

<specifics>
## Specific Ideas

- tRPC v11 Fastify adapter needs early smoke test — noted as blocker in STATE.md
- Database schema follows REQUIREMENTS.md API-02 draft exactly: users, sessions, calculation_history, share_snapshots, push_tokens
- Error contract codes from API-12: AUTH_EXPIRED, RATE_LIMITED, HISTORY_NOT_FOUND, SHARE_NOT_FOUND, SERVER_ERROR
- Tax-core version gate (API-11): minimum version + effective date endpoint, feature flags to disable specific calculators remotely

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
