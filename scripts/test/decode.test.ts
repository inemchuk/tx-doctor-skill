import { describe, it, expect } from 'vitest';
import { decode } from '../src/lib/decode.js';

describe('decode', () => {
  it('decodes SPL Token code with program context', () => {
    const r = decode({ code: 1, program: 'spl-token' });
    expect(r.name).toBe('InsufficientFunds');
    expect(r.fixes.length).toBeGreaterThan(0);
  });

  it('decodes System code with program context', () => {
    const r = decode({ code: 0, program: 'system' });
    expect(r.name).toBe('AccountAlreadyInUse');
  });

  it('flags Anchor custom code needing IDL', () => {
    const r = decode({ code: 6001 });
    expect(r.needsIdl).toBe(true);
    expect(r.summary).toMatch(/IDL/);
  });

  it('decodes a known Anchor framework code', () => {
    const r = decode({ code: 3012 });
    expect(r.name).toBe('AccountNotInitialized');
  });

  it('decodes from a log dump', () => {
    const r = decode({ logs: 'Program X failed: custom program error: 0x1' });
    expect(r.code).toBe(1);
  });

  it('resolves family from program id in logs', () => {
    const r = decode({
      logs: 'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1',
    });
    expect(r.name).toBe('InsufficientFunds');
  });

  it('unknown high code degrades gracefully', () => {
    const r = decode({ code: 999999 });
    expect(r.name).toBe('Unknown');
    expect(r.summary).toMatch(/raw code/i);
  });

  it('no input → Unknown, no throw', () => {
    const r = decode({});
    expect(r.name).toBe('Unknown');
  });
});
