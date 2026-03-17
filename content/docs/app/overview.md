---
title: Overview
description: How the webai3_web inference platform works — authentication, x402 payments, and AI model execution.
section: Inference App
order: 1
---

## What it Does

`webai3_web` is a pay-per-use AI inference platform built on Next.js 16. Users connect a wallet, authenticate via Sign-In With Ethereum (SIWE), and run AI models (text-to-image, text-to-text, text-to-sound). Each request is paid in USDC on Ethereum before inference runs using the **x402 payment protocol**.

Outputs (images, audio) are stored permanently on Cloudflare R2 and served via public CDN URLs. Text outputs are stored directly in PostgreSQL.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Web3 | Wagmi v2 + viem + SIWE (EIP-4361) |
| Payments | x402 protocol (EIP-3009 `transferWithAuthorization`) |
| AI Models | Replicate API |
| Storage | Cloudflare R2 (S3-compatible) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | iron-session (encrypted HTTP-only cookies) |

## Authentication

Users authenticate via Sign-In With Ethereum (SIWE / EIP-4361):

```
GET  /api/auth/nonce   → server generates a one-time nonce
POST /api/auth/verify  → verifies SIWE signature, upserts user in PostgreSQL, writes session
GET  /api/auth/session → client reads current session
POST /api/auth/logout  → destroys the session cookie
```

Sessions store only `{ address: string, chainId: number }` — no private keys, no tokens. Sessions are encrypted HTTP-only cookies managed by `iron-session`.

## Inference and Payment Pipeline

### The x402 Flow

x402 is an extension of HTTP 402. The server challenges the client with the exact USDC amount required before serving compute:

```
1. Client → POST /api/inference/estimate
           ← { estimatedCostUsdc, estimatedSeconds }

2. Client → POST /api/inference                  (no Payment-Signature header)
           ← 402 Payment Required
              Header: Payment-Required: <PaymentRequiredResponse>

3. Client signs an EIP-712 TransferWithAuthorization message off-chain

4. Client → POST /api/inference                  (with Payment-Signature header)
   Server:
     a. Decode + validate the Payment-Signature header
     b. Call x402 facilitator /verify  → confirm signature is valid
     c. Call x402 facilitator /settle  → execute on-chain USDC transfer
     d. Replicate.run(model, input)    ← inference runs AFTER settlement
     e. Upload media to R2 (if image/audio)
     f. INSERT into inferences table
     ← 200 { id, output, status, metrics }
```

**Settlement is irrevocable and happens before inference.** If inference fails after settlement, the failure is recorded alongside the payment tx hash for investigation — USDC is not refunded automatically.

### Pricing

Default rate: `$0.001 USDC / second` of compute (configurable via `INFERENCE_RATE_PER_SEC` env var).

| Task | Default duration |
|---|---|
| `text-to-image` | 10 seconds |
| `text-to-text` | 3 seconds |
| `text-to-sound` | 15 seconds |

The server queries historical average `predict_time_ms` per model from the `inferences` table to give more accurate cost estimates over time.

AIC stakers receive a discount on the per-second rate — see [AIC Integration](/docs/app/aic-integration).

## x402 Protocol Details

- **PaymentRequiredResponse** — sent on unpaid requests. Specifies the USDC asset address, amount (6-decimal bigint as string), recipient address, network (CAIP-2 format), and EIP-712 domain hints.
- **PaymentPayload** — constructed by the client after signing. Contains the `TransferWithAuthorization` authorization struct and the EIP-712 signature.
- **Facilitator** (`X402_FACILITATOR_URL`, default `https://facilitator.x402.fi`):
  - `/verify` — validates the signature and checks the authorization hasn't been spent
  - `/settle` — submits the on-chain `transferWithAuthorization` and returns the tx hash

On local Anvil dev chains, facilitator calls are skipped and a random UUID is used as a mock tx hash.

## Database Schema

### `users` table

| Column | Type | Description |
|---|---|---|
| `address` | text PK | Wallet address (lowercase) |
| `created_at` | timestamptz | First auth |
| `last_seen_at` | timestamptz | Last auth |

### `inferences` table

| Column | Type | Description |
|---|---|---|
| `id` | uuid PK | Unique inference ID |
| `user_address` | text FK | Buyer's wallet |
| `task_type` | enum | `text-to-image`, `text-to-text`, `text-to-sound` |
| `model` | text | Replicate model ID |
| `input` | jsonb | Model inputs |
| `output_type` | enum | `text`, `image`, `audio` |
| `output_data` | jsonb | Output content or R2 URLs |
| `status` | enum | `pending`, `succeeded`, `failed` |
| `predict_time_ms` | integer | Actual Replicate execution time |
| `estimated_cost_usdc` | numeric(18,6) | Pre-payment estimate |
| `actual_cost_usdc` | numeric(18,6) | Post-inference actual cost |
| `payment_tx_hash` | text UNIQUE | On-chain USDC transfer hash |
| `payment_chain_id` | integer | Chain where payment settled |

## Supported Networks

| Network | Chain ID | USDC |
|---|---|---|
| Ethereum Mainnet | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Ethereum Sepolia | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Anvil (local) | 31337 | Fork of Sepolia |

## Environment Variables

### Client (`NEXT_PUBLIC_*`)

```
NEXT_PUBLIC_ETHEREUM_RPC_URL
NEXT_PUBLIC_SEPOLIA_RPC_URL
NEXT_PUBLIC_BASE_RPC_URL
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL
NEXT_PUBLIC_ENABLE_DEV_CHAIN
```

### Server

```
REPLICATE_API_TOKEN
DATABASE_URL
SESSION_SECRET          # min 32 chars, random
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
RECEIVER_ADDRESS        # Ethereum address receiving USDC payments
INFERENCE_RATE_PER_SEC  # default 0.001
X402_FACILITATOR_URL    # default https://facilitator.x402.fi
ADMIN_ADDRESSES         # comma-separated admin wallets
```

## Common Commands

```bash
pnpm dev              # start dev server (localhost:3000)
pnpm build            # production build
pnpm test             # run all tests
pnpm db:generate      # generate DB migration
pnpm db:migrate       # apply pending migrations
pnpm db:studio        # open Drizzle Studio (DB browser)
pnpm chain:start      # start local Anvil dev chain
pnpm chain:fund       # fund test wallets with USDC
```
