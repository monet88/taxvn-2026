# CLAUDE.md

Vietnamese PIT calculator comparing the old 7-bracket law with the new 5-bracket law under Law 109/2025/QH15 (effective 01/01/2026). Static site at https://thue.1devops.io.

Tech stack: Next.js 16 (App Router, static export), React 19, TypeScript 5.9, Tailwind CSS 3.4, Recharts.

## Project map

- `src/app/page.tsx` - Landing page with marketing sections and scroll reveal
- `src/app/tinh-thue/page.tsx` - Main calculator; single `'use client'` page hosting 40+ tabs
- `src/lib/` - Tax calculation engine for brackets, GROSS↔NET, ESOP, securities, real estate, and related domains
- `src/components/` - Calculator components and shared UI
- `src/components/ui/` - Shared primitives such as `LoadingSpinner`, `Tooltip`, and `LawInfoModal`
- `src/components/SaveShare/` - URL sharing, QR code, import/export, and named saves
- `src/utils/` - Input sanitizers, tax calendar helpers, and optimization tips
- `src/contexts/ThemeContext.tsx` - Dark/light theme state
- `src/hooks/` - `useScrollReveal` and `useKeyboardShortcuts`

<important if="you need to run commands to build, lint, start the app, or check deployment output">

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build -> static export to out/
npm run lint     # ESLint
npm run start    # Production server (not used for deploy)
```

No test framework is configured. Playwright is in `devDependencies`, but there is no Playwright config or test suite.
</important>

<important if="you are working with state, props, or data flow between components">

All state lives in `src/app/tinh-thue/page.tsx` and flows down through props. There is no state library; use `useState` and `useCallback` with functional updates. Each tab receives `SharedTaxState` plus its tab-specific state.
</important>

<important if="you are adding new tabs, tab navigation entries, or lazy-loaded calculator sections">

- Most tabs use `React.lazy()` with `<Suspense>` fallbacks.
- Some lazy imports use `.then(m => ({ default: m.NamedExport }))`.
- Only `TaxInput`, `TaxResult`, and `TabNavigation` load eagerly.
- `TAB_GROUPS` in `TabNavigation.tsx` defines tab organization.
- Each `TabType` union member must map to a lazy component in the main page switch block.
</important>

<important if="you are modifying tax calculations, brackets, deductions, insurance, or date-based tax rules">

- `src/lib/taxCalculator.ts` is the central source for `OLD_TAX_BRACKETS`, `NEW_TAX_BRACKETS`, deductions, insurance rates, and date-aware helpers such as `calculateOldTax()`, `calculateNewTax()`, and `calculateTaxForDate()`.
- `src/lib/grossNetCalculator.ts` handles GROSS↔NET conversion with binary search (1,000 VND precision, 50-iteration cap).
- Other domains live in dedicated `*Calculator.ts` files for bonus, ESOP, pension, securities, real estate, and similar cases.
- `EFFECTIVE_DATES` and `getTaxConfigForDate()` decide which law and rates apply.
</important>

<important if="you are working with salary, insurance, allowances, or other payroll-domain inputs">

- `declaredSalary` is the salary reported for insurance and can differ from actual gross income.
- BHXH and BHYT are capped at 20x base salary (46.8M VND).
- BHTN is capped at 20x the regional minimum wage for the selected region and year.
- `AllowancesState` mixes tax-exempt allowances (meals, phone, transport) with taxable ones (housing, position); clothing has a monthly cap.
</important>

<important if="you are working with URL sharing, snapshots, import/export, or saved calculator states">

Use `snapshotCodec.ts` and `snapshotTypes.ts` for compressed URL snapshots with compact key mapping and versioned decoding. Named saves live alongside that flow in `snapshotStorage.ts`.
</important>

<important if="you are deploying, changing build output, or modifying CI configuration">

The app uses static export via `output: 'export'` in `next.config.js`. GitHub Actions deploys from `master` by running `npm ci`, then `npx next build`, then publishing `out/` to GitHub Pages. `NEXT_PUBLIC_BASE_PATH` controls the `basePath`.
</important>

<important if="you are adding or modifying imports">

Use the `@/*` alias for `./src/*` as defined in `tsconfig.json`.
</important>

<important if="you are creating a git commit">

Use Vietnamese Conventional Commits: `type(scope): mô tả`.

- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`
- Scopes: `tax`, `ui`, `mobile`, `i18n`, `tools`, `core`, `pdf`, `a11y`
</important>

<important if="you are changing code symbols, reviewing blast radius before edits, or preparing to commit code">

This repo is indexed by GitNexus as `taxvn-2026` (2396 symbols, 5270 relationships, 191 execution flows).

- Before modifying any function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius to the user.
- Before committing, run `gitnexus_detect_changes()` and confirm the affected symbols and execution flows match the intended scope.
- If impact analysis returns `HIGH` or `CRITICAL`, warn the user before editing.
- When you need to understand unfamiliar code, prefer `gitnexus_query({query: "concept"})` over blind grep.
- When you need full caller/callee and process context, use `gitnexus_context({name: "symbolName"})`.

Quick reference:

| Tool | When to use | Command |
| --- | --- | --- |
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

Impact levels:

| Depth | Meaning | Action |
| --- | --- | --- |
| `d=1` | WILL BREAK - direct callers/importers | Update these immediately |
| `d=2` | LIKELY AFFECTED - indirect deps | Test them |
| `d=3` | MAY NEED TESTING - transitive deps | Test if on a critical path |

Pre-finish check for code changes:

1. `gitnexus_impact` ran for every modified symbol.
2. No `HIGH` or `CRITICAL` warning was ignored.
3. `gitnexus_detect_changes()` matches the expected scope.
4. All `d=1` dependents were updated.
</important>

<important if="you are debugging, tracing an error, or investigating a regression with GitNexus">

Use this sequence:

1. `gitnexus_query({query: "<error or symptom>"})` to find relevant execution flows.
2. `gitnexus_context({name: "<suspect function>"})` to inspect callers, callees, and process participation.
3. Read `gitnexus://repo/taxvn-2026/process/{processName}` for the full flow trace.
4. For regressions, run `gitnexus_detect_changes({scope: "compare", base_ref: "main"})`.
</important>

<important if="you are renaming, extracting, splitting, or otherwise refactoring code with GitNexus">

- Renames must start with `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})`. Review graph hits first, then apply with `dry_run: false`.
- Before extracting or splitting a symbol, run `gitnexus_context({name: "target"})` and `gitnexus_impact({target: "target", direction: "upstream"})`.
- After refactors, run `gitnexus_detect_changes({scope: "all"})` to confirm only expected files and flows changed.
</important>

<important if="you need GitNexus resources, skill references, or process entry points">

Resources:

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/taxvn-2026/context` | Codebase overview and index freshness |
| `gitnexus://repo/taxvn-2026/clusters` | Functional areas |
| `gitnexus://repo/taxvn-2026/processes` | Execution flows |
| `gitnexus://repo/taxvn-2026/process/{name}` | Full step-by-step process trace |

Skill references:

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
</important>

<important if="you need to refresh the GitNexus index or check whether embeddings must be preserved">

If a GitNexus tool reports a stale index, rerun analysis from the repo root:

```bash
npx gitnexus analyze
npx gitnexus analyze --embeddings
```

Check `.gitnexus/meta.json` before choosing the command. If `stats.embeddings` is non-zero, use `--embeddings`; running analyze without it deletes existing embeddings.

Claude Code users may already have a post-tool hook that refreshes the index after `git commit` and `git merge`.
</important>
