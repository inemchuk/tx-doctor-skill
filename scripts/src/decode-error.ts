#!/usr/bin/env node
// tx-decode-error — turn a Solana error code or log dump into a diagnosis.
//
// Usage:
//   tx-decode-error 0x1771
//   tx-decode-error 1 --program spl-token
//   tx-decode-error --logs "Program ... failed: custom program error: 0x1"
//   tx-decode-error 6001 --idl ./target/idl/my_program.json

import { readFileSync } from 'node:fs';
import { parseArgs } from './lib/args.js';
import { toDecimal } from './lib/hex.js';
import { decode } from './lib/decode.js';
import { resolveFromIdl } from './lib/idl.js';

const USAGE = `tx-decode-error — decode a Solana program error

Usage:
  tx-decode-error <code> [--program <family>]
  tx-decode-error --logs "<log dump>"
  tx-decode-error <code> --idl <path-to-idl.json>

<code>            decimal (6001) or hex (0x1771)
--program        system | spl-token | token-2022 | associated-token | anchor
--logs           a transaction log dump to parse
--idl            local Anchor IDL JSON to resolve a custom (6000+) code
--help           show this help`;

function main(): void {
  const { positional, flags } = parseArgs(process.argv.slice(2));

  if (flags.help) {
    console.log(USAGE);
    return;
  }
  if (positional.length === 0 && typeof flags.logs !== 'string') {
    console.error(USAGE);
    process.exit(1);
  }

  let code: number | undefined;
  if (positional[0]) {
    try {
      code = toDecimal(positional[0]);
    } catch {
      console.error(`Invalid error code: ${positional[0]}`);
      process.exit(1);
    }
  }

  const logs = typeof flags.logs === 'string' ? flags.logs : undefined;
  const program = typeof flags.program === 'string' ? flags.program : undefined;

  let result = decode({ code, program, logs });

  if (result.needsIdl && typeof flags.idl === 'string' && result.code !== undefined) {
    try {
      const idl = JSON.parse(readFileSync(flags.idl, 'utf8')) as { errors?: { code: number; name: string; msg?: string }[] };
      const hit = resolveFromIdl(idl.errors, result.code);
      if (hit) {
        result = {
          ...result,
          name: hit.name,
          summary: hit.msg ?? `Custom error ${hit.code} (${hit.name})`,
          needsIdl: false,
          fixes: [`Resolved from IDL ${flags.idl}; review the program logic raising ${hit.name}`],
        };
      } else {
        console.error(`Code ${result.code} not found in ${flags.idl}`);
      }
    } catch (err) {
      console.error(`Could not read IDL: ${(err as Error).message}`);
    }
  }

  printResult(result);
}

function printResult(r: ReturnType<typeof decode>): void {
  const codeStr = r.code !== undefined ? `${r.code} (0x${r.code.toString(16)})` : 'n/a';
  console.log(`\n  Error:   ${r.name}`);
  console.log(`  Code:    ${codeStr}`);
  if (r.family) console.log(`  Program: ${r.family}`);
  console.log(`  Summary: ${r.summary}`);
  if (r.causes.length) {
    console.log('\n  Likely causes:');
    for (const c of r.causes) console.log(`    - ${c}`);
  }
  if (r.fixes.length) {
    console.log('\n  Fixes:');
    for (const f of r.fixes) console.log(`    - ${f}`);
  }
  console.log('');
}

main();
