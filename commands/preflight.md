---
description: Run the pre-send checklist for a Solana transaction — simulate, size compute units, verify blockhash/confirmation plan.
argument-hint: [--tx <base64>]
---

Run preflight for: `$ARGUMENTS`

1. Read `skill/simulation-preflight.md`.
2. If a base64 tx is given, run `node dist/simulate.js --tx <base64>` and report
   status, CU used, recommended CU limit, and any decoded error.
3. Walk the dry-run checklist:
   - simulated successfully (`err: null`)
   - CU limit set from estimate + buffer (not 1.4M)
   - compute-budget instructions first
   - priority fee priced for conditions
   - blockhash at correct commitment; retry/confirm plan in place
4. Report pass/fail per item and what to fix before sending.
