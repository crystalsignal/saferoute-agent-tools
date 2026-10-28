# Check a Base swap before execution

Use this for an indicative supported-token eligibility check before supplying a wallet. Inspect the live schema first. Example input:

```json
{"from":"USDC","to":"WETH","amount":"1"}
```

Run `npm run demo` for one unpaid POST and validation of the 402 challenge. Expected local output (illustrative, not a paid API result):

```json
{"stage":"challenge_verified","priceUsdc":0.001,"paid":false,"next":"Use your existing x402 client only after authorizing one 0.001 USDC service payment."}
```

For an operator-approved paid call, import `runFirstCall` from `skills/saferoute-base-swap/scripts/inspect.mjs` and supply your existing restricted `paidFetch`. This may spend real USDC. The CLI has no paid mode. The adapter in `examples/tool-adapter.mjs` requires a separate `authorizeSafetyPayment` callback immediately before handing over to that client.

The client must restrict payment to exact scheme, Base `eip155:8453`, canonical USDC `0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913`, merchant `0x08a6a2ddecdebdbfcb29d725042a6f3d74849e08`, and exactly 1000 atomic USDC units (0.001 USDC) per request. An external shared budget must cover all applications and retries. Inspection of a prior challenge is not enough: the payment client must enforce these restrictions on the challenge it actually signs.

On a successful paid response, inspect `status`, `expiresAt`, `liquidity`, `warnings`, `priceImpact`, `allowance`, and `nextAction`. Consult the full live schema rather than accepting only HTTP 200. A preflight does not authorize a quote or swap. Record the request ID and settlement separately from a useful result. The helper's settlement header is service-reported evidence; independently reconcile receipts when payment certainty is required.

Do not automatically retry after timeout, malformed settlement or uncertain outcome. Save the attempt locally and reconcile it. A denied/invalid request is not permission to increase budget or change token scope.
