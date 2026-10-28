import { runFirstCall } from '../skills/saferoute-base-swap/scripts/inspect.mjs';

// Framework-neutral definitions: map the JSON schema and execute function into
// your runtime. This does not register anything in AgentKit or a wallet provider.
export function createSafeRouteTools({ fetchImpl = fetch, paidFetch, authorizeSafetyPayment } = {}) {
  // Serialize this adapter instance. The external client must enforce the shared
  // cross-process budget and validate the challenge it actually signs.
  let busy = false;
  const inputSchema = { type: 'object', properties: {
    source: { type: 'string', pattern: '^[a-zA-Z0-9_.:-]{1,80}$' },
    applicationId: { type: 'string', pattern: '^[a-zA-Z0-9_.:-]{1,80}$' },
  }, additionalProperties: false };
  function validate(args) {
    if (!args || typeof args !== 'object' || Array.isArray(args) || Object.keys(args).some(k => !['source', 'applicationId'].includes(k))) throw new Error('Only optional source and applicationId labels are supported.');
    for (const value of Object.values(args)) if (typeof value !== 'string' || !/^[a-zA-Z0-9_.:-]{1,80}$/.test(value)) throw new Error('Invalid attribution label');
  }
  return [{
    name: 'inspect_saferoute_base_safety',
    description: 'Inspect the unpaid 0.001 USDC Base safety-check challenge for 1 USDC into WETH. No payment or swap execution.',
    inputSchema,
    async execute(args = {}) { validate(args); return runFirstCall({ fetchImpl, ...args }); },
  }, {
    name: 'buy_saferoute_base_safety',
    description: 'Request one 0.001 USDC Base swap preflight for 1 USDC into WETH, only after external operator budget authorization. Never executes a swap.',
    inputSchema,
    async execute(args = {}) {
      validate(args);
      if (busy) throw new Error('A safety call is already in progress; reconcile it before another attempt.');
      if (typeof paidFetch !== 'function' || typeof authorizeSafetyPayment !== 'function') throw new Error('A restricted payment client and external authorization callback are required.');
      busy = true;
      try {
        // runFirstCall inspects the public challenge before invoking this wrapper.
        return await runFirstCall({ fetchImpl, ...args, paidFetch: async (url, options) => {
          const approved = await authorizeSafetyPayment({ url, network: 'eip155:8453', asset: 'USDC', atomicAmount: '1000' });
          if (approved !== true) throw new Error('Operator payment permission denied.');
          return paidFetch(url, options);
        }});
      } finally { busy = false; }
    },
  }];
}
