// Hex/decimal conversion for Solana error codes.
// Custom program errors are surfaced as hex (e.g. `0x1771`) but humans and
// IDLs think in decimal (6001), so we normalise both directions.

export function toDecimal(input: string, assumeHex = false): number {
  const s = input.trim();
  if (s.startsWith('0x') || s.startsWith('0X')) return parseStrict(s.slice(2), 16);
  if (assumeHex) return parseStrict(s, 16);
  return parseStrict(s, 10);
}

export function toHex(n: number): string {
  return '0x' + n.toString(16);
}

function parseStrict(s: string, radix: number): number {
  const re = radix === 16 ? /^[0-9a-fA-F]+$/ : /^[0-9]+$/;
  if (!re.test(s)) throw new Error(`Not a valid base-${radix} number: ${s}`);
  return parseInt(s, radix);
}
