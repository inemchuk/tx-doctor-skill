import { describe, it, expect } from 'vitest';
import { parseLogs } from '../src/lib/logParser.js';

describe('parseLogs', () => {
  it('extracts custom program error code (hex)', () => {
    const r = parseLogs(
      'Program log: Instruction: Transfer\nProgram TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1771',
    );
    expect(r.customCode).toBe(6001);
  });

  it('extracts custom program error code (decimal)', () => {
    const r = parseLogs('failed: custom program error: 6');
    expect(r.customCode).toBe(6);
  });

  it('extracts AnchorError code + name', () => {
    const r = parseLogs(
      'Program log: AnchorError occurred. Error Code: ConstraintHasOne. Error Number: 2001. Error Message: A has one constraint was violated.',
    );
    expect(r.anchorErrorNumber).toBe(2001);
    expect(r.anchorErrorName).toBe('ConstraintHasOne');
  });

  it('extracts failing program id', () => {
    const r = parseLogs(
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1',
    );
    expect(r.programId).toBe('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  });

  it('returns empty result on no match (no throw)', () => {
    expect(parseLogs('Program log: hello').customCode).toBeUndefined();
  });
});
