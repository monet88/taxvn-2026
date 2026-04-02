# Phase 4: Calculator Screens - Discussion Log

**Mode:** Autonomous
**Trigger:** `$gsd-autonomous 4`
**Date:** 2026-04-01

The user requested autonomous execution starting at Phase 4, so the recommended defaults below were auto-selected from the roadmap, prior phase context, and the current codebase state.

| Gray Area | Recommended Decision | Result |
|---|---|---|
| Tool source of truth | Create a dedicated mobile registry from Phase 4 requirements + `packages/tax-core`, not from the stale 39-item web tab list | Auto-selected |
| Phase-start blocker handling | Fix the mobile TypeScript / NativeWind baseline before adding calculator UI work | Auto-selected |
| Tool information architecture | Keep the existing 3 content tabs and populate them with searchable card lists | Auto-selected |
| Calculator screen pattern | Shared primitives + registry-driven composition, not 42 unrelated one-off layouts | Auto-selected |
| Realtime calculation behavior | Derived results on every sanitized input change, no submit button | Auto-selected |
| Draft persistence | Persist drafts per tool slug in `useCalculatorStore` | Auto-selected |
| Currency input behavior | Store raw digits, render vi-VN formatted amounts for display | Auto-selected |
| Share behavior | Use Supabase share tokens + native Share sheet + `taxvn://share/{token}` deep link | Auto-selected |

## Notes

- Phase 01 verification already closed the old tax-core blocker set, so those items were not treated as active stop conditions.
- The current active technical blocker is the mobile shell type baseline.
- A direct code check confirmed the share Edge Function supports optional auth and returns 8-character tokens, so share can stay login-optional.
