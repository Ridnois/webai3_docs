---
title: Staking & Inference Discounts
description: How staking AIC will reduce your inference cost — coming after the presale and TGE.
section: User Guide
order: 5
---

> **Coming soon.** Staking launches after the presale closes and the AIC token goes live (TGE). The discount tiers described below reflect the confirmed design. This page will be updated with instructions when the staking contract is deployed.

---

## What Staking Does

Locking AIC in the staking contract gives you a discount on inference costs. The more you stake, the lower your per-second rate. The discount applies automatically — no manual action required each time you run inference.

Staking is non-custodial. Your AIC stays in the staking contract (not in team hands), and you can unstake at any time.

---

## Discount Tiers

| Staked AIC | Discount | Rate (per second) |
|---|---:|---|
| 0 | 0% | $0.001000 |
| ≥ 1,000 | 10% | $0.000900 |
| ≥ 10,000 | 20% | $0.000800 |
| ≥ 50,000 | 35% | $0.000650 |
| ≥ 200,000 | 50% | $0.000500 |

Tiers are based on your total staked balance. Staking 10,001 AIC gives you the full 20% — you don't need exactly 10,000.

---

## Real Cost Comparisons

| Task | Avg. time | Base cost | At 50% discount |
|---|---|---|---|
| Text-to-image | ~10 sec | ~$0.010 | ~$0.005 |
| Text-to-text | ~3 sec | ~$0.003 | ~$0.0015 |
| Text-to-sound | ~15 sec | ~$0.015 | ~$0.0075 |

---

## How It Will Work

Once staking is live:

1. Claim your AIC from the presale (after TGE)
2. Approve the staking contract to spend your AIC
3. Stake — your AIC moves to the staking contract
4. Your discount applies automatically to all subsequent inferences

To unstake: initiate an unstake, wait for the cooldown period, then withdraw your AIC back to your wallet. Your discount remains active during the cooldown.

---

## When Does This Launch?

Staking deploys after TGE. The presale and vesting contracts ship first. Follow announcements in the community channels for the exact date.
