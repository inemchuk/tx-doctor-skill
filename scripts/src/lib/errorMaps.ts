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

// --- Anchor framework errors ---
// Numbers are stable across Anchor versions. Source: anchor lang/src/error.rs.
const ANCHOR_LANG: Record<number, ErrorEntry> = {
  // Instructions (100s)
  100: e(100, 'InstructionMissing', '8 byte instruction identifier not provided'),
  101: e(101, 'InstructionFallbackNotFound', 'Fallback functions are not supported'),
  102: e(102, 'InstructionDidNotDeserialize', 'The program could not deserialize the given instruction',
    ['Args/account layout sent by the client does not match the program'],
    ['Regenerate the client from the current IDL; check arg order and types']),
  103: e(103, 'InstructionDidNotSerialize', 'The program could not serialize the given instruction'),
  // IDL (1000s)
  1000: e(1000, 'IdlInstructionStub', 'The program was compiled without idl instructions'),
  1001: e(1001, 'IdlInstructionInvalidProgram', 'Invalid program given to the IDL instruction'),
  // Constraints (2000s)
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
  2005: e(2005, 'ConstraintRentExempt', 'A rent exemption constraint was violated'),
  2006: e(2006, 'ConstraintSeeds', 'A seeds constraint was violated',
    ['PDA seeds/bump passed do not derive the provided account'],
    ['Recompute the PDA with the exact seeds and canonical bump']),
  2007: e(2007, 'ConstraintExecutable', 'An executable constraint was violated'),
  2009: e(2009, 'ConstraintAssociated', 'An associated constraint was violated'),
  2010: e(2010, 'ConstraintAssociatedInit', 'An associated init constraint was violated'),
  2011: e(2011, 'ConstraintClose', 'A close constraint was violated'),
  2012: e(2012, 'ConstraintAddress', 'An address constraint was violated',
    ['Account address does not match the `address = …` constraint'],
    ['Pass the exact expected address']),
  2013: e(2013, 'ConstraintZero', 'A zero constraint was violated'),
  2014: e(2014, 'ConstraintTokenMint', 'A token mint constraint was violated'),
  2015: e(2015, 'ConstraintTokenOwner', 'A token owner constraint was violated'),
  2016: e(2016, 'ConstraintMintMintAuthority', 'A mint mint authority constraint was violated'),
  2017: e(2017, 'ConstraintMintFreezeAuthority', 'A mint freeze authority constraint was violated'),
  2018: e(2018, 'ConstraintMintDecimals', 'A mint decimals constraint was violated'),
  2019: e(2019, 'ConstraintSpace', 'A space constraint was violated'),
  // Require macros (2500s)
  2500: e(2500, 'RequireViolated', 'A require expression was violated'),
  2501: e(2501, 'RequireEqViolated', 'A require_eq expression was violated'),
  2502: e(2502, 'RequireKeysEqViolated', 'A require_keys_eq expression was violated'),
  2503: e(2503, 'RequireNeqViolated', 'A require_neq expression was violated'),
  2504: e(2504, 'RequireKeysNeqViolated', 'A require_keys_neq expression was violated'),
  2505: e(2505, 'RequireGtViolated', 'A require_gt expression was violated'),
  2506: e(2506, 'RequireGteViolated', 'A require_gte expression was violated'),
  // Accounts (3000s)
  3000: e(3000, 'AccountDiscriminatorAlreadySet', 'The account discriminator was already set on this account'),
  3001: e(3001, 'AccountDiscriminatorNotFound', 'No discriminator was found on the account'),
  3002: e(3002, 'AccountDiscriminatorMismatch', 'The account discriminator did not match what was expected',
    ['Account is of a different type than expected'],
    ['Pass the correct account; check you are not mixing up account types']),
  3003: e(3003, 'AccountDidNotDeserialize', 'Failed to deserialize the account'),
  3004: e(3004, 'AccountDidNotSerialize', 'Failed to serialize the account'),
  3005: e(3005, 'AccountNotEnoughKeys', 'Not enough account keys given to the instruction',
    ['Fewer accounts passed than the instruction expects'],
    ['Pass all required accounts in the right order (regenerate client from IDL)']),
  3006: e(3006, 'AccountNotMutable', 'The given account is not mutable'),
  3007: e(3007, 'AccountOwnedByWrongProgram', 'The given account is owned by a different program than expected',
    ['Account owner is not the expected program'],
    ['Pass an account created/owned by the expected program']),
  3008: e(3008, 'InvalidProgramId', 'Program ID was not as expected'),
  3009: e(3009, 'InvalidProgramExecutable', 'Program account is not executable'),
  3010: e(3010, 'AccountNotSigner', 'The given account did not sign'),
  3011: e(3011, 'AccountNotSystemOwned', 'The given account is not owned by the system program'),
  3012: e(3012, 'AccountNotInitialized', 'The program expected this account to be already initialized',
    ['Account has not been created/initialised yet'],
    ['Initialise the account first, or use init / init_if_needed']),
  3013: e(3013, 'AccountNotProgramData', 'The given account is not the associated program data account'),
  3014: e(3014, 'AccountNotAssociatedTokenAccount', 'The given account is not the expected associated token account'),
  3015: e(3015, 'AccountSysvarMismatch', 'The given public key does not match the required sysvar'),
  // Misc (4100s)
  4100: e(4100, 'DeclaredProgramIdMismatch', 'The declared program id does not match the actual program id',
    ['`declare_id!` does not match the deployed program id'],
    ['Update declare_id! to the deployed program id and rebuild/redeploy']),
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
