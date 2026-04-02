# Phase 4: Calculator Screens - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning
**Mode:** Auto-selected defaults from `$gsd-autonomous 4`

<domain>
## Phase Boundary

Deliver all 42 calculator tools inside the existing Expo mobile shell so users can calculate, compare, and reference PIT data directly on-device with real-time updates, Vietnamese currency formatting, draft persistence, and native sharing.

Phase 4 is not a redesign of the shell. Phase 3 already established the 4-tab app structure, auth flow, deep links, and design tokens. Phase 4 fills the three content tabs with the real product surface:

- `Tính toán` — calculator-first tools
- `So sánh` — comparative and scenario tools
- `Tham khảo` — reference and document-oriented tools

The mobile app must reuse `@taxvn/tax-core` directly. No calculator API endpoints are introduced in this phase.

</domain>

<decisions>
## Implementation Decisions

### Phase Start / Risk Handling
- **D-01:** Treat the mobile TypeScript baseline as the first phase-4 gate. Fix NativeWind `className` typing and related mobile shell type issues before adding calculator screens.
- **D-02:** Ignore the stale Phase 1 blocker note in `STATE.md` for `isSecondHalf2026` and bracket parity. Phase 01 verification already marked those defects as fixed and verified.
- **D-03:** Keep the real active blocker in scope: the mobile shell must compile cleanly before calculator work fans out.

### Information Architecture
- **D-04:** Keep the existing 4-tab shell from Phase 3. Phase 4 only populates `index`, `so-sanh`, and `tham-khao`; `tai-khoan` remains Phase-3-owned.
- **D-05:** The mobile tool registry becomes the source of truth for tab grouping. Do not copy the web `src/components/TabNavigation.tsx` list blindly because it currently exposes only 39 tools while Phase 4 requires 42.
- **D-06:** Group all 42 tools into three mobile content buckets:
  - `calculate` — direct calculators and domain-specific computation tools
  - `compare` — comparison, optimization, and simulation flows
  - `reference` — reference data, documents, calendars, and explainer tools

### Screen Architecture
- **D-07:** Use a registry-driven screen system. Tool metadata, labels, requirement IDs, and group ownership live in one typed registry under `apps/mobile`.
- **D-08:** Build shared calculator primitives first, then compose individual tool screens from those primitives instead of hand-styling 42 isolated screens.
- **D-09:** The first shared primitives should cover the common product shape:
  - Tool list/search surface
  - Screen scaffold with title, law badge, and status slots
  - Currency / number inputs
  - Result summary cards
  - Comparison result blocks
  - Share action row

### Calculation & State
- **D-10:** All calculations run on-device through `packages/tax-core`. Mobile screens call pure calculator functions directly and derive results in real time from local state.
- **D-11:** No "Calculate" button. Recalculation is derived state triggered on sanitized input change (`UX-02`).
- **D-12:** Draft persistence is keyed by tool slug inside `useCalculatorStore` so interrupted input survives app switches (`UX-04`).
- **D-13:** Prefer raw digit state + formatted display for VND inputs. Sanitization keeps only numeric characters; rendered values use `Intl.NumberFormat('vi-VN')` (`UX-03`).

### Sharing / Deep Links
- **D-14:** Share does not require login. The existing Supabase share Edge Function already supports optional auth and stores share snapshots with an 8-character token.
- **D-15:** Mobile share flow:
  - Build a snapshot compatible with the existing web snapshot schema
  - POST snapshot JSON to `supabase/functions/share`
  - Receive token
  - Open native `Share` sheet with pre-filled tax result text and `taxvn://share/{token}`
- **D-16:** Sharing uses backend tokens, not giant inline deep-link payloads, because the backend share lifecycle is already built and phase 3 deep linking is in place.

### Design / Interaction
- **D-17:** Inherit the Phase 3 design system wholesale: light-only, white/surface layers, emerald accent, custom NativeWind primitives, no third-party component library.
- **D-18:** Tool index screens use a searchable card list, not a dense icon grid. This improves scanability for 42 tools on phone-sized screens.
- **D-19:** Calculator screens prioritize "inputs first, results immediately below" so the first useful result is visible without mode switching.

### Agent's Discretion
- Exact registry file placement inside `apps/mobile`
- Shared primitive component boundaries
- Route naming details for tool detail screens
- Which calculators ship in which internal plan wave as long as the final phase covers all 42 requirements

</decisions>

<canonical_refs>
## Canonical References

### Project / Phase References
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/phases/03-mobile-foundation/03-CONTEXT.md`
- `.planning/phases/03-mobile-foundation/03-UI-SPEC.md`
- `.planning/phases/02-backend-api/02-CONTEXT.md`

### Existing Product Source
- `packages/tax-core/src/`
- `src/components/TabNavigation.tsx`
- `src/lib/snapshotTypes.ts`
- `src/lib/snapshotCodec.ts`
- `src/components/SaveShare/ShareSection.tsx`

### Mobile Shell Source
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/so-sanh.tsx`
- `apps/mobile/app/(tabs)/tham-khao.tsx`
- `apps/mobile/stores/useCalculatorStore.ts`
- `apps/mobile/stores/useAppStore.ts`
- `apps/mobile/utils/supabase.ts`
- `apps/mobile/utils/secureStore.ts`

### Backend Share Flow
- `supabase/functions/share/index.ts`
- `supabase/migrations/00001_initial_schema.sql`

</canonical_refs>

<code_context>
## Existing Code Insights

### What already exists
- Expo Router shell, auth stack, deep-link scheme, and account tab are already in place from Phase 3.
- `packages/tax-core` contains the shared calculator engine and its tests.
- Backend share token generation already exists via Supabase Edge Function.
- `useCalculatorStore` exists, but currently only models local history and needs expansion for per-tool drafts and active calculator state.

### Current gaps discovered during phase start
- `apps/mobile` compiles with failing TypeScript due to missing NativeWind type declarations (`className` errors across app screens).
- `apps/mobile/utils/supabase.ts` currently rejects the secure storage adapter type.
- The content tabs are placeholder screens and do not expose any calculator inventory yet.
- The web tab registry is not complete enough to serve as Phase 4's source of truth.

</code_context>

<specifics>
## Specific Ideas

- Use requirement IDs directly in the registry so parity tracking remains visible while porting.
- Registry descriptions should stay short and utilitarian, matching the web tool labels users already know.
- Build list/search first so the app immediately reflects the full 42-tool surface, then hang detail screens off that registry in later plans.
- Keep share text outcome-focused, for example: "Kết quả tính thuế cho thu nhập 25.000.000 đ".

</specifics>

<deferred>
## Deferred Ideas

- Universal links / install fallback for shared results
- Dark mode
- Offline sync for history
- Cross-device draft sync

</deferred>

---

*Phase: 04-calculator-screens*
*Context gathered: 2026-04-01*
