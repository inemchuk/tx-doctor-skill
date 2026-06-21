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

const CLUSTERS: Record<string, string> = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://127.0.0.1:8899',
  localhost: 'http://127.0.0.1:8899',
};

/** Map a cluster alias (mainnet/devnet/testnet/localnet) to its RPC URL. */
export function clusterUrl(name: string): string | undefined {
  return CLUSTERS[name.toLowerCase()];
}

/**
 * Resolve the RPC endpoint, in order: --rpc, --cluster <alias>, RPC_URL env,
 * then default devnet. Throws on an unknown --cluster alias.
 */
export function resolveRpcUrl(flags: Record<string, string | boolean>): string {
  if (typeof flags.rpc === 'string') return flags.rpc;
  if (typeof flags.cluster === 'string') {
    const url = clusterUrl(flags.cluster);
    if (!url) throw new Error(`Unknown cluster "${flags.cluster}". Use mainnet, devnet, testnet, or localnet.`);
    return url;
  }
  if (process.env.RPC_URL) return process.env.RPC_URL;
  return 'https://api.devnet.solana.com';
}
