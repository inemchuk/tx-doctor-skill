// Priority-fee math. Recommend a CU price (micro-lamports per CU) from recent
// on-chain prioritization fees, and compute the resulting priority fee.
//
// Priority fee (lamports) = ceil(microLamportsPerCu * cuLimit / 1_000_000)

/** Nearest-rank percentile. Sorts internally; clamps p to [0, 100]. */
export function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(100, p));
  if (clamped === 0) return sorted[0];
  const rank = Math.ceil((clamped / 100) * sorted.length);
  return sorted[Math.min(rank, sorted.length) - 1];
}

/** Recommend a CU price from recent fee samples (default p75). */
export function recommendMicroLamports(samples: number[], p = 75): number {
  if (samples.length === 0) return 0;
  return percentile(samples, p);
}

/** Priority fee in lamports for a given CU price and CU limit. */
export function priorityFeeLamports(microLamportsPerCu: number, cuLimit: number): number {
  return Math.ceil((microLamportsPerCu * cuLimit) / 1_000_000);
}
