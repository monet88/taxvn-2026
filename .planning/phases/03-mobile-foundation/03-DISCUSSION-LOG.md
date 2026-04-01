# Phase 3: Mobile Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 03-mobile-foundation
**Areas discussed:** Expo framework, Navigation & tabs, State management, Design system, Auth UX flow

---

## Expo Framework Choice

| Option | Description | Selected |
|--------|-------------|----------|
| Expo Managed (SDK 52) + EAS Build | Full managed workflow, no native config maintenance | ✓ |
| Expo Bare Workflow | More control over native modules, but more maintenance | |
| React Native CLI (no Expo) | Maximum flexibility, most setup overhead | |

**User's choice:** Expo Managed (SDK 52) — recommended default
**Notes:** User selected all recommended. NativeWind v4 + SDK 52 compatibility concern from STATE.md resolved by choosing SDK 52 (confirmed compatible).

---

## Navigation & Tab Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Expo Router (file-based) | Built into Expo, deep links automatic, maps to file structure | ✓ |
| React Navigation (manual) | More control, but manual deep link config needed | |

**User's choice:** Expo Router — recommended default
**Notes:** 4 tabs (Tính toán / So sánh / Tham khảo / Tài khoản) map cleanly to `app/(tabs)/` file structure. Tool→calculator navigation via `[tool].tsx` dynamic route.

---

## State Management

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand (3 stores) | Lightweight, persist middleware for AsyncStorage, no boilerplate | ✓ |
| Redux Toolkit | More structure, but heavier for this app size | |
| React Context only | Built-in, but re-render performance issues at scale | |

**User's choice:** Zustand (3 stores: auth, calculator, app) — recommended default
**Notes:** Auth store wraps Supabase `onAuthStateChange`. Calculator store uses `persist` middleware → AsyncStorage for draft survival (UX-04).

---

## Design System & Styling

| Option | Description | Selected |
|--------|-------------|----------|
| NativeWind v4 (Tailwind) | Consistent with web Tailwind approach, UX-09 tokens map directly | ✓ |
| StyleSheet API only | Native performance, but no design token system | |
| Tamagui / Gluestack | Component libraries with theming, but added dependency | |

**User's choice:** NativeWind v4 — recommended default
**Notes:** Light-only v1 (dark mode v2). No third-party component library. All UX-09 tokens (colors, type scale, spacing, radius, touch targets) mapped into mobile `tailwind.config.ts`.

---

## Auth UX Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen auth screens | Dedicated login/register pages, trustworthy for financial app | ✓ |
| Bottom sheet modal | Less intrusive, but may feel less secure for financial data | |
| Inline auth prompt | Minimal disruption, but complex state management | |

**User's choice:** Full-screen auth screens — recommended default
**Notes:** Login-optional (AUTH-00). Biometric prompt after first successful login. `expo-secure-store` for refresh token. Return to calculator with state preserved after auth.

---

## Agent's Discretion

- File naming within `apps/mobile` (follow Expo Router conventions)
- Zustand store file organization
- Sentry configuration details
- Analytics provider choice
- Loading/splash screen design

## Deferred Ideas

None — discussion stayed within phase scope.
