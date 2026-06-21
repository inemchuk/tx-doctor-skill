# Migrating from web3.js v1 to @solana/kit

**Read this when** you're on the old `@solana/web3.js` (v1) and hitting its
patterns, or starting fresh and choosing a client library.

## What changed

`@solana/web3.js` **v2** was renamed to **`@solana/kit`** (by Anza) to avoid a
confusing upgrade path. Kit is the modern, **tree-shakeable**, functional SDK
(smaller bundles, ~200ms faster confirmations in Anza's tests). The legacy v1
`@solana/web3.js` is in maintenance mode — prefer kit for new code.

**`gill`** is a higher-level library built on kit with transaction builders for
common tasks (create/mint/transfer tokens). Use gill when you want batteries
included; drop to kit for low-level control. They interoperate.

## Mental-model shifts

| Concept | v1 (`@solana/web3.js`) | kit (`@solana/kit`) |
|---|---|---|
| Connection | `new Connection(url)` | `createSolanaRpc(url)` (+ `createSolanaRpcSubscriptions` for WS) |
| Call an RPC | `await connection.getX()` | `await rpc.getX().send()` |
| Keypair | `Keypair` object | signer abstractions (`KeyPairSigner`, `TransactionSigner`) |
| Transaction | mutable `Transaction` / `VersionedTransaction` | immutable message + `pipe(...)` transforms |
| Add instruction | `tx.add(ix)` | `appendTransactionMessageInstruction(ix, msg)` |
| Set fee payer | `tx.feePayer = …` | `setTransactionMessageFeePayer(addr, msg)` |
| Lifetime | `tx.recentBlockhash = …` | `setTransactionMessageLifetimeUsingBlockhash(bh, msg)` |
| Sign | `tx.sign(kp)` | `await signTransactionMessageWithSigners(msg)` |
| Send + confirm | `sendAndConfirmTransaction(...)` | `sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(tx, …)` |
| Address type | `PublicKey` | `Address` (branded string) via `address(...)` |
| Amounts | `number` | `bigint` for lamports/amounts |

## Why this matters for tx-doctor

Every other module here uses kit idioms (`createSolanaRpc`, `.send()`, message
pipes, factories). If you're porting v1 code, translate with the table above
first, then apply the CU / fee / retry patterns.

## Sources

- Triton: intro to the new Solana Kit (blog.triton.one)
- Helius: building with web3.js 2.0 / kit (helius.dev/blog)
- gill (gillsdk.com, github.com/gillsdk/gill)
