# Coding Conventions

**Analysis Date:** 2026-03-31

## Naming Patterns

**Files:**
- React components: PascalCase matching the component name — `TaxInput.tsx`, `BonusCalculator.tsx`
- Multi-file components live in a PascalCase directory with a matching main file and an `index.ts` barrel — `BonusCalculator/BonusCalculator.tsx` + `BonusCalculator/index.ts`
- Lib/calculator files: camelCase — `taxCalculator.ts`, `bonusCalculator.ts`, `grossNetCalculator.ts`
- Hook files: camelCase prefixed with `use` — `useKeyboardShortcuts.ts`, `useScrollReveal.ts`
- Utility files: camelCase — `inputSanitizers.ts`, `taxCalendarData.ts`
- Type-only files inside component directories: `types.ts` (see `src/components/SalarySlip/types.ts`)

**Functions:**
- Pure calculation functions: camelCase verb + noun — `calculateOldTax`, `calculateNewTax`, `calculateTaxForDate`, `formatCurrency`, `parseCurrencyInput`
- Date-aware getter functions: `get` prefix — `getTaxConfigForDate`, `getRegionalMinimumWages`, `getMaxUnemploymentInsuranceSalary`
- React components: PascalCase — `TaxInputComponent`, `ScenarioCard`, `BonusCalculator`
- React hooks: camelCase `use` prefix — `useKeyboardShortcuts`, `useScrollReveal`, `useTheme`
- Event handlers: `handle` prefix — `handleIncomeChange`, `handleModeChange`, `handleInsuranceToggle`, `handleAllowanceChange`
- Boolean predicates: `is` prefix — `isAfterMilestone`, `isCurrentlyIn2026`, `isInputField`

**Variables:**
- camelCase throughout — `grossIncome`, `taxableIncome`, `insuranceDeduction`
- Boolean state: `show` prefix for visibility toggles — `showAdvanced`, `showAllowances`
- Refs tracking state: descriptive past-tense or `last` prefix — `lastSentGross`, `lastCalculatedGross`, `isExternalUpdate`

**Constants:**
- SCREAMING_SNAKE_CASE for all module-level constants — `OLD_TAX_BRACKETS`, `NEW_DEDUCTIONS`, `INSURANCE_RATES`, `MAX_MONTHLY_INCOME`, `DEFAULT_ALLOWANCES`
- Numeric literals use underscores for readability — `5_000_000`, `46_800_000`, `10_000_000_000`

**Types/Interfaces:**
- PascalCase, descriptive — `TaxInput`, `TaxResult`, `InsuranceDetail`, `AllowancesBreakdown`
- Interfaces for data shapes — `TaxConfig`, `GrossNetInput`, `CurrencyInputIssues`
- `type` used for union/string-literal types — `RegionType = 1 | 2 | 3 | 4`, `Theme = 'light' | 'dark' | 'system'`, `TooltipPosition`

## Code Style

**Formatting:**
- No Prettier config file detected. TypeScript compiler target ES2017, strict mode on.
- Trailing commas on multi-line object/array literals (consistent throughout codebase).
- Single quotes for strings.
- 2-space indentation.

**Linting:**
- ESLint via Next.js built-in (`next lint`). No custom `.eslintrc` file.
- `// eslint-disable-line react-hooks/exhaustive-deps` used selectively in `useScrollReveal.ts` (single documented exception).

**TypeScript:**
- `strict: true` in `tsconfig.json` — no implicit any, strict null checks enforced.
- Nullish coalescing `??` used consistently for default values — `allowances.meal ?? 0`.
- Optional chaining `?.` used throughout — `initialValues?.grossIncome`, `options?.max`.
- Type assertions reserved for unavoidable DOM casts — `(element as HTMLElement).tagName`.
- Interfaces preferred over type aliases for object shapes; `type` used for unions and primitives.

## Import Organization

**Order:**
1. React and React hooks — `import { useState, useEffect, useRef } from 'react'`
2. Next.js imports — `import { usePathname } from 'next/navigation'`
3. Internal lib modules via `@/` alias — `import { formatNumber } from '@/lib/taxCalculator'`
4. Internal component imports via `@/` alias — `import Tooltip from '@/components/ui/Tooltip'`
5. Internal util imports — `import { parseCurrencyInput } from '@/utils/inputSanitizers'`

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`). All internal imports use `@/` — never relative paths like `../../lib`.

**`'use client'` directive:**
- Present at the top of all interactive components and hooks — `TaxInput.tsx`, `useKeyboardShortcuts.ts`, `useScrollReveal.ts`, `ThemeContext.tsx`.
- Library files with no browser APIs (e.g., `taxCalculator.ts`, `bonusCalculator.ts`) omit this directive.

## Error Handling

**Numeric safety:**
- All formatting functions guard against `null`/`undefined`/`NaN` explicitly — `formatCurrency` uses `Number.isFinite(amount) ? amount : 0`.
- Allowance fields default via `?? 0` before arithmetic to prevent NaN propagation — see `calculateAllowancesBreakdown` in `src/lib/taxCalculator.ts`.
- `parseCurrencyInput` in `src/utils/inputSanitizers.ts` clamps to `max` and returns issue flags; callers show inline warning messages rather than throwing.
- `Math.max(0, ...)` guards prevent negative taxable income — e.g., `Math.max(0, grossIncome + allowancesBreakdown.taxable - totalDeductions)`.

**Input validation:**
- Currency inputs return a `CurrencyInputParseResult` with `{ value, issues: { negative, decimal, overflow } }` rather than throwing exceptions.
- Callers render inline `<p className="text-xs text-amber-600">` warning messages from `buildWarning()` in `TaxInput.tsx`.
- No try/catch blocks present — all failure paths are handled through conditional checks and safe defaults.

## Logging

**Framework:** None — no logging library is used.

**Patterns:**
- No `console.log` calls in production source (none found in `src/`).
- No debug logging pattern established.

## Comments

**When to Comment:**
- Block comments with `//` used to mark logical sections within large files — `// ===== DATE-AWARE CONSTANTS =====`, `// ===== PHỤ CẤP (ALLOWANCES) =====`.
- Inline comments clarify domain logic — `// BHXH 8%`, `// 20 lần lương cơ sở`.
- JSDoc `/** */` blocks on exported functions that have non-obvious behavior — `getTaxConfigForDate`, `calculateTaxForDate`, `isAfterMilestone`.
- Vietnamese comments are standard for domain context; English for technical notes.

**JSDoc usage:**
```typescript
/**
 * Lấy cấu hình thuế dựa trên ngày hiện tại
 * - Trước 01/01/2026: Luật Thuế TNCN 2007 (7 bậc, giảm trừ 11M/4.4M)
 * - Từ 01/01/2026: Luật Thuế TNCN sửa đổi 2025 (5 bậc, giảm trừ 15.5M/6.2M)
 */
export function getTaxConfigForDate(date: Date = new Date()): TaxConfig {
```

## Function Design

**Size:** Calculator functions are long but focused — `calculateOldTax` and `calculateNewTax` in `src/lib/taxCalculator.ts` are ~60 lines each; internal logic steps are commented. Components can be 800+ lines (`TaxInput.tsx`).

**Default parameters:** Consistently used for optional date and region — `function getTaxConfigForDate(date: Date = new Date())`.

**Destructuring:** Input objects are always destructured at the top of functions with default values inline:
```typescript
const {
  grossIncome,
  dependents,
  otherDeductions = 0,
  hasInsurance = true,
  region = 1,
} = input;
```

**Return values:** Functions return typed interfaces, never bare primitives for complex results. Breakdown/detail types (e.g., `InsuranceDetail`, `TaxBreakdownItem[]`) accompany summary totals.

## Module Design

**Exports:**
- Lib files export everything at the module level — no default export.
- Components: named internal function + `export default memo(ComponentName)` pattern for performance:
  ```typescript
  function TaxInputComponent(props: TaxInputProps) { ... }
  export default memo(TaxInputComponent);
  ```
- Some components use default export directly without memo.

**Barrel Files:**
- Every multi-file component directory has an `index.ts` re-exporting the component:
  ```typescript
  // BonusCalculator/index.ts
  export { default as BonusCalculator } from './BonusCalculator';
  ```
- `src/hooks/index.ts` and `src/components/ui/index.ts` aggregate exports for their directories.

## Tailwind CSS Patterns

**Class strings:**
- Template literals with ternaries for conditional classes — `className={\`flex-1 py-2 ${condition ? 'bg-primary-600 text-white' : 'bg-gray-100'}\`}`.
- `min-h-[44px]` applied to all interactive elements for touch accessibility compliance.
- Custom color token `primary-*` used throughout (configured in `tailwind.config.ts`).
- Inline SVG icons defined as local arrow-function components within the file — `const InfoIcon = () => (<svg .../>)`.

## Accessibility Conventions

- `aria-label`, `aria-pressed`, `aria-expanded`, `aria-checked`, `aria-live`, `aria-describedby` applied consistently to interactive elements.
- `role="radiogroup"`, `role="group"`, `role="region"` used where semantically appropriate.
- `<fieldset>` + `<legend>` for grouped checkboxes (insurance options).
- `disabled` state + `cursor-not-allowed` applied together on disabled buttons.

---

*Convention analysis: 2026-03-31*
