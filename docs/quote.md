# Get a paid Base quote

A quote needs a buyer-controlled public Base address. It costs a separate 0.01 USDC API payment and returns an unsigned transaction or buyer-signable gasless payload. This repository does not sign or execute it.

```json
{"from":"USDC","to":"WETH","amount":"1","wallet":"YOUR_PUBLIC_BASE_ADDRESS","executionMode":"standard"}
```

Replace the address placeholder; never supply a private key. For an unpaid inspection:

```sh
SAFEROUTE_QUOTE_WALLET=YOUR_PUBLIC_BASE_ADDRESS npm run demo:quote
```

The command verifies the unpaid 402 network, canonical USDC, merchant and 10000 atomic USDC unit price, then stops. It does not buy a quote. Use the live OpenAPI before adding a payment client.

A paid integration needs separate operator permission and an existing restricted x402 client for the exact endpoint and 0.01 USDC price. Do not use the safety helper's 0.001 USDC allowance for quotes. Disable redirects and automatic retries after uncertain settlement. Enforce the cumulative budget outside the model. Read the returned expiration, taker, amounts, fee, spender, simulation and payload before considering any signing action. SafeRoute's current swap fee is 10 bps if a swap is executed; the API fee is separate. Simulation may be skipped or fail; do not interpret either as passed.

For MCP, the existing endpoint is `https://api.usesaferoute.com/mcp`; tools are `check_base_swap` and `get_safe_swap_quote`. Runtime payment and signing permissions remain the operator's responsibility. No paid response sample is fabricated here: the repository provides a live public schema excerpt under `docs/response-schemas.json`.
