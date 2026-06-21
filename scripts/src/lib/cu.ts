// Compute-unit math. You pay the priority fee on the *requested* CU limit, not
// the consumed amount, so set the limit to the simulated estimate plus a small
// safety buffer — never the 1.4M max.

export const MAX_CU = 1_400_000;

export function withBuffer(units: number, buffer = 0.1): number {
  if (units < 0) throw new Error('units must be >= 0');
  return clampCu(Math.ceil(units * (1 + buffer)));
}

export function clampCu(units: number): number {
  return Math.min(units, MAX_CU);
}
