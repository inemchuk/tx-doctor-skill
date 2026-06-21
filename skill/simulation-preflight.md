# Simulation & preflight

**Read this when** you want to verify a transaction *before* sending it, or read
why a simulation failed.

## Why simulate

Simulation runs the transaction against the current bank without committing it.
Use it to: (1) catch errors early, (2) measure real compute-unit consumption,
(3) inspect logs and return data. Always simulate before sending in production.

## RPC: `simulateTransaction`

Key config flags:

- `replaceRecentBlockhash: true` — let the RPC swap in a valid blockhash so the
  sim doesn't fail on an expired/placeholder one. Use this for *estimation*.
- `sigVerify: false` — skip signature checks (can't combine with
  `replaceRecentBlockhash`). Use when you haven't signed yet.
- `encoding: 'base64'` — pass a serialized wire transaction.

Response `value` contains:

| Field | Use |
|---|---|
| `err` | `null` on success; otherwise the transaction error |
| `logs` | program log lines — decode errors from here (`decoding-errors.md`) |
| `unitsConsumed` | real CU used → feed into your CU limit (`compute-units.md`) |
| `returnData` | program return value, if any |

## Tool

```bash
node dist/simulate.js --tx <base64WireTransaction> --rpc <url>
```

Prints status, CU used, a recommended CU limit (estimate + 10% buffer), decoded
error, and the full logs.

## Preflight vs `skipPreflight`

`sendTransaction` runs a preflight simulation by default. Two modes:

- **Keep preflight** (default): the RPC rejects obviously-bad txs early. Good for
  normal sends; costs one extra simulation round-trip.
- **`skipPreflight: true`**: skip it for speed/latency when you've *already*
  simulated yourself, or during congestion where preflight against a lagging RPC
  produces false negatives. Pair with your own simulation + retry loop
  (`landing-retries.md`).

## Dry-run checklist

- [ ] Simulated with `replaceRecentBlockhash` and got `err: null`
- [ ] Set CU limit from `unitsConsumed` + buffer (not the 1.4M max)
- [ ] Compute-budget instructions are first in the transaction
- [ ] Priority fee priced for current conditions (`priority-fees.md`)
- [ ] Blockhash fetched at the right commitment; retry/confirm plan in place

## Sources

- Solana RPC: `simulateTransaction` (solana.com/docs/rpc/http/simulatetransaction)
- Solana: "How to request optimal compute" (solana.com/developers/guides)
