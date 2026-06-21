#!/usr/bin/env node
// Decode a Solana error code or log dump into a diagnosis.
//
//   tx-doctor decode 0x1771
//   tx-doctor decode 1 --program spl-token
//   tx-doctor decode --logs "Program ... custom program error: 0x1"
//   solana logs | tx-doctor decode
//   tx-doctor decode 6001 --idl ./target/idl/my_program.json

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from './lib/args.js';
import { toDecimal } from './lib/hex.js';
import { decode } from './lib/decode.js';
import { resolveFromIdl } from './lib/idl.js';

const USAGE = `tx-doctor decode — decode a Solana program error

Usage:
  tx-doctor decode <code> [--program <family>]
  tx-doctor decode --logs "<log dump>"
  <something that prints logs> | tx-doctor decode
  tx-doctor decode <code> --idl <path-or-url>

<code>       decimal (6001) or hex (0x1771)
--program    system | spl-token | token-2022 | associated-token | anchor
--logs       a transaction log dump to parse
--idl        Anchor IDL JSON (file path or http(s) URL) for a custom (6000+) code
--help       show this help`;

type IdlShape = { errors?: { code: number; name: string; msg?: string }[] };

async function loadIdl(src: string): Promise<IdlShape> {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
    return (await res.json()) as IdlShape;
  }
  return JSON.parse(readFileSync(src, 'utf8')) as IdlShape;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

export async function run(argv: string[]): Promise<void> {
  const { positional, flags } = parseArgs(argv);

  if (flags.help) {
    console.log(USAGE);
    return;
  }

  let logs = typeof flags.logs === 'string' ? flags.logs : undefined;
  if (!positional[0] && !logs) {
    const piped = await readStdin();
    if (piped.trim()) logs = piped;
  }
  if (!positional[0] && !logs) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  let code: number | undefined;
  if (positional[0]) {
    try {
      code = toDecimal(positional[0]);
    } catch {
      console.error(`Invalid error code: ${positional[0]}`);
      process.exitCode = 1;
      return;
    }
  }

  const program = typeof flags.program === 'string' ? flags.program : undefined;
  let result = decode({ code, program, logs });

  if (result.needsIdl && typeof flags.idl === 'string' && result.code !== undefined) {
    try {
      const idl = await loadIdl(flags.idl);
      const hit = resolveFromIdl(idl.errors, result.code);
      if (hit) {
        result = {
          ...result,
          name: hit.name,
          summary: hit.msg ?? `Custom error ${hit.code} (${hit.name})`,
          needsIdl: false,
          fixes: [`Resolved from IDL ${flags.idl}; review the logic raising ${hit.name}`],
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run(process.argv.slice(2)).catch((err) => {
    console.error((err as Error).message);
    process.exit(1);
  });
}
