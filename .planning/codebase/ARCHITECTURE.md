# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Single-page application with tab-based multi-tool layout, static export

**Key Characteristics:**
- Next.js App Router with `output: 'export'` — generates fully static HTML/JS/CSS, no server runtime
- One primary interactive page (`/tinh-thue`) hosts 39+ calculator tools via a tab switcher
- All state lives in a single top-level component (`src/app/tinh-thue/page.tsx`) and is lifted to the page level
- Business logic is fully separated into pure TypeScript functions in `src/lib/`; components are purely presentational
- URL hash encodes the full calculator state (LZ-compressed JSON) for sharing and deep linking

## Layers

**Routing Layer:**
- Purpose: Next.js App Router pages and layouts
- Location: `src/app/`
- Contains: `layout.tsx` (root layout, metadata, GA, PWA), `page.tsx` (homepage), `tinh-thue/page.tsx` (main calculator), `not-found.tsx`, `robots.ts`, `sitemap.ts`
- Depends on: Context providers, components
- Used by: Browser — these are the entry points

**Business Logic Layer:**
- Purpose: Pure tax calculation functions, data constants, utility helpers
- Location: `src/lib/`
- Contains: 40+ TypeScript modules, one per calculator domain (e.g., `taxCalculator.ts`, `bonusCalculator.ts`, `mortgageCalculator.ts`)
- Depends on: Nothing (no React imports)
- Used by: Components and the main calculator page

**Component Layer:**
- Purpose: Presentational React components for each tool and shared UI
- Location: `src/components/`
- Contains: One directory per calculator tab, flat single-file components, and a `ui/` subdirectory for cross-cutting UI primitives
- Depends on: `src/lib/` for calculations, `src/contexts/` for theme
- Used by: `src/app/tinh-thue/page.tsx`

**State / Persistence Layer:**
- Purpose: Snapshot encoding for URL sharing, localStorage for named saves
- Location: `src/lib/snapshotCodec.ts`, `src/lib/snapshotStorage.ts`, `src/lib/snapshotTypes.ts`
- Contains: `encodeSnapshot` / `decodeSnapshot` (LZ-string compression + compact key mapping), `getNamedSaves` / `saveNamedSave` (localStorage CRUD)
- Depends on: `lz-string` npm package, `src/lib/taxCalculator.ts`
- Used by: `src/app/tinh-thue/page.tsx`, `src/components/SaveShare/`

**Context Layer:**
- Purpose: Theme context (currently hard-wired to light mode)
- Location: `src/contexts/ThemeContext.tsx`
- Contains: `ThemeProvider`, `useTheme`
- Depends on: React
- Used by: `src/app/layout.tsx`, `src/app/tinh-thue/page.tsx`

**Hooks Layer:**
- Purpose: Reusable React hooks
- Location: `src/hooks/`
- Contains: `useKeyboardShortcuts.ts`, `useScrollReveal.ts`
- Depends on: React
- Used by: Components and pages

**Utils Layer:**
- Purpose: Non-calculator utility data (tax calendar data, optimization tips, input sanitizers)
- Location: `src/utils/`
- Contains: `taxCalendarData.ts`, `taxOptimizationTips.ts`, `inputSanitizers.ts`
- Depends on: Nothing
- Used by: Components

## Data Flow

**Primary Tax Calculation Flow:**

1. User enters salary in `TaxInput` component (`src/components/TaxInput.tsx`)
2. `TaxInput` calls `onCalculate` prop → `handleCalculate` in `src/app/tinh-thue/page.tsx`
3. `handleCalculate` calls `updateSharedState` which calls `calculateNewTax(input)` from `src/lib/taxCalculator.ts`
4. Result stored in `newResult` state; re-render propagates `TaxResult` display (`src/components/TaxResult.tsx`)
5. After debounce (500ms), `encodeSnapshot(currentSnapshot)` is called and URL hash is updated via `window.history.replaceState`

**Tab Navigation Flow:**

1. User clicks a tab group button in `TabNavigation` (`src/components/TabNavigation.tsx`)
2. Dropdown opens showing tabs in that group; user selects a tab
3. `onTabChange` callback fires → `handleTabChange` in page updates `activeTab` state and URL hash
4. Conditional rendering in the page renders the matching lazy component wrapped in `<Suspense>`
5. On first access the component JS chunk is fetched; on subsequent visits it is cached

**Snapshot Share/Restore Flow:**

1. User clicks "Save/Share" → `SaveShareButton` (`src/components/SaveShare/SaveShareButton.tsx`) opens the panel
2. Panel calls `encodeSnapshot(currentSnapshot)` → LZ-compressed, key-compacted JSON → URL-safe string
3. URL is `#<tabId>~<encodedState>` or `#<tabId>` for default state
4. On page load, `handleHashNavigation` in `tinh-thue/page.tsx` calls `decodeSnapshot`, then `handleLoadSnapshot` to hydrate all 22 tab states
5. Legacy `?gross=...&dependents=...` query params are handled by `decodeLegacyURLParams` for backward compatibility

**State Management:**

- All shared state lives in `sharedState: SharedTaxState` in `src/app/tinh-thue/page.tsx`
- Each of the 22 serializable tabs also has its own lifted state (`overtimeState`, `bonusState`, etc.)
- No global state library (no Redux, Zustand, etc.) — plain React `useState` + prop drilling
- `currentSnapshot` is a `useMemo` over all state slices, used for URL encoding and save/share

## Key Abstractions

**`SharedTaxState`:**
- Purpose: The common inputs shared across all tabs (gross income, dependents, region, insurance options, allowances)
- Location: `src/lib/taxCalculator.ts`
- Pattern: Plain interface; passed as props `sharedState` + `onStateChange` to tabs that need to read or modify shared inputs

**`CalculatorSnapshot`:**
- Purpose: Serializable representation of the entire calculator state (shared + all tab-specific states + active tab + metadata)
- Location: `src/lib/snapshotTypes.ts`
- Pattern: Versioned struct; encoded to URL hash for sharing, stored in localStorage for named saves

**`TaxConfig` / Date-aware tax selection:**
- Purpose: Selects the correct tax brackets and deductions based on calculation date
- Location: `src/lib/taxCalculator.ts` — `getTaxConfigForDate(date)`, `calculateNewTax`, `calculateOldTax`
- Pattern: Strategy pattern — same `TaxInput` → different bracket tables depending on date

**Calculator Module Pattern:**
- Purpose: Each domain calculator exports pure functions and TypeScript types
- Examples: `src/lib/bonusCalculator.ts`, `src/lib/mortgageCalculator.ts`, `src/lib/overtimeCalculator.ts`
- Pattern: Module exports `calculate*` function(s), result interface, default state constants; zero side effects

**Lazy Tab Component Pattern:**
- Purpose: Each of the 39 tabs is loaded on demand to minimize initial bundle
- Examples: All `const X = lazy(() => import('@/components/X'))` at the top of `src/app/tinh-thue/page.tsx`
- Pattern: `React.lazy` + named export unwrapping where needed: `lazy(() => import('...').then(m => ({ default: m.ComponentName })))`

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Sets HTML `lang="vi"`, loads Inter font with Vietnamese subset, injects JSON-LD structured data, initializes Google Analytics, wraps children in `ThemeProvider` and `PWAProvider`

**Homepage (`/`):**
- Location: `src/app/page.tsx`
- Triggers: Direct navigation to root URL
- Responsibilities: Marketing landing page with feature grid, animated counters, FAQ accordion, and CTA links to `/tinh-thue#<tab>`

**Calculator App (`/tinh-thue`):**
- Location: `src/app/tinh-thue/page.tsx`
- Triggers: Direct navigation, links from homepage, URL hash changes
- Responsibilities: Owns all calculator state, handles URL hash encoding/decoding, renders active tab's component, manages keyboard shortcuts

## Error Handling

**Strategy:** Minimal — most errors are swallowed with `console.error` and fallback values

**Patterns:**
- `decodeSnapshot` / `encodeSnapshot` in `src/lib/snapshotCodec.ts` wrap operations in try/catch; return `null` / `''` on failure
- `getNamedSaves` in `src/lib/snapshotStorage.ts` returns `[]` on JSON parse failure
- `calculateNewTax` / `calculateOldTax` use `Math.max(0, ...)` to clamp negative taxable income
- `formatCurrency` / `formatNumber` in `src/lib/taxCalculator.ts` guard against `null`/`undefined`/`NaN` inputs

## Cross-Cutting Concerns

**Logging:** `console.error` only — no structured logging library

**Validation:** Input sanitization via `src/utils/inputSanitizers.ts`; numeric clamping in `parseCurrency` in `src/lib/taxCalculator.ts`; snapshot structural validation in `isValidSnapshot` in `src/lib/snapshotTypes.ts`

**Authentication:** None — fully anonymous, client-side-only app

**PWA:** Service worker at `public/sw.js`; manifest at `public/manifest.json`; `PWAProvider` in `src/components/ui/PWAProvider.tsx` handles install prompts and update notifications

**SEO:** JSON-LD schemas (WebApplication, Organization, FAQPage) in `src/app/layout.tsx`; `robots.ts` and `sitemap.ts` generated via Next.js App Router conventions

**Theming:** `ThemeContext` exists but dark mode is stubbed out — always resolves to `'light'` (`src/contexts/ThemeContext.tsx`)

---

*Architecture analysis: 2026-03-31*
