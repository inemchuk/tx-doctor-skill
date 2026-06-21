---
name: tx-doctor
description: Diagnose Solana transaction failures and land transactions reliably — decode error codes, budget compute units, price priority fees, route delivery (Jito), handle blockhash/retries/confirmation, versioned tx + Address Lookup Tables, and durable nonces. Symptom-first. Progressive disclosure — read only what you need.
user-invocable: true
---

# Tx Doctor

The transaction-lifecycle layer for Solana: take a builder from a **symptom**
(an error string, a stuck transaction, a signature) to a **diagnosis and a
concrete fix**. Covers the path most other skills skip — simulation → compute
units → priority fees → delivery → confirmation/retries → error decoding.

This skill complements the kit's existing pieces: defer general program/frontend
work to `solana-dev`, and RPC-provider API depth (e.g. Helius) to those skills.
Tx Doctor owns the **decision logic** of getting a transaction to land and
understanding why one failed.

## Operating procedure

1. **Classify the symptom** using the routing table below.
2. **Load only the matching module** (progressive disclosure — don't read them all).
3. **Optionally run a CLI** from `scripts/` to decode/simulate/measure against a live RPC.
4. **Deliver a diagnosis + a minimal fix** (show the diff / the exact instruction change).

When the cause is a custom (`6000+`) error, never guess — resolve it from the
program's IDL (`--idl`) or say it's program-specific.

## Symptom → module routing

| Symptom / request | Read |
|---|---|
| `custom program error: 0x…`, unknown code, AnchorError | `decoding-errors.md` |
| `Blockhash not found` / expired / "block height exceeded" | `landing-retries.md` |
| `AccountNotFound`, `insufficient lamports`, rent, "debit an account" | `decoding-errors.md` (non-code table) |
| `Transaction too large` / too many accounts | `versioned-tx-alt.md` |
| "exceeded CUs meter" / tx too slow / fees too high | `compute-units.md` |
| "tx not landing in congestion" / how much to pay | `priority-fees.md` → `delivery-routing.md` |
| "should I use Jito / bundles / tips" | `delivery-routing.md` |
| "how do I confirm / retry safely" | `landing-retries.md` |
| "offline / long-lived signing" | `landing-retries.md` (durable nonce) |
| "verify before sending" | `simulation-preflight.md` |
| "migrate from web3.js v1" | `sdk-migration.md` |
| links / further reading | `resources.md` |

## Tools (`scripts/`)

TypeScript on `@solana/kit`. Build once (`npm install && npm run build`), then run:

| Command | Purpose |
|---|---|
| `node dist/decode-error.js <code\|--logs\|--idl>` | decode an error code / log dump (offline) |
| `node dist/simulate.js --tx <base64>` | simulate → CU used, recommended limit, logs, decoded error |
| `node dist/estimate-fee.js [--accounts a,b] [--cu N]` | priority-fee percentiles + recommendation |
| `node dist/inspect-tx.js <signature>` | decode a confirmed/failed transaction by signature |

After `npm link` the same tools are available as `tx-decode-error`, `tx-simulate`,
`tx-estimate-fee`, `tx-inspect`.

## Agent & commands

- Agent: `agents/tx-doctor.md` — transaction-triage persona.
- Commands: `/diagnose-tx`, `/decode-error`, `/optimize-fees`, `/preflight`.
- Rules: `rules/transaction-safety.md` (auto-applies when editing tx-building code).
