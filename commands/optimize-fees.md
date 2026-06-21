---
description: Recommend compute-unit limit, priority-fee price, and delivery strategy so a transaction lands reliably.
argument-hint: [--accounts <writable addrs>] [--tx <base64>]
---

Optimize landing for the transaction context: `$ARGUMENTS`

1. Read `skill/compute-units.md`, `skill/priority-fees.md`, and
   `skill/delivery-routing.md`.
2. If a base64 tx is given, run `node dist/simulate.js --tx <base64>` to get real
   CU usage and a recommended CU limit.
3. Run `node dist/estimate-fee.js --accounts <writable>` for a priority-fee
   recommendation (build first if needed).
4. Recommend: CU limit (estimate + buffer), CU price, whether a Jito tip/bundle
   is warranted, and the send strategy (plain / priority fee / fan-out).
5. Show the exact compute-budget instructions to add (limit + price), first in
   the transaction.
