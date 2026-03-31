# Roadmap: TaxVN Mobile

## Overview

Build a complete React Native mobile app for Vietnamese personal income tax calculation. The journey starts with extracting the proven tax-core logic into a tested, shared package — the foundation every subsequent phase depends on. From there: a Node.js backend for auth/history/push (no calculator endpoints), a mobile auth shell with navigation, all 42 calculator screens running client-side, calculation history, and finally push notifications for tax deadlines and law changes.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Monorepo Foundation** - Extract tax-core, fix bugs, establish test suite, scaffold monorepo
- [ ] **Phase 2: Backend API** - Fastify + Prisma backend for auth, history, push tokens, share snapshots
- [ ] **Phase 3: Mobile Foundation** - Expo Router shell, auth screens, Zustand stores, design system
- [ ] **Phase 4: Calculator Screens** - All 42 calculator tools ported to mobile with real-time recalculation
- [ ] **Phase 5: Calculation History** - Per-account history list, search, filter, restore, auto-save
- [ ] **Phase 6: Push Notifications** - Local deadline reminders and remote law-change alerts

## Phase Details

### Phase 1: Monorepo Foundation
**Goal**: The verified, tested tax-core package exists and all calculation logic is correct — every subsequent phase can import it with confidence
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. Running `pnpm test` in the monorepo root executes 120+ test cases across all 40+ calculators with zero failures
  2. All three packages (tax-core, tax-data, config) resolve their imports from each other without path alias hacks
  3. A GROSS→NET→GROSS round-trip through the binary search returns the same value within 1 VND on both Node.js and Hermes (React Native's JS engine)
  4. The `isSecondHalf2026` flag is gone from all 7 affected files and new-law deductions are applied uniformly for all of 2026
  5. `incomeSummaryCalculator` and `taxCalculator` produce identical bracket results for the same input
**Plans**: TBD

### Phase 2: Backend API
**Goal**: Users can register, log in (email + Google), and the API correctly persists history entries and share tokens — the mobile app can authenticate and store data
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, API-11, API-12, SEC-01, SEC-02, OBS-01, OBS-02
**Success Criteria** (what must be TRUE):
  1. A user can register with email/password and log in, receiving short-lived access tokens that refresh automatically
  2. A logged-in user can save a calculation, retrieve the list, and delete entries — data persists across sessions
  3. Posting a share snapshot returns an 8-character token; fetching that token returns the original snapshot JSON
  4. Five failed login attempts within 15 minutes from the same IP are blocked with appropriate error response
  5. The `/health` endpoint returns 200 and structured logs appear for every auth event and API error
**Plans**: TBD

### Phase 3: Mobile Foundation
**Goal**: A user can open the app, navigate all four tabs, sign up or log in (email + Google + biometric), and the app stays signed in across restarts — the shell every calculator screen will live inside is complete
**Depends on**: Phase 1 (Phase 2 can run in parallel; mobile wires to real API when Phase 2 completes)
**Requirements**: AUTH-00, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, UX-01, UX-07, UX-08, UX-09, UX-10, UX-11, SEC-03, OBS-03, OBS-04
**Success Criteria** (what must be TRUE):
  1. Calculators are accessible without login; the login prompt appears only when a user taps Save History or Share
  2. A user can register, log in with email/password, log in with Google, enable Face ID/Touch ID, and log out — session persists across app restarts
  3. All four bottom tabs (Tinh toan / So sanh / Tham khao / Tai khoan) navigate correctly, each showing a searchable scrollable tool list
  4. Opening a share deep link loads the correct calculator screen with the shared state pre-filled
  5. Sentry receives crash reports tagged with the tax-core version; calculator usage events fire for analytics
**Plans**: TBD
**UI hint**: yes

### Phase 4: Calculator Screens
**Goal**: All 42 calculator tools are available on mobile with real-time recalculation, correct Vietnamese number formatting, and results that match the web app exactly — the core product works
**Depends on**: Phase 3
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, CALC-08, CALC-09, CALC-10, CALC-11, CALC-12, CALC-13, CALC-14, CALC-15, CALC-16, CALC-17, CALC-18, CALC-19, CALC-20, CALC-21, CALC-22, CALC-23, CALC-24, CALC-25, CALC-26, CALC-27, CALC-28, CALC-29, CALC-30, CALC-31, CALC-32, CALC-33, CALC-34, CALC-35, CALC-36, CALC-37, CALC-38, CALC-39, CALC-40, CALC-41, CALC-42, UX-02, UX-03, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. Entering a monthly gross income into the main tax calculator produces results that match the web app's output for the same input, including the 7-bracket vs 5-bracket comparison
  2. Every calculator screen updates results as the user types — no "Calculate" button needed
  3. VND amounts display with Vietnamese locale formatting (25.000.000 d) on both iOS and Android numeric keyboards
  4. Input values survive an app switch mid-entry (e.g., a phone call interrupts the user) and are restored on return
  5. The native Share Sheet opens with a pre-filled result text and deep link for any calculator result
**Plans**: TBD
**UI hint**: yes

### Phase 5: Calculation History
**Goal**: Logged-in users can see, search, restore, and delete a persistent record of every calculation they completed — history survives app uninstall if the account exists
**Depends on**: Phase 2, Phase 4
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, HIST-06, HIST-07
**Success Criteria** (what must be TRUE):
  1. After completing any calculation while logged in, the result appears in the History tab without the user doing anything
  2. Tapping a history entry restores the calculator to the exact state it was in when the result was saved, including all input values
  3. A user can search history by tool name or income amount and filter by tool type and date range
  4. Swiping left on a history item deletes it; a long-press bulk-select mode allows deleting multiple entries at once
  5. If the history save fails (offline or server error), a subtle retry indicator appears and the save retries automatically on reconnect
**Plans**: TBD
**UI hint**: yes

### Phase 6: Push Notifications
**Goal**: Users receive timely reminders about tax deadlines and law changes, with granular control over which categories they want — the app stays useful between active sessions
**Depends on**: Phase 2, Phase 3
**Requirements**: PUSH-01, PUSH-02, PUSH-03, PUSH-04
**Success Criteria** (what must be TRUE):
  1. A user who has used the app at least once receives a local notification before the March 31, April 30, and quarterly tax deadlines
  2. When a tax law change is published, remote push notifications reach registered devices within the expected delivery window
  3. In-app notification settings allow toggling deadline reminders and law-change alerts independently
  4. The OS permission dialog for notifications appears only after the user's first completed calculation, not on first launch
**Plans**: TBD

## Progress

**Execution Order:**
Phases 2 and 3 can run in parallel after Phase 1 completes. Phase 4 is blocked on Phase 3. Phase 5 is blocked on Phases 2 and 4. Phase 6 is blocked on Phases 2 and 3.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation | 0/? | Not started | - |
| 2. Backend API | 0/? | Not started | - |
| 3. Mobile Foundation | 0/? | Not started | - |
| 4. Calculator Screens | 0/? | Not started | - |
| 5. Calculation History | 0/? | Not started | - |
| 6. Push Notifications | 0/? | Not started | - |
