# Versioned transactions & Address Lookup Tables

**Read this when** you hit `Transaction too large`, "too many account keys", or
need to pack more accounts into one transaction.

## The size limit

A serialized transaction must fit in **1232 bytes**. Each account key is 32
bytes, so packing many accounts (DeFi routes, multi-CPI) quickly overflows.

## Legacy vs v0

- **Legacy** transactions list every account inline.
- **v0** (versioned) transactions can reference **Address Lookup Tables (ALTs)**,
  replacing 32-byte keys with 1-byte indexes — dramatically more accounts per tx.

Always build **v0** transactions for anything non-trivial. With `@solana/kit`,
transaction messages are versioned and you attach lookup tables to the message.

## Address Lookup Tables

1. **Create** an ALT (an on-chain account that stores a list of addresses).
2. **Extend** it with the addresses you reuse.
3. **Reference** it from your v0 transaction so those accounts compress to indexes.

```ts
// Conceptual flow with kit:
// - create ALT, extend with addresses
// - include the ALT in the transaction message so referenced
//   accounts are addressed by index instead of full key
```

## Pitfalls

- **ALT not warmed up:** an ALT (or newly added entries) can't be used until it's
  active — at least one slot must pass after creation/extension. Using it too soon
  → `AccountNotFound` / resolution failure.
- **Deactivated/closed ALT:** referencing a deactivated table fails. Keep the ALT
  alive for as long as transactions reference it.
- **Wrong addresses in the table:** indexes resolve to whatever is stored —
  double-check the extend step.
- **Still too large:** if even with an ALT you overflow, split into multiple
  transactions (and consider a Jito bundle for atomicity — `delivery-routing.md`).

## Sources

- Solana: versioned transactions & address lookup tables (solana.com/docs)
- `@solana/kit` transaction messages (github.com/anza-xyz/kit)
