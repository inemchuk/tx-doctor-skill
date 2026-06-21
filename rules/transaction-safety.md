# Transaction safety rules

Auto-apply these when writing or editing Solana transaction-building code
(`@solana/kit` / `gill` / `web3.js`).

1. **Simulate before send.** Always simulate (`replaceRecentBlockhash`) and check
   `err` before broadcasting in production.
2. **Size the CU limit from the estimate.** Use `estimateComputeUnitLimitFactory`
   + a ~10% buffer. Never ship the 1.4M max (you pay the priority fee on the
   requested limit).
3. **Set both compute-budget instructions, first.** A `SetComputeUnitLimit` and a
   `SetComputeUnitPrice`, before other instructions.
4. **Fetch blockhash at `confirmed`+** and track `lastValidBlockHeight`. Never
   reuse an expired blockhash; rebuild on expiry.
5. **Have a confirmation/retry plan.** Use `sendAndConfirmTransactionFactory`, or
   a manual loop re-sending the *same* signed tx until confirmed or expired.
6. **Priority fee ≠ Jito tip.** Don't conflate them; in congestion you may need
   both.
7. **Use v0 + ALTs** for transactions with many accounts (1232-byte limit).
8. **Durable nonce** for offline / long-lived signing instead of a recent
   blockhash.
9. **Prefer `@solana/kit` (v6) idioms** for new code; treat `web3.js` v1 as
   legacy.

See the `skill/` modules for the rationale and code for each rule.
