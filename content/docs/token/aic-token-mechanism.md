---
title: AIC Token — Deep Dive
description: How the AIC token works end-to-end, from genesis to governance, presale mechanics, fund routing, vesting, and staking discounts.
section: Token (AIC)
order: 4
---

## What This Document Covers

This is a mechanism-level walkthrough of the AIC token system — not an overview, but a detailed account of how each part works, why it was designed that way, and how the pieces fit together. Read [Tokenomics](/docs/token/tokenomics) for the high-level model and [Technical Spec](/docs/token/technical-spec) for the raw ABI reference.

---

## 1. Token Genesis

### One-Shot Minting

`WebAI3Token` has no `mint()` function. The entire 1,000,000,000 AIC supply is created in a single constructor call via a genesis allocation array:

```solidity
constructor(address admin, Allocation[] memory allocations) {
    // validates: admin != 0, allocations.length > 0,
    //            each recipient != 0, sum == 1_000_000_000 ether
    for (uint256 i; i < allocations.length; i++) {
        _mint(allocations[i].recipient, allocations[i].amount);
    }
}
```

**Why this matters:** The supply constraint is enforced at deployment, not by policy. There is no governance action, multisig decision, or admin key that could inflate the supply later — the code simply doesn't have that capability.

The constructor validates that allocations sum to exactly `1e27` (the raw base-unit representation of 1B tokens at 18 decimals). Any mismatch reverts with `InvalidAllocationTotal(expected, actual)`.

### Who Receives What

At deployment, 6 allocation buckets are filled:

| Bucket | Tokens | Where |
|---|---:|---|
| Presale allocation | 500,000,000 | `ClaimModule` contract |
| Ecosystem | 150,000,000 | Protocol treasury/multisig |
| Treasury | 150,000,000 | Protocol treasury/multisig |
| Team | 100,000,000 | Team vesting contract |
| Liquidity + infra incentives | 100,000,000 | Liquidity/incentive multisig |

The presale allocation goes directly to `ClaimModule`, not to `WebAI3Presale`. Buyers never receive tokens at purchase time — they receive a recorded allocation in `ClaimModule` instead.

---

## 2. Governance — ERC20Votes

### How Voting Power Works

AIC uses OpenZeppelin's `ERC20Votes` extension. The key mechanic:

- Holding AIC does **not** automatically give you voting power.
- You must call `delegate(address)` to activate it.
- Delegating to yourself (`delegate(msg.sender)`) turns your balance into votes.
- Delegating to another address transfers your voting power to them.

```
Alice holds 10,000 AIC
├── Before delegate(): getVotes(alice) = 0
├── alice calls delegate(alice): getVotes(alice) = 10,000
└── alice calls delegate(bob): getVotes(bob) += 10,000, getVotes(alice) = 0
```

Voting power tracks your current token balance. If Alice transfers 3,000 AIC to Carol while delegating to herself, her voting power drops to 7,000 automatically.

### Historical Snapshots

The contract maintains a checkpoint ledger. Every time voting power changes, the old and new values are recorded against the current block:

```solidity
event DelegateVotesChanged(
    address indexed delegate,
    uint256 previousBalance,  // voting power before change
    uint256 newBalance        // voting power after change
);
```

Governance contracts query **past** state, not current state:

```solidity
getPastVotes(account, proposalCreatedBlock)
getPastTotalSupply(proposalCreatedBlock)
```

This prevents flash loan attacks: borrowing tokens in block N cannot affect voting power at block N-1. A governance proposal created at block N locks in the voter snapshot — subsequent token movements don't change the outcome.

### Emergency Pause

`PAUSER_ROLE` can call `pause()` to freeze all token transfers. Approvals and delegation still work while paused — governance coordination remains possible even during a transfer freeze.

---

## 3. Presale Mechanism

### Phase Advancement Logic

The presale has 7 phases. Each phase has a **cumulative raise cap** (not a per-phase cap). The active phase at any moment is whichever phase has a cumulative cap that has not yet been crossed:

```solidity
function getActivePhase() public view returns (uint8) {
    for (uint8 i = 0; i < _phases.length; i++) {
        if (totalRaisedUSDC < _phases[i].cumulativeRaiseCap) {
            return i;
        }
    }
    return type(uint8).max; // all caps crossed, no active phase
}
```

Phase boundaries:

| Phase | Triggered when `totalRaisedUSDC` >= |
|---|---|
| 0→1 | $500,000 |
| 1→2 | $1,000,000 |
| 2→3 | $2,000,000 |
| 3→4 | $3,500,000 |
| 4→5 | $5,000,000 |
| 5→6 | $6,000,000 |
| 6 ends | $7,000,000 (hard cap) |

Phase advancement is **automatic** — there is no admin button to advance phases. It happens inside every `buyTokens()` call, mid-transaction, as soon as the cumulative threshold is crossed.

### Pricing Formula

Each phase has a `pricePerTokenUSDC6` value (price in USDC with 6 decimal places):

| Phase | `pricePerTokenUSDC6` | Human-readable |
|---|---|---|
| 0 | 10,000 | $0.010 / AIC |
| 1 | 13,000 | $0.013 / AIC |
| 2 | 20,000 | $0.020 / AIC |
| 3 | 28,000 | $0.028 / AIC |
| 4 | 38,000 | $0.038 / AIC |
| 5 | 53,000 | $0.053 / AIC |
| 6 | 70,000 | $0.070 / AIC |

The conversion from USDC to AIC:

```
aicAmount = (usdcAmount * 1e18) / pricePerTokenUSDC6
```

For example, spending $100 USDC in Phase 0:

```
aicAmount = (100_000_000 * 1e18) / 10_000
          = 10_000_000_000_000_000_000_000  // 10,000 AIC in base units
          = 10,000 AIC
```

### Buy Transaction Flow

A `buyTokens(usdcAmount)` call follows these steps in order:

```
1. Validate lifecycle: not finalized, timestamp within window, not paused
2. Look up active phase
3. Cap check A: totalRaisedUSDC + usdcAmount <= HARD_CAP (7M)
4. Cap check B: phase.soldTokens + aicAmount <= phase.tokenCap
5. Cap check C: totalAllocatedTokens + aicAmount <= PRESALE_TOKEN_CAP (500M)
6. Transfer USDC from buyer → PresaleVault.routeDeposit()
7. Record allocation: ClaimModule.recordAllocation(buyer, aicAmount)
8. Update accounting: totalRaisedUSDC, contributions[buyer], tokenAllocations[buyer]
9. Emit TokensPurchased(buyer, usdcAmount, aicAmount, phase)
10. If phase boundary crossed: emit PhaseAdvanced(oldPhase, newPhase)
```

Tokens are never transferred to the buyer during this step. Step 7 only records a number in `ClaimModule` storage. The actual AIC transfer happens later, when the buyer calls `ClaimModule.claim()`.

### Anti-Whale Caps

Phase 0 and Phase 1 cap per-wallet contributions:

```
Phase 0: contributions[msg.sender] + usdcAmount <= 25,000 USDC
Phase 1: contributions[msg.sender] + usdcAmount <= 50,000 USDC
Phase 2+: no per-wallet limit
```

The cumulative `contributions[buyer]` counter persists across all phases, so splitting into multiple transactions doesn't bypass the Phase 0/1 caps.

### Pause Mechanism

Admins can pause buying activity. Two constraints prevent indefinite pauses:

- **Single pause cap:** any single pause can last at most **72 hours**
- **Cumulative pause cap:** total paused time across the entire presale cannot exceed **14 days**

After 72 hours of continuous pause, `forceUnpause()` becomes callable by anyone — no admin approval needed. This prevents a compromised or unresponsive admin from locking buyers out permanently.

---

## 4. Fund Routing

### Vault-First Design

On every successful buy, USDC goes to `PresaleVault` before any accounting changes:

```
buyer
  │ USDC
  ▼
PresaleVault.routeDeposit(usdcAmount)
  ├── 70% → LiquidityVault
  ├── 15% → DevRunwayVault
  ├── 10% → TeamStreamVault
  └──  5% → MarketingVault
```

The split happens atomically in the same transaction as the buy. There is no intermediate state where funds sit in the presale contract itself.

### LiquidityVault — Dual-Path Design

The liquidity vault holds 70% of all presale proceeds to fund the DEX launch. It has two withdrawal paths:

**Path A (Primary):**
`LIQUIDITY_EXECUTOR_ROLE` calls `provideLiquidity()`. Available from finalization up to 7 days after.

**Path B (Fallback):**
After 7 days post-finalization, anyone calls `provideLiquidityFallback()`. No role required.

Both paths execute exactly once — `liquidityProvisioned` is a one-way boolean flag. The fallback exists because `ClaimModule.enableClaims()` requires `liquidityProvisioned == true`. Without this fallback, an unresponsive liquidity operator could permanently block all buyers from claiming their tokens.

### DevRunwayVault — Dual Gate

Dev withdrawals are constrained by **both** a time stream and a milestone cap. Whichever is more restrictive applies:

```
withdrawableDev = min(streamedDevAmount(now), milestoneUnlocked(totalRaisedUSDC), devDeposited)
               - devWithdrawn
```

**Time stream:**

```
DEV_MAX_BUDGET = $7M × 15% = $1,050,000
streamedDevAmount = DEV_MAX_BUDGET × min(elapsed / 180 days, 1.0)
```

At presale start + 0 days: 0 unlocked.
At presale start + 90 days: $525,000 unlocked (linear).
At presale start + 180 days: $1,050,000 fully unlocked.

**Milestone cap (amount unlocked by raise level):**

| Raised | Max Dev Access |
|---|---:|
| $500k | $50k |
| $1M | $120k |
| $2M | $250k |
| $3.5M | $420k |
| $5M | $650k |
| $6M | $850k |
| $7M | $1,050k |

If the presale raises $7M on day 1, the milestone cap unlocks the full $1,050,000 — but the time stream constrains withdrawals to only $8,208 on day 1 (1/180 of the maximum). The gates prevent a fast raise from causing a full immediate dev payout.

### TeamStreamVault

Linear release over 365 days from `streamStartTimestamp`. No milestones. No lump-sum. The team can only access what time has proportionally unlocked:

```
streamedAmount = totalDeposited × min(elapsed / 365 days, 1.0)
```

### MarketingVault — Timelock

Marketing funds are completely locked until `presaleFinalized == true`. After finalization, withdrawals require a two-step flow:

```
1. queueWithdrawal(amount)       -- onlyRole(MARKETING_OPERATOR_ROLE)
2. wait withdrawalDelay (48h)
3. executeWithdrawal()           -- onlyRole(MARKETING_OPERATOR_ROLE)
```

The pre-finalization lock is enforced on-chain — there is no admin bypass. Buyers can verify before participating that marketing funds cannot be accessed until the presale completes.

---

## 5. Finalization

### Two Finalization Triggers

```solidity
bool finalizable = (totalRaisedUSDC >= HARD_CAP)
                || (block.timestamp >= PRESALE_END_TIMESTAMP);
```

`PRESALE_END_TIMESTAMP` is immutable — set once at deployment and cannot be changed by any admin. `finalizePresale()` is a permissionless function: anyone can call it once either condition is true.

Finalization:
1. Lifts any active pause
2. Sets `presaleFinalized = true` in all vaults
3. Enables MarketingVault spending
4. Starts the 7-day liquidity provisioning window

### Claims Ordering Constraint

Claims cannot open until both flags are true:

```solidity
function enableClaims() external {
    require(presale.presaleFinalized(), "not finalized");
    require(liquidityVault.liquidityProvisioned(), "liquidity not provisioned");
    claimsEnabled = true;
}
```

This ordering is on-chain, not procedural. The sequence is:

```
presale ends → finalize → provision liquidity → enable claims → buyers claim
```

No step can be skipped.

---

## 6. Token Vesting and Claiming

### Vesting Schedule

Presale buyers receive AIC in three tranches relative to the Token Generation Event (TGE):

| Checkpoint | Cumulative Unlocked |
|---|---:|
| TGE | 30% |
| TGE + 90 days | 65% |
| TGE + 180 days | 100% |

Between checkpoints, the unlock is linearly interpolated. For example, at TGE + 45 days: `30% + (45/90) × 35% = 47.5%`.

### How Claiming Works

```solidity
function claimableAmount(address user) public view returns (uint256) {
    uint256 vested = totalAllocation[user] * vestedBps() / 10_000;
    return vested - totalClaimed[user];
}
```

`vestedBps()` returns a basis-point value (0–10000) representing the current unlock percentage. It's a pure time calculation — no oracle, no admin input.

`claim()` transfers `claimableAmount(msg.sender)` of AIC from `ClaimModule`'s balance to the caller and increments `totalClaimed[msg.sender]`. Unclaimed amounts from earlier tranches accumulate — buyers don't lose access by waiting.

---

## 7. Staking and Inference Discounts

> **Status:** planned, not yet deployed. The staking contract interface and discount tiers are defined; implementation is Tier 1 on the roadmap.

### How Staking Will Work

A separate staking contract will implement:

```solidity
interface IAICStaking {
    function stakedBalance(address account) external view returns (uint256);
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function withdraw() external;
}
```

Users lock AIC in this contract. The inference API reads `stakedBalance(userAddress)` at payment time to determine the applicable discount tier.

### Discount Tier Lookup

| Staked AIC | Discount | Rate at $0.001/s default |
|---|---:|---:|
| 0 | 0% | $0.001000 / sec |
| ≥ 1,000 | 10% | $0.000900 / sec |
| ≥ 10,000 | 20% | $0.000800 / sec |
| ≥ 50,000 | 35% | $0.000650 / sec |
| ≥ 200,000 | 50% | $0.000500 / sec |

### How It Integrates with x402 Payments

Inference is paid per-second of compute via the [x402 protocol](/docs/app/overview). The payment authorization (an EIP-3009 `transferWithAuthorization` signature) is for a specific USDC amount calculated before the model runs:

```
estimatedDuration = modelProfile.estimatedSeconds
appliedRate = baseRate * (1 - discountPct)
paymentAmount = estimatedDuration * appliedRate
```

The signed authorization is submitted to the x402 facilitator. If actual inference time differs from the estimate, the actual cost is recorded in the database (`actual_cost_usdc`), but the authorized amount is what gets settled on-chain.

When the staking contract is live, the inference API will:
1. Read `IAICStaking.stakedBalance(userAddress)` at request time
2. Look up the applicable tier
3. Calculate the discounted rate
4. Record `stakedAicAtTime` and `discountPct` in the inference record

---

## 8. End-to-End Flow

```
[Presale Phase]
Buyer → buyTokens(USDC) → PresaleVault routes split
                        → ClaimModule.recordAllocation(buyer, AIC)

[Post-Finalization]
Anyone → finalizePresale()
Operator → LiquidityVault.provideLiquidity()  (or permissionless fallback after 7d)
Anyone → ClaimModule.enableClaims()

[Claim Phase]
Buyer → ClaimModule.claim()
      ← receives unlocked AIC based on vesting schedule

[Governance]
Holder → AIC.delegate(self or delegate)
       → participates in on-chain governance votes

[Inference]
User → stake AIC in IAICStaking
     → calls inference API with x402 payment signature
     → API checks stakedBalance, applies discount tier
     → pays discounted rate per second of compute
```

---

## 9. Key Security Properties

| Property | Mechanism |
|---|---|
| Supply immutability | No mint function; supply validated at construction |
| Flash loan governance resistance | `getPastVotes` uses historical block snapshots |
| Admin cannot block claims | LiquidityVault has permissionless fallback; enables claims permissionlessly |
| Admin cannot close presale early | `finalizePresale()` conditions are time or cap, no admin-close path |
| Admin cannot spend marketing pre-finalization | MarketingVault checks `presaleFinalized` before allowing any withdrawal |
| Pause cannot be indefinite | 72h single cap + 14d cumulative cap, with permissionless `forceUnpause` |
| Dev cannot extract funds immediately | Dual gate: time stream AND milestone cap, whichever is lower |
