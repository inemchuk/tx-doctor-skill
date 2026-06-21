# Landing, confirmation & retries

**Read this when** you see `Blockhash not found` / "block height exceeded", txs
silently drop, or you need offline/long-lived signing.

## Blockhash lifetime

Every (non-nonce) transaction carries a recent blockhash and is only valid until
its `lastValidBlockHeight` (~150 blocks, roughly 60–90s). After that it can never
land — you must rebuild with a fresh blockhash.

```ts
const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
// latestBlockhash.blockhash, latestBlockhash.lastValidBlockHeight
```

Fetch at `confirmed` (or `finalized`) — a `processed` blockhash may not be known
to the RPC you send through, causing `Blockhash not found`.

## Commitment levels

| Level | Meaning | Use for |
|---|---|---|
| `processed` | seen by a node, may be dropped | fastest UI hints only |
| `confirmed` | voted by supermajority | most sends/confirmations |
| `finalized` | rooted, irreversible | settlement, durable nonce auth |

## Confirm reliably

Use kit's `sendAndConfirmTransactionFactory` (WebSocket-based confirmation) for
the simple path:

```ts
import { sendAndConfirmTransactionFactory } from '@solana/kit';
const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
await sendAndConfirm(signedTx, { commitment: 'confirmed' });
```

## Manual retry loop (congestion)

RPC-side `maxRetries` is coarse. For control, send with `maxRetries: 0` +
`skipPreflight: true` (you've already simulated), then **rebroadcast the same
signed transaction** on an interval while polling status — until confirmed or the
blockhash expires.

```
sign once (fixed blockhash)
loop until confirmed OR currentBlockHeight > lastValidBlockHeight:
    send raw (skipPreflight, maxRetries: 0)
    poll getSignatureStatuses([sig])
    sleep ~2s
if expired and unconfirmed: rebuild with fresh blockhash, repeat
```

Re-sending the *same* signed tx is safe — it has the same signature, so it can
only land once.

## Durable nonces (offline / long-lived)

When you can't sign-and-send within ~90s (hardware wallet, multisig, offline
signing), use a **durable nonce** instead of a recent blockhash. The transaction
stays valid until the nonce advances.

```ts
import {
  setTransactionMessageLifetimeUsingDurableNonce,
  sendAndConfirmDurableNonceTransactionFactory,
} from '@solana/kit';

const msg = setTransactionMessageLifetimeUsingDurableNonce(
  { nonce, nonceAccountAddress, nonceAuthorityAddress },
  transactionMessage,
); // prepends the advance-nonce instruction automatically

const send = sendAndConfirmDurableNonceTransactionFactory({ rpc, rpcSubscriptions });
await send(signedTx, { commitment: 'confirmed' });
```

The advance-nonce instruction must be **first**, and the nonce value comes from
the on-chain nonce account.

## Pitfalls

- Confirming on a different commitment than you sent → premature "success".
- Building once but signing slowly → blockhash expires; use durable nonce.
- New blockhash on every retry → different signature each time; poll all of them
  or (better) re-send the same signed tx.

## Sources

- Solana: transaction confirmation & expiration (solana.com/developers/guides/advanced/confirmation)
- `@solana/kit` send/confirm + durable nonce (github.com/anza-xyz/kit)
