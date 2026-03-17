---
title: Post-Presale Operations
description: Step-by-step guide for every on-chain action after the presale ends — who does it, when, and why.
section: Token (AIC)
order: 4
---

## The Big Picture

When the presale ends, the protocol doesn't automatically unlock. A small sequence of actions must happen in order before buyers can claim their AIC. Think of it like a relay race — each leg hands off to the next.

```
PRESALE ENDS
     │
     ▼
① Anyone calls finalizePresale()
   → Sets the clock for everything else
     │
     ├──────────────────────────────────────────┐
     ▼                                          ▼
② Liquidity Operator seeds the DEX pool    Marketing Operator can now
   (must happen within 7 days)              queue withdrawals
     │
     ▼
③ Anyone calls enableClaims()
   → The token claim window is now open
     │
     ▼
④ Token buyers claim their AIC
   (30% at TGE, 65% at TGE+90d, 100% at TGE+180d)


— Running in parallel from Presale Start —

⑤ Dev Runway streams over 180 days
⑥ Team stream runs over 365 days
```

The critical path for buyers is steps ①②③. Steps ⑤ and ⑥ run independently from the claim pipeline.

## Who's Who

### Presale Participants (Buyers)

Contributors who sent USDC during the presale in exchange for an AIC allocation. Their tokens vest over time starting at TGE. Buyers interact directly with the `ClaimModule` contract to pull their tokens — no other action is needed from them before claiming.

**What they care about:** When can I get my tokens? How much can I claim right now?

### The Liquidity Operator

The most time-sensitive role after finalization. Holds `LIQUIDITY_OPERATOR_ROLE` on `LiquidityVault`. Responsible for taking the 70% USDC held in the vault and providing it as liquidity on a DEX. Has a **7-day window** after finalization. If the window is missed, anyone can trigger the fallback path.

**What they care about:** Getting liquidity seeded before the window expires — which unblocks token claims for all buyers.

### The Dev Operator

Holds `DEV_OPERATOR_ROLE` on `DevRunwayVault`. Manages the day-to-day engineering budget. The vault streams USDC continuously over 180 days starting from presale start (not from finalization). The operator calls `withdraw()` whenever runway funds are needed.

### The Team Operator

Holds `TEAM_OPERATOR_ROLE` on `TeamStreamVault`. Similar to the Dev Operator but for team compensation — linear stream over a full 365-day period.

### The Marketing Operator

Holds `MARKETING_OPERATOR_ROLE` on `MarketingVault`. Marketing funds are available in full after finalization, but require a 2-day timelock: queue a withdrawal → wait 2 days → execute.

## Step 1 — Finalize the Presale

**Who:** Anyone — no special wallet required.
**When:** After the presale ends (time-based or hard cap reached).
**One-time:** Cannot be called twice.

```solidity
WebAI3Presale.finalizePresale()
```

Call `WebAI3Presale.isFinalizable()` first — if `true`, the call will succeed.

**What happens under the hood:**

```
WebAI3Presale.finalizePresale()
  ├─ Confirms end condition is met (hard cap OR end timestamp)
  ├─ Sets presaleFinalized = true
  ├─ Clears any active emergency pause
  ├─ Records finalizedAt = current timestamp
  ├─ Notifies LiquidityVault → starts the 7-day operator window
  └─ Notifies MarketingVault → unlocks queueWithdrawal()
```

## Step 2 — Provide Liquidity

This is the **gating step** for everything buyers care about. Claims cannot open until liquidity is provisioned.

### Path A — Normal Path (Liquidity Operator, within 7 days)

```solidity
LiquidityVault.provideLiquidity()
```

Transfers the entire USDC balance of the vault to the `liquidityRecipient` address in one transaction.

Requirements:
- Caller has `LIQUIDITY_OPERATOR_ROLE`
- `presaleFinalized == true`
- `liquidityProvisioned == false`
- `block.timestamp <= finalizedAt + 7 days`

### Path B — Fallback Path (Anyone, after 7 days)

```solidity
LiquidityVault.provideLiquidityFallback()
```

Available after the 7-day operator window expires. No role restriction. Executes identically to Path A. This ensures the protocol can never be permanently stuck because one wallet went offline.

## Step 3 — Enable Claims

**Who:** Anyone — no special wallet required.
**When:** After both Step 1 and Step 2 are complete.

```solidity
ClaimModule.enableClaims()
```

The contract checks both preconditions before proceeding. Once this lands, buyers can start claiming.

## Step 4 — Token Claims (Buyers)

**Who:** Each buyer, from the wallet they bought with.
**When:** After Step 3, any time — but claimable amounts depend on how much time has passed since TGE.

### Vesting Schedule

| When | Unlocks | Example: 10,000 AIC allocation |
|---|---|---|
| TGE | 30% | 3,000 AIC |
| TGE + 90 days | 35% more (65% total) | 3,500 more AIC |
| TGE + 180 days | 35% more (100% total) | 3,500 more AIC |

```solidity
ClaimModule.claim()
```

Buyers can claim as many times as they like. Each call transfers only newly vested tokens since the last claim. No need to claim at exactly the right moment — the contract tracks cumulative claimed amounts.

Check available balance before claiming:
```solidity
ClaimModule.claimableAmount(address buyer) → uint256
```

## Step 5 — Vault Withdrawals (Operators)

These three vaults operate independently from the claim pipeline.

### Dev Runway Vault

**Budget:** Up to 1,050,000 USDC (15% of the $7M hard cap)
**Stream:** Linear over 180 days from presale start

```
Available = min(1,050,000 USDC × days_elapsed / 180, total_deposited) − already_withdrawn
```

```solidity
DevRunwayVault.withdraw(amount)
```

The dev stream started when the presale opened. By the time claims are enabled, a portion has already accumulated and is ready to withdraw.

### Team Stream Vault

**Budget:** 10% of actual raised USDC
**Stream:** Linear over 365 days from presale start

```solidity
TeamStreamVault.withdraw(amount)
```

### Marketing Vault

**Available from:** After `finalizePresale()` is called
**Mechanism:** Full balance available, but requires a 2-day timelock

```solidity
// Step 1 — Queue the withdrawal
MarketingVault.queueWithdrawal(amount)

// Step 2 — Wait 2 days

// Step 3 — Execute
MarketingVault.executeWithdrawal()

// Optional — Cancel before execution
MarketingVault.cancelQueuedWithdrawal()
```

## Full Timeline (Sepolia Dates)

```
PRESALE_START (~Mar 16, 2026)
│  Dev runway and team stream begin accumulating
│
PRESALE_END (~Jul 14, 2026) — or HARD_CAP hit
│
├─ Day 0     finalizePresale() called (anyone)
│               LiquidityVault operator window opens
│               MarketingVault queue unlocked
│
├─ Day 0–7   provideLiquidity() — preferred path
│
├─ Day 7+    If operator missed window:
│               provideLiquidityFallback() (anyone)
│
│   Once liquidity provisioned:
├─ ─────     enableClaims() (anyone)
│
TGE (~Jul 15, 2026)
├─ Buyers can claim 30%
│
TGE + 90 days (~Oct 13, 2026)
├─ Buyers can claim 65% cumulative
│
TGE + 180 days (~Jan 11, 2027)
└─ Buyers can claim 100%
```

## Stakeholder Checklists

### Liquidity Operator — Time-Critical

- [ ] Monitor for `PresaleFinalized` event on `WebAI3Presale`
- [ ] Call `LiquidityVault.provideLiquidity()` within 7 days of finalization
- [ ] Confirm `liquidityProvisioned = true` on-chain

### Anyone (help unblock the chain)

- [ ] Call `WebAI3Presale.finalizePresale()` once end condition is met
- [ ] Call `ClaimModule.enableClaims()` after Steps 1 and 2
- [ ] Call `LiquidityVault.provideLiquidityFallback()` if operator missed the 7-day window

### Dev Operator — Ongoing

- [ ] Call `DevRunwayVault.withdraw(amount)` when runway funds are needed
- [ ] Check `withdrawableDev()` to see currently available amount

### Marketing Operator — Post-Finalization

- [ ] Call `MarketingVault.queueWithdrawal(amount)` after finalization
- [ ] Wait 2 days
- [ ] Call `MarketingVault.executeWithdrawal()` to release funds

### Token Buyers — After Claims Enabled

- [ ] Wait for `ClaimsEnabled` event on `ClaimModule`
- [ ] Call `ClaimModule.claim()` at TGE, TGE+90d, TGE+180d (or any time after)
- [ ] Check `claimableAmount(address)` to see what's currently available

## Error Reference

| Error | Contract | Meaning |
|---|---|---|
| `PresaleAlreadyFinalized` | Presale | `finalizePresale()` called twice |
| `PresaleNotFinalizable` | Presale | End condition not yet met |
| `LiquidityAlreadyProvisioned` | LiquidityVault | Provision called twice |
| `LiquidityWindowExpired` | LiquidityVault | Primary path after 7-day window |
| `LiquidityFallbackNotAvailable` | LiquidityVault | Fallback within operator window |
| `LiquidityNotProvisioned` | ClaimModule | `enableClaims()` called before liquidity |
| `AlreadyConfigured` | ClaimModule | `enableClaims()` called twice |
| `ClaimsNotEnabled` | ClaimModule | `claim()` before `enableClaims()` |
| `NothingClaimable` | ClaimModule | No vested and unclaimed balance |
| `MarketingLocked` | MarketingVault | `queueWithdrawal()` before finalization |
| `TimelockNotReady` | MarketingVault | `executeWithdrawal()` before 2-day wait |
| `WithdrawalExceedsLimit` | Dev/Team/MarketingVault | Requested amount exceeds available |
