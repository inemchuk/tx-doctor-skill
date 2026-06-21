// Shared types for the Tx Doctor decode library.

/** A single, fully described program error code. */
export interface ErrorEntry {
  code: number;
  name: string;
  message: string;
  causes: string[];
  fixes: string[];
}

/** Which Solana program family an error code belongs to. */
export type ProgramFamily =
  | 'system'
  | 'spl-token'
  | 'token-2022'
  | 'associated-token'
  | 'compute-budget'
  | 'anchor';

/** Anchor reserves numeric ranges for framework vs. user-defined errors. */
export type AnchorClass =
  | 'lang'
  | 'idl'
  | 'constraint'
  | 'account'
  | 'misc'
  | 'custom'
  | 'unknown';
