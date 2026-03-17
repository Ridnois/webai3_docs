---
title: Architecture
description: How the four projects integrate and what each component owns.
section: Overview
order: 2
---

## System Map

```
Users / AI agents
        │
        ▼
webai3-landing            webai3_web
(Next.js, static)         (Next.js + API routes)
 - Presale UI              - Wallet auth (SIWE)
 - AIC buy flow            - Model selection
 - Tokenomics              - x402 payment
        │                  - Replicate inference
        │                  - R2 media storage
        ▼                        │
WebAI3Presale ◄──────────────────┘
WebAI3Token (AIC)        ▲
ClaimModule         reads AIC balance
PresaleVault        for staking discounts
LiquidityVault
DevRunwayVault
TeamStreamVault
MarketingVault
```

## Integration Points

| From | To | Mechanism |
|---|---|---|
| `webai3-landing` | `webai3_web` | URL link ("Launch App") |
| `webai3-landing` | `webai3_token` | On-chain reads (presale state, phase info) |
| `webai3_web` | `webai3_token` | On-chain reads (AIC balance, staked amount) |
| `webai3_web` | x402 facilitator | HTTPS API (`/verify`, `/settle`) |
| `webai3_web` | Replicate | HTTPS API (model inference) |
| `webai3_web` | Cloudflare R2 | S3-compatible API (media upload) |
| `webai3_web` | PostgreSQL | TCP (users + inferences database) |
| `webai3-dashboard` | `webai3_token` | On-chain reads (vault balances, presale state) |

Contract addresses and ABIs are hardcoded in each consumer after deployment. There are no build-time dependencies between the four repos.

## webai3_token — Smart Contract Layer

Eight contracts deployed on Ethereum:

| Contract | Purpose |
|---|---|
| `WebAI3Token` | ERC-20 AIC token with governance voting (ERC20Votes) |
| `WebAI3Presale` | Phase pricing, buy accounting, finalization logic |
| `PresaleVault` | Splits each buy into 70/15/10/5 across four vaults |
| `LiquidityVault` | Holds 70% of raised USDC for DEX liquidity provisioning |
| `DevRunwayVault` | 15% — dual-gated: milestone cap + linear stream over 180 days |
| `TeamStreamVault` | 10% — linear stream over 365 days |
| `MarketingVault` | 5% — locked until finalization, then 2-day timelock |
| `ClaimModule` | Manages buyer vesting (30% TGE, 35% at +90d, 35% at +180d) |

### Contract Addresses (Sepolia Testnet)

| Contract | Address |
|---|---|
| `WebAI3Token (AIC)` | `0xE375BC84dcd834a0662Aff41e8e18d1f2A907F18` |
| `WebAI3Presale` | `0x22Eec638a99ec9F8ffad231666baf9a9304CeF96` |
| `PresaleVault` | `0x220663B010DB4E6c3Da750B70Ee84B8BBa0F6C64` |
| `LiquidityVault` | `0x78DD71d73a59D376BB4dDC1ebcBdC9bA26EED19E` |
| `DevRunwayVault` | `0x61A6207526ab7231431da9EfD155C91d2De0aefA` |
| `TeamStreamVault` | `0xB60Ce11B006307d84c44ff4FA0E81E05B5231C6b` |
| `MarketingVault` | `0x841e3Cb3b19D150C31a509CC77CB4264Cc2C4685` |
| `ClaimModule` | `0x7EFC15670baD86dA4c39b86a46A90DEEce8850A3` |

## webai3_web — Inference API Layer

Next.js 16 app with App Router. Key layers:

- **Auth:** Sign-In With Ethereum (SIWE / EIP-4361), sessions via `iron-session` (encrypted HTTP-only cookies)
- **Payment:** x402 protocol — HTTP 402 challenge, EIP-3009 `transferWithAuthorization`, facilitator verification + settlement
- **Inference:** Replicate API — text-to-image, text-to-text, text-to-sound
- **Storage:** Cloudflare R2 (S3-compatible) for media outputs, PostgreSQL for inference records
- **Pricing:** `$0.001 USDC / second` of compute (configurable via env var), discounted for AIC stakers

## webai3-landing — Presale Frontend

Static Next.js 16 app. No backend, no database. All presale configuration comes from `NEXT_PUBLIC_*` env vars and on-chain reads via wagmi v3 + viem.

The presale checkout currently redirects to an external URL (`NEXT_PUBLIC_PRESALE_CHECKOUT_URL`). A native wagmi-based inline flow is planned.

## Deployment Timeline (Sepolia State)

| Event | Status | Date |
|---|---|---|
| Contracts deployed + verified | Done | Mar 2026 |
| Presale start | Deployed | ~Mar 16, 2026 |
| Presale end | Live | ~Jul 14, 2026 |
| TGE | Upcoming | ~Jul 15, 2026 |
| Mainnet deployment | Pending audit | TBD |
