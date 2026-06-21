import { describe, it, expect } from 'vitest';
import { toDecimal, toHex } from '../src/lib/hex.js';

describe('hex', () => {
  it('parses 0x-prefixed hex', () => expect(toDecimal('0x1771')).toBe(6001));
  it('parses bare hex when flagged', () => expect(toDecimal('1771', true)).toBe(6001));
  it('parses decimal strings', () => expect(toDecimal('6001')).toBe(6001));
  it('round-trips to hex', () => expect(toHex(6001)).toBe('0x1771'));
  it('throws on garbage', () => expect(() => toDecimal('zzz')).toThrow());
  it('trims whitespace', () => expect(toDecimal('  0x1  ')).toBe(1));
});
