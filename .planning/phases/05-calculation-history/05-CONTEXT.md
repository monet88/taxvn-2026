# Phase 05: Calculation History - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

A persistent sync mechanism and UI that stores all of a user's past tax evaluations, allowing search, filtering, and 1-tap state restoration. Includes an offline retry queue to ensure robust functionality.
</domain>

<decisions>
## Implementation Decisions

### Auto-save Triggering
- **D-01:** Debounce auto-save (e.g., 5 seconds) after the user makes changes to inputs, combined with a save-on-unmount hook. This captures calculations without spamming the backend or history list when typing continuously. Only "completed" or meaningful states (e.g. valid inputs) should trigger a save.

### Restore UX Conflict
- **D-02:** When restoring a history item, silently overwrite the current draft values. Calculator state is ephemeral and history is always preserved, so confirmation dialogs add unnecessary friction.

### List Density & Grouping
- **D-03:** History list will be grouped temporally (Today, Yesterday, Last Week, Older) and support infinite scrolling. 

### Bulk Delete Pattern
- **D-04:** Use a long-press interaction to trigger multi-select mode, which displays checkboxes on items and a bottom action bar for delete operations. Single-item delete can be supported via swipe-to-delete.

### Offline Sync Visualization
- **D-05:** Show a subtle cloud or dotted-cloud icon on the history item while it is queued in the offline retry list. Replace it with a standard timestamp or sync success indicator once synced.

### the agent's Discretion
Empty states, detailed search/filter UI pattern (e.g., modal vs inline chips), toast notifications on bulk deletion.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture and Product Constraints
- `.planning/PROJECT.md` — Overall tax-core execution model and database schema
- `.planning/REQUIREMENTS.md` — `HIST-01` through `HIST-07` requirements
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCalculatorStore` — Current draft persistence logic is here.
- History tab in `(tabs)/history.tsx` — Contains simple empty states and shell layout from Phase 3, ready to be wired.

### Established Patterns
- Client-side history handling: History saves the *inputs* and the key *results*, matching the Supabase `calculation_history` table schema from Phase 2.
</code_context>

<specifics>
## Specific Ideas

No specific layout references — standard intuitive patterns for native navigation, search input, and filter chips.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 05-calculation-history*
*Context gathered: 2026-04-02*
