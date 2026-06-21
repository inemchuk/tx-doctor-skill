import { describe, it, expect } from 'vitest';
import { percentile, recommendMicroLamports, priorityFeeLamports } from '../src/lib/fees.js';

describe('fees', () => {
  it('computes p75', () => expect(percentile([0, 10, 20, 30, 40], 75)).toBe(30));
  it('computes p50', () => expect(percentile([0, 10, 20, 30, 40], 50)).toBe(20));
  it('handles single sample', () => expect(percentile([5], 90)).toBe(5));
  it('sorts unsorted input', () => expect(percentile([40, 0, 20, 10, 30], 75)).toBe(30));
  it('empty samples → 0 recommendation', () => expect(recommendMicroLamports([])).toBe(0));
  it('default recommendation is p75', () =>
    expect(recommendMicroLamports([0, 10, 20, 30, 40])).toBe(30));
  it('priority fee = ceil(price*limit/1e6) lamports', () =>
    expect(priorityFeeLamports(10000, 200000)).toBe(2000));
  it('priority fee rounds up', () => expect(priorityFeeLamports(1, 1)).toBe(1));
});
