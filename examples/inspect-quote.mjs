import { pathToFileURL } from 'node:url';
import { payTo, usdc } from '../skills/saferoute-base-swap/scripts/inspect.mjs';

export async function inspectQuote({ wallet, fetchImpl = fetch } = {}) {
  if (!/^0x[0-9a-f]{40}$/i.test(wallet ?? '') || /^0x0{40}$/i.test(wallet))
    throw new Error('Set SAFEROUTE_QUOTE_WALLET to a nonzero public Base address. Never provide a private key.');
  const response = await fetchImpl('https://api.usesaferoute.com/v1/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'USDC', to: 'WETH', amount: '1', wallet, executionMode: 'standard' }),
    redirect: 'error', signal: AbortSignal.timeout(20000),
  });
  if (response.status !== 402) throw new Error(`Expected unpaid 402, received ${response.status}`);
  const encoded = response.headers.get('payment-required');
  if (!encoded) throw new Error('Missing PAYMENT-REQUIRED header');
  const challenge = JSON.parse(Buffer.from(encoded, 'base64').toString());
  if (!Array.isArray(challenge.accepts) || !challenge.accepts.some(r =>
    r.scheme === 'exact' && r.network === 'eip155:8453' &&
    r.asset?.toLowerCase() === usdc && r.payTo?.toLowerCase() === payTo &&
    /^\d+$/.test(r.amount) && BigInt(r.amount) === 10000n))
    throw new Error('Unexpected merchant, network, token or quote price; stopped without payment.');
  return { stage: 'quote_challenge_verified', priceUsdc: 0.01, paid: false };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  inspectQuote({ wallet: process.env.SAFEROUTE_QUOTE_WALLET }).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
