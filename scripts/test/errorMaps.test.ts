import { describe, it, expect } from 'vitest';
import {
  lookupSplToken,
  lookupSystem,
  lookupAssociatedToken,
  classifyAnchor,
  familyFromProgramId,
} from '../src/lib/errorMaps.js';

describe('errorMaps', () => {
  it('SPL Token 1 = InsufficientFunds', () =>
    expect(lookupSplToken(1)?.name).toBe('InsufficientFunds'));
  it('SPL Token 4 = OwnerMismatch', () =>
    expect(lookupSplToken(4)?.name).toBe('OwnerMismatch'));
  it('SPL Token 17 = AccountFrozen', () =>
    expect(lookupSplToken(17)?.name).toBe('AccountFrozen'));
  it('unknown SPL Token code returns undefined', () =>
    expect(lookupSplToken(9999)).toBeUndefined());
  it('System 0 = AccountAlreadyInUse', () =>
    expect(lookupSystem(0)?.name).toBe('AccountAlreadyInUse'));
  it('System 1 = ResultWithNegativeLamports', () =>
    expect(lookupSystem(1)?.name).toBe('ResultWithNegativeLamports'));
  it('Associated Token 0 = InvalidOwner', () =>
    expect(lookupAssociatedToken(0)?.name).toBe('InvalidOwner'));

  it('Anchor 6000 classified as custom', () => expect(classifyAnchor(6000)).toBe('custom'));
  it('Anchor 2000 classified as constraint', () => expect(classifyAnchor(2000)).toBe('constraint'));
  it('Anchor 3012 classified as account', () => expect(classifyAnchor(3012)).toBe('account'));
  it('Anchor 100 classified as lang', () => expect(classifyAnchor(100)).toBe('lang'));
  it('Anchor 50 classified as unknown', () => expect(classifyAnchor(50)).toBe('unknown'));

  it('maps SPL Token program id to family', () =>
    expect(familyFromProgramId('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')).toBe('spl-token'));
  it('maps System program id to family', () =>
    expect(familyFromProgramId('11111111111111111111111111111111')).toBe('system'));
  it('unknown program id → undefined', () =>
    expect(familyFromProgramId('SomethingElse')).toBeUndefined());
});
