// Unified decode entry point: turn a code, a program hint, and/or a log dump
// into a human diagnosis. Always returns a result (degrades gracefully).

import {
  classifyAnchor,
  familyFromProgramId,
  lookupAnchorLang,
  lookupAssociatedToken,
  lookupComputeBudget,
  lookupSplToken,
  lookupSystem,
} from './errorMaps.js';
import { parseLogs } from './logParser.js';
import type { ErrorEntry, ProgramFamily } from './types.js';

// Anchor user-defined codes start at 6000. There is no hard upper bound in the
// runtime, but real programs stay small; above this we stop assuming "Anchor
// custom" and report the raw code instead of guessing.
const ANCHOR_CUSTOM_MAX = 65535;

export interface DecodeInput {
  code?: number;
  program?: string;
  logs?: string;
}

export interface DecodeResult {
  code?: number;
  name: string;
  summary: string;
  causes: string[];
  fixes: string[];
  needsIdl: boolean;
  family?: ProgramFamily;
}

export function decode(input: DecodeInput): DecodeResult {
  let code = input.code;
  let family = normalizeFamily(input.program);

  if (input.logs) {
    const parsed = parseLogs(input.logs);
    code = code ?? parsed.anchorErrorNumber ?? parsed.customCode;
    if (!family && parsed.programId) family = familyFromProgramId(parsed.programId);
  }

  if (code === undefined) {
    return {
      name: 'Unknown',
      summary: 'No error code found. Pass a numeric code (e.g. 0x1771) or a log dump.',
      causes: [],
      fixes: [],
      needsIdl: false,
    };
  }

  // Known program family resolves low, fixed codes unambiguously.
  if (family) {
    const entry = lookupByFamily(family, code);
    if (entry) return fromEntry(entry, family, false);
  }

  if (code < 6000) {
    const anchor = lookupAnchorLang(code);
    if (anchor) return fromEntry(anchor, 'anchor', false);

    const cls = classifyAnchor(code);
    if (cls !== 'unknown') {
      return {
        code,
        name: `Anchor ${cls} error`,
        summary: `Code ${code} (0x${code.toString(16)}) is an Anchor framework ${cls} error. See decoding-errors.md for the ${cls} range.`,
        causes: [`An Anchor ${cls} check failed`],
        fixes: ['Open the program source / IDL and match the error number to its #[msg]'],
        needsIdl: false,
        family: 'anchor',
      };
    }

    return {
      code,
      name: 'Unknown',
      summary: `Raw code ${code} (0x${code.toString(16)}). Specify --program (system | spl-token | associated-token | anchor) to resolve it.`,
      causes: [],
      fixes: [],
      needsIdl: false,
    };
  }

  if (code <= ANCHOR_CUSTOM_MAX) {
    return {
      code,
      name: `Custom error ${code}`,
      summary: `Code ${code} (0x${code.toString(16)}) is a user-defined Anchor error (>= 6000). Fetch the program's IDL to resolve its name and message.`,
      causes: ['A program-specific (custom) error defined in the on-chain program'],
      fixes: [
        'Fetch the IDL: pass --program <programId> --rpc <url>, or run `anchor idl fetch <programId>`',
        'Match the error number to its #[error_code] entry in the program source',
      ],
      needsIdl: true,
      family: 'anchor',
    };
  }

  return {
    code,
    name: 'Unknown',
    summary: `Raw code ${code} (0x${code.toString(16)}) is outside known ranges. Check the failing program's source for its error definition.`,
    causes: [],
    fixes: [],
    needsIdl: false,
  };
}

function fromEntry(entry: ErrorEntry, family: ProgramFamily, needsIdl: boolean): DecodeResult {
  return {
    code: entry.code,
    name: entry.name,
    summary: `${entry.message} (${family} error ${entry.code} / 0x${entry.code.toString(16)})`,
    causes: entry.causes,
    fixes: entry.fixes,
    needsIdl,
    family,
  };
}

function lookupByFamily(family: ProgramFamily, code: number): ErrorEntry | undefined {
  switch (family) {
    case 'spl-token':
    case 'token-2022':
      return lookupSplToken(code);
    case 'system':
      return lookupSystem(code);
    case 'associated-token':
      return lookupAssociatedToken(code);
    case 'compute-budget':
      return lookupComputeBudget(code);
    case 'anchor':
      return lookupAnchorLang(code);
    default:
      return undefined;
  }
}

function normalizeFamily(program?: string): ProgramFamily | undefined {
  if (!program) return undefined;
  switch (program.toLowerCase()) {
    case 'system':
      return 'system';
    case 'spl-token':
    case 'token':
      return 'spl-token';
    case 'token-2022':
    case 'token2022':
      return 'token-2022';
    case 'associated-token':
    case 'ata':
      return 'associated-token';
    case 'compute-budget':
      return 'compute-budget';
    case 'anchor':
      return 'anchor';
    default:
      return undefined;
  }
}
