/**
 * Tests for salaryComparisonCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCompanyOffer,
  compareCompanyOffers,
  createDefaultCompanyOffer,
  type CompanyOffer,
} from '../salaryComparisonCalculator';

function makeOffer(
  id: string,
  name: string,
  gross: number,
  overrides: Partial<CompanyOffer> = {}
): CompanyOffer {
  return {
    ...createDefaultCompanyOffer(id, name),
    grossSalary: gross,
    ...overrides,
  };
}

describe('calculateCompanyOffer', () => {
  it('Happy: standard company offer at 30M monthly', () => {
    const offer = makeOffer('a', 'Company A', 30_000_000);
    const result = calculateCompanyOffer(offer, 0);

    expect(result.monthlyGross).toBe(30_000_000);
    expect(result.monthlyTax).toBeGreaterThanOrEqual(0);
    expect(result.monthlyNet).toBeLessThanOrEqual(30_000_000);
    expect(result.monthlyNet).toBeGreaterThan(0);

    expect(result.annualGross).toBe(30_000_000 * 12);
    expect(result.annualBonus).toBe(30_000_000 * 1); // 1 bonus month default
    expect(result.effectiveRate).toBeGreaterThan(0);
  });

  it('Happy: offer with benefits adds to monthly total', () => {
    const offer = makeOffer('b', 'Company B', 30_000_000, {
      otherBenefits: 2_000_000,
    });
    const result = calculateCompanyOffer(offer, 0);

    expect(result.monthlyBenefits).toBe(2_000_000);
    expect(result.monthlyTotal).toBe(result.monthlyNet + 2_000_000);
    expect(result.annualBenefits).toBe(2_000_000 * 12);
  });

  it('Boundary: zero salary results in zero everything', () => {
    const offer = makeOffer('z', 'Zero', 0);
    const result = calculateCompanyOffer(offer, 0);

    expect(result.monthlyGross).toBe(0);
    expect(result.monthlyTax).toBe(0);
    expect(result.monthlyNet).toBe(0);
  });

  it('Edge: negative salary is clamped to zero', () => {
    const offer = makeOffer('neg', 'Negative', -5_000_000);
    const result = calculateCompanyOffer(offer, 0);

    expect(result.monthlyGross).toBe(0);
    expect(result.monthlyTax).toBe(0);
  });
});

describe('compareCompanyOffers', () => {
  it('Happy: compare two salary offers and identify best', () => {
    const offers = [
      makeOffer('a', 'Company A', 25_000_000),
      makeOffer('b', 'Company B', 35_000_000),
    ];
    const result = compareCompanyOffers(offers, 0);

    expect(result.companies).toHaveLength(2);
    // Company B (higher salary) should have higher monthly NET
    expect(result.bestOffer.byMonthlyNet).toBe(1);
    expect(result.bestOffer.byAnnualNet).toBe(1);
    expect(result.differences.maxMonthlyDiff).toBeGreaterThan(0);
  });

  it('Boundary: single offer comparison', () => {
    const offers = [makeOffer('a', 'Only', 30_000_000)];
    const result = compareCompanyOffers(offers, 0);

    expect(result.companies).toHaveLength(1);
    expect(result.bestOffer.byMonthlyNet).toBe(0);
    expect(result.differences.maxMonthlyDiff).toBe(0);
  });

  it('Edge: dependents reduce tax for all offers equally', () => {
    const offers = [
      makeOffer('a', 'A', 30_000_000),
      makeOffer('b', 'B', 30_000_000),
    ];
    const noDeps = compareCompanyOffers(offers, 0);
    const withDeps = compareCompanyOffers(offers, 2);

    // With dependents, net income should be higher (less tax)
    expect(withDeps.companies[0].monthlyNet).toBeGreaterThanOrEqual(
      noDeps.companies[0].monthlyNet
    );
  });
});
