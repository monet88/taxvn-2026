# Phase 2: Backend API - Research

**Researched:** 2026-04-01
**Status:** Complete

## Key Findings

### tRPC v11 + Fastify v5 Adapter
- tRPC v11 requires Fastify v5+ (breaking change from v4)
- Install: `@trpc/server fastify zod`
- Adapter import: `@trpc/server/adapters/fastify` → `fastifyTRPCPlugin`
- **Critical**: Must set `routerOptions.maxParamLength: 5000` for batch requests
- Context factory receives `{ req, res }: CreateFastifyContextOptions`
- Register: `server.register(fastifyTRPCPlugin, { prefix: '/trpc', trpcOptions: { router, createContext } })`

### Prisma + PostgreSQL in Monorepo
- Prisma schema at `apps/api/prisma/schema.prisma`
- `prisma.config.ts` with `defineConfig` for type-safe env access
- Generator: `prisma-client` with output to `./generated/client`
- Migrations: `npx prisma migrate dev` (dev), `npx prisma migrate deploy` (prod)
- In monorepo: `pnpm exec prisma generate` from `apps/api/`

### Authentication Pattern
- bcrypt with 12 cost factor (~250ms)
- JWT access token (15min) + refresh token (7-day, rotated on use)
- Sessions stored in DB with `refresh_token_hash` (never store raw token)
- Blacklist via deleting session row on logout
- Google OAuth via `@fastify/oauth2` plugin

### Rate Limiting
- `@fastify/rate-limit` — per-route config, in-memory store
- 5 attempts/15min on login route, exponential backoff response

### Health Checks
- `/health` — shallow (app alive, returns 200)
- `/health/ready` — deep (Prisma `$queryRaw` to verify DB connection)

### Share Tokens
- NanoID 8-char: `nanoid(8)` — URL-safe alphabet, collision probability negligible at this scale
- 90-day expiration with background cleanup (Prisma scheduled delete)

## Validation Architecture

### Test Strategy
- Vitest for unit tests (calculators already use it in packages/tax-core)
- Supertest + Fastify inject for API integration tests
- Key test areas: auth flow, token refresh, rate limiting, history CRUD, share CRUD

### Risk Areas
- tRPC v11 + Fastify v5 adapter compatibility (smoke test first PR)
- Prisma migration management in monorepo
- JWT refresh token rotation race conditions under concurrent requests

---
*Research complete: 2026-04-01*
