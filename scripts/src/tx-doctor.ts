#!/usr/bin/env node
// Single entry point that dispatches to the sub-commands.
//
//   tx-doctor decode  0x1771
//   tx-doctor simulate --tx <base64>
//   tx-doctor fee     --accounts <a,b> --cluster mainnet
//   tx-doctor inspect <signature> --cluster mainnet

const USAGE = `tx-doctor — diagnose Solana transactions and help them land

Usage:
  tx-doctor <command> [options]

Commands:
  decode    decode an error code or log dump        (alias: decode-error)
  simulate  simulate a tx: CU usage + decoded error
  fee       recommend a priority-fee CU price       (alias: estimate-fee)
  inspect   decode a confirmed tx by signature

Run "tx-doctor <command> --help" for command options.`;

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case 'decode':
    case 'decode-error': {
      const { run } = await import('./decode-error.js');
      return run(rest);
    }
    case 'simulate': {
      const { run } = await import('./simulate.js');
      return run(rest);
    }
    case 'fee':
    case 'estimate-fee': {
      const { run } = await import('./estimate-fee.js');
      return run(rest);
    }
    case 'inspect':
    case 'inspect-tx': {
      const { run } = await import('./inspect-tx.js');
      return run(rest);
    }
    case undefined:
    case '-h':
    case '--help':
      console.log(USAGE);
      return;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.error(USAGE);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});
