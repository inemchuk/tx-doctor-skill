# Delivery routing (Jito, bundles, tips)

**Read this when** transactions still don't land despite a priority fee, or you
need atomic multi-tx execution or MEV protection.

## Tip ≠ priority fee (the #1 mistake)

- **Priority fee** increases the chance the *runtime* includes your tx during
  congestion. Paid via the compute-budget price instruction.
- **Jito tip** is a bid into the Jito **Block Engine auction**, paid by
  transferring SOL to a Jito **tip account**. It improves your **bundle's**
  ranking against competing bundles.

They are different levers. In competitive conditions you often need **both**: a
healthy priority fee *and* a competitive tip. A big tip with a too-low priority
fee can still fail; a good priority fee without a tip can lose the auction.

By 2026 the Jito-Solana client runs under the large majority of stake and tips
are a major share of priority-fee volume — so "landing in congestion" is, in
practice, competing in Jito's auction.

## Bundles

A **bundle** is a group of transactions executed **sequentially, atomically,
all-or-nothing**. Use bundles for: atomic multi-step actions, MEV protection
(front-run resistance), and guaranteeing ordering. The Block Engine ranks
bundles by **tip per compute unit** and packs the best-paying non-conflicting set
into the block.

Send bundles via the Jito Block Engine endpoints; put the tip transfer in the
bundle (commonly the last tx) to one of the published tip accounts.

### Sending a bundle (sketch)

The Block Engine exposes a JSON-RPC `sendBundle` method that takes an array of
base64-encoded signed transactions. The tip is a normal SOL transfer to a Jito
tip account, included as one of the transactions (usually last).

```ts
// 1) Pick a tip account (fetch the current list from Jito's getTipAccounts).
const TIP_ACCOUNT = address('<one of Jito's tip accounts>');

// 2) Build your action tx(s) AND a tip transfer tx (transfer SOL -> TIP_ACCOUNT).
//    Sign each; serialize to base64 wire format.
const encoded = signedTxs.map((tx) => getBase64EncodedWireTransaction(tx));

// 3) Submit the bundle to a Block Engine endpoint.
const res = await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sendBundle', params: [encoded] }),
});
const { result: bundleId } = await res.json();

// 4) Poll bundle status (getBundleStatuses) or watch your tx signatures.
```

Notes: bundles are all-or-nothing — if any tx fails, none land (and the tip
isn't paid). Size the tip competitively (tip-per-CU) and still set a priority
fee on the action tx(s). Always fetch the **current** tip accounts and endpoints
from Jito rather than hard-coding them.

## Staked connections

Sending through a **staked** RPC connection (the sender has stake weight) gives
better transaction-forwarding priority than a generic public RPC. Many providers
(Helius, Triton, etc.) offer staked send endpoints.

## The 2026 pattern: treat sending as routing

Don't hard-commit to one path. **Fan out in parallel**: submit through Jito
(bundle or single+tip), plus one or more low-latency send services (e.g.
Astralane / Lil-JIT-style relays), with **raw RPC as a degraded fallback**.
First confirmation wins; dedupe by signature.

```
build tx ─┬─> Jito (tip)        ─┐
          ├─> staked send relay  ─┼─> first confirmation wins
          └─> raw RPC (fallback) ─┘
```

## Decision guide

| Situation | Do |
|---|---|
| calm network | plain send, no tip needed |
| busy, single tx | priority fee + optionally a small tip |
| congestion / launch / hot account | priority fee **and** competitive Jito tip, fan-out send |
| atomic multi-tx / ordering / MEV protection | Jito **bundle** with tip |

## Sources

- Jito Labs low-latency txn send & bundles (docs.jito.wtf)
- Solana MEV protection guide (solana.com/developers/guides/advanced/mev-protection)
