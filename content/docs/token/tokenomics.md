---
title: Tokenomics
description: AIC token supply, distribution, utility, and economic model.
section: Token (AIC)
order: 1
---

## Overview

The protocol introduces a native token (**AIC**) designed to align incentives between:

- developers building AI-powered applications
- users consuming AI inference
- infrastructure providers supplying compute
- long-term contributors and early supporters

The core principle of the model is **usage-driven value capture**: paid inference requests move value through the protocol and fund long-term network growth.

## Token Utility

Primary utility targets the actual network loop (demand, settlement, incentives):

1. **Staking** — AIC holders stake to participate in protocol-aligned incentives and share in network economics.

2. **Payment discounts** — Staking AIC unlocks reduced inference rates vs stablecoin-only payments, creating demand tied to usage.

3. **Governance** — AIC holders participate in governance over protocol parameters (fees, onboarding, treasury policy, upgrades) via on-chain voting (`ERC20Votes`).

4. **Agent economy** — The protocol is designed for machine-to-machine payments: autonomous software can hold assets, pay for inference, and participate in incentives.

## Total Supply

Total supply is fixed at genesis — no minting after deployment:

**1,000,000,000 AIC**

## Distribution

| Category | Allocation | Tokens |
|---|---:|---:|
| Presale | 50% | 500,000,000 |
| Ecosystem | 15% | 150,000,000 |
| Treasury | 15% | 150,000,000 |
| Team | 10% | 100,000,000 |
| Liquidity + infrastructure incentives | 10% | 100,000,000 |

## Presale Rounds

Pricing increases across 7 phases. Each phase is triggered by cumulative USDC raised (not time). When a phase's raise cap is hit, the price advances to the next phase automatically.

| Phase | Price | Raise Range |
|---|---|---|
| 1 | $0.010 / AIC | $0 – $500k |
| 2 | $0.013 / AIC | $500k – $1M |
| 3 | $0.020 / AIC | $1M – $2M |
| 4 | $0.028 / AIC | $2M – $3.5M |
| 5 | $0.038 / AIC | $3.5M – $5M |
| 6 | $0.053 / AIC | $5M – $6M |
| 7 | $0.070 / AIC | $6M – $7M |

At the hard cap ($7M raised), AIC will have been sold at an average of ~$0.014.

## Vesting and Claims

Presale buyers receive AIC in three tranches:

| Unlock | Cumulative |
|---|---|
| TGE (Token Generation Event) | 30% |
| TGE + 90 days | 65% |
| TGE + 180 days | 100% |

Claims are handled entirely on-chain via the `ClaimModule` contract. Buyers call `ClaimModule.claim()` using the wallet they bought with. The contract calculates claimable amount automatically based on elapsed time since TGE.

## Fund Routing

Every USDC contribution is split at the `PresaleVault` level:

| Vault | Allocation | Purpose |
|---|---|---|
| LiquidityVault | 70% | Launch liquidity provisioning (DEX) |
| DevRunwayVault | 15% | Engineering budget (dual-gated stream) |
| TeamStreamVault | 10% | Team compensation (linear stream) |
| MarketingVault | 5% | GTM spend (locked until finalization) |

At hard cap ($7M raised): liquidity vault receives **$4.9M USDC** — providing substantial depth at token launch and reducing immediate sell pressure.

## Staking Discount Tiers

Planned inference discount schedule for AIC stakers:

| Staked AIC | Discount | Effective rate (at $0.001/s default) |
|---|---|---|
| 0 | 0% | $0.001000 / sec |
| ≥ 1,000 | 10% | $0.000900 / sec |
| ≥ 10,000 | 20% | $0.000800 / sec |
| ≥ 50,000 | 35% | $0.000650 / sec |
| ≥ 200,000 | 50% | $0.000500 / sec |

This creates a direct utility loop: buy AIC in presale → stake in inference app → reduce inference costs → stake more to reduce further.
