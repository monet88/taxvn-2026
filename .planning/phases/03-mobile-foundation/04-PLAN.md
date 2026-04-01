---
phase: 03-mobile-foundation
plan: 04
type: execute
wave: 4
depends_on: ["03"]
files_modified: ["apps/mobile/app.json", "apps/mobile/app/_layout.tsx", "apps/mobile/app/(tabs)/tai-khoan.tsx", "apps/mobile/app/(tabs)/_layout.tsx"]
autonomous: true
requirements: ["UX-07", "UX-08", "UX-10", "SEC-03", "OBS-03", "OBS-04"]
must_haves:
  truths:
    - "Application scheme ('taxvn://') navigates directly to deeply linked routes"
    - "App checks backend version via Edge Function on layout mount"
    - "Sentry is configured for Error and Breadcrumb tracking"
    - "Legal Disclaimers and Term of Use are readable in the Account tab with proper accessibility labeling"
  artifacts:
    - path: "apps/mobile/app.json"
      provides: "Scheme configuration"
    - path: "apps/mobile/app/(tabs)/tai-khoan.tsx"
      provides: "Static account and legal options"
  key_links:
    - from: "apps/mobile/app/_layout.tsx"
      to: "Sentry"
      via: "Sentry.init hook at the top level Root Layout component"
---

<objective>
Configure deep linking integration, observability with Sentry, and the static legal screens for the Account tab.

Purpose: Finishes the infrastructural needs of the mobile shell, preparing it entirely for Calculator drops and history screens by finalizing deep links, analytics logic, and App Store disclaimers.
Output: Mobile shell fully wrapped in Sentry, able to parse taxvn:// links, verifying core API compatibility silently.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/execute-plan.md
@~/.gemini/antigravity/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-mobile-foundation/03-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Deep Linking & Scheme Setup</name>
  <files>apps/mobile/app.json, apps/mobile/app/_layout.tsx</files>
  <action>Update `app.json` with the scheme `taxvn` directly addressing UX-07. Ensure `expo-router`'s dynamic `Linking.createURL` correctly resolves incoming URLs. While Expo Router handles parsing implicitly, document or prepare a test handler route inside `app/_layout.tsx` or test utilizing `npx uri-scheme open taxvn://...`.</action>
  <verify>
    <automated>grep '"scheme": "taxvn"' apps/mobile/app.json</automated>
  </verify>
  <done>Deep linking scheme 'taxvn' registered in Expo config.</done>
</task>

<task type="auto">
  <name>Task 2: Sentry Initialization & Version API Checks</name>
  <files>apps/mobile/app/_layout.tsx, apps/mobile/app.json, apps/mobile/package.json</files>
  <action>Initialize `@sentry/react-native` inside `app/_layout.tsx` satisfying `OBS-03` and `OBS-04`. Check for missing `.env.local` configs (`EXPO_PUBLIC_SENTRY_DSN`) securely avoiding crashes if empty. Follow the Expo integration plugin approach in `app.json` if required. Implement a background `fetch` utilizing the Supabase Edge function (to be built or mocked) for 'tax-core' version sync check on App mount (`UX-08`), pushing any mismatch warning into `useAppStore` created in Plan 02.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile exec jest --passWithNoTests</automated>
  </verify>
  <done>Layout wrapper catches errors with Sentry and polls the API for version mismatches harmlessly.</done>
</task>

<task type="auto">
  <name>Task 3: Account Tab Screen Implementation</name>
  <files>apps/mobile/app/(tabs)/tai-khoan.tsx, apps/mobile/app/auth/_layout.tsx</files>
  <action>Implement the static layout for the 'Tài Khoản' tab (`UX-10`, `SEC-03`). Use robust semantic React Native elements (`Text` with `accessibilityRole="header"`, etc.) fulfilling the baseline. Add static disclaimers and ToS text components to comply with iOS App Store Finance app requirements showing them visibly at the bottom. Add functional 'Logout' button using `supabase.auth.signOut()` ensuring it hides when `useAuthStore` session is `null`, and exposing 'Login / Register' mapping directly to `app/auth/` routes.</action>
  <verify>
    <automated>pnpm --filter @taxvn/mobile exec jest --passWithNoTests</automated>
  </verify>
  <done>Account tab structurally maps user states to legal requirements correctly and dynamically.</done>
</task>

</tasks>

<success_criteria>
Mobile shell possesses proper scheme definition for linking, captures layouts in Sentry hooks gracefully, and renders essential App Store legal language inside the Account tab.
</success_criteria>

<output>
After completion, create `.planning/phases/03-mobile-foundation/03-04-SUMMARY.md`
</output>
