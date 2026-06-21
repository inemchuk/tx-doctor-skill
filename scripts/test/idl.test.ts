import { describe, it, expect } from 'vitest';
import { resolveFromIdl } from '../src/lib/idl.js';

describe('resolveFromIdl', () => {
  const errors = [
    { code: 6000, name: 'Unauthorized', msg: 'Not authorized' },
    { code: 6001, name: 'AmountTooLarge', msg: 'Amount must be <= 100' },
  ];
  it('finds a custom code', () => {
    expect(resolveFromIdl(errors, 6001)?.name).toBe('AmountTooLarge');
  });
  it('returns undefined for missing code', () => {
    expect(resolveFromIdl(errors, 6099)).toBeUndefined();
  });
  it('handles undefined errors array', () => {
    expect(resolveFromIdl(undefined, 6000)).toBeUndefined();
  });
});
