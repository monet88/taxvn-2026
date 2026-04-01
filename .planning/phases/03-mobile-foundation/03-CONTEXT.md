# Phase 3: Mobile Foundation - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Expo Router mobile app shell with authentication screens (email + Google + biometric), 4-tab navigation (Tính toán / So sánh / Tham khảo / Tài khoản), Zustand state stores, NativeWind design system, deep link handling, and observability (Sentry + analytics). This is the shell every calculator screen will live inside — no calculator UI in this phase.

Deliverables: `apps/mobile` Expo project, auth flow (login/register/biometric), tab navigation with tool lists, design tokens, deep link handler, Sentry crash reporting, analytics events.

</domain>

<decisions>
## Implementation Decisions

### Expo Framework
- **D-01:** Expo Managed workflow (SDK 52) with EAS Build — no Bare workflow needed for v1
- **D-02:** EAS Build handles iOS/Android native builds — no local Xcode/Gradle maintenance
- **D-03:** NativeWind v4 compatibility validated with Expo SDK 52 (STATE.md concern resolved)
- **D-04:** Key Expo packages: `expo-router`, `expo-secure-store`, `expo-local-authentication`, `expo-linking`, `@sentry/react-native`

### Navigation & Tab Structure
- **D-05:** Expo Router (file-based routing) — deep links work out of the box (UX-07)
- **D-06:** 4 bottom tabs mapped to file structure:
  - `app/(tabs)/tinh-toan/` — Calculators (Tính toán)
  - `app/(tabs)/so-sanh/` — Comparison tools (So sánh)
  - `app/(tabs)/tham-khao/` — Reference tools (Tham khảo)
  - `app/(tabs)/tai-khoan/` — Account (Tài khoản: profile, history, settings, about, logout)
- **D-07:** Tool list→calculator: push navigation within each tab stack (`app/(tabs)/tinh-toan/[tool].tsx`)
- **D-08:** Sticky search bar component at top of each tool list screen — filters tools locally (no API call)
- **D-09:** Tab icons: SF Symbols (iOS) / Material Icons (Android), no emoji (per UX-11)

### State Management
- **D-10:** Zustand with 3 focused stores:
  - `useAuthStore` — Supabase session, user profile, biometric enabled flag
  - `useCalculatorStore` — Active calculator state, draft inputs (persisted to AsyncStorage via Zustand `persist` middleware)
  - `useAppStore` — UI state (selected tab, search queries, version check result, theme)
- **D-11:** Auth store wraps `@supabase/supabase-js` `onAuthStateChange` listener
- **D-12:** Draft persistence: Zustand `persist` middleware → AsyncStorage (survives app switch per UX-04)
- **D-13:** No Redux, no React Context for global state — Zustand only

### Design System & Styling
- **D-14:** NativeWind v4 (Tailwind for React Native) — consistent with web's Tailwind approach
- **D-15:** Design tokens from UX-09:
  - Colors: primary `#1a1a1a`, accent `#059669` (emerald), error `#dc2626`, bg `#ffffff`, surface `#f9fafb`, border `#e5e7eb`
  - Type scale: xs(12px), sm(14px), base(16px), lg(18px), xl(24px), 2xl(32px for income input)
  - Spacing: 4/8/12/16/24/32/48px (Tailwind default)
  - Border radius: sm(6px inputs), md(12px cards), lg(16px modals)
  - Touch targets: minimum 44x44px per Apple HIG (`min-h-[44px]`)
  - Font: System default (SF Pro iOS, Roboto Android) — Vietnamese diacritics supported natively
- **D-16:** Light-only in v1 — dark mode deferred to v2 (per PROJECT.md Out of Scope)
- **D-17:** No third-party component library — custom components built on NativeWind primitives
- **D-18:** Accessibility baseline: WCAG AA contrast (4.5:1 text, 3:1 large), `accessibilityLabel` on all inputs/buttons, Dynamic Type (iOS), TalkBack/VoiceOver tested (per UX-10)

### Auth UX Flow
- **D-19:** Login-optional architecture — calculators accessible without auth; login prompted only on Save History or Share (AUTH-00)
- **D-20:** Dedicated full-screen auth screens (not modal/bottom sheet) — cleaner for financial app, builds trust
  - `app/auth/login.tsx` — email/password + Google OAuth button
  - `app/auth/register.tsx` — email/password registration
- **D-21:** Auth redirect flow: calculator → user taps "Save" → redirected to auth → login/register → return to calculator with state preserved
- **D-22:** Biometric auth: after first successful email/Google login, prompt "Bật Face ID/Touch ID?" → stores session in `expo-secure-store` → subsequent app opens use biometric to unlock stored session
- **D-23:** Session storage: `expo-secure-store` for Supabase refresh token, SDK handles access token renewal automatically
- **D-24:** Error states: inline field validation (email format, password min 8 chars), toast notifications for server errors, rate limit message from Supabase Auth built-in

### Observability
- **D-25:** Sentry (`@sentry/react-native`) for crash reporting — tagged with tax-core version in every error (OBS-03)
- **D-26:** Calculator usage analytics events — tool opened, calculation completed, share triggered (OBS-04)
- **D-27:** Version check on app open — Supabase Edge Function `/functions/v1/version-check` → banner "Cập nhật bảng thuế mới" if outdated (UX-08)

### App Store Preparation
- **D-28:** Legal disclaimer "Không phải tư vấn thuế chuyên nghiệp" in Tài khoản → About (SEC-03)
- **D-29:** Privacy policy URL configured in app store listings (SEC-03)

### Agent's Discretion
- File naming conventions within `apps/mobile` (follow Expo Router conventions)
- Zustand store file organization (single `stores/` directory or co-located)
- Sentry configuration details (sample rate, environment tagging)
- Analytics provider choice (Sentry performance monitoring or lightweight custom events)
- Loading/splash screen design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture
- `.planning/PROJECT.md` — Core value, constraints, key decisions (client-side calculation, Supabase backend)
- `.planning/REQUIREMENTS.md` — Full requirements list with AUTH-*, UX-*, SEC-*, OBS-* specs for Phase 3

### Prior Phase Decisions
- `.planning/phases/01-monorepo-foundation/01-CONTEXT.md` — Package structure (tax-core, tax-data, config)
- `.planning/phases/02-backend-api/02-CONTEXT.md` — Supabase auth flow, data model, Edge Functions, RLS policies

### Codebase Context
- `.planning/codebase/STACK.md` — Current tech stack (Next.js 16, TypeScript 5.9, Tailwind 3.4)
- `.planning/codebase/STRUCTURE.md` — Directory layout, naming conventions, where to add new code
- `.planning/codebase/CONVENTIONS.md` — Coding conventions (naming, imports, error handling, TypeScript patterns)

### Existing Supabase Setup
- `supabase/config.toml` — Supabase local dev configuration
- `supabase/migrations/` — Database schema migrations (tables, RLS policies)
- `supabase/functions/` — Edge Functions (share, version-check, health)

### Monorepo Configuration
- `pnpm-workspace.yaml` — Workspace glob patterns (packages/*, apps/*)
- `turbo.json` — Turborepo pipeline configuration

### UX Specifications
- `.planning/REQUIREMENTS.md` §UX-09 — Design tokens (colors, type scale, spacing, radius, touch targets)
- `.planning/REQUIREMENTS.md` §UX-01 — Navigation shell spec (4 tabs, tool lists, search)
- `.planning/REQUIREMENTS.md` §UX-11 — Design decisions (VND format, calculator layout, icons, haptics)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/tax-core` — 30+ pure calculator modules, importable in React Native (runs on Hermes)
- `packages/tax-data` — 6 static reference data modules (tax history, treaties, exemptions, deadlines, pension)
- `packages/config` — Shared TypeScript/ESLint config
- `supabase/` — Full Supabase setup with migrations, Edge Functions, config.toml
- `@supabase/supabase-js` — Client SDK (from Phase 2) for auth + data queries

### Established Patterns
- TypeScript strict mode, camelCase functions, PascalCase components, SCREAMING_SNAKE_CASE constants
- Pure calculation functions with typed input/output interfaces
- `@/*` path alias in tsconfig (web) — mobile will need its own tsconfig with similar alias or package imports
- Barrel files (`index.ts`) for component directories

### Integration Points
- `pnpm-workspace.yaml` — `apps/mobile` will be added as a workspace member
- `packages/tax-core` — imported by mobile app for all calculations
- `supabase/` — mobile connects to the same Supabase project (local dev or cloud)
- Deep links: share token URLs route to specific calculator screen with pre-filled state (UX-07)

</code_context>

<specifics>
## Specific Ideas

- VND format uses dấu chấm ngăn cách hàng nghìn (25.000.000 ₫) per vi-VN locale (UX-11)
- Calculator layout: scrollable single page (inputs top → results below), results always visible without button (UX-11)
- History card format: tool icon + tool name + gross income + tax total + date (UX-11)
- Haptic feedback: light impact on calculation complete, iOS only (UX-11)
- Icons: SF Symbols (iOS) / Material Icons (Android), no emoji in production (UX-11)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-mobile-foundation*
*Context gathered: 2026-04-01*
