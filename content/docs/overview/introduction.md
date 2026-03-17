---
title: Introduction
description: What WebAI3 is, what it does, and why it exists.
section: Overview
order: 1
---

## What is WebAI3?

WebAI3 is an AI inference platform where users pay per request using USDC on Ethereum. It is built around the **x402 payment protocol** — an open HTTP extension that allows web clients to pay for resources before they are served, using on-chain stablecoin transfers as the settlement mechanism.

The platform has two distinct products:

| Product | What it does |
|---|---|
| **Inference App** (`webai3_web`) | Users connect a wallet, authenticate via SIWE, and run AI models (text-to-image, text-to-text, text-to-sound). Each request is paid in USDC before inference runs. |
| **Presale** (`webai3-landing`) | Token presale for AIC — the protocol's governance and utility token. Buyers contribute USDC across 7 phases at escalating prices and receive vested AIC after TGE. |

The two products are connected by the AIC token: presale buyers receive AIC, which can be staked in the inference app to unlock discounts on inference costs.

## Why x402?

The x402 protocol makes micropayments a native part of HTTP. Instead of requiring subscriptions or prepaid credits, the server issues a `402 Payment Required` response that describes exactly what USDC amount is needed and to which address. The client signs an EIP-3009 `transferWithAuthorization` message off-chain, which gets verified and settled by a facilitator before compute runs.

This enables **agent-native payments**: autonomous AI software can hold USDC and pay for compute without human interaction — the entire payment loop is machine-readable and requires no accounts or API keys.

## The AIC Token

AIC (`WebAI3Token`) is a fixed-supply ERC-20 governance token deployed on Ethereum. Key properties:

- **Supply:** 1,000,000,000 AIC — minted once at deployment, no further minting
- **Governance:** ERC20Votes — holders can delegate and vote on protocol parameters
- **Utility:** Staking AIC in the inference app reduces the per-second inference rate
- **Presale:** 500M AIC (50% of supply) sold across 7 phases at $0.010–$0.070 per token

## How the Four Projects Fit Together

```
┌─────────────────────────────────────────┐
│           Ethereum Blockchain            │
│  USDC · AIC Token · x402 Facilitator   │
└──────┬──────────┬──────────┬────────────┘
       │          │          │
       ▼          ▼          ▼
 webai3_web   webai3-     webai3-
 Inference    landing     token
 App + API    Marketing   Smart
              + Presale   Contracts
```

- **webai3_web** — inference payments via x402, reads AIC balance for staking discounts
- **webai3-landing** — presale frontend, reads presale contract state on-chain
- **webai3_token** — all 8 smart contracts: `WebAI3Token`, `WebAI3Presale`, 5 vaults, `ClaimModule`
- **webai3-dashboard** — read-only admin view of presale and vault state (not covered in user docs)

## Networks

| Network | Chain ID | USDC Address | Use |
|---|---|---|---|
| Ethereum Mainnet | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | Production |
| Ethereum Sepolia | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Staging |
| Anvil (local) | 31337 | Fork of Sepolia | Development |

The **x402 facilitator** is operated by RelAI at `https://facilitator.x402.fi` and supports `eip155:1` (Ethereum mainnet). Sepolia testing uses Anvil in local dev mode where payment settlement is mocked.
