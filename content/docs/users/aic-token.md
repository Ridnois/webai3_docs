---
title: The AIC Token
description: What AIC is, how the supply works, what you can do with it, and why it has value in the WebAI3 ecosystem.
section: User Guide
order: 2
---

AIC is the native token of the WebAI3 protocol. Understanding it requires understanding three things: where it comes from, what it does, and how it connects to the inference app.

---

## Fixed Supply

The AIC supply is **1,000,000,000 tokens** — minted once when the contract was deployed, never again.

There is no mint function in the code. No team wallet, no governance vote, no admin key can create more. This is verifiable: the contract is open source with no upgrade mechanism.

### Where the 1B tokens went

| Allocation | Tokens | % |
|---|---:|---:|
| Presale (7-phase) | 500,000,000 | 50% |
| Ecosystem grants | 150,000,000 | 15% |
| Protocol treasury | 150,000,000 | 15% |
| Team | 100,000,000 | 10% |
| Liquidity & infrastructure incentives | 100,000,000 | 10% |

The presale allocation sits in the `ClaimModule` contract at deployment. Buyers never receive tokens immediately when they buy — they receive a recorded allocation that they can claim (with vesting) after the presale ends and liquidity is provisioned.

---

## What AIC Does

### 1. Staking for inference discounts

Staking AIC in the inference app locks your tokens in a staking contract. In return, your per-second inference rate drops:

| Staked AIC | Discount | Rate (at $0.001/s default) |
|---|---:|---|
| 0 | 0% | $0.001000 / sec |
| 1,000 | 10% | $0.000900 / sec |
| 10,000 | 20% | $0.000800 / sec |
| 50,000 | 35% | $0.000650 / sec |
| 200,000 | 50% | $0.000500 / sec |

Staking is not a subscription — it's a continuous position. Your discount applies for every inference you run while staked. You can unstake at any time (subject to a cooldown period).

**Example:** A developer running 1,000 image generations per month at ~10 seconds each:
- Without staking: 10,000 seconds × $0.001 = **$10/month**
- With 10,000 AIC staked (20% off): 10,000 seconds × $0.0008 = **$8/month**
- With 200,000 AIC staked (50% off): 10,000 seconds × $0.0005 = **$5/month**

At $0.07/AIC (presale Phase 7 price), staking 10,000 AIC costs $700. At $2/month in savings, that's a 350-month payback — staking pays off most if you're a heavy user or the token appreciates.

### 2. Governance

AIC implements ERC20Votes, the standard for on-chain governance. Holders can delegate their voting power and vote on protocol parameters:

- Inference fee rates
- Staking discount thresholds
- Treasury policy
- Protocol upgrades

Voting power is not automatic. You must call `delegate(yourAddress)` on the AIC contract to activate your votes. You can also delegate to another address if you prefer to let someone else vote on your behalf.

### 3. Presale participation

50% of all AIC is sold in the presale. The presale is the primary distribution mechanism — it's how most tokens enter circulation before any exchange listing.

See [Presale Guide](/docs/users/presale-guide) for details on how to participate.

---

## The Economic Loop

The value case for AIC is a usage loop:

```
Inference demand rises
    ↓
Protocol collects more USDC from payments
    ↓
More demand to buy AIC (for discounts, governance)
    ↓
Fixed supply → price pressure
    ↓
Existing holders benefit from appreciation
    ↓
Higher AIC price → more effective discount per dollar of AIC held
```

Later tiers add a deflationary mechanism: a percentage of AIC paid for inferences gets burned (sent to `address(0)`, permanently removed from supply). This is planned for Tier 2, after the staking system is live.

---

## What AIC Is Not

- **Not a stablecoin** — AIC floats in price. There is no peg.
- **Not a utility token with required use** — you can use the inference app without AIC, paying in USDC at the base rate
- **Not a yield-bearing asset by itself** — staking gives you a discount, not a monetary return
- **Not inflationary** — supply cannot increase

---

## Token Standard Details

AIC is an ERC-20 token with several extensions:

| Extension | What it adds |
|---|---|
| ERC-20 | Standard transfers, approvals, balanceOf |
| ERC20Pausable | Emergency pause (blocks all transfers) |
| ERC20Permit (EIP-2612) | Gasless approvals via signature |
| ERC20Votes | Governance delegation + historical voting snapshots |
| AccessControl | Role-based admin (pause, role management) |

The `permit()` function means you can approve token spending with a signature instead of a separate on-chain transaction — this is how the presale contract takes USDC without requiring a separate approval step.
