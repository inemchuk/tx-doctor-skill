// Parse Solana transaction log dumps to extract the failing program and code.
// Never throws on a non-match — returns an empty-ish result so callers can
// degrade gracefully.

export interface ParsedLog {
  programId?: string;
  customCode?: number;
  anchorErrorNumber?: number;
  anchorErrorName?: string;
  raw: string;
}

export function parseLogs(logs: string): ParsedLog {
  const out: ParsedLog = { raw: logs };

  const custom = logs.match(/custom program error:\s*(0x[0-9a-fA-F]+|\d+)/);
  if (custom) {
    const v = custom[1];
    out.customCode = v.startsWith('0x') ? parseInt(v.slice(2), 16) : parseInt(v, 10);
  }

  // Solana program ids are base58, 32-44 chars. Capture the one reported failing.
  const prog = logs.match(/Program ([1-9A-HJ-NP-Za-km-z]{32,44}) failed/);
  if (prog) out.programId = prog[1];

  const num = logs.match(/Error Number:\s*(\d+)/);
  if (num) out.anchorErrorNumber = parseInt(num[1], 10);

  const name = logs.match(/Error Code:\s*(\w+)/);
  if (name) out.anchorErrorName = name[1];

  return out;
}
