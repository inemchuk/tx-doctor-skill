#!/usr/bin/env node
// Fetch a confirmed transaction by signature and explain it: status, fee,
// compute units, instruction programs, and any decoded error.
//
//   tx-doctor inspect <signature> [--cluster mainnet]

import { pathToFileURL } from 'node:url';
import { createSolanaRpc, signature } from '@solana/kit';
import { parseArgs, resolveRpcUrl } from './lib/args.js';
import { decode } from './lib/decode.js';
import { familyFromProgramId } from './lib/errorMaps.js';

const USAGE = `tx-doctor inspect — decode a confirmed transaction by signature

Usage:
  tx-doctor inspect <signature> [--cluster <name> | --rpc <url>]

--cluster   mainnet | devnet | testnet | localnet
--rpc       explicit RPC endpoint (or RPC_URL env)
--help      show this help`;

export async function run(argv: string[]): Promise<void> {
  const { positional, flags } = parseArgs(argv);
  if (flags.help || positional.length === 0) {
    console.log(USAGE);
    if (!flags.help) process.exitCode = 1;
    return;
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

    const message = tx.transaction.message;
    if ('instructions' in message && 'accountKeys' in message) {
      const keys = message.accountKeys;
      console.log('\n  Instructions:');
      message.instructions.forEach((ix, i) => {
        const pid = String(keys[ix.programIdIndex] ?? `#${ix.programIdIndex}`);
        const fam = familyFromProgramId(pid);
        console.log(`    ${i}: ${pid}${fam ? ` (${fam})` : ''}`);
      });
    }

    if (failed) {
      const decoded = decode({ logs: (meta?.logMessages ?? []).join('\n') });
      console.log(`\n  Error:    ${decoded.name} — ${decoded.summary}`);
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run(process.argv.slice(2)).catch((err) => {
    console.error((err as Error).message);
    process.exit(1);
  });
}
