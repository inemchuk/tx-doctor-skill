# Tx Doctor

A skill for figuring out why a Solana transaction failed — and getting it to land.

Most Solana skills help you write programs or call protocols. None of them help
with the part that actually eats your afternoon: a transaction that throws
`custom program error: 0x1771`, or one that just never lands when the network is
busy. Tx Doctor is the thing you reach for when that happens.

You give it a symptom — an error code, a log dump, a signature — and it tells you
which program failed, what the error means, and what to change. It also covers
the boring-but-critical stuff around landing: compute units, priority fees, Jito,
blockhash expiry, retries, lookup tables, durable nonces.

## Why it exists

If you've shipped on Solana you've seen these and lost time to all of them:

- `Transaction simulation failed: ... custom program error: 0x1771` — and now you
  go convert hex to decimal and grep through enums.
- A transaction that succeeds in calm conditions and silently disappears during a
  launch, because the priority fee / compute budget / delivery path was wrong.
- The 2026 churn: `@solana/web3.js` became `@solana/kit`, Jito tips aren't the
  same thing as priority fees, and half the StackOverflow answers are for v1.

The error codes, the compute-unit math, the fee logic — these are all knowable.
Tx Doctor just encodes them so you don't re-learn them every time.

## What you get

A small CLI and a set of focused docs.

The CLI is one command, `tx-doctor`, with four sub-commands:

```
tx-doctor decode   <code | --logs | --idl>   # what does this error mean?
tx-doctor simulate --tx <base64>             # CU used + recommended limit + decoded error
tx-doctor fee      [--accounts a,b]          # what priority fee should I pay?
tx-doctor inspect  <signature>               # break down a confirmed/failed tx
```

The decode logic — error maps for the System, SPL Token, Associated Token and
Anchor programs, the log parser, the CU and fee math — is plain functions with a
test suite (70 tests), so the answers are deterministic, not guessed. Custom
Anchor errors (6000+) are resolved from the program's IDL rather than made up.

The docs live in `skill/` and load on demand (the hub routes a symptom to the one
file you need): error decoding, simulation, compute units, priority fees, Jito
delivery, blockhash/retries, versioned transactions + lookup tables, and a
web3.js-v1 → kit migration cheat-sheet.

## Install

```bash
git clone https://github.com/inemchuk/tx-doctor-skill
cd tx-doctor-skill
./install.sh          # copies into ~/.claude/skills/tx-doctor, builds the CLI
```

`-y` skips the prompt; `--agents` also writes an `AGENTS.md` for Codex and other
agents. The installer doesn't touch your global `CLAUDE.md`.

To use the CLI on its own:

```bash
npm install     # also builds it
node dist/tx-doctor.js decode 0x1771
# or, after `npm link`:
tx-doctor decode 0x1771
```

## A few examples

```
$ tx-doctor decode 1 --program spl-token
  Error:   InsufficientFunds
  Summary: Insufficient funds (spl-token error 1 / 0x1)
  Fixes:   - Check the token balance and amount (base units, not UI units)

$ solana logs | tx-doctor decode          # pipe logs straight in
  Error:   AccountOwnedByWrongProgram
  ...

$ tx-doctor decode 6001 --idl ./target/idl/my_program.json
  Error:   AmountTooLarge               # pulled from your program's IDL

$ tx-doctor inspect <sig> --cluster mainnet
  Status:  FAILED
  Instructions:
    0: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (spl-token)
  Error:   InsufficientFunds — ...
```

In Claude Code you also get the `@tx-doctor` agent and the `/diagnose-tx`,
`/decode-error`, `/optimize-fees` and `/preflight` commands.

## Using it inside the Solana AI Kit

It's built to slot into [solana-ai-kit](https://github.com/solanabr/solana-ai-kit):
add it as a submodule under `ext/tx-doctor`, drop the symptom rows into the hub
`SKILL.md` routing table, and add a `skill-registry.json` entry. It leans on
`solana-dev` for general program work and references Helius/Jito for provider
details instead of duplicating them.

## Working on it

```bash
npm test          # vitest
npm run typecheck
npm run build
```

MIT licensed.
