# SafeRoute agent tools

An installable skill and small integration examples for supported-token Base swap preflights and quotes, paid per request through x402. Node.js 22+; no dependencies for the inspection demos.

## Install the skill

```sh
npx skills add https://usesaferoute.com --skill saferoute-base-swap
```

Or clone this repository and read `skills/saferoute-base-swap/SKILL.md`. Inspect the source before installing or running tools.

## Run without spending

```sh
git clone https://github.com/crystalsignal/saferoute-agent-tools.git
cd saferoute-agent-tools
npm test
npm run demo
SAFEROUTE_QUOTE_WALLET=YOUR_PUBLIC_BASE_ADDRESS npm run demo:quote
```

Both demos make an unpaid request, verify the payment challenge, and stop. They do not load wallet secrets, sign, pay, approve tokens, or execute swaps. The quote example requires a public address; it does not establish wallet ownership. These requests still disclose their request inputs to the API.

## What the API does

| API | Price per call | Result and limits |
| --- | --- | --- |
| `POST /v1/swap-safety-check` | 0.001 USDC | Wallet-free approved-token eligibility, indicative liquidity/output, and next action. No executable transaction. |
| `POST /v1/quote` | 0.01 USDC | Wallet-bound quote with unsigned transaction or buyer-signable gasless payload. Signing/submission remain with the caller. |

Base mainnet (`eip155:8453`); canonical Base USDC. Supported symbols and schemas are authoritative in [live OpenAPI](https://api.usesaferoute.com/openapi.json). The current notional cap is $500 USDC equivalent. Executed swaps disclose a separate 10 bps SafeRoute swap fee; gas, liquidity/provider costs and other applicable charges are separate from the API price. Inspect the actual quote before any trade.

This is bounded preflight evidence, not arbitrary scam-token detection, a trade recommendation, a guarantee of safety, or proof of execution. Price impact is checked on the full quote; allowance checks require a wallet. Expired quotes must not be executed.

## Integrate

- [Safety preflight recipe](docs/safety-preflight.md)
- [Wallet-bound quote recipe](docs/quote.md)
- [Framework-neutral tool adapter](examples/tool-adapter.mjs): expose explicit inspection and safety-check tools in an existing runtime. No framework or wallet SDK is bundled.
- [Attribution and validation](docs/measurement.md)
- [Developer guide](https://usesaferoute.com/developers) · [MCP endpoint](https://api.usesaferoute.com/mcp) · [First-call guide](https://usesaferoute.com/start)

Payment-capable integration requires an existing operator-approved x402 client enforcing the exact merchant, network, token, price and cumulative budget. The package does not implement a wallet or enforce a shared budget across processes. Never give a model unrestricted signing or spending authority. Unknown settlement must be reconciled before retrying.

## Contribute

Open an issue with a reproducible unpaid example or a pull request with focused changes. Do not post private keys, seed phrases, customer contacts, private request logs or wallet ownership claims. Public labels are self-reported. No official affiliation with Coinbase, AgentKit, Bankr, Merit or any other framework is implied.

The hosted SafeRoute service has its own terms and pricing. This repository contains no production service source or operational journals.
