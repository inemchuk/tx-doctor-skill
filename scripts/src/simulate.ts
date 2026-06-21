#!/usr/bin/env node
// Simulate a base64-encoded transaction: real compute units, recommended CU
// limit, logs, and any decoded error.
//
//   tx-doctor simulate --tx <base64> [--cluster mainnet]

import { pathToFileURL } from 'node:url';
import { createSolanaRpc } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { withBuffer } from './lib/cu.js';
import { decode } from './lib/decode.js';

const USAGE = `tx-doctor simulate — simulate a transaction and report CU + errors

Usage:
  tx-doctor simulate --tx <base64> [--cluster <name> | --rpc <url>]

--tx        base64-encoded wire transaction
--cluster   mainnet | devnet | testnet | localnet
--rpc       explicit RPC endpoint (overrides --cluster; or RPC_URL env)
--help      show this help`;

export async function run(argv: string[]): Promise<void> {
  const { flags } = parseArgs(argv);
  if (flags.help || typeof flags.tx !== 'string') {
    console.log(USAGE);
    if (!flags.help) process.exitCode = 1;
    return;
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
    const consumed = unitsConsumed != null ? Number(unitsConsumed) : undefined;

    console.log(`\n  Status:   ${err ? 'FAILED' : 'OK'}`);
    if (consumed !== undefined) {
      console.log(`  CU used:  ${consumed}`);
      console.log(`  Set CU limit to: ${withBuffer(consumed)} (estimate + 10% buffer)`);
    }
    if (err) {
      const decoded = decode({ logs: (logs ?? []).join('\n') });
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run(process.argv.slice(2)).catch((err) => {
    console.error((err as Error).message);
    process.exit(1);
  });
}
