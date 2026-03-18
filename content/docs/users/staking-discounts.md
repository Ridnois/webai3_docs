---
title: Staking & Inference Discounts
description: How staking AIC reduces your inference cost — the five discount tiers, real cost comparisons, and how staking works in practice.
section: User Guide
order: 5
---

> **Status:** Staking is planned and not yet live. The discount tiers and staking mechanism described here reflect the design specification. This page will be updated when the staking contract is deployed.

---

## How Staking Works

You lock AIC in a staking contract. The staking contract tracks your position. The inference app reads your staked balance before each payment and applies the corresponding discount tier.

The discount is applied to the **per-second inference rate**. The default rate is $0.001 USDC per second. Discounts reduce this rate for every second of compute you purchase.

Staking is non-custodial: your AIC stays in the staking contract (not in team hands), and you can unstake at any time after a cooldown period.

---

## Discount Tiers

| Staked AIC | Discount | Rate | vs. No Staking |
|---|---:|---|---|
| 0 | 0% | $0.001000 / sec | baseline |
| ≥ 1,000 | 10% | $0.000900 / sec | save $0.0001/sec |
| ≥ 10,000 | 20% | $0.000800 / sec | save $0.0002/sec |
| ≥ 50,000 | 35% | $0.000650 / sec | save $0.00035/sec |
| ≥ 200,000 | 50% | $0.000500 / sec | save $0.0005/sec |

Tiers are based on the **total staked balance**, not increments. Staking 10,001 AIC gives you the full 20% tier — you don't need exactly 10,000.

---

## Real Cost Comparisons

The inference app runs three types of tasks. Each takes a different amount of time:

| Task | Avg. time | Base cost |
|---|---|---|
| Text-to-image | ~10 seconds | ~$0.010 |
| Text-to-text | ~3 seconds | ~$0.003 |
| Text-to-sound | ~15 seconds | ~$0.015 |

**Cost per 1,000 text-to-image runs** (10 seconds each = 10,000 compute seconds):

| Staked AIC | Rate | Total cost | Monthly savings vs. no staking |
|---|---|---|---|
| 0 | $0.001000/s | $10.00 | — |
| 1,000 | $0.000900/s | $9.00 | $1.00 |
| 10,000 | $0.000800/s | $8.00 | $2.00 |
| 50,000 | $0.000650/s | $6.50 | $3.50 |
| 200,000 | $0.000500/s | $5.00 | $5.00 |

---

## How the Discount Is Applied

When you call the inference API, the server:

1. Reads your staked AIC balance from the staking contract: `IAICStaking.stakedBalance(yourAddress)`
2. Looks up your discount tier based on that balance
3. Calculates the effective rate: `baseRate × (1 - discountPct)`
4. Uses the discounted rate to calculate the payment amount

This happens server-side before you sign the payment authorization. The amount you sign already reflects your discount — you don't pay base rate and get a refund.

---

## How to Stake

Once the staking contract is deployed:

1. Hold AIC in your wallet (claim from presale, or buy on a DEX after listing)
2. Approve the staking contract to spend your AIC
3. Call `stake(amount)` — your AIC moves to the staking contract
4. Your discount applies automatically to all subsequent inferences

**To unstake:**

1. Call `unstake(amount)` — starts the cooldown period
2. After the cooldown, call `withdraw()` — your AIC is returned to your wallet

During the cooldown, your staked balance remains in the contract and your discount continues to apply. Only after withdrawal does your balance drop and your tier potentially change.

---

## Choosing How Much to Stake

The right amount depends on how frequently you use inference:

**Occasional use (< 100 inferences/month):**
Entry-level staking (1,000 AIC) gives you 10% off. Savings are modest but real.

**Regular use (100–1,000 inferences/month):**
The 10,000 AIC tier (20% off) starts to produce meaningful monthly savings at this volume.

**Heavy or developer use (> 1,000 inferences/month):**
The 50,000–200,000 AIC tiers make the most economic sense. The staking cost amortizes quickly if you're running continuous inference workloads.

---

## The Economic Case for Staking

Staking creates a direct loop between holding AIC and reducing your inference costs:

```
Buy AIC in presale (or on DEX)
    ↓
Stake AIC in the inference app
    ↓
Get discounted inference rate
    ↓
Run more inference for same USDC spend
    ↓
Savings can fund more AIC purchase → stake more → bigger discount
```

When AIC-as-payment is added (Tier 1.5), you'll also be able to pay for inference directly in AIC. A portion of each AIC payment will be burned, reducing the circulating supply and creating deflationary pressure on the fixed 1B token cap.

---

## Future: Model Access Gating (Tier 2)

After staking is live, certain model tiers will require a minimum AIC balance or stake:

| Tier | Requirement | Access |
|---|---|---|
| Free | 0 AIC | Basic models, limited rate |
| Standard | ≥ 500 AIC held | Broader model catalog |
| Premium | ≥ 5,000 AIC staked | Full catalog, highest rate limits |

This gating is enforced server-side on the inference API. UI badges will indicate which tier each model requires.
