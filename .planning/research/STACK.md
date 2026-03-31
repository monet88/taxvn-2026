# Technology Stack

**Project:** TaxVN Mobile — React Native + Node.js backend
**Researched:** 2026-03-31
**Overall Confidence:** HIGH (all major choices verified against current sources as of 2026-03-31)

---

## Context: What We Are Building

The existing Next.js static site has 40+ pure TypeScript modules in `src/lib/` — zero React imports,
zero side effects. These modules are the crown jewel and must be reused verbatim on the backend.
No new tax logic should be written; everything routes through the shared package.

The new system is a monorepo with three apps:
- `apps/mobile` — Expo (React Native) iOS + Android
- `apps/api` — Fastify Node.js REST API
- `packages/tax-engine` — the existing `src/lib/` modules, extracted as a shared TypeScript package

---

## Recommended Stack

### Mobile App

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo SDK | 55.x (latest stable) | React Native runtime + toolchain | New Architecture only (Legacy removed in SDK 55), React 19.2, React Native 0.83. Default for new projects. Managed workflow eliminates native config friction for iOS + Android simultaneously. |
| React Native | 0.83 (bundled with SDK 55) | Cross-platform mobile framework | Bundled by Expo SDK — do not install separately. New Architecture is the only option from SDK 55 onward. |
| Expo Router | v5.x (bundled with SDK 55) | File-based navigation | Built on React Navigation. File-system routing matches mental model from Next.js (familiar to this codebase). Automatic deep linking, type-safe routes out of the box. |
| NativeWind | v4.2.x (stable) or v5 (preview) | Utility-first styling (Tailwind in RN) | The existing web app is heavily Tailwind. NativeWind v4 is proven stable with Expo SDK 54/55. v5 (preview) adds Tailwind CSS v4 support but is not yet stable — start with v4.2.x. |
| Zustand | 5.x (5.0.12 current) | Client-side UI state | 20M+ weekly downloads, zero dependencies, React Concurrent Mode safe. The current web app uses props drilling from a single page; Zustand replaces this cleanly. Do not use Redux Toolkit — this app has no need for time-travel debugging or saga middleware. |
| TanStack Query | v5.x (5.95.x current) | Server state + API caching | Handles fetching, caching, background refetch, and offline persistence for API calls. Use alongside Zustand (not instead of it): Zustand for UI state, TanStack Query for all backend data. Required: `@tanstack/query-async-storage-persister` + `@react-native-async-storage/async-storage` for offline caching. |
| expo-notifications | SDK 55 bundled | Push notifications (local + remote) | Unified iOS/Android API. Requires FCM v1 credentials for Android production delivery. Do not use the FCM Legacy API (deprecated by Google). |
| expo-auth-session | SDK 55 bundled | OAuth redirect flow (Google Sign-In) | Handles redirect URI, browser popup, and token exchange for Google OAuth. Cross-platform (iOS + Android + web). Alternative `@react-native-google-signin` requires native code and cannot be used in Expo Go. |
| expo-secure-store | SDK 55 bundled | Secure token storage | Stores JWT refresh tokens in iOS Keychain / Android EncryptedSharedPreferences. Never use AsyncStorage for auth tokens. |

### Backend API

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 22.x LTS | Runtime | Already confirmed in existing codebase (Dockerfile `node:22-alpine`, local `v22.22.0`). LTS until April 2027. Fastify v5 requires Node 20+, so 22.x satisfies that requirement. |
| Fastify | 5.x (5.8.4 current) | HTTP framework | 2-3x faster than Express for JSON APIs, 4.8M weekly downloads, TypeScript-first. The app is heavily JSON computation (tax calc results) so serialization speed matters. Express is the safe legacy choice but Fastify's built-in schema validation + serialization is a better fit for a typed TypeScript API. |
| Prisma ORM | 7.x (7.6.0 current) | Database access | Strongest TypeScript type safety of any Node.js ORM. Auto-generated client from schema. TypedSQL for raw queries. Prisma Migrate for schema evolution. The move from 6.x to 7.x replaced the Rust query engine with a TypeScript engine — no binary compilation step. |
| PostgreSQL | 16.x | Primary database | Structured relational data (users, tax history records) with ACID guarantees. 55.6% developer usage vs MongoDB's 24% (Stack Overflow 2025). Tax calculation history has a fixed schema — flexible document storage would be wasteful here. Use Neon (serverless) or Supabase-hosted Postgres for managed hosting. |
| jsonwebtoken | 9.x | JWT signing/verification | Industry-standard. Use separate signing secrets for access tokens (15 min TTL) and refresh tokens (30 day TTL). Store refresh tokens hashed in DB. Store refresh token in httpOnly secure cookie, access token in memory. |
| bcrypt | 5.x | Password hashing | Standard for email/password auth. 10 salt rounds is the current recommendation. |
| zod | 3.x | Request/response validation | TypeScript-first schema validation. Define schemas once; use for API request validation in Fastify AND for shared types consumed by the mobile client. |

### Monorepo Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turborepo | latest (v2.x) | Monorepo build orchestration | Fast incremental builds with caching. Simpler setup than Nx for a three-app structure. Expo SDK 52+ auto-detects monorepos — no manual Metro config needed. Official Expo monorepo example (`byCedric/expo-monorepo-example`) uses Turborepo + pnpm. |
| pnpm workspaces | 9.x | Package manager + workspace links | Fast installs via content-addressable store. Native workspace support without Lerna overhead. Preferred by the reference Expo monorepo example. |
| TypeScript | 5.x (5.9.x, matching existing) | Type safety across all packages | All packages share a root `tsconfig.json` with project references. The `tax-engine` package exports the existing `src/lib/` types directly. |

### Push Notifications (Production)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo Push Service | N/A (cloud) | Notification dispatch during MVP | Free, unified iOS/Android API, no backend code for APNs/FCM. Acceptable for MVP. Use `ExpoPushToken` via `getExpoPushTokenAsync`. |
| Firebase FCM v1 | N/A (SDK) | Android delivery engine (required in production) | Expo's push service uses FCM v1 under the hood for Android. Must configure FCM v1 credentials (OAuth-based service account) — the legacy FCM server key API was deprecated. |

---

## Critical Architecture Decision: Shared `tax-engine` Package

The 40+ modules in `src/lib/` are pure TypeScript with zero dependencies. The migration strategy:

1. Create `packages/tax-engine/` in the monorepo.
2. Copy `src/lib/` files into `packages/tax-engine/src/`.
3. Add a `package.json` with `name: "@taxvn/tax-engine"`.
4. Both `apps/api` and `apps/mobile` import from `@taxvn/tax-engine`.
5. The API exposes HTTP endpoints that call these functions; the mobile app calls the API.
6. The mobile app does NOT import `@taxvn/tax-engine` directly — all calculations go through the API. This ensures: (a) result consistency, (b) no bundle size penalty on mobile, (c) easy audit logging.

This is the most important architectural decision. Keeping logic in a shared package (not duplicating) and keeping the mobile app thin (API calls only, no direct imports of tax functions) prevents drift.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Expo SDK 55 (managed) | Bare React Native workflow | Bare workflow requires managing Xcode/Android Studio config manually. For a two-platform app with no custom native modules needed, managed workflow is strictly better until you hit a wall. |
| Navigation | Expo Router v5 | React Navigation 7 (standalone) | Expo Router is built on React Navigation and adds file-based routing + automatic deep linking. Since we're on Expo, there's no reason to bypass it. |
| State (UI) | Zustand 5 | Redux Toolkit | RTK's own maintainers say it "peaked in 2017." RTK Query overlaps with TanStack Query. RTK adds boilerplate for no gain here. |
| State (server) | TanStack Query v5 | SWR | TanStack Query has React Native-specific offline docs, AsyncStorage persister packages, and onlineManager integration. SWR has no first-class React Native support. |
| HTTP framework | Fastify 5 | Express | Express has 12% CPU overhead on JSON parsing alone vs Fastify's 2-3x throughput advantage. This API is JSON-heavy (all tax calc responses). Express is fine for legacy projects; there's no reason to start new with it. |
| HTTP framework | Fastify 5 | Hono | Hono is optimized for edge/serverless. This project will run on a traditional Node.js server (VPS/container). Fastify has a larger ecosystem and more mature plugins for a Node.js deployment target. |
| ORM | Prisma 7 | TypeORM | TypeORM is decorator-based and requires `experimentalDecorators`. Prisma generates from schema and produces stronger types. Prisma 7 removed the Rust binary — simpler deployment. |
| Database | PostgreSQL | MongoDB | Tax history records have a fixed, relational structure: user → calculation → inputs+result. This is a textbook relational model. MongoDB adds flexibility we don't need and removes the ACID guarantees that financial data requires. |
| Auth (hosted) | DIY JWT + Google OAuth | Clerk / Auth0 / Supabase Auth | Clerk has 50k free MAU but couples auth to a third-party service. For a Vietnamese tax app with potentially Vietnamese data residency concerns, self-managed JWT auth is simpler, cheaper at scale, and keeps data fully in our own Postgres. Auth0 costs $0.07/MAU at scale. DIY with `jsonwebtoken` + `bcrypt` is well-understood and keeps the stack minimal. |
| Styling | NativeWind v4.2.x | Tamagui | Tamagui has a steep learning curve and optimizing compiler complexity. NativeWind maps directly to Tailwind CSS class names — developers already know this system from the web app. Gluestack UI v3 + NativeWind is an option for pre-built accessible components if needed. |
| Monorepo | Turborepo + pnpm | Nx | Nx is better for large enterprise setups with many teams and generators. For three apps sharing one package, Turborepo + pnpm workspaces is lower overhead. The official Expo monorepo reference uses this combination. |

---

## Installation

```bash
# Bootstrap monorepo
npx create-turbo@latest taxvn-monorepo --package-manager pnpm

# Mobile app
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript

# Install mobile dependencies
pnpm add nativewind@^4.2.0 tailwindcss@^3.4.17
pnpm add zustand @tanstack/react-query @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
pnpm add @react-native-async-storage/async-storage
pnpm add expo-notifications expo-auth-session expo-secure-store expo-web-browser expo-crypto

# API
cd apps/api
pnpm init
pnpm add fastify @fastify/cors @fastify/jwt @fastify/cookie
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add jsonwebtoken bcrypt zod
pnpm add -D prisma typescript tsx @types/node @types/bcrypt @types/jsonwebtoken

# Shared tax engine package
cd packages/tax-engine
pnpm init
# Copy src/lib/* here — no new dependencies needed (pure TS)
```

---

## Version Confidence Table

| Technology | Verified Version | Confidence | Source |
|------------|-----------------|------------|--------|
| Expo SDK | 55.x (55.0.9) | HIGH | expo.dev/changelog/sdk-55 (Feb 2026) |
| React Native | 0.83 | HIGH | reactnative.dev/blog (Dec 2025) |
| Fastify | 5.x (5.8.4) | HIGH | npmjs.com/package/fastify (Mar 2026) |
| Prisma | 7.x (7.6.0) | HIGH | npmjs.com/package/prisma (Mar 2026) |
| Zustand | 5.x (5.0.12) | HIGH | npmjs.com/package/zustand (Mar 2026) |
| TanStack Query | 5.x (5.95.0) | HIGH | npmjs.com/package/@tanstack/react-query |
| NativeWind | v4.2.x (stable) | HIGH | nativewind.dev docs + community reports |
| NativeWind v5 | preview only | LOW | Not yet stable as of Mar 2026 — do not use in production |
| Node.js | 22.x LTS | HIGH | Current project Dockerfile confirmed |
| Expo Router | v5.x | HIGH | expo.dev/blog/expo-router-v5 |

---

## What NOT to Use

| Technology | Reason |
|-----------|--------|
| Redux Toolkit | Overkill for this app's state complexity. RTK peaked in 2017. Use Zustand + TanStack Query instead. |
| React Navigation standalone | Expo Router is built on it and adds file-based routing for free. Use Expo Router; drop to React Navigation APIs only when needed for complex custom transitions. |
| FCM Legacy API | Deprecated by Google. Expo's push service already migrated to FCM v1. If you configure FCM credentials manually, use service account OAuth (v1 API). |
| AsyncStorage for auth tokens | Not encrypted. Use `expo-secure-store` for any token or credential storage. |
| TypeORM | Decorator-based config, weaker types than Prisma. Prisma 7's TypeScript engine removes the previous binary deployment complexity. |
| MongoDB | Wrong data model for tax history. PostgreSQL's structure enforces correctness for financial records. |
| NativeWind v5 (preview) in production | Not stable as of March 2026. The `nativewind@preview` tag signals active development. Wait for v5.0.0 stable. |
| Express | Starting new backend with Express in 2026 is a regression choice. Fastify gives 2-3x better throughput for JSON APIs with equal or better TypeScript DX. |
| `@react-native-google-signin` | Requires native code (no Expo Go support). Core web functionality is paywalled. Use `expo-auth-session` instead. |
| Hono for this backend | Hono is excellent for edge/serverless. This project deploys to a persistent Node.js server — Fastify's ecosystem is more mature for that target. |

---

## Sources

- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55) — Feb 2026
- [React Native 0.83 Release](https://reactnative.dev/blog/2025/12/10/react-native-0.83) — Dec 2025
- [Fastify npm (v5.8.4)](https://www.npmjs.com/package/fastify) — Mar 2026
- [Prisma npm (v7.6.0)](https://www.npmjs.com/package/prisma) — Mar 2026
- [Zustand npm (v5.0.12)](https://www.npmjs.com/package/zustand) — Mar 2026
- [TanStack Query npm (v5.95.0)](https://www.npmjs.com/package/@tanstack/react-query) — Mar 2026
- [NativeWind Expo SDK Compatibility Discussion](https://github.com/nativewind/nativewind/discussions/1604) — community thread
- [Expo Router v5 announcement](https://expo.dev/blog/expo-router-v5) — Expo blog
- [Fastify vs Express vs Hono comparison](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/) — BetterStack
- [TanStack Query React Native docs](https://tanstack.com/query/latest/docs/framework/react/react-native) — official
- [Expo Push Notification docs](https://docs.expo.dev/push-notifications/overview/) — official
- [Expo Auth Session docs](https://docs.expo.dev/versions/latest/sdk/auth-session/) — official
- [Expo Monorepo guide](https://docs.expo.dev/guides/monorepos/) — official
- [byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example) — reference implementation
- [Auth provider comparison — Clerk vs Auth0 vs Supabase](https://designrevision.com/blog/auth-providers-compared) — Mar 2025
- [PostgreSQL vs MongoDB 2025](https://www.bytebase.com/blog/postgres-vs-mongodb/) — Bytebase
