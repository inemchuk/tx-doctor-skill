---
description: Diagnose a Solana transaction failure end-to-end from a signature, error string, or log dump, and return a concrete fix.
argument-hint: <signature | error code | "log dump">
---

Diagnose the Solana transaction problem described by: `$ARGUMENTS`

Steps:
1. Read `skill/SKILL.md` and route to the relevant module(s).
2. If the argument looks like a **signature** (base58, ~88 chars), run
   `node dist/tx-doctor.js inspect $ARGUMENTS` (build first if needed:
   `npm install && npm run build`).
3. If it's an **error code** (e.g. `0x1771`) or a **log dump**, run
   `node dist/tx-doctor.js decode` with the code or `--logs "..."`.
4. Identify the failing program, the error, and the root cause.
5. For a custom (6000+) code, resolve via the program's IDL (`--idl`) or explain
   it's program-specific.
6. Return: **diagnosis** + **the exact fix** (diff if editing code), grounded in
   the relevant `skill/` module.
