#!/usr/bin/env node
// tx-estimate-fee — recommend a priority-fee CU price from recent on-chain
// prioritization fees, with p50/p75/p90 percentiles.
//
// Usage:
//   tx-estimate-fee [--accounts <addr1,addr2>] [--cu <limit>] [--rpc <url>]

import { address, createSolanaRpc } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { percentile, priorityFeeLamports, recommendMicroLamports } from './lib/fees.js';

const USAGE = `tx-estimate-fee — recommend a priority-fee CU price

Usage:
  tx-estimate-fee [--accounts <a,b>] [--cu <limit>] [--rpc <url>]

--accounts  comma-separated addresses your tx writes to (improves the estimate)
--cu        CU limit to price the priority fee against (default 200000)
--rpc       RPC endpoint (or RPC_URL env; default devnet)
--help      show this help`;

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
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

    const p50 = percentile(samples, 50);
    const p75 = percentile(samples, 75);
    const p90 = percentile(samples, 90);
    const recommended = recommendMicroLamports(samples, 75);

    console.log(`\n  Samples:        ${samples.length} recent slots`);
    console.log(`  p50 / p75 / p90: ${p50} / ${p75} / ${p90} micro-lamports per CU`);
    console.log(`  Recommended:    ${recommended} micro-lamports per CU (p75)`);
    console.log(`  Priority fee:   ${priorityFeeLamports(recommended, cuLimit)} lamports at CU limit ${cuLimit}`);
    console.log('\n  Tip: raise the CU *price* before the CU *limit*. Add compute-budget instructions first.\n');
  } catch (e) {
    console.error(`Fee request failed: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
