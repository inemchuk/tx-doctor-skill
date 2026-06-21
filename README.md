# Tx Doctor

**The transaction-lifecycle skill for Solana — figure out why a transaction failed, and get it to land.**

Most Solana skills help you write programs or call protocols. None of them help
with the part that eats your afternoon: a transaction throwing
`custom program error: 0x1771`, or one that just never lands when the network is
busy. Tx Doctor is what you reach for then. Give it a symptom — an error code, a
log dump, a signature — and it tells you which program failed, what the error
means, and what to change.

> **Works alongside the core `solana-dev` skill.** Tx Doctor owns the transaction
> lifecycle (errors, compute units, fees, delivery, retries) and leans on
> `solana-dev` for general program/frontend work, referencing Helius/Jito for
> provider specifics instead of duplicating them.

---

## How it works

```
   symptom  (error code · log dump · signature · "won't land")
                              │
                              ▼
                      skill/SKILL.md
                  routes the symptom to ─┐
                              │          │
            ┌─────────────────┤          └────────────┐
            ▼                 ▼                        ▼
     knowledge module    tx-doctor CLI          agent / commands
  (decode · CU · fees ·  (decode · simulate ·   (@tx-doctor,
   Jito · retries · …)    fee · inspect)         /diagnose-tx …)
            └─────────────────┬──────────────────────┘
                              ▼
                  diagnosis + a concrete fix
```

The hub loads only the one module a symptom needs (progressive disclosure), and
the CLI backs it with real, tested logic rather than guesses.

---

## Why it exists

If you've shipped on Solana you've lost time to all of these:

| You hit… | …and then |
|---|---|
| `simulation failed: custom program error: 0x1771` | convert hex, grep through enums, hope you find the right program |
| a tx that lands in calm but vanishes during a launch | wrong priority fee / compute budget / delivery path |
| `Blockhash not found`, `Transaction too large` | re-learn blockhash expiry and lookup tables |
| the 2026 churn | `web3.js` → `@solana/kit`, Jito tips ≠ priority fees, half the answers are for v1 |

The error codes, the compute-unit math, the fee logic — these are all knowable.
Tx Doctor encodes them so you don't re-derive them every time.

---

## The CLI

One command, four sub-commands:

| Command | What it does |
|---|---|
| `tx-doctor decode <code \| --logs \| --idl>` | what does this error mean? (offline; reads stdin too) |
| `tx-doctor simulate --tx <base64>` | CU used + recommended limit + decoded error |
| `tx-doctor fee [--accounts a,b]` | what priority fee should I pay? |
| `tx-doctor inspect <signature>` | break down a confirmed/failed transaction |

Network commands take `--cluster` (`mainnet`, `devnet`, `testnet`, `localnet`) or `--rpc <url>`.

The decode logic — error maps for the System, SPL Token, Associated Token and
Anchor programs, the log parser, the CU/fee math — is plain functions covered by
**70 tests**, so answers are deterministic. Custom Anchor errors (6000+) are
resolved from the program's IDL, never invented.

---

## Knowledge modules

Each loads on demand from `skill/`:

| Module | Covers |
|---|---|
| `decoding-errors` | error-code tables + non-code symptoms (`Blockhash not found`, rent, ALT…) |
| `simulation-preflight` | `simulateTransaction`, reading logs, preflight vs `skipPreflight` |
| `compute-units` | estimating CU, the 1.4M cap, "price before limit" |
| `priority-fees` | `getRecentPrioritizationFees`, percentiles, fee math |
| `delivery-routing` | Jito bundles & tips (≠ priority fees), staked sends, fan-out |
| `landing-retries` | blockhash/`lastValidBlockHeight`, retry loop, durable nonces |
| `versioned-tx-alt` | v0 transactions + Address Lookup Tables, the 1232-byte limit |
| `sdk-migration` | `web3.js` v1 → `@solana/kit` / `gill` cheat-sheet |
| `resources` | sourced links |

In Claude Code you also get the `@tx-doctor` agent and `/diagnose-tx`,
`/decode-error`, `/optimize-fees`, `/preflight` commands.

---

## Installation

```bash
git clone https://github.com/inemchuk/tx-doctor-skill
cd tx-doctor-skill
./install.sh            # copies into ~/.claude/skills/tx-doctor and builds the CLI
```

| Flag | Effect |
|---|---|
| `-y`, `--yes` | non-interactive |
| `--agents` | also write `AGENTS.md` for Codex / other agents |
| `--dir DIR` | install into `DIR` instead of `~/.claude/skills` |

The installer never overwrites your global `CLAUDE.md`. To use the CLI standalone:

```bash
npm install                              # also builds
node dist/tx-doctor.js decode 0x1771
# or, after `npm link`:
tx-doctor decode 0x1771
```

---

## Examples

```text
$ tx-doctor decode 1 --program spl-token
  Error:   InsufficientFunds
  Summary: Insufficient funds (spl-token error 1 / 0x1)
  Fixes:   - Check the token balance and amount (base units, not UI units)

$ solana logs | tx-doctor decode
  Error:   AccountOwnedByWrongProgram
  ...

$ tx-doctor decode 6001 --idl ./target/idl/my_program.json
  Error:   AmountTooLarge            # pulled from your program's IDL

$ tx-doctor inspect <sig> --cluster mainnet
  Status:  FAILED
  Instructions:
    0: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (spl-token)
  Error:   InsufficientFunds — ...
```

---

## Repository layout

```
tx-doctor-skill/
├── skill/            SKILL.md hub + 9 focused modules
├── scripts/
│   ├── src/          tx-doctor CLI + lib/ (error maps, parser, math)
│   └── test/         vitest suite (70 tests)
├── agents/           tx-doctor triage agent
├── commands/         /diagnose-tx /decode-error /optimize-fees /preflight
├── rules/            transaction-safety auto-rules
└── install.sh
```

---

## Using it inside the Solana AI Kit

Built to slot into [solana-ai-kit](https://github.com/solanabr/solana-ai-kit):
add it as a submodule under `ext/tx-doctor`, drop the symptom rows into the hub
`SKILL.md` routing table, and add a `skill-registry.json` entry.

---

## Development

```bash
npm test          # vitest
npm run typecheck
npm run build
```

---

## License

MIT — see [LICENSE](LICENSE).
