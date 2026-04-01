/**
 * Tests for inheritanceGiftTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import { isExemptRelationship, getRelationshipLabel } from '../inheritanceGiftTaxCalculator';

describe('inheritanceGiftTaxCalculator', () => {
  it('Vợ/chồng miễn thuế', () => {
    expect(isExemptRelationship('spouse')).toBe(true);
  });

  it('Cha mẹ - con miễn thuế', () => {
    expect(isExemptRelationship('parent_child')).toBe(true);
  });

  it('Bạn bè không miễn thuế', () => {
    expect(isExemptRelationship('other')).toBe(false);
  });

  it('getRelationshipLabel trả về string', () => {
    const label = getRelationshipLabel('spouse');
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
  });
});
