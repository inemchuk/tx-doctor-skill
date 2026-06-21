#!/usr/bin/env node
// tx-simulate — simulate a base64-encoded transaction and report the real
// compute-unit usage, a recommended CU limit, logs, and any decoded error.
//
// Usage:
//   tx-simulate --tx <base64WireTransaction> [--rpc <url>]

import { createSolanaRpc } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { withBuffer } from './lib/cu.js';
import { decode } from './lib/decode.js';

const USAGE = `tx-simulate — simulate a transaction and report CU + errors

Usage:
  tx-simulate --tx <base64> [--rpc <url>]

--tx     base64-encoded wire transaction
--rpc    RPC endpoint (or RPC_URL env; default devnet)
--help   show this help`;

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
  if (flags.help || typeof flags.tx !== 'string') {
    console.log(USAGE);
    process.exit(flags.help ? 0 : 1);
  }

  const rpc = createSolanaRpc(resolveRpcUrl(flags));
  type TxArg = Parameters<typeof rpc.simulateTransaction>[0];

  try {
    const sim = await rpc
      .simulateTransaction(flags.tx as TxArg, {
        encoding: 'base64',
        replaceRecentBlockhash: true,
        sigVerify: false,
      })
      .send();

    const { err, logs, unitsConsumed } = sim.value;
    const consumed = unitsConsumed !== undefined && unitsConsumed !== null ? Number(unitsConsumed) : undefined;

    console.log(`\n  Status:   ${err ? 'FAILED' : 'OK'}`);
    if (consumed !== undefined) {
      console.log(`  CU used:  ${consumed}`);
      console.log(`  Set CU limit to: ${withBuffer(consumed)} (estimate + 10% buffer)`);
    }

    if (err) {
      const joined = (logs ?? []).join('\n');
      const decoded = decode({ logs: joined });
      console.log(`  Error:    ${decoded.name} — ${decoded.summary}`);
    }

    if (logs && logs.length) {
      console.log('\n  Logs:');
      for (const line of logs) console.log(`    ${line}`);
    }
    console.log('');
  } catch (e) {
    console.error(`Simulation request failed: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
