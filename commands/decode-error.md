---
description: Decode a Solana program error code or log dump into its meaning, likely cause, and fix.
argument-hint: <error code | "log dump"> [--program <family>] [--idl <path>]
---

Decode the Solana error: `$ARGUMENTS`

1. Run `node dist/decode-error.js $ARGUMENTS` (build first if `dist/` is missing:
   `npm install && npm run build`).
2. If the result needs an IDL (custom 6000+ code) and the user has one, re-run
   with `--idl <path-to-idl.json>`.
3. Read `skill/decoding-errors.md` for context on the error family.
4. Explain the error, the likely cause, and the concrete fix.
