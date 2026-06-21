# Tx Doctor — Solana transaction lifecycle skill

> Diagnose Solana transaction failures and land transactions reliably — a
> symptom-first AI skill for the Solana AI Kit.

Tx Doctor takes a builder from a **symptom** (an error string, a stuck
transaction, a signature) to a **diagnosis and a concrete fix**. It owns the
part of the stack most skills skip: simulation → compute units → priority fees →
delivery (Jito) → confirmation/retries → error decoding.

## The problem it solves

Every Solana builder loses hours to the transaction lifecycle:

- Cryptic failures: `custom program error: 0x1771`, `Blockhash not found`,
  `Transaction too large`, `exceeded CUs meter`.
- Transactions that silently **don't land** in congestion (bad compute-unit /
  priority-fee / delivery strategy).
- Confusion over the 2026 stack: `web3.js v1` → `@solana/kit` / `gill`, Jito
  tips vs priority fees, versioned tx + Address Lookup Tables, durable nonces.

The Solana AI Kit bundles many skills, but none owns the transaction lifecycle
as a coherent, symptom-first domain. Tx Doctor fills that gap.

## What's inside

```
skill/        SKILL.md hub (symptom→module routing) + 9 focused modules
scripts/      4 TypeScript CLIs over @solana/kit, with vitest-tested pure core
agents/       tx-doctor triage agent
commands/     /diagnose-tx /decode-error /optimize-fees /preflight
rules/        transaction-safety auto-rules
install.sh    installer (installs alongside solana-dev)
```

### Knowledge modules (progressive disclosure)

`decoding-errors` · `simulation-preflight` · `compute-units` · `priority-fees` ·
`delivery-routing` (Jito) · `landing-retries` · `versioned-tx-alt` ·
`sdk-migration` · `resources`. The hub loads only the module a symptom needs.

### CLIs

| Command | What it does |
|---|---|
| `tx-decode-error <code\|--logs\|--idl>` | decode an error code or log dump (offline) |
| `tx-simulate --tx <base64>` | simulate → CU used, recommended limit, logs, decoded error |
| `tx-estimate-fee [--accounts a,b] [--cu N]` | priority-fee percentiles + recommendation |
| `tx-inspect <signature>` | decode a confirmed/failed transaction |

The deterministic core (error maps, log parsing, CU/fee math) has **58 vitest
tests** and is typechecked in CI.

## Install

One-liner (after cloning):

```bash
./install.sh           # interactive
./install.sh -y        # non-interactive
./install.sh --agents  # also emit AGENTS.md for Codex/other agents
```

This installs into `~/.claude/skills/tx-doctor` and optionally fetches the core
`solana-dev` skill. It does **not** overwrite your global `CLAUDE.md`.

Build the CLIs:

```bash
cd ~/.claude/skills/tx-doctor && npm install && npm run build
node dist/decode-error.js 0x1771
```

## Usage in Claude Code

- **Skill hub:** open `skill/SKILL.md` — the routing table maps symptoms to
  modules.
- **Agent:** `@tx-doctor` for full triage.
- **Commands:** `/diagnose-tx <sig|error>`, `/decode-error <code>`,
  `/optimize-fees`, `/preflight`.

## Examples

```bash
$ node dist/decode-error.js 1 --program spl-token
  Error:   InsufficientFunds
  Summary: Insufficient funds (spl-token error 1 / 0x1)
  Fixes:   - Check the token balance and amount (base units, not UI units)

$ node dist/decode-error.js 6001 --idl ./target/idl/my_program.json
  Error:   AmountTooLarge          # resolved from your program's IDL
```

## How it fits the kit

Designed to drop into [`solanabr/solana-ai-kit`](https://github.com/solanabr/solana-ai-kit):
add as a submodule under `ext/tx-doctor`, add the symptom rows to the hub
`SKILL.md` routing table, and a `skill-registry.json` entry. It complements
(does not duplicate) `solana-dev`, Helius, and the deployment skill.

## Development

```bash
npm install
npm test         # vitest
npm run typecheck
npm run build
```

## License

MIT — see [LICENSE](LICENSE).
