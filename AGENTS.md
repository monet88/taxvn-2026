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

This project is indexed by GitNexus as **taxvn-2026** (2396 symbols, 5270 relationships, 191 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/taxvn-2026/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/taxvn-2026/context` | Codebase overview, check index freshness |
| `gitnexus://repo/taxvn-2026/clusters` | All functional areas |
| `gitnexus://repo/taxvn-2026/processes` | All execution flows |
| `gitnexus://repo/taxvn-2026/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
