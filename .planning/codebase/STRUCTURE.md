# Codebase Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```
taxvn-2026/
├── src/
│   ├── app/                   # Next.js App Router pages and layouts
│   │   ├── layout.tsx         # Root layout: metadata, fonts, analytics, providers
│   │   ├── page.tsx           # Homepage (marketing / feature grid)
│   │   ├── globals.css        # Global Tailwind base styles
│   │   ├── not-found.tsx      # 404 page
│   │   ├── robots.ts          # Robots.txt generation
│   │   ├── sitemap.ts         # Sitemap generation
│   │   └── tinh-thue/
│   │       ├── layout.tsx     # Calculator section layout
│   │       └── page.tsx       # Main calculator app (all state, all tabs)
│   ├── components/
│   │   ├── <FeatureName>/     # One directory per calculator tab (40+ directories)
│   │   │   ├── <Name>.tsx     # Main component
│   │   │   ├── index.ts       # Re-export barrel
│   │   │   └── [sub].tsx      # Optional sub-components (e.g., MortgageChart.tsx)
│   │   ├── ui/                # Shared UI primitives
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LawInfoModal.tsx
│   │   │   ├── KeyboardShortcuts.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── PWAProvider.tsx
│   │   │   ├── PWAUpdatePrompt.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   └── index.ts
│   │   ├── Header.tsx         # Shared site header
│   │   ├── Footer.tsx         # Shared site footer
│   │   ├── TabNavigation.tsx  # Tab group dropdown navigation
│   │   ├── TaxInput.tsx       # Primary income/deduction input form
│   │   ├── TaxResult.tsx      # Tax calculation result display
│   │   ├── TaxChart.tsx       # Tax bracket visualization chart
│   │   ├── TaxBracketTable.tsx# Bracket reference table
│   │   ├── InsuranceBreakdown.tsx
│   │   ├── GrossNetConverter.tsx
│   │   ├── OtherIncomeInput.tsx
│   │   ├── EmployerCostCalculator.tsx
│   │   ├── RegionComparison.tsx
│   │   ├── RegionSelector.tsx
│   │   └── IncomeWaterfallChart.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx   # Light/dark theme context (dark mode stubbed)
│   ├── hooks/
│   │   ├── index.ts           # Barrel export
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useScrollReveal.ts
│   ├── lib/                   # Pure business logic — no React
│   │   ├── taxCalculator.ts   # Core PIT calculation, insurance, shared types
│   │   ├── snapshotTypes.ts   # All tab state interfaces + CalculatorSnapshot
│   │   ├── snapshotCodec.ts   # URL encode/decode (LZ-string compression)
│   │   ├── snapshotStorage.ts # localStorage CRUD for named saves
│   │   ├── exportUtils.ts     # PDF/print export helpers
│   │   ├── pwaUtils.ts        # Service worker registration
│   │   └── <domain>Calculator.ts  # One file per calculator domain (35+ files)
│   └── utils/
│       ├── taxCalendarData.ts # Static tax deadline data
│       ├── taxOptimizationTips.ts # Static optimization tip data
│       └── inputSanitizers.ts # Input parsing/sanitization helpers
├── public/
│   ├── sw.js                  # Service worker
│   ├── manifest.json          # PWA manifest
│   ├── favicon.ico
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── og-image.png           # Open Graph image
│   ├── _headers               # CDN/server security headers
│   └── CNAME                  # GitHub Pages custom domain
├── docs/
│   └── TAX_CALCULATION.md     # Tax calculation documentation
├── scripts/
│   └── generate-icons.mjs     # PWA icon generation script
├── next.config.js             # Static export config
├── tailwind.config.ts         # Tailwind with custom colors/animations
├── tsconfig.json              # TypeScript config with @/ path alias
├── postcss.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── build.sh
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router. Contains only routing, layout wrappers, and page-level components
- Contains: Two routes — `/` (homepage) and `/tinh-thue` (calculator)
- Key files: `src/app/tinh-thue/page.tsx` (the main app, ~1147 lines), `src/app/layout.tsx` (metadata + providers)

**`src/components/`:**
- Purpose: All React components. Feature components are grouped in named subdirectories; shared/simple components are flat files at the top level
- Contains: 40+ calculator feature directories, a `ui/` subdirectory, and ~12 flat shared components
- Key files: `src/components/TabNavigation.tsx` (tab system definition), `src/components/TaxInput.tsx`, `src/components/TaxResult.tsx`

**`src/lib/`:**
- Purpose: All business logic. Pure TypeScript — no React imports. Each file corresponds to one calculator domain
- Contains: `taxCalculator.ts` (core, ~950 lines), `snapshotTypes.ts` (~920 lines), `snapshotCodec.ts`, `snapshotStorage.ts`, and 35+ domain calculators
- Key files: `src/lib/taxCalculator.ts` (tax brackets, insurance rates, `calculateNewTax`, `calculateOldTax`), `src/lib/snapshotCodec.ts` (URL state sharing)

**`src/utils/`:**
- Purpose: Static data and lightweight helpers that don't fit the calculator-module pattern
- Contains: Tax calendar deadlines, optimization tips text, input sanitizer functions

**`src/contexts/`:**
- Purpose: React Context providers
- Contains: `ThemeContext.tsx` only (currently always returns `'light'`)

**`src/hooks/`:**
- Purpose: Custom React hooks shared across multiple components
- Contains: `useKeyboardShortcuts.ts` (number key + Ctrl+S shortcuts), `useScrollReveal.ts` (IntersectionObserver-based reveal animation)

**`public/`:**
- Purpose: Static assets served directly by the web server
- Generated: `icon-192.png`, `icon-512.png` via `scripts/generate-icons.mjs`
- Committed: Yes — all public assets are committed

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, fonts, Google Analytics, JSON-LD, PWA
- `src/app/page.tsx`: Homepage with feature showcase
- `src/app/tinh-thue/page.tsx`: Calculator application — all state, all tab rendering logic

**Core Tax Logic:**
- `src/lib/taxCalculator.ts`: Tax brackets (old 7-bracket, new 5-bracket), deductions, insurance rates, `calculateNewTax()`, `calculateOldTax()`, `calculateOtherIncomeTax()`, `SharedTaxState` interface
- `src/lib/snapshotTypes.ts`: `CalculatorSnapshot`, all tab state interfaces (`OvertimeTabState`, `BonusTabState`, etc.), default state constants

**URL State Sharing:**
- `src/lib/snapshotCodec.ts`: `encodeSnapshot()`, `decodeSnapshot()`, `generateShareURL()`, `decodeLegacyURLParams()`
- `src/lib/snapshotStorage.ts`: `getNamedSaves()`, `saveNamedSave()`, `exportToJSON()`, `importFromJSON()`

**Navigation:**
- `src/components/TabNavigation.tsx`: `TAB_GROUPS` array (source of truth for all 39 tabs), `TabType` union type, dropdown menus

**Configuration:**
- `next.config.js`: Static export mode, `trailingSlash: true`, `basePath` env var
- `tailwind.config.ts`: Custom `primary` color tokens, `reveal`/`slide-up` animations
- `tsconfig.json`: Path alias `@/` → `./src/`

## Naming Conventions

**Files:**
- Calculator components: PascalCase matching the feature name — `BonusCalculator.tsx`, `OvertimeCalculator.tsx`
- Calculator lib modules: camelCase with `Calculator` suffix — `bonusCalculator.ts`, `overtimeCalculator.ts`
- Exception: `taxCalculator.ts` (no suffix, it is the core module)
- Barrel files: always `index.ts`
- Type-only files: `types.ts` within a component directory (e.g., `src/components/SalarySlip/types.ts`)

**Directories:**
- Component feature directories: PascalCase — `BonusCalculator/`, `SalarySlip/`, `SaveShare/`
- App Router directories: kebab-case — `tinh-thue/`

**Components:**
- React components: PascalCase
- Hooks: camelCase with `use` prefix

**Tab IDs:**
- kebab-case strings matching URL hash — `'bonus-calculator'`, `'annual-settlement'`, `'mua-nha'`
- Defined in `TabType` union in `src/components/TabNavigation.tsx`

## Where to Add New Code

**New Calculator Tab:**
1. Create `src/lib/<featureName>Calculator.ts` with pure calculation functions and TypeScript types
2. Add tab state interface + `DEFAULT_<FEATURE>_STATE` constant to `src/lib/snapshotTypes.ts` in the `TabStates` interface
3. Add state field to `TabStates` and update `DEFAULT_TAB_STATES`, `createSnapshot()`, `mergeSnapshotWithDefaults()` in `src/lib/snapshotTypes.ts`
4. Create `src/components/<FeatureName>/` directory with `<FeatureName>.tsx` and `index.ts`
5. Add `lazy()` import and tab rendering block to `src/app/tinh-thue/page.tsx`
6. Add tab entry to `TAB_GROUPS` in `src/components/TabNavigation.tsx`
7. Add tab ID to `VALID_TABS` array in `src/app/tinh-thue/page.tsx`

**New Shared UI Component:**
- Add to `src/components/ui/` and export from `src/components/ui/index.ts`

**New Custom Hook:**
- Add to `src/hooks/` and export from `src/hooks/index.ts`

**New Static Data:**
- Add to `src/utils/` if it's reference data (arrays, maps), not calculation logic

**New Business Logic (for existing tab):**
- Add functions to the relevant `src/lib/<feature>Calculator.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents (codebase maps, phase plans)
- Generated: No — written by GSD agents
- Committed: No (in `.gitignore`)

**`.gitnexus/`:**
- Purpose: GitNexus code intelligence index
- Generated: Yes — by `npx gitnexus analyze`
- Committed: Partially (meta.json is committed; embeddings may not be)

**`.claude/`:**
- Purpose: Claude Code skill files and project-specific AI guidance
- Generated: No
- Committed: Yes

**`.next/`** (not present in tree — excluded):
- Purpose: Next.js build output
- Generated: Yes — by `next build`
- Committed: No

**`public/`:**
- Purpose: Static assets deployed alongside the built site
- Generated: Partially (icons via `scripts/generate-icons.mjs`)
- Committed: Yes

---

*Structure analysis: 2026-03-31*
