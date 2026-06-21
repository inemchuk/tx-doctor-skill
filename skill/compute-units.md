# Compute units

**Read this when** you hit "exceeded CUs meter", overpay on fees, or want to
size the CU limit correctly.

## The model

- A transaction may use up to **1,400,000 CU** (hard cap).
- With no `SetComputeUnitLimit` instruction, the default is **200,000 CU per
  non-builtin instruction** (capped at 1.4M). This is often *more* than you need.
- You pay the priority fee on the **requested CU limit**, not the amount
  consumed. So an inflated limit = wasted lamports; too low = "exceeded CUs".

**Rule:** set the limit to your *simulated* usage plus a small buffer.

## Estimate from simulation (@solana/kit)

`estimateComputeUnitLimitFactory` simulates the message (temporarily setting the
limit to the 1.4M max so the sim itself doesn't run out) and returns the real CU.

```ts
import { appendTransactionMessageInstruction } from '@solana/kit';
import {
  estimateComputeUnitLimitFactory,
  getSetComputeUnitLimitInstruction,
} from '@solana-program/compute-budget';

const estimate = estimateComputeUnitLimitFactory({ rpc });
const units = await estimate(transactionMessage);

const withLimit = appendTransactionMessageInstruction(
  getSetComputeUnitLimitInstruction({ units: Math.ceil(units * 1.1) }), // +10% buffer
  transactionMessage,
);
```

Or compute the buffer with the helper used by the CLI:

```ts
import { withBuffer } from '../scripts/src/lib/cu.js';
withBuffer(units);        // +10%, clamped to 1.4M
withBuffer(units, 0.2);   // +20%
```

## Set the price too

Compute budget = a **limit** instruction and a **price** instruction
(micro-lamports per CU). See `priority-fees.md` for choosing the price.

```ts
import { getSetComputeUnitPriceInstruction } from '@solana-program/compute-budget';
getSetComputeUnitPriceInstruction({ microLamports: 10_000n });
```

## Ordering matters

Add **both compute-budget instructions first** in the transaction. They are
cheap builtins and the runtime expects them up front.

## Pitfalls

- Setting only the price but not the limit → you still pay on the 200k×ix default.
- Setting the limit to 1.4M "to be safe" → you overpay the priority fee massively.
- Estimating once and reusing forever → re-estimate when the instruction set or
  account state changes account sizes / branches.

## Tool

```bash
node dist/simulate.js --tx <base64>   # prints "Set CU limit to: <estimate+buffer>"
```

## Sources

- `@solana/kit` / `@solana-program/compute-budget` (github.com/anza-xyz/kit)
- Solana fees & compute (solana.com/docs/core/fees)
