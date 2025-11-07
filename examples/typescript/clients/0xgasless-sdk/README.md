# 0xgasless SDK Client Example using Axios

This example demonstrates how to use the `@0xgasless/x402` facilitator SDK for gasless payments on Avalanche networks (Fuji testnet and C-Chain mainnet).

## What is 0xgasless?

0xgasless provides a facilitator service that sponsors gas fees for x402 payments on Avalanche. This means:

- **No gas fees**: The 0xgasless facilitator covers transaction gas costs
- **Simple setup**: Just provide your private key and the facilitator URL
- **Avalanche networks**: Works on Fuji (testnet) and C-Chain (mainnet)
- **USDC payments**: Settles payments in USDC with sponsored gas

## Prerequisites

- Node.js v20+ (install via [nvm](https://github.com/nvm-sh/nvm))
- pnpm v10 (install via [pnpm.io/installation](https://pnpm.io/installation))
- A running x402 server configured for Avalanche (you can use the example express server at `examples/typescript/servers/express`)
- An Ethereum private key with USDC on Avalanche Fuji or C-Chain
- Access to a 0xgasless facilitator instance (either run locally or use a hosted service)

## Getting USDC on Avalanche Fuji

1. Get AVAX from the [Avalanche Fuji Faucet](https://faucet.avax.network/)
2. Swap AVAX for USDC on [Trader Joe](https://traderjoexyz.com/avalanche/trade) or another DEX
3. Alternatively, bridge USDC from another network using [Avalanche Bridge](https://bridge.avax.network/)

## Setup

1. Install and build all packages from the typescript examples root:

```bash
cd ../../
pnpm install
pnpm build
cd clients/0xgasless-sdk
```

2. Copy `.env-local` to `.env` and configure your environment variables:

```bash
cp .env-local .env
```

Edit `.env` with your values:

```bash
RESOURCE_SERVER_URL=http://localhost:4021  # Your x402 server URL
ENDPOINT_PATH=/weather                      # The paid endpoint you want to access
PRIVATE_KEY=0x...                          # Your Ethereum private key
GASLESS_FACILITATOR_URL=http://localhost:3402  # 0xgasless facilitator URL
```

## Running the 0xgasless Facilitator

Before running this example, you need a running 0xgasless facilitator. See the [gasless-x402 package](../../../../typescript/packages/gasless-x402) for setup instructions.

Quick start:

```bash
cd ../../../../typescript/packages/gasless-x402
# Configure config.json and set GASLESS_PRIVATE_KEY
bun run dev
```

## Running the Example

```bash
pnpm dev
```

## How It Works

The example demonstrates:

1. **Account Creation**: Creates a viem account from your private key
2. **Facilitator Configuration**: Sets up the 0xgasless facilitator for gasless settlements
3. **Payment Interceptor**: Creates an Axios instance with x402 payment handling
4. **Request Execution**: Makes a request to a paid endpoint with automatic payment
5. **Gas Sponsorship**: The 0xgasless facilitator covers all gas fees for settlements

## Example Code

```typescript
import { createFacilitatorConfig } from "@0xgasless/x402";
import axios from "axios";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";

// Create account from private key
const account = privateKeyToAccount(process.env.PRIVATE_KEY);

// Configure 0xgasless facilitator
const facilitator = createFacilitatorConfig(
  process.env.GASLESS_FACILITATOR_URL
);

// Create Axios instance with payment handling and gasless settlement
const api = withPaymentInterceptor(
  axios.create({
    baseURL: process.env.RESOURCE_SERVER_URL,
  }),
  account,
  facilitator,
);

// Make request - gas fees are sponsored by 0xgasless!
api
  .get(process.env.ENDPOINT_PATH)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error.response?.data);
  });
```

## Key Differences from CDP SDK Example

| Feature | CDP SDK Example | 0xgasless SDK Example |
|---------|----------------|----------------------|
| **Wallet Management** | CDP manages server wallets | You provide your own private key |
| **Gas Fees** | You pay gas fees | 0xgasless sponsors gas fees |
| **Networks** | Multiple networks supported | Avalanche Fuji & C-Chain |
| **Setup Complexity** | Requires CDP API keys | Simple private key setup |
| **Use Case** | Server-side wallet management | Gasless payment settlements |

## Security Notes

- **Never commit your `.env` file** - it contains your private key
- Keep your private key secure and never share it
- Use a dedicated wallet for testing with small amounts
- The private key is only used to sign payment authorizations, not to pay gas

## Troubleshooting

### "Missing required environment variables"

Make sure all variables in `.env` are set correctly.

### "Request failed: 402 Payment Required"

The server requires payment. Check that:
- Your account has sufficient USDC on the correct network (Avalanche Fuji or C-Chain)
- The 0xgasless facilitator is running and accessible
- Your server is configured to accept payments on Avalanche networks

### "Facilitator connection error"

Ensure the 0xgasless facilitator is running:
```bash
cd ../../../../typescript/packages/gasless-x402
bun run dev
```

## Learn More

- [x402 Protocol Specification](../../../../specs/x402-specification.md)
- [0xgasless Facilitator Package](../../../../typescript/packages/gasless-x402)
- [x402-axios Client Documentation](../../../../typescript/packages/x402-axios)

