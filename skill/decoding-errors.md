# Decoding transaction errors

**Read this when** you see a `custom program error`, an `AnchorError`, or a
non-code runtime failure (`Blockhash not found`, `AccountNotFound`, rent errors).

## Step 0 — hex → decimal

Custom errors are reported in hex. Convert first.

```
0x0  = 0      0x1  = 1      0xa  = 10
0x1770 = 6000  0x1771 = 6001  (Anchor user errors start at 6000 / 0x1770)
```

Run `node dist/tx-doctor.js decode 0x1771` to do this and look up the meaning.

## Step 1 — which program raised it?

The runtime prints `Program <id> failed: custom program error: 0x…`. The
program id tells you which error map applies:

| Program id | Family |
|---|---|
| `11111111111111111111111111111111` | System |
| `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | SPL Token |
| `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Token-2022 |
| `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Associated Token |
| anything else | the program's own (Anchor or native) errors |

## SPL Token (`TokenError`)

| Code | Name | Meaning |
|---|---|---|
| 0 / 0x0 | NotRentExempt | balance below rent-exempt threshold |
| 1 / 0x1 | InsufficientFunds | not enough tokens for transfer/burn |
| 2 / 0x2 | InvalidMint | mint account invalid/uninitialised |
| 3 / 0x3 | MintMismatch | token account belongs to a different mint |
| 4 / 0x4 | OwnerMismatch | signer is not the owner/authority |
| 17 / 0x11 | AccountFrozen | account frozen by the freeze authority |
| 18 / 0x12 | MintDecimalsMismatch | decimals passed ≠ mint decimals |

Full enum (0–19) is in `scripts/src/lib/errorMaps.ts`. Source:
`github.com/solana-program/token` (`program/src/error.rs`).

## System program (`SystemError`)

| Code | Name | Meaning |
|---|---|---|
| 0 | AccountAlreadyInUse | address already exists |
| 1 | ResultWithNegativeLamports | not enough SOL for the operation |
| 4 | MaxSeedLengthExceeded | seed too long |
| 5 | AddressWithSeedMismatch | address ≠ derived-from-seed |
| 6–8 | Nonce* | durable nonce issues (see `landing-retries.md`) |

## Anchor framework errors (ranges)

Anchor reserves numeric ranges; the **number** tells you the category:

| Range | Category | Common examples |
|---|---|---|
| 100–999 | lang | 102 InstructionDidNotDeserialize |
| 1000–1999 | IDL | |
| 2000–2999 | constraint | 2001 ConstraintHasOne, 2006 ConstraintSeeds |
| 3000–3999 | account | 3007 AccountOwnedByWrongProgram, 3012 AccountNotInitialized |
| 4100+ | misc | |
| **6000+** | **user-defined** | resolve via the program's IDL |

Source: `github.com/solana-foundation/anchor` (`lang/src/error.rs`).

### AnchorError log format

```
Program log: AnchorError occurred. Error Code: ConstraintHasOne. Error Number: 2001. Error Message: A has one constraint was violated.
```

`Error Number` + `Error Code` are emitted directly — read them off the logs.

### Custom (6000+) codes

These are defined per program; they are **not** in any static map. Resolve:

```bash
# from a local IDL or a URL:
node dist/tx-doctor.js decode 6001 --idl ./target/idl/my_program.json
node dist/tx-doctor.js decode 6001 --idl https://example.com/my_program.json

# or fetch it on-chain (needs the anchor CLI installed):
node dist/tx-doctor.js decode 6001 --fetch <programId> --cluster mainnet
```

## Non-code runtime symptoms

These do not come as `custom program error` codes:

| Symptom | Cause | Fix |
|---|---|---|
| `Blockhash not found` | blockhash expired before landing, or wrong commitment | refetch blockhash with `confirmed`/`finalized`; see `landing-retries.md` |
| `block height exceeded` | `lastValidBlockHeight` passed | rebuild + resend with a fresh blockhash |
| `AccountNotFound` | account not created, wrong cluster, or stale ALT | create/init the account; verify cluster; warm/extend the ALT (`versioned-tx-alt.md`) |
| `insufficient lamports` / rent | payer can't cover rent + fee | fund the payer; use `getMinimumBalanceForRentExemption` |
| `Attempt to debit an account but found no record` | fee payer has 0 SOL / never funded on this cluster | airdrop/fund the payer on the right cluster |
| `exceeded CUs meter` | ran out of compute budget | raise CU limit from a simulated estimate (`compute-units.md`) |
| `Transaction too large` | > 1232 bytes | versioned tx + ALT (`versioned-tx-alt.md`) |
| write-lock contention / dropped | many txs write the same hot account | spread writes; add priority fee / Jito tip (`delivery-routing.md`) |

## Tools

- `node dist/tx-doctor.js decode <code>` — offline lookup
- `node dist/tx-doctor.js inspect <signature>` — decode a failed tx end-to-end
