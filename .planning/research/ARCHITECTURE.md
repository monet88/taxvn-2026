# Architecture Patterns

**Project:** TaxVN Mobile — React Native + Node.js
**Domain:** Cross-platform tax calculator (mobile-first, with Node.js backend)
**Researched:** 2026-03-31
**Overall confidence:** HIGH (all major claims verified against official docs and multiple current sources)

---

## Recommended Architecture

### System Overview

```
taxvn-2026/                         ← existing git repo becomes monorepo root
├── apps/
│   ├── mobile/                     ← NEW: Expo React Native app (iOS + Android)
│   └── api/                        ← NEW: Fastify Node.js backend
├── packages/
│   ├── tax-core/                   ← MIGRATED: src/lib/ pure TS modules
│   └── config/                     ← NEW: shared tsconfig, eslint
├── src/                            ← EXISTING: Next.js (frozen, no new work)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

The existing `src/` tree stays untouched. New work lives entirely in `apps/` and `packages/`. The Next.js app in `src/` is deprecated-in-place and eventually removed after mobile launches.

---

## Component Boundaries

| Component | Responsibility | Communicates With | Platform |
|-----------|---------------|-------------------|----------|
| `packages/tax-core` | All 40+ tax calculation functions, type interfaces, constants | No dependencies — consumed by api and mobile | Node.js + React Native (pure TS) |
| `apps/api` | HTTP API, authentication, user data persistence, push notifications | `packages/tax-core`, database, FCM | Node.js |
| `apps/mobile` | UI screens, navigation, auth flows, user state, API calls | `apps/api` via tRPC, `packages/tax-core` optionally | iOS + Android |

### `packages/tax-core` — The Critical Boundary

This package is the direct migration of `src/lib/` with surgery applied:

**Include in `tax-core`** (40 files confirmed pure TS, zero React):
- All `*Calculator.ts` domain modules (grossNetCalculator, bonusCalculator, etc.)
- `taxCalculator.ts` — core brackets, insurance, `calculateNewTax`, `calculateOldTax`
- `snapshotTypes.ts` — type interfaces (but NOT localStorage or codec logic)
- `taxLawHistory.ts`, `taxTreatyData.ts`, `pensionConstants.ts` — static data
- `taxExemptionChecker.ts`, `taxDeadlineManager.ts` — pure logic

**Exclude from `tax-core`** (platform-specific, stays in respective apps):
- `snapshotCodec.ts` — lz-string URL encoding → mobile uses deep links differently; api doesn't need it
- `snapshotStorage.ts` — localStorage CRUD → mobile uses MMKV, api uses Postgres
- `exportUtils.ts` — PDF generation → mobile uses react-native-pdf or similar
- `pwaUtils.ts` — service worker → deleted, no longer relevant

### `apps/api` — Backend Boundary

The backend owns everything that requires persistence or trust:

- Authentication (JWT access tokens + refresh tokens in HttpOnly cookies for web; secure storage on mobile)
- User account CRUD
- Calculation history persistence (Postgres via Prisma)
- Push notification scheduling (FCM/APNs for tax deadlines)
- Rate limiting and input validation (all inputs validated server-side with Zod even though `tax-core` validates client-side too)
- The tRPC router that exposes typed procedures to mobile

The backend does NOT own tax logic — it imports `tax-core` and delegates calculations there. This preserves the property that calculation results are identical between web (legacy), backend, and any future surface.

### `apps/mobile` — Mobile Boundary

The mobile app owns:

- All UI screens and navigation (Expo Router, file-based)
- Auth state (Zustand store persisted to MMKV)
- Server state (TanStack Query as cache layer over tRPC)
- Local UI state per screen/feature (Zustand or React useState — feature decides)
- Navigation flow (Expo Router route groups for auth vs. authenticated)

The mobile app does NOT call `tax-core` directly for "online" calculations — it sends inputs to the API and receives results. However, `tax-core` can be imported for lightweight client-side pre-validation or offline fallback in v2.

---

## Data Flow

### Primary Calculation Flow (Online)

```
User types salary in TaxInputScreen (mobile)
    ↓ TanStack Query mutation
apps/api POST /trpc/tax.calculate
    ↓ Zod validates input
tax-core calculateNewTax(input)
    ↓ returns TaxResult
apps/api returns typed response
    ↓ TanStack Query updates cache
TaxResultScreen re-renders with result
    ↓ (async, after result shown)
apps/api saves to calculation_history table
```

### Authentication Flow

```
User navigates to app
Expo Router checks (auth) route group guard
    ↓ Zustand auth store has no token
Redirect → /sign-in screen
User submits credentials
    ↓ tRPC mutation: auth.login
apps/api verifies credentials, issues accessToken + refreshToken
accessToken → stored in Expo SecureStore (NOT AsyncStorage)
refreshToken → stored in Expo SecureStore
Zustand auth store updated → guard condition changes
Expo Router auto-redirects → /(tabs)/
```

### Token Refresh Flow

```
TanStack Query fires a request
apps/api returns 401 (accessToken expired)
tRPC client interceptor catches 401
    ↓ calls auth.refresh with refreshToken
apps/api issues new accessToken
Original request retried automatically
If refreshToken also expired → force logout → redirect /sign-in
```

### History Persistence Flow

```
Calculation result displayed in mobile
    ↓ background mutation (fire-and-forget from UX perspective)
apps/api POST /trpc/history.save
    ↓ writes to history table (user_id, inputs JSON, result JSON, timestamp)
History screen loads
    ↓ TanStack Query: history.list (paginated)
apps/api queries Postgres, returns paginated history
    ↓ displayed in HistoryScreen
```

### Push Notification Flow (Tax Deadline Reminders)

```
apps/api cron job runs daily (node-cron)
    ↓ taxDeadlineManager from tax-core returns upcoming deadlines
For each user with notifications enabled:
    ↓ sends via FCM (Firebase Cloud Messaging) for Android
    ↓ sends via APNs for iOS
Mobile receives push → Expo Notifications handles it
User taps notification → deep link to relevant calculator tab
```

---

## Monorepo Structure — Definitive Layout

```
taxvn-2026/
├── apps/
│   ├── mobile/
│   │   ├── app/                    # Expo Router file-based routes
│   │   │   ├── _layout.tsx         # Root layout + providers
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in.tsx
│   │   │   │   └── sign-up.tsx
│   │   │   └── (tabs)/
│   │   │       ├── _layout.tsx     # Bottom tab navigator
│   │   │       ├── index.tsx       # Main tax calculator (replaces tinh-thue)
│   │   │       ├── history.tsx     # Calculation history list
│   │   │       ├── tools.tsx       # 40+ calculator tool grid
│   │   │       └── settings.tsx    # Account + notification settings
│   │   ├── features/               # Feature-grouped logic
│   │   │   ├── auth/               # Login, signup, token management
│   │   │   ├── tax-calculator/     # Main income tax input/result
│   │   │   ├── tools/              # 40+ specialized calculators
│   │   │   └── history/            # Saved calculation history
│   │   ├── components/             # Shared UI primitives (design system)
│   │   ├── store/                  # Zustand stores (auth, settings)
│   │   ├── hooks/                  # Shared custom hooks
│   │   ├── lib/                    # tRPC client setup, API config
│   │   ├── metro.config.js
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── routers/            # tRPC routers: auth, tax, history, notifications
│       │   ├── middleware/         # JWT verification, rate limiting
│       │   ├── db/                 # Prisma schema + client
│       │   ├── services/           # Business services (auth, notifications)
│       │   └── index.ts            # Fastify server entry
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── tax-core/
│   │   ├── src/                    # All 40+ migrated lib modules
│   │   ├── tsconfig.json           # No lib compilation — exports raw TS
│   │   └── package.json            # "main": "./src/index.ts"
│   └── config/
│       ├── tsconfig.base.json
│       ├── eslint.base.js
│       └── package.json
│
├── src/                            # FROZEN: existing Next.js web app
├── pnpm-workspace.yaml
├── turbo.json
└── package.json (root)
```

---

## Technology Decisions

### Monorepo Tooling: pnpm + Turborepo

**Why:** Expo SDK 52+ has first-class pnpm support with auto Metro config. Turborepo provides build caching and parallel task execution. This is the dominant stack for Expo monorepos in 2025, used by the canonical `byCedric/expo-monorepo-example`.

**Critical config:** Set `node-linker=hoisted` in `.npmrc` for the monorepo root to prevent pnpm isolated install conflicts with React Native packages that assume hoisted `node_modules`.

**EAS build caveat:** EAS Cloud builds need special handling for pnpm. The workaround is configuring `eas.json` to run `pnpm install --frozen-lockfile` as a custom install command before the build step. Alternatively, use local builds (`eas build --local`) for CI.

### Mobile Framework: Expo (Managed Workflow → EAS Build)

**Why:** SDK 53 fully supports New Architecture (Fabric + Bridgeless). Expo Router provides file-based navigation with automatic deep linking — every calculator tab becomes a deep-linkable route automatically. No manual linking configuration.

**Not bare React Native:** The app has no native modules that require bare workflow. Expo SDK covers push notifications (expo-notifications), secure storage (expo-secure-store), and all required primitives.

### Mobile Navigation: Expo Router v4

**Why:** File-based routes map naturally to the existing 39-tab structure. Route groups `(auth)` and `(tabs)` cleanly separate unauthenticated screens from the main app. Auth guard in `_layout.tsx` redirects based on Zustand auth store. Every calculator is automatically deep-linkable, preserving the URL-sharing feature from the web app (just as `taxvn://tools/bonus-calculator` instead of a URL hash).

### Mobile State: Zustand + TanStack Query

**Why:** Zustand for global UI state (auth, user settings, active calculator tab) — lightweight, TypeScript-native, no boilerplate. TanStack Query for all server state (calculation results, history) — handles caching, refetching, and optimistic updates. This separation eliminates the monolithic `useState` props-drilling problem in the current `page.tsx`.

**Storage:** `zustand/middleware` with `AsyncStorage` for small preferences; MMKV (`react-native-mmkv`) for performance-critical persistence. Expo SecureStore for tokens.

### API Protocol: tRPC over HTTP

**Why:** End-to-end TypeScript type safety. The `tax-core` types (TaxInput, TaxResult, etc.) flow through tRPC routers and arrive fully typed in mobile screens without any code generation or manual type duplication. tRPC v11 works with React Native's `@trpc/client` with `httpBatchLink`.

**Structure:** tRPC router defined in `apps/api/src/routers/`. Router type exported and consumed by `apps/mobile/src/lib/trpc.ts`. All 40+ calculator domains become individual tRPC procedures.

### Backend Framework: Fastify

**Why:** First-class TypeScript generics for request/response types. Built-in JSON Schema validation (AJV) — 2-4x faster than Express for the same routes. Plugin architecture (`@fastify/jwt`, `@fastify/cors`, `@fastify/rate-limit`) keeps the server modular. Fits tRPC's Fastify adapter (`@trpc/server/adapters/fastify`).

### Shared Package Export Strategy: Raw TypeScript

**Why:** `packages/tax-core` exports raw `.ts` source files, not compiled JavaScript. Each consuming app transpiles according to its own runtime (Metro for mobile, Node.js/tsx for api). This is the recommended pattern for monorepo shared packages — avoids CommonJS/ESM conflicts and preserves source maps.

**Implementation:** `package.json` in `tax-core` sets `"main": "./src/index.ts"` and `"exports": {"." : "./src/index.ts"}`. Both Fastify (via ts-node/tsx) and Metro pick up the TypeScript directly.

---

## Patterns to Follow

### Pattern 1: Route-Group Auth Guard (Expo Router)

```typescript
// apps/mobile/app/(tabs)/_layout.tsx
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/auth'

export default function TabsLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Redirect href="/sign-in" />
  return <Tabs>{/* tab screens */}</Tabs>
}
```

**When:** Always — this is the canonical Expo Router auth pattern. The guard runs on every navigation attempt including deep links, so a push notification deep link to a history item will route through sign-in if the session expired.

### Pattern 2: Feature-Scoped tRPC Hooks

```typescript
// apps/mobile/features/tax-calculator/api.ts
import { trpc } from '@/lib/trpc'

export function useTaxCalculation() {
  return trpc.tax.calculate.useMutation({
    onSuccess: (result) => {
      // TanStack Query handles caching
    }
  })
}
```

**When:** Every API call. Keep tRPC hooks scoped to the feature that uses them, not in a global `api/` folder. This mirrors the feature-first architecture pattern.

### Pattern 3: tax-core Pure Function Calls from API

```typescript
// apps/api/src/routers/tax.ts
import { calculateNewTax, TaxInput } from '@taxvn/tax-core'
import { z } from 'zod'

const taxRouter = router({
  calculate: publicProcedure
    .input(z.object({ grossSalary: z.number(), dependents: z.number(), ... }))
    .mutation(({ input }) => {
      // Delegate to the same pure functions the web app uses
      return calculateNewTax(input as TaxInput)
    })
})
```

**When:** Always delegate to `tax-core` from the API router. Never re-implement calculation logic in the API layer. This guarantees bit-for-bit identical results across all surfaces.

### Pattern 4: Snapshot → Deep Link Migration

The current `snapshotCodec.ts` encodes state as a URL hash. Mobile uses Expo Router deep links instead.

```
Web:    https://taxvn.vn/tinh-thue#bonus-calculator~<lz-encoded-state>
Mobile: taxvn://tools/bonus-calculator?gross=30000000&dependents=1
```

For sharing results, the API generates a short link (`/share/:id`) that stores the full snapshot in the database and redirects to the mobile deep link. URL parameter state for simple cases; server-stored snapshots for complex multi-field states.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Duplicating Tax Logic in the Mobile Client

**What:** Calling `tax-core` functions directly from mobile screens for "performance" and bypassing the API.

**Why bad:** Results diverge if the server has a hotfixed tax bracket constant and the mobile app has a stale bundled version. Calculation correctness is a legal compliance requirement for this domain.

**Instead:** All tax calculations go through the API. `tax-core` is imported by the API only. Mobile gets results via tRPC.

**Exception:** Client-side pre-validation (input range checks, format checks) can use `tax-core` utilities without calculation logic.

### Anti-Pattern 2: Monolithic Zustand Store

**What:** One giant `useAppStore` with all app state (auth + calculator inputs + history + UI).

**Why bad:** This recreates the same single-page state blob from `tinh-thue/page.tsx`, just in a different format. Causes unnecessary re-renders across unrelated screens.

**Instead:** Split by domain: `useAuthStore`, `useSettingsStore`, `useTaxInputStore`. TanStack Query handles all server-originated data — do not put API results in Zustand.

### Anti-Pattern 3: Storing Tokens in AsyncStorage

**What:** Saving JWT access and refresh tokens in `AsyncStorage`.

**Why bad:** AsyncStorage is unencrypted. Any JS code in the app (including third-party SDKs) can read it.

**Instead:** Expo SecureStore (`expo-secure-store`) wraps Keychain (iOS) and Keystore (Android). All tokens go here.

### Anti-Pattern 4: pnpm Isolated Installs Without Hoisting

**What:** Using default pnpm isolated install strategy without setting `node-linker=hoisted`.

**Why bad:** React Native packages (and some Expo packages) assume packages are hoisted to the root `node_modules`. Isolated installs cause Metro resolution failures and EAS build errors.

**Instead:** Add `node-linker=hoisted` to root `.npmrc`. Confirmed workaround by the Expo team (SDK 52+ docs).

### Anti-Pattern 5: Compiling `tax-core` to JavaScript Before Use

**What:** Adding a `build` step to `packages/tax-core` that compiles `.ts` → `.js` before Metro or Node.js can consume it.

**Why bad:** Introduces CommonJS/ESM format decisions, loses source map fidelity, requires rebuild on every change, and adds friction to the dev loop.

**Instead:** Export raw TypeScript. Both Metro (via Babel) and Fastify (via `tsx` or `ts-node`) consume TypeScript directly.

---

## Build Order (Phase Dependencies)

The dependencies between components determine the correct build order for the roadmap:

```
1. packages/tax-core          ← No dependencies. Build first. Validates migration.
        ↓
2. apps/api                   ← Depends on tax-core. Auth + calculation endpoints first.
        ↓ (parallel once auth API is ready)
3. apps/mobile (auth)         ← Depends on api auth endpoints.
        ↓
4. apps/mobile (calculators)  ← Depends on api tax endpoints + tax-core types.
        ↓
5. apps/mobile (history)      ← Depends on calculators + api history endpoints.
        ↓
6. Push notifications         ← Depends on user accounts (step 2) + mobile install (step 4).
```

**Implication for phases:**
- Phase 1: Monorepo scaffolding + `tax-core` migration. No new features. Verify all 40 modules import cleanly.
- Phase 2: `apps/api` — auth system + core tax calculation endpoints. Testable via HTTP client before mobile exists.
- Phase 3: `apps/mobile` foundation — Expo Router skeleton, auth screens, Zustand auth store, tRPC client wired up.
- Phase 4: Port all 40+ calculator screens to mobile, consuming Phase 2 API.
- Phase 5: History persistence — screen + API endpoint + DB schema.
- Phase 6: Push notifications — tax deadline reminders.

---

## Scalability Considerations

| Concern | Current (MVP) | At 10K users | At 100K users |
|---------|--------------|--------------|---------------|
| Calculation throughput | Single Fastify instance | Single instance, fine — calculations are CPU ms | Stateless API scales horizontally; add replicas |
| Auth storage | Postgres for tokens | Fine | Add Redis for refresh token revocation |
| History queries | Postgres full-table | Add index on (user_id, created_at) | Partitioning by user_id range |
| Push notifications | Direct FCM/APNs calls | Fine | Queue via BullMQ to avoid blocking request threads |
| Mobile bundle size | All 40 tools in one bundle | Code-split by tab group (Expo lazy imports) | Fine — already lazy |

---

## Sources

- [Expo Monorepo Documentation](https://docs.expo.dev/guides/monorepos/) — Official, HIGH confidence
- [byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example) — Canonical pnpm + Turborepo Expo monorepo, HIGH confidence
- [Expo Router: Authentication Patterns](https://docs.expo.dev/router/advanced/authentication-rewrites/) — Official, HIGH confidence
- [Expo Router: Core Concepts](https://docs.expo.dev/router/basics/core-concepts/) — Official, HIGH confidence
- [tRPC with React Native](https://trpc.io/) — Official docs confirm React Native compatibility, HIGH confidence
- [Fastify vs Express 2025](https://betterstack.com/community/guides/scaling-nodejs/fastify-express/) — MEDIUM confidence (benchmark article, multiple sources agree)
- [React Native Tech Stack for 2025 — Galaxies.dev](https://galaxies.dev/article/react-native-tech-stack-2025) — MEDIUM confidence (community consensus)
- [Storyie — Scalable TypeScript Monorepo pnpm](https://storyie.com/blog/monorepo-architecture) — Raw TS export pattern, MEDIUM confidence
- [Expo Blog: Brownfield RN + Next.js Migration](https://expo.dev/blog/from-a-brownfield-react-native-and-next-js-stack-to-one-expo-app) — Official Expo blog, HIGH confidence

---

*Architecture research: 2026-03-31*
