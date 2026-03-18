---
title: Claiming Your Tokens
description: What happens after the presale ends — the finalization sequence, vesting schedule, and how to claim your AIC.
section: User Guide
order: 4
---

After the presale closes, there is a mandatory sequence before you can claim your AIC. This sequence is enforced on-chain — no admin can skip it or accelerate it.

---

## The Sequence

```
1. Presale ends (hard cap hit or deadline passed)
       ↓
2. Anyone calls finalizePresale()
       ↓
3. Liquidity provisioned (operator within 7 days, or permissionless fallback after)
       ↓
4. Anyone calls enableClaims()
       ↓
5. You claim your AIC (subject to vesting schedule)
```

Each step is a separate on-chain action. Steps 2 and 4 are permissionless — any wallet can call them once the conditions are met. You don't need to wait for the team to do anything at these steps.

---

## Step 1: The Presale Ends

The presale ends when either:
- **Hard cap is reached** — $7,000,000 USDC raised total
- **Deadline passes** — the end timestamp set at deployment is reached

Both conditions are immutable. No admin can extend the deadline or raise the hard cap.

---

## Step 2: Finalization

Once the presale ends, anyone can call `finalizePresale()` on the presale contract. This:

- Sets `presaleFinalized = true` on all related contracts
- Lifts any active pause
- Starts the 7-day liquidity provisioning window
- Unlocks the MarketingVault (enabling the timelock queue)

This is permissionless. If the team doesn't call it, you can. Any Ethereum wallet can trigger finalization once the conditions are met.

---

## Step 3: Liquidity Provisioning

The LiquidityVault holds 70% of all presale USDC. Before claims can open, this USDC must be used to provide DEX liquidity (creating trading depth for the AIC/USDC pair).

**Primary path:** The liquidity operator calls `provideLiquidity()` within 7 days of finalization.

**Fallback path:** If the operator doesn't act within 7 days, anyone can call `provideLiquidityFallback()`. This permissionless fallback ensures the operator cannot indefinitely block claims.

Both paths transfer the full vault balance to the designated `liquidityRecipient` address, which provisions the liquidity pool.

---

## Step 4: Enable Claims

Once `presaleFinalized == true` AND `liquidityProvisioned == true`, anyone can call `ClaimModule.enableClaims()`. This is the final step before buyers can access their tokens.

The `enableClaims()` function verifies both conditions on-chain before setting `claimsEnabled = true`. It's a one-way flag — once enabled, claims are permanently open.

---

## Step 5: Claiming — The Vesting Schedule

Your AIC is not released all at once. It vests across three tranches tied to the Token Generation Event (TGE):

| When | Cumulative Unlock |
|---|---:|
| TGE (Token Generation Event) | 30% |
| TGE + 90 days | 65% |
| TGE + 180 days | 100% |

Between milestones, unlocking is linear. For example, at TGE + 45 days you have access to approximately 47.5% of your allocation.

### Example

You bought 100,000 AIC in the presale:

| When you claim | Claimable (cumulative) |
|---|---:|
| Day of TGE | 30,000 AIC |
| TGE + 90 days | 65,000 AIC |
| TGE + 180 days | 100,000 AIC |

If you don't claim at TGE, unclaimed amounts accumulate. Claiming at TGE + 90 days gives you the full 65,000 in one transaction.

---

## How to Claim

1. Visit the WebAI3 app after `enableClaims()` has been called
2. Connect the same wallet you used to buy in the presale
3. The app shows your claimable amount based on the current date
4. Click **Claim** — this calls `ClaimModule.claim()` on-chain
5. Your AIC is transferred to your wallet

The `claim()` function is permissionless and non-custodial. You can claim as many times as you want — each call transfers whatever has vested since your last claim.

---

## Checking Your Allocation

You can check your allocation at any time by reading the `ClaimModule` contract:

```
ClaimModule.totalAllocation(yourWalletAddress)    → total AIC you're owed
ClaimModule.totalClaimed(yourWalletAddress)       → AIC you've already claimed
ClaimModule.claimableAmount(yourWalletAddress)    → AIC claimable right now
ClaimModule.vestedBps()                           → current vesting % (in basis points)
```

---

## Common Questions

**Can I claim before TGE?**
No. `claimableAmount()` returns 0 before TGE. Claims revert with `NothingClaimable`.

**What if I miss the TGE claim window?**
There is no window. Unclaimed amounts accumulate indefinitely. You can claim anytime after `claimsEnabled == true`.

**What if I used multiple wallets?**
Each wallet's allocation is tracked separately. You must claim from each wallet individually.

**Can someone else claim on my behalf?**
No. `claim()` transfers tokens to `msg.sender`. The caller receives their own allocation — there's no way to claim for another address.

**What happens to unclaimed allocations?**
Nothing — they stay in the `ClaimModule` indefinitely. The contract holds the full 500M AIC. Unclaimed tokens remain allocated to their respective buyers forever.
