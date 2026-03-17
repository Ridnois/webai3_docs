---
title: Local Testing
description: How to run the full USDC payment flow locally using a forked Ethereum chain with Anvil.
section: Inference App
order: 3
---

## Overview

Test the full x402 USDC payment flow locally using a forked Ethereum Sepolia chain. This requires Foundry (Anvil) to run a local chain.

## Prerequisites

- Node.js and pnpm
- Foundry installed:

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup
```

## Setup

### 1. Copy the local dev environment

```bash
cp .env.example .env
```

Set in `.env`:

- `NEXT_PUBLIC_ENABLE_DEV_CHAIN=true` — adds the Foundry chain (chainId 31337) to the wallet connector
- `RECEIVER_ADDRESS` — set to Anvil Account #1 (the payment receiver)

### 2. Start Anvil

In a **separate terminal**:

```bash
pnpm chain:start
```

This forks Ethereum Sepolia into a local Anvil node at `http://127.0.0.1:8545` with chainId `31337`. The USDC contract from Sepolia is available on the fork.

Override the fork URL if needed:

```bash
BASE_SEPOLIA_FORK_URL=https://your-rpc-url pnpm chain:start
```

### 3. Fund test accounts with USDC

```bash
pnpm chain:fund
```

This mints **1,000,000 USDC** to each of the first 5 Anvil accounts by impersonating the USDC masterMinter on the fork.

Fund additional addresses:

```bash
pnpm chain:fund 0xYourAddress 0xAnotherAddress
```

### 4. Start the app

```bash
pnpm dev
```

## Wallet Setup (MetaMask)

### Add the local network

| Field | Value |
|---|---|
| Network name | Anvil Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Symbol | ETH |

### Import a test account

Use Anvil Account #0 (the payer):

```
Private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

Import the USDC token in MetaMask:

```
Token address: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
Decimals:      6
```

## Test Accounts

All accounts use the standard Anvil mnemonic: `test test test test test test test test test test test junk`

| # | Address | Role | Private Key |
|---|---|---|---|
| 0 | `0xf39Fd6...2266` | Payer | `0xac0974...ff80` |
| 1 | `0x70997...9C8` | Receiver | `0x59c699...90d` |
| 2 | `0x3C44Cd...BC` | Extra | `0x5de411...5a` |
| 3 | `0x90F79b...06` | Extra | `0x7c8521...7a6` |
| 4 | `0x15d34A...65` | Extra | `0x47e179...26a` |

Each account starts with **10,000 ETH** and **1,000,000 USDC** after running `pnpm chain:fund`.

## Testing the Payment Flow

1. Open `http://localhost:3000/inference/text-to-image`
2. Connect wallet (Account #0) and switch to **Anvil Local**
3. Select a model and fill in a prompt
4. Click **Run Inference** — cost estimate appears
5. Payment dialog opens showing estimated cost and your USDC balance
6. Click **Pay & Run** — approve the USDC transfer in MetaMask
7. Transaction confirms on the local chain, then inference runs
8. Result displays with actual cost

### Verify in the database

```bash
pnpm db:studio
```

Check the `inferences` table — rows should have `estimated_cost_usdc`, `actual_cost_usdc`, `payment_tx_hash`, and `payment_chain_id` populated.

## Edge Cases to Test

| Scenario | How to trigger | Expected |
|---|---|---|
| Insufficient balance | Transfer most USDC out of Account #0 | Pay button disabled, balance shown in red |
| User rejects wallet tx | Click Reject in MetaMask | Error in dialog, can retry |
| Same txHash reused | Copy a txHash and submit it in a second request | Server returns 402 |

## Troubleshooting

### Port 8545 already in use

```bash
kill $(lsof -ti:8545)
pnpm chain:start
```

### MetaMask nonce issues

If MetaMask shows "nonce too high" after restarting Anvil, reset the account: **Settings → Advanced → Clear activity tab data**.

### Anvil not found

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

### USDC balance shows 0 after funding

Make sure MetaMask is connected to the Anvil network (chainId 31337), not Ethereum Sepolia (11155111). They use the same USDC contract address but are different chains.
