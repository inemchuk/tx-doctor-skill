import { describe, it, expect } from 'vitest';
import { withBuffer, MAX_CU, clampCu } from '../src/lib/cu.js';

describe('cu', () => {
  it('adds default 10% buffer, rounds up', () => expect(withBuffer(2340)).toBe(2574));
  it('honors custom buffer', () => expect(withBuffer(1000, 0.2)).toBe(1200));
  it('clamps to MAX_CU', () => expect(clampCu(2_000_000)).toBe(MAX_CU));
  it('withBuffer clamps to MAX_CU', () => expect(withBuffer(1_400_000)).toBe(MAX_CU));
  it('MAX_CU is 1.4M', () => expect(MAX_CU).toBe(1_400_000));
  it('rejects negative', () => expect(() => withBuffer(-1)).toThrow());
});
