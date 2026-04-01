# AGENTS.md

Vietnamese PIT calculator — compares old 7-bracket vs new 5-bracket tax law (Law 109/2025/QH15, effective 01/01/2026). Static site at https://thue.1devops.io.

Tech stack: Next.js 16 (App Router, static export), React 19, TypeScript 5.9, Tailwind CSS 3.4, Recharts.

## Project map

- `src/app/page.tsx` — Landing page (marketing, scroll-reveal)
- `src/app/tinh-thue/page.tsx` — Main calculator, hosts 40+ tabs as single `'use client'` component
- `src/lib/` — Tax calculation engine (brackets, GROSS↔NET, ESOP, securities, real estate, etc.)
- `src/components/` — Calculator components (each in own directory) + shared components
- `src/components/ui/` — Shared UI primitives (LoadingSpinner, Tooltip, LawInfoModal)
- `src/components/SaveShare/` — URL sharing, QR code, import/export, named saves
- `src/utils/` — Input sanitizers, tax calendar, optimization tips
- `src/contexts/ThemeContext.tsx` — Dark/light theme
- `src/hooks/` — `useScrollReveal`, `useKeyboardShortcuts`

<important if="you need to run commands to build, lint, or start dev server">

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build → static export to out/
npm run lint     # ESLint
npm run start    # Production server (not used for deploy)
```

No test framework configured. Playwright is in devDependencies but has no config or test files.
</important>

<important if="you are working with state, props, or data flow between components">

All state lives in `tinh-thue/page.tsx` and passes down via props. No state library — pure `useState`/`useCallback` with functional updates. Tab components receive `SharedTaxState` and their own tab-specific state.
</important>

<important if="you are adding new tabs or lazy-loading components">

- 40+ tab components use `React.lazy()` with `<Suspense>` fallbacks; some use `.then(m => ({ default: m.NamedExport }))`
- Only TaxInput, TaxResult, TabNavigation load eagerly
- Tabs organized via `TAB_GROUPS` in `TabNavigation.tsx` — each tab has a `TabType` union member mapped to a lazy component in the main page's switch block
</important>

<important if="you are modifying tax calculations, brackets, deductions, or insurance rates">

- `taxCalculator.ts` — Central: `OLD_TAX_BRACKETS` (7 bậc), `NEW_TAX_BRACKETS` (5 bậc), deductions, insurance rates. Exports `calculateOldTax()`, `calculateNewTax()`, `calculateTaxForDate()`
- `grossNetCalculator.ts` — GROSS↔NET via binary search (precision: 1,000₫, max 50 iterations)
- Each domain has its own `*Calculator.ts` (bonus, ESOP, pension, securities, real estate, etc.)
- Date-aware: `EFFECTIVE_DATES` constants gate which law/rates apply; `getTaxConfigForDate()` selects brackets automatically
</important>

<important if="you are working with tax domain concepts like salary, insurance, or allowances">

- **Declared salary** (`declaredSalary`) — salary reported for insurance, may differ from actual gross income
- **Insurance cap** — BHXH/BHYT capped at 20× base salary (46.8M₫); BHTN capped at 20× regional minimum wage (region-dependent, year-dependent)
- **Allowances** (`AllowancesState`) — tax-exempt (meals, phone, transport) vs taxable (housing, position); clothing has monthly cap
</important>

<important if="you are working with URL sharing, snapshots, or saved states">

`snapshotCodec.ts` + `snapshotTypes.ts` — URL sharing via lz-string compression with compact key mapping and versioned codec. See also `snapshotStorage.ts` for named saves.
</important>

<important if="you are deploying, configuring CI, or modifying build output">

Static export (`output: 'export'` in next.config.js). GitHub Actions on `master` branch: `npm ci` → `npx next build` → deploy `out/` to GitHub Pages. `basePath` configurable via `NEXT_PUBLIC_BASE_PATH`.
</important>

<important if="you are creating a git commit">

Conventional Commits in Vietnamese: `type(scope): mô tả`. Types: feat, fix, refactor, style, docs, chore, perf, test. Scopes: tax, ui, mobile, i18n, tools, core, pdf, a11y.
</important>

<important if="you are adding or modifying imports">

`@/*` maps to `./src/*` (configured in tsconfig.json).
</important>

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **taxvn-2026**. Use GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

<important if="you are about to modify, edit, delete, or refactor any function, class, or method">

## Before editing any symbol

- **MUST** run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report blast radius before modifying
- **MUST** warn the user if impact analysis returns HIGH or CRITICAL risk before proceeding
- **NEVER** edit without running impact analysis first
- **NEVER** rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph

## Before committing

- **MUST** run `gitnexus_detect_changes()` to verify changes only affect expected symbols and execution flows

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |
</important>

<important if="you are exploring unfamiliar code or trying to understand how something works">

- Use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping
- Use `gitnexus_context({name: "symbolName"})` for full context — callers, callees, process participation
</important>

<important if="you are debugging a bug, tracing an error, or investigating unexpected behavior">

1. `gitnexus_query({query: "<error or symptom>"})` — find related execution flows
2. `gitnexus_context({name: "<suspect function>"})` — see callers, callees, process participation
3. `READ gitnexus://repo/taxvn-2026/process/{processName}` — trace full execution flow
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})`
</important>

<important if="you are renaming, extracting, splitting, or moving code">

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first, then `dry_run: false`
- **Extracting/Splitting**: MUST run `gitnexus_context` then `gitnexus_impact` to find all refs before moving code
- After any refactor: `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed
</important>

<important if="you need to use GitNexus tools or resources">

| Tool | Use | Example |
|------|-----|---------|
| `query` | Find code by concept | `gitnexus_query({query: "tax calculation"})` |
| `context` | 360° view of a symbol | `gitnexus_context({name: "calculateOldTax"})` |
| `impact` | Blast radius before edit | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/taxvn-2026/context` | Codebase overview, index freshness |
| `gitnexus://repo/taxvn-2026/clusters` | All functional areas |
| `gitnexus://repo/taxvn-2026/processes` | All execution flows |
| `gitnexus://repo/taxvn-2026/process/{name}` | Step-by-step execution trace |

| Skill file | When |
|-----------|------|
| `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` | "How does X work?" |
| `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` | "What breaks if I change X?" |
| `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` | "Why is X failing?" |
| `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` | Rename / extract / split |
| `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` | Tools & schema reference |
| `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` | Index, status, clean CLI |
</important>

<important if="you just committed code or need to refresh the GitNexus index">

```bash
npx gitnexus analyze              # Rebuild index
npx gitnexus analyze --embeddings # Rebuild + preserve embeddings
```

Check `.gitnexus/meta.json` `stats.embeddings` to see if embeddings exist. Running without `--embeddings` deletes them.

> A PostToolUse hook handles this automatically after `git commit` and `git merge`.
</important>

<!-- gitnexus:end -->
