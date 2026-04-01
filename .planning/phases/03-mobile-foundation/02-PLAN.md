---
phase: 03-mobile-foundation
plan: 02
type: execute
wave: 2
depends_on: ["01"]
files_modified: ["apps/mobile/stores/useAuthStore.ts", "apps/mobile/stores/useCalculatorStore.ts", "apps/mobile/stores/useAppStore.ts", "apps/mobile/utils/secureStore.ts", "apps/mobile/package.json"]
autonomous: true
requirements: ["AUTH-00", "AUTH-05"]
must_haves:
  truths:
    - "Application state persists across app restarts using AsyncStorage and SecureStore"
    - "Calculators are accessible without logging in (AuthStore allows null sessions)"
  artifacts:
    - path: "apps/mobile/stores/useAuthStore.ts"
      provides: "Global authentication state management"
    - path: "apps/mobile/utils/secureStore.ts"
      provides: "Wrapper for expo-secure-store to implement StateStorage from zustand"
  key_links:
    - from: "apps/mobile/stores/useAuthStore.ts"
      to: "apps/mobile/utils/secureStore.ts"
      via: "Zustand persist middleware"
      pattern: "storage: createJSONStorage"
---

<objective>
Implement global state management using Zustand and persistence using `AsyncStorage` and `expo-secure-store`.

Purpose: Sets up the data layer of the application so that the auth session, user preferences, and calculation history survive app restarts.
Output: Zustand stores configured with custom storage adapters for persistence.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/execute-plan.md
@~/.gemini/antigravity/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-mobile-foundation/01-PLAN.md
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build Secure Storage Utilities</name>
  <files>apps/mobile/utils/secureStore.ts, apps/mobile/__tests__/secureStore.test.ts</files>
  <behavior>
    - Test 1: secureStore.getItem("key") attempts to fetch from SecureStore
    - Test 2: secureStore.setItem("key", "val") attempts to save to SecureStore
    - Test 3: Implements the Zustand StateStorage interface correctly
  </behavior>
  <action>Create a custom storage adapter `secureStore.ts` that wraps `expo-secure-store` to conform to Zustand's `StateStorage` interface (getItem, setItem, removeItem). This adapter will be used for both Zustand persistence and later as the custom storage engine for Supabase Auth to fulfill AUTH-05.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile test -- secureStore</automated>
  </verify>
  <done>SecureStore wrapper is fully tested and implements StateStorage.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement Zustand Stores</name>
  <files>apps/mobile/stores/useAuthStore.ts, apps/mobile/stores/useCalculatorStore.ts, apps/mobile/stores/useAppStore.ts, apps/mobile/__tests__/stores.test.ts</files>
  <behavior>
    - Test 1: useAuthStore retains a default unauthenticated state (null session) per AUTH-00
    - Test 2: useAuthStore accepts session updates
    - Test 3: useCalculatorStore exposes history array
    - Test 4: useAppStore manages "firstLaunch" boolean
  </behavior>
  <action>Install `@react-native-async-storage/async-storage`. Create `useCalculatorStore` and `useAppStore` utilizing Zustand's `persist` middleware backed by `AsyncStorage`. Create `useAuthStore` using the `persist` middleware backed by the custom `secureStore` built in Task 1. Define explicit TypeScript interfaces for all states.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile test -- stores</automated>
  </verify>
  <done>Zustand stores export hook and pass their logic tests.</done>
</task>

</tasks>

<success_criteria>
Store logic tests pass, verifying that state actions mutate the store and `persist` options are correctly registered with their respective storage adapters.
</success_criteria>

<output>
After completion, create `.planning/phases/03-mobile-foundation/03-02-SUMMARY.md`
</output>
