# Feature Landscape

**Domain:** Mobile tax calculator app (Vietnamese Personal Income Tax / TNCN)
**Researched:** 2026-03-31
**Confidence:** HIGH (stack-specific patterns from Expo/RN docs; MEDIUM for Vietnamese-market specifics)

---

## Context

This app migrates 40 tools from a Next.js web app to React Native. The feature landscape must be evaluated from two angles:

1. **Port-over features** — already proven on web, must survive the migration intact
2. **New mobile-native features** — auth, history, push notifications (the stated milestone goal)

The primary competitor to benchmark against is eTax Mobile (Tổng cục Thuế, 12M+ users) — a filing tool, not a calculator. TaxVN's value is in depth of calculation, comparison, and planning tools that eTax does not provide.

---

## Table Stakes

Features users expect on a finance app. Missing or broken = uninstall.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real-time recalculation | Users never click a "calculate" button; results update as they type | Low | Already works on web; preserve this pattern |
| Gross-Net converter | Most Vietnamese salaried workers reason in NET; every HR tool has this | Low | Core tool — `gross-net` tab, binary-search logic already in lib |
| Insurance breakdown | BHXH/BHYT/BHTN deductions are opaque; workers demand a breakdown | Low | Already in `insurance` tab |
| Old vs new tax law comparison | Luật 109/2025/QH15 is a breaking change — users want to see the delta | Low | `calculator` tab, 7-bracket vs 5-bracket side-by-side |
| Salary slip generator | Payroll teams use this daily; absence is a dealbreaker for HR users | Medium | `salary-slip` tab exists |
| Tax calendar / deadline reminders | Missing a TNCN deadline = late-payment penalty (0.03%/day); this is the highest-anxiety event | Low (static) | `tax-calendar` tab; push upgrades this to Medium |
| Biometric auth (Face ID / Touch ID) | Any financial app that holds personal data and lacks biometrics feels unsafe | Medium | Requires `expo-local-authentication`; fallback to PIN needed |
| Native share (Share Sheet) | Users share results with employers, spouses, accountants via Zalo/email | Low | Use `react-native-share` or Expo's `Share` API |
| Input auto-save / draft persistence | Form data must survive an app-switch or phone call interruption | Low | AsyncStorage per-calculator state |
| Clear numeric input (VND formatting) | Entering 15000000 without formatting is error-prone; formatted display is expected | Low | Already in web (`inputSanitizers.ts`); needs RN keyboard handling |
| Result breakdown (not just a total) | Users need to understand how the number was reached to trust it | Low | TaxResult component equivalent is already built |

---

## Differentiators

Features that distinguish TaxVN from eTax Mobile and generic calculators. These are what make users recommend the app.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 40+ specialized calculators | eTax has none; ESOP, crypto, content-creator, couple-optimizer are unaddressed by any Vietnamese app | High (port effort) | The entire `src/lib/` catalogue; port is mechanical but large |
| Calculation history (per-account) | Users recalculate monthly; "what did my April numbers look like?" is a real query | Medium | Requires auth + backend storage; server-side history tied to user |
| Push notifications for tax deadlines | Deadline anxiety is real; opt-in reminders for March 31 / April 30 / quarterly dates are high-value | Medium | Local notifications for fixed dates via `expo-notifications`; no backend needed for v1 |
| Law-change push alerts | When tax brackets change mid-year (it happened in 2025), users want to be told | Medium | Requires admin-side content management to trigger; backend needed |
| Old vs new law comparison (date-aware) | App automatically selects the correct bracket/deduction based on income date — no other app does this | Low (logic exists) | `taxCalendarData.ts` + date-aware logic already in lib |
| Salary offer comparison | HR candidates compare multiple offers simultaneously; no app serves this well | Low (logic exists) | `salary-compare` tab |
| Couple tax optimizer | Households with two incomes waste money without planning; this is a niche but loyal audience | Low (logic exists) | `couple-optimizer` tab |
| Content creator / crypto tax | YouTubers, TikTokers, crypto traders have no dedicated tool in Vietnamese | Low (logic exists) | `content-creator` + `crypto-tax` tabs |
| Region comparison (4-zone NET) | Vietnam has 4 minimum wage zones; workers relocating need this | Low (logic exists) | `region-compare` tab |
| Tax treaty lookup | Expats and foreign-income earners in Vietnam have nowhere to check DTA applicability | Low (static data) | `tax-treaty` tab |
| PDF / Share export of results | Accountants and HR teams need a printable artifact | Medium | `exportUtils.ts` logic exists; mobile PDF requires `react-native-pdf-lib` or similar |
| Exemption checker (21 allowances) | Most workers overpay by not claiming exempt allowances; this tool has direct financial impact | Low (logic exists) | `exemption-checker` tab |

---

## Anti-Features

Features to deliberately exclude. Building these would waste development time, confuse users, or create risk without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Actual tax filing / submission to eTax | Regulatory risk; would require MoF integration and compliance audits TaxVN cannot reasonably complete | Keep TaxVN as a calculator/planner; direct users to eTax Mobile for submission |
| Social benchmarking ("your taxes vs peers") | Requires large data pool to be meaningful; privacy-sensitive; creates false conclusions with small N | Show legal optimization tips (already in `taxOptimizationTips.ts`) instead |
| AI chatbot / natural language tax advice | High hallucination risk on legal numbers; requires ongoing maintenance of prompt guardrails; regulatory grey area for "advice" | Surface static, verified tips inline in calculators |
| Offline mode (full sync) | Complex conflict resolution with server history; the PROJECT.md already defers this to v2 | Simple local draft persistence (AsyncStorage) is sufficient; show "sync pending" badge |
| Admin dashboard | Out of scope per PROJECT.md | — |
| Dark mode | Out of scope per PROJECT.md for v1 | — |
| Multi-language (English UI) | Out of scope per PROJECT.md; all users are Vietnamese | — |
| Social/household sharing of calculation sessions | Requires real-time sync infrastructure; high complexity for low v1 value | Share via native Share Sheet (screenshot or PDF) instead |
| Budgeting / expense tracking | Different product category; TaxVN is a calculator, not a finance tracker | Scope creep; stay focused on tax calculation |
| In-app payments or premium tiers (v1) | Creates conversion friction on launch; user acquisition is more valuable than monetization in v1 | Keep app free; add monetization hooks in v2 |

---

## Feature Dependencies

```
auth (email + Google OAuth)
  → calculation history          (history requires user identity)
    → history search/filter      (search requires history to exist)
    → history-based re-calc      (re-open a past calc requires history)

push notifications (expo-notifications)
  → tax deadline reminders       (local, no server required)
  → law-change alerts            (remote, requires backend trigger)

native share (Expo Share API)
  → share as text                (no dependencies)
  → share as PDF                 → exportUtils.ts port → react-native PDF lib

biometric auth
  → requires: auth (session must exist to lock)
  → fallback: PIN / password

calculator history (server-side)
  → requires: auth + backend API + DB schema

all 40+ calculator tools
  → require: src/lib/* ported to backend (Node.js API)
  → each tool is independent of others once API exists
```

---

## Tool Catalogue Summary (40 tools to port)

| Group | Tools | Port Complexity |
|-------|-------|----------------|
| Core Income | calculator, gross-net, overtime, annual-settlement, bonus, ESOP, salary-compare, yearly | Low — pure math, lib exists |
| Special Income | securities, rental, household-business, real-estate, freelancer, other-income, content-creator, crypto-tax | Low — pure math, lib exists |
| HR / Employer | employer-cost, insurance, salary-slip, severance, business-form | Low-Medium — some output rendering |
| Reference / Tools | table, tax-history, exemption-checker, tax-treaty, withholding-tax, VAT, foreigner-tax | Low — mostly static data + simple calc |
| Planning | tax-calendar, tax-deadline, monthly-planner, income-summary, couple-optimizer, region-compare, mua-nha, pension, multi-source-income | Medium — stateful, multi-step inputs |
| Admin (advisory) | late-payment, tax-document | Low — formula + output generation |

---

## Notification Strategy

Use a two-tier notification model to avoid fatigue:

**Tier 1 — Local (no backend, scheduled at install time):**
- March 31: Employer TNCN filing deadline
- April 30: Individual TNCN settlement deadline
- Q1/Q2/Q3/Q4 estimated tax dates
- Annual opt-in prompt at app launch after January 1

**Tier 2 — Remote (requires backend + FCM/APNs token registry):**
- Law changes (Luật 109 enforcement dates, new bracket announcements)
- Ad-hoc announcements from tax authority

Implementation: `expo-notifications` handles both tiers. Token-to-user mapping stored in Node.js backend. In-app toggle screen for each notification category. Ask for permission post-onboarding, not on first launch (best practice: contextual opt-in after user completes first calculation).

---

## History UX Pattern

The history screen should follow a simple, established pattern rather than building something custom:

- List view: date, tool name, key input (income amount), key output (tax amount) — no full detail on list
- Tap to expand: restore full calculator state exactly as it was saved
- Search: by tool name or income amount range
- Filter: by tool type (dropdown/bottom sheet), date range
- Sort: newest first (default), oldest first, highest income
- Delete: swipe-to-delete on individual records; bulk delete in edit mode

No ML categorization, no "insights", no anomaly detection — those patterns are correct for bank transaction data, not for calculator history where the user deliberately entered everything.

---

## MVP Recommendation

The v1 milestone is "migrate 40+ tools + add auth + history + push notifications." Given that framing, prioritize in this order:

**Must ship (or the milestone fails):**
1. All 40 calculator tools on mobile UI (the core product)
2. Biometric-guarded auth (email + Google OAuth) — baseline trust for finance app
3. Calculation history per account — the stated new feature
4. Push notifications for tax deadlines — the stated new feature
5. Native Share Sheet — table stakes on mobile, replaces URL sharing

**Ship if time allows (makes the app feel complete):**
6. PDF export from mobile (harder than web due to native bridge)
7. History search and filter (useful once history has > 10 entries)
8. In-app notification settings screen (toggle categories)

**Defer to v2 (explicitly out of scope):**
- Offline mode with conflict resolution
- Dark mode
- Admin dashboard
- Social features

---

## Sources

- [eTax Mobile — App Store](https://apps.apple.com/vn/app/etax-mobile/id1589750682) — Vietnamese tax app competitive reference (MEDIUM confidence, app store listing)
- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/) — Implementation reference (HIGH confidence, official docs)
- [Expo Notifications SDK](https://docs.expo.dev/versions/latest/sdk/notifications/) — API reference (HIGH confidence, official docs)
- [Key Features Every Personal Finance App Needs in 2026](https://financialpanther.com/key-features-every-personal-finance-app-needs-in-2026/) — Feature landscape (MEDIUM confidence, industry article)
- [React Native Push Notifications Complete Guide 2026](https://devcom.com/tech-blog/react-native-push-notifications/) — Notification patterns (MEDIUM confidence)
- [12 Design Recommendations for Calculator Tools — NN/G](https://www.nngroup.com/articles/recommendations-calculator/) — Calculator UX (HIGH confidence, NN/G research)
- [Finance App Prototypes vs Production React Native](https://jt.org/the-gap-between-ai-generated-finance-app-prototypes-and-production-ready-react-native-apps/) — Auth/security pitfalls (MEDIUM confidence)
- [Hướng dẫn quyết toán thuế TNCN trên eTax Mobile](https://www.meinvoice.vn/tin-tuc/39997/huong-dan-quyet-toan-thue-tncn-tren-etax-mobile/) — TNCN deadline context (HIGH confidence, Vietnamese MoF-adjacent source)
- [Mobile Filter UX Design Patterns — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-mobile-filters) — History/filter UX (MEDIUM confidence)
