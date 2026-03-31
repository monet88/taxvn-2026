# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Runner:**
- Playwright `^1.57.0` is present in `devDependencies` (`package.json`) but no configuration file exists.
- No `playwright.config.ts`, `jest.config.*`, or `vitest.config.*` found at the project root.

**Assertion Library:**
- None configured. Playwright's built-in expect would be the assertion library if configured.

**Run Commands:**
```bash
# No test scripts are defined in package.json scripts block.
# Defined scripts are:
npm run dev          # Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint via next lint
```

## Test File Organization

**Current state:** No test files exist anywhere in the codebase. `fd` and `grep` searches for `*.test.*` and `*.spec.*` returned zero results.

**Location (if tests were added):**
- Playwright recommends a `tests/` or `e2e/` directory at the project root.
- Unit tests for lib calculators would naturally co-locate or go in `src/lib/__tests__/`.

**Naming (established convention):**
- Not yet established. Recommended: `*.test.ts` for unit tests, `*.spec.ts` for Playwright E2E.

## Test Structure

**No tests written yet.** The following reflects what is appropriate given the codebase structure.

**Calculator unit test shape (recommended):**
```typescript
// src/lib/__tests__/taxCalculator.test.ts
import { calculateNewTax, calculateOldTax } from '../taxCalculator';

describe('calculateNewTax', () => {
  it('returns zero tax for income below personal deduction', () => {
    const result = calculateNewTax({ grossIncome: 10_000_000, dependents: 0 });
    expect(result.taxAmount).toBe(0);
  });

  it('calculates correct insurance deductions for region 1', () => {
    const result = calculateNewTax({ grossIncome: 30_000_000, dependents: 0, region: 1 });
    expect(result.insuranceDeduction).toBeGreaterThan(0);
  });
});
```

**Playwright E2E shape (recommended):**
```typescript
// tests/tax-calculator.spec.ts
import { test, expect } from '@playwright/test';

test('calculates tax for 30M gross income', async ({ page }) => {
  await page.goto('/tinh-thue');
  await page.fill('#gross-income', '30000000');
  await expect(page.locator('[data-testid="tax-amount"]')).toBeVisible();
});
```

## Mocking

**Framework:** None configured.

**What would need mocking in unit tests:**
- `new Date()` calls — many calculator functions accept an optional `date: Date = new Date()` parameter, making them inherently testable without mocking by passing a fixed date:
  ```typescript
  // No mock needed — just pass the date
  calculateTaxForDate({ grossIncome: 30_000_000, dependents: 0, calculationDate: new Date('2026-01-01') });
  getTaxConfigForDate(new Date('2025-12-31'));
  ```
- `localStorage` — used in `src/lib/snapshotStorage.ts` for save/load. Would need mocking in unit tests.
- `IntersectionObserver` — used in `src/hooks/useScrollReveal.ts`. Would need mocking for hook tests.

**What NOT to mock:**
- Pure calculator functions in `src/lib/` — all are pure functions taking typed inputs and returning typed results, no external dependencies.
- `formatCurrency`, `formatNumber`, `parseCurrency` in `src/lib/taxCalculator.ts` — deterministic, no side effects.

## Fixtures and Factories

**No fixtures exist.** Given the domain, recommended test data would be:

```typescript
// tests/fixtures/taxInputs.ts
export const sampleInputs = {
  lowIncome: { grossIncome: 10_000_000, dependents: 0, region: 1 as const },
  midIncome: { grossIncome: 30_000_000, dependents: 1, region: 1 as const },
  highIncome: { grossIncome: 100_000_000, dependents: 2, region: 1 as const },
};
```

**Location:**
- Not yet established. Recommend `tests/fixtures/` for E2E fixtures, `src/lib/__tests__/fixtures/` for unit test data.

## Coverage

**Requirements:** None enforced — no coverage configuration exists.

**View Coverage:**
```bash
# With Playwright:
npx playwright test --reporter=html

# If vitest were added:
npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Not written. The lib layer (`src/lib/`) is highly amenable to unit testing — all calculator functions are pure functions with typed inputs/outputs and no browser dependencies. Priority targets: `taxCalculator.ts`, `grossNetCalculator.ts`, `bonusCalculator.ts`, `annualSettlementCalculator.ts`.

**Integration Tests:**
- Not written. Would test calculator functions in combination (e.g., `grossToNet` using `calculateNewTax` internally).

**E2E Tests:**
- Not written. Playwright is installed (`@playwright/test ^1.57.0`, `playwright ^1.57.0`) but has no config file. The main calculator page is at `/tinh-thue` (`src/app/tinh-thue/page.tsx`).

## Testability Assessment

**Highly testable (pure functions, no side effects):**
- `src/lib/taxCalculator.ts` — `calculateOldTax`, `calculateNewTax`, `calculateTaxForDate`, `formatCurrency`, `parseCurrency`, `calculateOtherIncomeTax`
- `src/lib/grossNetCalculator.ts` — `grossToNet`, `netToGross`
- `src/lib/bonusCalculator.ts` — `calculateBonusComparison`
- `src/lib/annualSettlementCalculator.ts` — annual settlement functions
- `src/utils/inputSanitizers.ts` — `parseCurrencyInput`
- `src/hooks/useKeyboardShortcuts.ts` — `getShortcutKey`, `groupShortcutsByCategory`, `formatShortcutForDisplay`

**Requires setup to test:**
- React components (need React Testing Library or Playwright)
- `src/lib/snapshotStorage.ts` (needs localStorage mock)
- `src/lib/snapshotCodec.ts` (needs `lz-string` available)
- `src/hooks/useScrollReveal.ts` (needs IntersectionObserver mock)

## Setup Required to Enable Testing

To activate Playwright E2E testing, create `playwright.config.ts` at the project root:

```typescript
// playwright.config.ts (minimal setup)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

To add unit testing, install vitest and `@vitejs/plugin-react`:
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react
```

---

*Testing analysis: 2026-03-31*
