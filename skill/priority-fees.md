# Priority fees

**Read this when** transactions aren't landing in congestion, or you're unsure
how much to pay.

## Fee anatomy

```
total fee = base fee + priority fee
base fee     = 5,000 lamports per signature   (50% burned)
priority fee = CU_price × CU_limit / 1,000,000 lamports   (CU_price in micro-lamports/CU)
```

The priority fee buys **inclusion priority** during congestion. In calm
conditions transactions land fine without one — only add it when congested or
time-sensitive.

**Rule:** raise the CU **price** before the CU **limit**. Price buys priority;
limit only buys headroom (and costs you more if inflated — see `compute-units.md`).

## Estimate the price

### `getRecentPrioritizationFees` (any RPC)

Returns recent per-slot prioritization fees. Pass the **writable accounts** your
tx touches to get a contention-aware estimate, then take a percentile (p75 is a
sane default; go higher when competing for a hot account).

```ts
const fees = await rpc.getRecentPrioritizationFees(writableAddresses).send();
const samples = fees.map((f) => Number(f.prioritizationFee));
// percentile(samples, 75) → micro-lamports per CU
```

### Helius `getPriorityFeeEstimate` (if using Helius)

Helius offers a smart estimate with `priorityLevel` (Min/Low/Medium/High/VeryHigh)
and per-account awareness. Prefer it when you already use Helius RPC; otherwise
`getRecentPrioritizationFees` + percentile is provider-agnostic.

## Rough ranges (2026)

| Condition | CU price (micro-lamports/CU) |
|---|---|
| calm | 0 – 1,000 |
| normal busy | 1,000 – 5,000 |
| congestion / launches | 50,000 – 100,000+ |

Always prefer a live estimate over a hard-coded number.

## Tool

```bash
node dist/estimate-fee.js --accounts <writable1,writable2> --cu 200000
# → p50/p75/p90, recommended CU price, resulting priority fee in lamports
```

## Beyond priority fees

In 2026, landing in heavy congestion often also needs **Jito tips / bundles** —
a *separate* mechanism from priority fees. See `delivery-routing.md`.

## Sources

- Solana fees (solana.com/docs/core/fees)
- Helius priority fee API (helius.dev/docs/priority-fee-api)
