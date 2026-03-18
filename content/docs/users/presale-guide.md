---
title: Presale Guide
description: How to participate in the AIC presale — the 7 phases, how pricing works, what you're buying, and what happens to your USDC.
section: User Guide
order: 3
---

The AIC presale distributes 500,000,000 tokens (50% of total supply) across 7 phases. Each phase has a fixed price per AIC. The price increases as more USDC is raised — you get a better price by participating earlier.

---

## Before You Start

You need:

- An Ethereum wallet (MetaMask, Coinbase Wallet, Rainbow, or any wallet that supports EIP-712 signing)
- USDC on Ethereum mainnet
- A small amount of ETH for gas (buying AIC requires two transactions: one USDC approval + one buy)

---

## The 7 Phases

Phases advance automatically based on how much USDC has been raised in total — not by a timer. When total contributions hit the phase threshold, the next buyer pays the higher price.

| Phase | Price per AIC | Raise Range | Token Cap |
|---:|---|---|---:|
| 1 | $0.010 | $0 – $500,000 | 50,000,000 |
| 2 | $0.013 | $500k – $1M | 38,500,000 |
| 3 | $0.020 | $1M – $2M | 50,000,000 |
| 4 | $0.028 | $2M – $3.5M | 53,600,000 |
| 5 | $0.038 | $3.5M – $5M | 39,500,000 |
| 6 | $0.053 | $5M – $6M | 18,900,000 |
| 7 | $0.070 | $6M – $7M | 249,500,000 |

**Key detail:** Each phase has a token cap as well as a raise range. A phase ends when *either* its raise range is hit *or* its token allocation runs out — whichever comes first.

### Why phase advancement is automatic

There is no admin who decides when to advance a phase. The smart contract reads `totalRaisedUSDC` on every purchase. When it crosses a threshold (e.g., $500,000 for Phase 1 → Phase 2), the contract automatically starts applying Phase 2 pricing to subsequent purchases. A transaction that straddles a boundary fills the remainder at the old price.

---

## How to Buy

1. **Connect your wallet** to the WebAI3 landing page
2. **Choose your USDC amount** — the app shows you how many AIC you'll receive at the current phase price
3. **Approve USDC** — first transaction allows the presale contract to spend your USDC (only needed once, or when increasing your limit)
4. **Buy** — second transaction calls `buyTokens(usdcAmount)` on the presale contract
5. **Receive your allocation** — you don't receive AIC immediately. The contract records your allocation in the `ClaimModule`. You'll claim after the presale ends.

---

## Anti-Whale Limits

To protect early phases from being dominated by large buyers:

| Phase | Max USDC per wallet |
|---|---|
| Phase 1 | $25,000 |
| Phase 2 | $50,000 |
| Phase 3–7 | No limit |

These limits are enforced by the contract, not by a UI check. Splitting the buy across multiple wallets doesn't help — each wallet is tracked separately.

---

## What Happens to Your USDC

Every USDC you contribute is split at the moment of your transaction across four vaults. None of the funds sit in an intermediate wallet:

| Vault | Share | Purpose |
|---|---:|---|
| LiquidityVault | 70% | Funds the DEX listing (provides trading depth) |
| DevRunwayVault | 15% | Engineering budget (time-streamed over 180 days) |
| TeamStreamVault | 10% | Team compensation (linear stream over 365 days) |
| MarketingVault | 5% | Go-to-market spend (locked until presale finalizes) |

**This is enforced on-chain.** You can verify the split by looking at the `PresaleVault` contract. No admin can redirect your funds elsewhere after the transaction.

---

## What You're Actually Buying

When you call `buyTokens()`, you're not receiving AIC tokens. You're receiving a **recorded allocation** in the `ClaimModule` contract. This allocation is:

- Stored on-chain (verifiable by looking up `totalAllocation[yourAddress]`)
- Non-transferable (tied to your wallet address)
- Claimable after the presale ends and liquidity is provisioned (see [Claiming Your Tokens](/docs/users/claiming-tokens))

The AIC tokens themselves are held by the `ClaimModule` contract (it holds 500M AIC from the deployment allocation) and released to you on a vesting schedule.

---

## The Hard Cap

The presale has a hard cap of $7,000,000. Once $7M USDC is raised, no more purchases can be made. The presale can also end by timestamp — a deadline is set at deployment, and `finalizePresale()` becomes callable when either condition is met.

Finalization is permissionless: anyone can call it once the conditions are satisfied.

---

## What Happens After the Presale

When the presale ends:

1. Anyone calls `finalizePresale()` — marks the presale complete
2. The liquidity operator provisions DEX liquidity (within 7 days) — or anyone can trigger the fallback after 7 days
3. Anyone calls `enableClaims()` — opens the claim window
4. **You can claim your AIC** according to the vesting schedule

See [Claiming Your Tokens](/docs/users/claiming-tokens) for the full step-by-step.

---

## Is the Presale Safe?

Several on-chain mechanisms protect buyers:

**Admins cannot run off with funds.** The USDC splits happen atomically at purchase time. The 70% liquidity vault has a mandatory provisioning step — and if the operator fails to provision within 7 days, anyone can trigger a permissionless fallback.

**Marketing funds are locked.** The MarketingVault rejects withdrawals until `presaleFinalized == true`. This is enforced in the contract, not by policy.

**Claims cannot open before liquidity is provisioned.** `enableClaims()` checks both `presaleFinalized` and `liquidityProvisioned` on-chain. The ordering cannot be bypassed.

**Pause is bounded.** Admins can pause buying activity, but a single pause cannot last longer than 72 hours, and total paused time is capped at 14 days. After 72 hours of continuous pause, anyone can call `forceUnpause()`.
