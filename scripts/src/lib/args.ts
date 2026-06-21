// Tiny zero-dependency argv parser shared by the CLIs.
// Supports: positional args, `--flag value`, `--flag=value`, boolean `--flag`.

export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

/** Resolve the RPC endpoint from --rpc, RPC_URL, or default to devnet. */
export function resolveRpcUrl(flags: Record<string, string | boolean>): string {
  if (typeof flags.rpc === 'string') return flags.rpc;
  if (process.env.RPC_URL) return process.env.RPC_URL;
  return 'https://api.devnet.solana.com';
}
