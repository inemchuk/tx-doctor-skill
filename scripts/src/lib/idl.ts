// Resolve a custom Anchor error code from a program's IDL JSON.
// Anchor IDLs include an `errors` array of { code, name, msg }.

export interface IdlErrorEntry {
  code: number;
  name: string;
  msg?: string;
}

export function resolveFromIdl(
  errors: IdlErrorEntry[] | undefined,
  code: number,
): IdlErrorEntry | undefined {
  if (!errors) return undefined;
  return errors.find((e) => e.code === code);
}
