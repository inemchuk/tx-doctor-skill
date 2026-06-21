import { describe, it, expect } from 'vitest';
import { parseArgs, resolveRpcUrl, clusterUrl } from '../src/lib/args.js';

describe('parseArgs', () => {
  it('collects positionals', () => {
    expect(parseArgs(['0x1771']).positional).toEqual(['0x1771']);
  });
  it('parses --flag value', () => {
    expect(parseArgs(['--program', 'spl-token']).flags.program).toBe('spl-token');
  });
  it('parses --flag=value', () => {
    expect(parseArgs(['--rpc=https://x']).flags.rpc).toBe('https://x');
  });
  it('treats lone --flag as boolean true', () => {
    expect(parseArgs(['--help']).flags.help).toBe(true);
  });
  it('mixes positional and flags', () => {
    const r = parseArgs(['6001', '--program', 'anchor']);
    expect(r.positional).toEqual(['6001']);
    expect(r.flags.program).toBe('anchor');
  });
});

describe('resolveRpcUrl', () => {
  it('prefers --rpc flag', () => {
    expect(resolveRpcUrl({ rpc: 'https://flag' })).toBe('https://flag');
  });
  it('defaults to devnet when nothing set', () => {
    const saved = process.env.RPC_URL;
    delete process.env.RPC_URL;
    expect(resolveRpcUrl({})).toBe('https://api.devnet.solana.com');
    if (saved) process.env.RPC_URL = saved;
  });
  it('resolves a cluster alias', () => {
    expect(resolveRpcUrl({ cluster: 'mainnet' })).toBe('https://api.mainnet-beta.solana.com');
  });
  it('throws on an unknown cluster alias', () => {
    expect(() => resolveRpcUrl({ cluster: 'nope' })).toThrow();
  });
});

describe('clusterUrl', () => {
  it('maps devnet', () => expect(clusterUrl('devnet')).toBe('https://api.devnet.solana.com'));
  it('maps localnet to localhost', () => expect(clusterUrl('localnet')).toBe('http://127.0.0.1:8899'));
  it('is case-insensitive', () => expect(clusterUrl('MAINNET')).toBe('https://api.mainnet-beta.solana.com'));
  it('returns undefined for unknown', () => expect(clusterUrl('foo')).toBeUndefined());
});
