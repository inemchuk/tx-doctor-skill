// Error-code maps for the most frequently hit Solana programs.
//
// Sources (verify before editing):
// - SPL Token `TokenError`:        github.com/solana-program/token (program/src/error.rs)
// - System `SystemError`:          github.com/anza-xyz/agave (programs/system/src/system_processor.rs)
// - Associated Token error:        github.com/solana-program/associated-token-account
// - Anchor `ErrorCode`:            github.com/solana-foundation/anchor (lang/src/error.rs)
//
// These are stable, low-numbered enums. Custom program errors start at 6000
// (Anchor) and are program-specific — resolve those via the program's IDL.

import type { AnchorClass, ErrorEntry } from './types.js';

function e(code: number, name: string, message: string, causes: string[] = [], fixes: string[] = []): ErrorEntry {
  return { code, name, message, causes, fixes };
}

// --- SPL Token (also used by Token-2022 for these base codes) ---
const SPL_TOKEN: Record<number, ErrorEntry> = {
  0: e(0, 'NotRentExempt', 'Lamport balance below rent-exempt threshold',
    ['Account created without enough lamports for rent exemption'],
    ['Fund the account with at least the rent-exempt minimum (getMinimumBalanceForRentExemption)']),
  1: e(1, 'InsufficientFunds', 'Insufficient funds',
    ['Source token account balance is lower than the transfer/burn amount'],
    ['Check the token balance and amount (remember amounts are in base units, not UI units)']),
  2: e(2, 'InvalidMint', 'Invalid Mint',
    ['The mint account is not a valid SPL mint or is uninitialised'],
    ['Verify the mint address and that it has been initialised']),
  3: e(3, 'MintMismatch', 'Account not associated with this Mint',
    ['The token account belongs to a different mint than the instruction expects'],
    ['Use the token account that matches the mint (check the ATA derivation)']),
  4: e(4, 'OwnerMismatch', 'Owner does not match',
    ['The signer is not the owner/authority of the token account'],
    ['Sign with the correct owner, or pass the right authority/delegate']),
  5: e(5, 'FixedSupply', "This token's supply is fixed and new tokens cannot be minted"),
  6: e(6, 'AlreadyInUse', 'The account cannot be initialized because it is already being used'),
  7: e(7, 'InvalidNumberOfProvidedSigners', 'Invalid number of provided signers'),
  8: e(8, 'InvalidNumberOfRequiredSigners', 'Invalid number of required signers'),
  9: e(9, 'UninitializedState', 'State is uninitialized'),
  10: e(10, 'NativeNotSupported', 'Instruction does not support native tokens'),
  11: e(11, 'NonNativeHasBalance', 'Non-native account can only be closed if its balance is zero'),
  12: e(12, 'InvalidInstruction', 'Invalid instruction'),
  13: e(13, 'InvalidState', 'State is invalid for requested operation'),
  14: e(14, 'Overflow', 'Operation overflowed'),
  15: e(15, 'AuthorityTypeNotSupported', 'Account does not support specified authority type'),
  16: e(16, 'MintCannotFreeze', 'This token mint cannot freeze accounts'),
  17: e(17, 'AccountFrozen', 'Account is frozen',
    ['The token account was frozen by the freeze authority'],
    ['Have the freeze authority thaw the account before transferring']),
  18: e(18, 'MintDecimalsMismatch', 'The provided decimals value different from the Mint decimals'),
  19: e(19, 'NonNativeNotSupported', 'Instruction does not support non-native tokens'),
};

// --- System program ---
const SYSTEM: Record<number, ErrorEntry> = {
  0: e(0, 'AccountAlreadyInUse', 'an account with the same address already exists',
    ['Trying to create an account that already exists'],
    ['Use a different address/seed, or skip creation if it already exists']),
  1: e(1, 'ResultWithNegativeLamports', 'account does not have enough SOL to perform the operation',
    ['Transfer/allocate would overdraw the source account'],
    ['Fund the payer; account for rent and fees']),
  2: e(2, 'InvalidProgramId', 'cannot assign account to this program id'),
  3: e(3, 'InvalidAccountDataLength', 'cannot allocate account data of this length'),
  4: e(4, 'MaxSeedLengthExceeded', 'length of requested seed is too long'),
  5: e(5, 'AddressWithSeedMismatch', 'provided address does not match addressed derived from seed'),
  6: e(6, 'NonceNoRecentBlockhashes', 'advancing stored nonce requires a populated RecentBlockhashes sysvar'),
  7: e(7, 'NonceBlockhashNotExpired', 'stored nonce is still in recent_blockhashes'),
  8: e(8, 'NonceUnexpectedBlockhashValue', 'specified nonce does not match stored nonce'),
};

// --- Associated Token Account program ---
const ASSOCIATED_TOKEN: Record<number, ErrorEntry> = {
  0: e(0, 'InvalidOwner', 'Associated token account owner does not match address derivation',
    ['Passed an ATA whose owner does not match the derived address'],
    ['Derive the ATA with getAssociatedTokenAddress for the correct owner+mint']),
};

// --- Compute Budget program ---
// Compute Budget failures usually surface as transaction-level errors
// (e.g. "exceeded CUs meter"), not custom program error codes. See
// decoding-errors.md for the non-code symptom table.
const COMPUTE_BUDGET: Record<number, ErrorEntry> = {};

// --- Anchor framework errors (high-frequency subset) ---
const ANCHOR_LANG: Record<number, ErrorEntry> = {
  100: e(100, 'InstructionMissing', '8 byte instruction identifier not provided'),
  101: e(101, 'InstructionFallbackNotFound', 'Fallback functions are not supported'),
  102: e(102, 'InstructionDidNotDeserialize', 'The program could not deserialize the given instruction'),
  103: e(103, 'InstructionDidNotSerialize', 'The program could not serialize the given instruction'),
  2000: e(2000, 'ConstraintMut', 'A mut constraint was violated',
    ['Account expected to be mutable was passed as read-only'],
    ['Mark the account `mut` in the client and ensure it is writable']),
  2001: e(2001, 'ConstraintHasOne', 'A has one constraint was violated',
    ['A `has_one` field does not match the referenced account'],
    ['Pass the account whose key matches the stored field']),
  2002: e(2002, 'ConstraintSigner', 'A signer constraint was violated',
    ['Required signer did not sign'],
    ['Add the missing signer to the transaction']),
  2003: e(2003, 'ConstraintRaw', 'A raw constraint was violated'),
  2004: e(2004, 'ConstraintOwner', 'An owner constraint was violated'),
  2006: e(2006, 'ConstraintSeeds', 'A seeds constraint was violated',
    ['PDA seeds/bump passed do not derive the provided account'],
    ['Recompute the PDA with the exact seeds and canonical bump']),
  2012: e(2012, 'ConstraintAddress', 'An address constraint was violated'),
  2015: e(2015, 'ConstraintTokenMint', 'A token mint constraint was violated'),
  3002: e(3002, 'AccountDiscriminatorMismatch', 'The account discriminator did not match what was expected',
    ['Account is of a different type than expected'],
    ['Pass the correct account; check you are not mixing up account types']),
  3007: e(3007, 'AccountOwnedByWrongProgram', 'The given account is owned by a different program than expected',
    ['Account owner is not the expected program'],
    ['Pass an account created/owned by the expected program']),
  3012: e(3012, 'AccountNotInitialized', 'The program expected this account to be already initialized',
    ['Account has not been created/initialised yet'],
    ['Initialise the account first, or use init/init_if_needed']),
};

export const lookupSplToken = (code: number): ErrorEntry | undefined => SPL_TOKEN[code];
export const lookupSystem = (code: number): ErrorEntry | undefined => SYSTEM[code];
export const lookupAssociatedToken = (code: number): ErrorEntry | undefined => ASSOCIATED_TOKEN[code];
export const lookupComputeBudget = (code: number): ErrorEntry | undefined => COMPUTE_BUDGET[code];
export const lookupAnchorLang = (code: number): ErrorEntry | undefined => ANCHOR_LANG[code];

/** Classify an Anchor error number into its reserved range. */
export function classifyAnchor(code: number): AnchorClass {
  if (code >= 6000) return 'custom';
  if (code >= 4100) return 'misc';
  if (code >= 3000) return 'account';
  if (code >= 2000) return 'constraint';
  if (code >= 1000) return 'idl';
  if (code >= 100) return 'lang';
  return 'unknown';
}

/** Map a well-known program id to its error family. */
export function familyFromProgramId(programId: string): 'system' | 'spl-token' | 'token-2022' | 'associated-token' | 'compute-budget' | undefined {
  switch (programId) {
    case '11111111111111111111111111111111':
      return 'system';
    case 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA':
      return 'spl-token';
    case 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb':
      return 'token-2022';
    case 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL':
      return 'associated-token';
    case 'ComputeBudget111111111111111111111111111111':
      return 'compute-budget';
    default:
      return undefined;
  }
}
