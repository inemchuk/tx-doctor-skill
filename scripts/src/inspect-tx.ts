#!/usr/bin/env node
// tx-inspect — fetch a confirmed transaction by signature and explain it:
// status, fee, compute units, instruction programs, and any decoded error.
//
// Usage:
//   tx-inspect <signature> [--rpc <url>]

import { createSolanaRpc, signature } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { decode } from './lib/decode.js';

const USAGE = `tx-inspect — decode a confirmed transaction by signature

Usage:
  tx-inspect <signature> [--rpc <url>]

--rpc    RPC endpoint (or RPC_URL env; default devnet)
--help   show this help`;

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (flags.help || positional.length === 0) {
    console.log(USAGE);
    process.exit(flags.help ? 0 : 1);
  }

  const rpc = createSolanaRpc(resolveRpcUrl(flags));

  try {
    const tx = await rpc
      .getTransaction(signature(positional[0]), {
        maxSupportedTransactionVersion: 0,
        encoding: 'json',
      })
      .send();

    if (!tx) {
      console.error('Transaction not found (wrong cluster, or not yet finalized).');
      process.exit(1);
    }

    const meta = tx.meta;
    const failed = meta?.err != null;

    console.log(`\n  Slot:     ${tx.slot}`);
    console.log(`  Status:   ${failed ? 'FAILED' : 'SUCCESS'}`);
    if (meta) {
      console.log(`  Fee:      ${Number(meta.fee)} lamports`);
      if (meta.computeUnitsConsumed != null) {
        console.log(`  CU used:  ${Number(meta.computeUnitsConsumed)}`);
      }
    }

    if (failed) {
      const joined = (meta?.logMessages ?? []).join('\n');
      const decoded = decode({ logs: joined });
      console.log(`  Error:    ${decoded.name} — ${decoded.summary}`);
      for (const f of decoded.fixes) console.log(`    fix: ${f}`);
    }

    if (meta?.logMessages && meta.logMessages.length) {
      console.log('\n  Logs:');
      for (const line of meta.logMessages) console.log(`    ${line}`);
    }
    console.log('');
  } catch (e) {
    console.error(`Inspect request failed: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
