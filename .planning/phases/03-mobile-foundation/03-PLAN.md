---
phase: 03-mobile-foundation
plan: 03
type: execute
wave: 3
depends_on: ["02"]
files_modified: ["apps/mobile/utils/supabase.ts", "apps/mobile/app/auth/login.tsx", "apps/mobile/app/auth/register.tsx", "apps/mobile/app/auth/_layout.tsx", "apps/mobile/app/_layout.tsx", "apps/mobile/stores/useAuthStore.ts"]
autonomous: true
requirements: ["AUTH-01", "AUTH-02", "AUTH-03", "AUTH-04", "AUTH-06"]
must_haves:
  truths:
    - "Users can sign up, log in, and log out using Supabase Auth"
    - "Supabase session syncs correctly with useAuthStore on load and auth state changes"
    - "Local biometric authentication can be requested and verified"
  artifacts:
    - path: "apps/mobile/utils/supabase.ts"
      provides: "Initialized supabase-js client with secure store adapter"
    - path: "apps/mobile/app/auth/login.tsx"
      provides: "Login UI mapping to AUTH-02"
  key_links:
    - from: "apps/mobile/app/_layout.tsx"
      to: "apps/mobile/utils/supabase.ts"
      via: "supabase.auth.onAuthStateChange subscription"
---

<objective>
Configure Supabase Authentication with local biometric guards and authentication UI screens.

Purpose: Empowers the app to handle identities, allowing users to safely log in, retain session tokens securely, and log out, effectively syncing backend sessions with local Zustand stores.
Output: Working authentication flows backed by Supabase.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/execute-plan.md
@~/.gemini/antigravity/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-mobile-foundation/02-PLAN.md
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Supabase Initialization & State Synchronization</name>
  <files>apps/mobile/utils/supabase.ts, apps/mobile/app/_layout.tsx, apps/mobile/stores/useAuthStore.ts, apps/mobile/__tests__/supabaseSync.test.ts</files>
  <behavior>
    - Test 1: useAuthStore setSession updates its session value
    - Test 2: onAuthStateChange listener dispatches setSession correctly
  </behavior>
  <action>Initialize the `@supabase/supabase-js` client in `utils/supabase.ts`, passing the wrapper from `secureStore.ts` to `auth.storage` options. Add the URL and ANON key via `.env.local` config checking `process.env.EXPO_PUBLIC_SUPABASE_URL`. Inside the root `app/_layout.tsx`, start a `useEffect` that listens to `supabase.auth.onAuthStateChange` and updates `useAuthStore` accordingly. If `session` becomes `null`, it achieves AUTH-06 everywhere.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile test -- supabaseSync</automated>
  </verify>
  <done>Supabase client correctly configured with custom storage and bound to the root layout.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Auth UI Screens (Email/Pass & Google)</name>
  <files>apps/mobile/app/auth/login.tsx, apps/mobile/app/auth/register.tsx, apps/mobile/app/auth/_layout.tsx</files>
  <action>Create the authentication stack (`app/auth/`). In `register.tsx`, use `supabase.auth.signUp()` (AUTH-01). In `login.tsx`, use `signInWithPassword()` (AUTH-02) and add a button for `signInWithOAuth({ provider: 'google' })` (AUTH-03). Provide minimal NativeWind structure implementing these forms (email input, password input, submit buttons). Redirect to `/(tabs)/` when authentication state naturally updates to not `null` via the router.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile exec jest --passWithNoTests</automated>
  </verify>
  <done>Auth form screens exist and invoke the Supabase API.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Biometric Configuration (Face ID / Touch ID)</name>
  <files>apps/mobile/utils/biometrics.ts, apps/mobile/__tests__/biometrics.test.ts</files>
  <behavior>
    - Test 1: authenticateBiometric() invokes Expo LocalAuthentication api
  </behavior>
  <action>Create a helper `biometrics.ts` wrapping `expo-local-authentication`. Expose a `promptBiometricAuth` function that checks `hasHardwareAsync()` and `isEnrolledAsync()`, then triggers `authenticateAsync()`. This utility meets AUTH-04 and will be used by the Router guarding sensitive actions (like saving secure history) later on.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile test -- biometrics</automated>
  </verify>
  <done>Biometric wrapper function handles API promises from Expo correctly.</done>
</task>

</tasks>

<success_criteria>
Auth screens compile correctly, the Supabase storage adapter works without crashing, and biometric methods are available.
</success_criteria>

<output>
After completion, create `.planning/phases/03-mobile-foundation/03-03-SUMMARY.md`
</output>
