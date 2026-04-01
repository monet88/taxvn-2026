# Phase 3: Mobile Foundation - Research

**Researched:** 2026-04-01
**Domain:** React Native / Expo, Auth, NativeWind
**Confidence:** HIGH

## Summary

This phase establishes the mobile application shell using Expo Router (Managed Workflow). It implements a 4-tab tabbed navigation layout with embedded stack navigators for individual screens. State management uses Zustand with persistent data stored in AsyncStorage. Styling relies on NativeWind v4 with Tailwind 3.4. Supabase is the backend for Auth, using JWT persisted in `expo-secure-store`. The shell also supports biometric auth, Sentry crash reporting, and deep linking natively through Expo Router.

**Primary recommendation:** Use `expo` CLI to bootstrap the standard Expo Router 4-tab setup inside `apps/mobile`, then incrementally layer in NativeWind v4, Zustand, and Supabase Auth.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Expo Managed workflow (SDK 52) with EAS Build
- Navigation: Expo Router with 4 bottom tabs
- State: Zustand only (no Redux/React Context) with `useAuthStore`, `useCalculatorStore`, `useAppStore`
- Styling: NativeWind v4 (Tailwind for RN) — light mode only, no third-party UI libraries
- Auth: Supabase via `@supabase/supabase-js`, `expo-secure-store`, biometric `expo-local-authentication`
- Observability: Sentry `@sentry/react-native` and usage analytics

### the agent's Discretion
- File naming conventions within `apps/mobile`
- Zustand store file organization
- Sentry configuration details
- Analytics provider choice (Sentry performance monitoring vs custom)
- Loading/splash screen design

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-00 | Login-optional architecture | Handled by Expo Router group rendering based on `useAuthStore` session |
| AUTH-01 | Email/pass registration | Supabase `auth.signUp` |
| AUTH-02 | Email/pass login | Supabase `auth.signInWithPassword` |
| AUTH-03 | Google OAuth login | Supabase `auth.signInWithOAuth` + deep links |
| AUTH-04 | Face ID / Touch ID | `expo-local-authentication` storing auth token |
| AUTH-05 | Persist session restart | `expo-secure-store` wrapper for Supabase JS |
| AUTH-06 | Logout anywhere | Supabase `auth.signOut` |
| UX-01 | 4 bottom tabs | Expo Router `(tabs)` layout |
| UX-07 | Deep link handler | Expo Linking / Router deep links |
| UX-08 | Tax-core version check | Supabase Edge function fetch on startup |
| UX-09 | Design tokens | NativeWind + tailwind.config.ts |
| UX-10 | Accessibility baseline | Accessibility API in React Native |
| UX-11 | Design decisions resolved | Implementation specifics |
| SEC-03 | Legal disclaimer / App Store | Static screens in Account tab |
| OBS-03 | Sentry crash reporting | `@sentry/react-native` init in _layout |
| OBS-04 | Usage analytics | Sentry or Expo Analytics |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo` | `~52.0.x` | Managed App Framework | Defined by User |
| `expo-router` | `~4.0.x` | File-based Routing | Native deep links, standard for Expo 52 |
| `nativewind` | `^4.2.3` | UI Styling | Tailwind integration for React Native |
| `tailwindcss` | `^3.4.17` | CSS Utility classes | Required by NativeWind v4 |
| `zustand` | `^5.0.0` | Global State | Fast, hook-based, easy `persist` middleware |
| `@supabase/supabase-js` | `^2.101.1` | Auth API | First-party BaaS client |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-secure-store` | `~14.0.0` | JWT Storage | Keeping Supabase refresh tokens secure |
| `expo-local-authentication` | `~15.0.0` | Biometric Auth | Fingerprint/FaceID unlock |
| `@sentry/react-native` | `^8.6.0` | Observability | Error and crash tracking |
| `@react-native-async-storage/async-storage` | `1.23.1` | KV Store | Zustand `persist` target for non-secure app state |

**Installation:**
```bash
## Using pnpm in apps/mobile
pnpm install expo-router react-native-safe-area-context react-native-screens
pnpm install zustand @supabase/supabase-js expo-secure-store expo-local-authentication @sentry/react-native
pnpm install nativewind tailwindcss react-native-reanimated
```

## Architecture Patterns

### Recommended Project Structure
```text
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tabbar configuration
│   │   ├── tinh-toan/       # Calculators tab
│   │   ├── so-sanh/         # Comparisons tab
│   │   ├── tham-khao/       # Reference tab
│   │   └── tai-khoan/       # Account tab
│   ├── auth/                # Login, Register screens
│   ├── _layout.tsx          # Root layout, Sentry init, Session check
│   └── +not-found.tsx
├── components/
│   └── ui/                  # NativeWind primitives (Button, Input, Card)
├── stores/
│   ├── useAppStore.ts       # UI state, versioning
│   ├── useAuthStore.ts      # Auth state wrapping Supabase
│   └── useCalculatorStore.ts# Calculation persistence
├── utils/
│   └── supabase.ts          # Supabase client w/ secure-store adapter
├── tailwind.config.ts       # Shared or extended tailwind
└── app.json                 # Expo config
```

### Pattern 1: Zustand Supabase Auth Store
**What:** Synchronizing Supabase session state into Zustand for synchronous React consumption.
**When to use:** In Expo Router roots to guard auth paths.
**Example:**
```typescript
import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  biometricEnabled: boolean;
  setSession: (session: Session | null) => void;
  // ...
}
//... zustand implementation
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation | React Navigation directly | Expo Router | Expo router provides deep linking implicitly, essential for Share Link features |
| JWT storage | Custom AsyncStorage encryption | `expo-secure-store` | Hardware keychain-backed security (iOS Keychain / Android Keystore) |
| Layout sizing | React Native StyleSheet margins | NativeWind | Enables Tailwind utility classes mapped directly from monorepo conventions |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None | Initial project phase (greenfield mobile app) |
| Live service config | None | Initial project phase |
| OS-registered state | None | Initial project phase |
| Secrets/env vars | None | Mobile app requires env vars for Supabase URL/Anon key |
| Build artifacts | None | Initial project phase |

## Common Pitfalls

### Pitfall 1: Supabase Initialization with Expo
**What goes wrong:** JWTs are immediately lost on app reload.
**Why it happens:** Supabase defaults to localStorage which doesn't persist properly in standard RN environments.
**How to avoid:** explicitly specify the `storage` adapter to use `expo-secure-store` when initializing `@supabase/supabase-js`.

### Pitfall 2: NativeWind v4 Config
**What goes wrong:** Tailwind classes aren't compiled or cause runtime crashes.
**Why it happens:** NativeWind v4 acts differently than v2. It requires `withNativeWind` in `metro.config.js` and CSS imports.
**How to avoid:** Strictly follow NativeWind v4 docs for Expo Router integration. Add `import "./global.css"` in root `_layout.tsx`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | ✓ | 22.x | — |
| pnpm | Monorepo | ✓ | 9.x | — |
| Supabase | Auth API | ✓ | (Cloud) | Local Dev Supabase |
| Expo CLI | Mobile Build | ✓ | — | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo + @testing-library/react-native |
| Config file | apps/mobile/jest.config.js |
| Quick run command | `pnpm --filter mobile test` |
| Full suite command | `pnpm --filter mobile test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-00 | Calculators accessible without auth | unit | `pnpm test` | ❌ Wave 0 |
| AUTH-05 | Persist session restart | unit | `pnpm test` | ❌ Wave 0 |
| UX-01 | Tab bar navigation renders | unit | `pnpm test` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/mobile/jest.config.js`
- [ ] `apps/mobile/package.json` test scripts
- [ ] Framework install: `jest-expo @testing-library/react-native`

## Sources
### Primary (HIGH confidence)
- Expo Router Documentation - File-based routing and deep linking
- NativeWind v4 Documentation - integration with Metro and Expo
- Supabase Mobile/React Native Documentation - AsyncStorage / SecureStore patterns

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH - Directly follows the user-defined D-* constraints.
- Architecture: HIGH - Matches standard Expo recommended architecture.
- Pitfalls: HIGH - Documented issues with NativeWind v4 setup in Expo.
