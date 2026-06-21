#!/usr/bin/env node
// Recommend a priority-fee CU price from recent on-chain prioritization fees.
//
//   tx-doctor fee [--accounts <a,b>] [--cu <limit>] [--cluster mainnet]

import { pathToFileURL } from 'node:url';
import { address, createSolanaRpc } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { percentile, priorityFeeLamports, recommendMicroLamports } from './lib/fees.js';

const USAGE = `tx-doctor fee — recommend a priority-fee CU price

Usage:
  tx-doctor fee [--accounts <a,b>] [--cu <limit>] [--cluster <name> | --rpc <url>]

--accounts   comma-separated writable addresses your tx touches
--cu         CU limit to price the priority fee against (default 200000)
--cluster    mainnet | devnet | testnet | localnet
--rpc        explicit RPC endpoint (or RPC_URL env)
--help       show this help`;

export async function run(argv: string[]): Promise<void> {
  const { flags } = parseArgs(argv);
  if (flags.help) {
    console.log(USAGE);
    return;
  }

  const cuLimit = typeof flags.cu === 'string' ? Number(flags.cu) : 200_000;
  const rpc = createSolanaRpc(resolveRpcUrl(flags));
  const accounts =
    typeof flags.accounts === 'string'
      ? flags.accounts.split(',').map((a) => address(a.trim()))
      : undefined;

  try {
    const res = await rpc.getRecentPrioritizationFees(accounts).send();
    const samples = res.map((r) => Number(r.prioritizationFee));

    const recommended = recommendMicroLamports(samples, 75);
    console.log(`\n  Samples:         ${samples.length} recent slots`);
    console.log(`  p50 / p75 / p90: ${percentile(samples, 50)} / ${percentile(samples, 75)} / ${percentile(samples, 90)} micro-lamports/CU`);
    console.log(`  Recommended:     ${recommended} micro-lamports/CU (p75)`);
    console.log(`  Priority fee:    ${priorityFeeLamports(recommended, cuLimit)} lamports at CU limit ${cuLimit}`);
    console.log('\n  Tip: raise the CU price before the CU limit; put compute-budget instructions first.\n');
  } catch (e) {
    console.error(`Fee request failed: ${(e as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run(process.argv.slice(2)).catch((err) => {
    console.error((err as Error).message);
    process.exit(1);
  });
}
