---
title: Presale Architecture
description: Complete technical architecture of the WebAI3 7-phase fund-driven presale system.
section: Token (AIC)
order: 3
---

## Executive Summary

The WebAI3 presale is a 7-phase, fund-driven token sale with vault-first fund routing and a mandatory ordering constraint before claims open. All finalization and liquidity fallback paths are **permissionless** — no admin can block or indefinitely delay buyer access to tokens.

### Core Properties

- Vault-first routing for all presale funds
- Permissionless finalization (time-based or hard cap)
- Liquidity provisioning before claims — enforced on-chain
- Dual-gated dev unlock (milestone cap + linear stream)
- Bounded pause mechanism (max 72h single, 14 days cumulative)
- Mandatory 3-tranche vesting for all presale buyers
- 7-day fallback path if liquidity operator is unavailable

## Architecture Diagram

```
Users
  │
  ▼
WebAI3Presale (phase pricing, accounting, finalization)
  │
  ▼
PresaleVault (mandatory split on each buy)
  ├── LiquidityVault   [70%]  → DEX liquidity provisioning
  ├── DevRunwayVault   [15%]  → milestone cap + linear stream
  ├── TeamStreamVault  [10%]  → linear stream over 365 days
  └── MarketingVault   [5%]   → locked pre-finalization, then timelock

ClaimModule
  └── claimsEnabled only after liquidityProvisioned == true
```

## Fund Routing

### Split Per Buy — 70 / 15 / 10 / 5

| Vault | Allocation | Purpose |
|---|---:|---|
| LiquidityVault | 70% | Launch liquidity depth and price stability |
| DevRunwayVault | 15% | Controlled R&D runway |
| TeamStreamVault | 10% | Team operational stream |
| MarketingVault | 5% | Post-finalization GTM budget |

At hard cap ($7,000,000): LiquidityVault receives **$4,900,000 USDC**. At listing target $0.12, paired AIC side target is ~40,833,333 AIC. Buyers can only claim 30% at TGE — reducing immediate sell pressure.

## Presale Phases

### 7-Phase Fund-Driven Schedule

| Phase | Cumulative Raise | Price | Token Cap (AIC) | Duration |
|---:|---|---:|---:|---:|
| 1 | $0 – $500k | $0.010 | 50,000,000 | 14 days |
| 2 | $500k – $1M | $0.013 | 38,500,000 | 14 days |
| 3 | $1M – $2M | $0.020 | 50,000,000 | 14 days |
| 4 | $2M – $3.5M | $0.028 | 53,600,000 | 21 days |
| 5 | $3.5M – $5M | $0.038 | 39,500,000 | 21 days |
| 6 | $5M – $6M | $0.053 | 18,900,000 | 21 days |
| 7 | $6M – $7M | $0.070 | 249,500,000 | 35 days |
| **Total** | | | **500,000,000** | |

Phase advances happen automatically when the cumulative raise cap is hit (e.g., when `totalRaisedUSDC >= 500,000` the system switches from Phase 1 pricing to Phase 2 pricing). The contract uses a strict `<` comparison, so the transition at exactly `500,000` moves cleanly to Phase 2.

### Anti-Whale Caps

- Phase 1: max `25,000 USDC` per wallet
- Phase 2: max `50,000 USDC` per wallet
- Phase 3+: no per-wallet cap

## Vault Policies

### LiquidityVault — Liveness-Safe

The vault has two provisioning paths to guarantee it can never be permanently blocked:

**Path A (Primary):** `LIQUIDITY_EXECUTOR_ROLE` calls `provideLiquidity()` within 7 days of finalization.

**Path B (Fallback):** After 7 days, anyone calls `provideLiquidityFallback()` — no role required.

Both paths can execute exactly once (`liquidityProvisioned` is a one-way flag). Both call the same internal logic and transfer the full USDC balance to the `liquidityRecipient` address.

### DevRunwayVault — Dual-Gated Unlock

Dev withdrawals require both conditions to be satisfied:

```
withdrawableDev = max(0,
  min(milestoneUnlocked(totalRaisedUSDC), streamedDevAmount(now), devDeposited)
  - devWithdrawn
)
```

**Stream formula:**
```
DEV_MAX_BUDGET = HARD_CAP × 15% = 1,050,000 USDC
streamedDevAmount(now) = DEV_MAX_BUDGET × min(elapsed / 180 days, 1)
```

**Milestone caps:**

| Cumulative Raised | Max Milestone-Unlocked Dev |
|---|---:|
| $500k | $50k |
| $1M | $120k |
| $2M | $250k |
| $3.5M | $420k |
| $5M | $650k |
| $6M | $850k |
| $7M | $1,050k |

A fast raise cannot drain the full dev budget immediately — the time-based stream is always the binding constraint in the early weeks.

### TeamStreamVault

Linear stream over 365 days from presale start. No lump-sum function. The team can only claim what has streamed.

### MarketingVault — Full Pre-Finalization Lock

- `marketingWithdrawable = 0` while `presaleFinalized == false`
- After finalization: full balance available with a **2-day timelock** (queue → wait → execute)
- No admin or owner bypass of the pre-finalization lock

This design lets buyers verify that marketing funds cannot be spent before the sale completes — the lock is enforced on-chain, not by policy.

## Finalization

### Permissionless Finalization Condition

```
finalizable = (totalRaisedUSDC >= HARD_CAP)
           OR (block.timestamp >= PRESALE_END_TIMESTAMP)
```

`PRESALE_END_TIMESTAMP` is **immutable** — set once at deployment and cannot be changed. No owner-only close function exists. Anyone can call `finalizePresale()` once either condition is true.

### State Machine

```
NotInitialized → Active
Active ⇄ Paused (bounded: max 72h single, 14d cumulative)
Active/Paused → Finalized (permissionless)
Finalized → LiquidityPending
LiquidityPending → LiquidityProvisioned (operator, within 7 days)
LiquidityPending → LiquidityFallbackOpen (anyone, after 7 days)
LiquidityFallbackOpen → LiquidityProvisioned (permissionless fallback)
LiquidityProvisioned → ClaimsEnabled
```

### Claims Ordering

`enableClaims()` requires both:

1. `presaleFinalized == true` — confirmed presale ended
2. `liquidityProvisioned == true` — liquidity is seeded

This ordering is enforced on-chain. The claim window cannot open before liquidity is provisioned.

## Vesting Schedule

| When | Amount |
|---|---:|
| TGE | 30% |
| TGE + 90 days | 35% (65% cumulative) |
| TGE + 180 days | 35% (100% cumulative) |

Buyers can claim at any time after each unlock — the contract accumulates unclaimed amounts across tranches.

## Security Controls

### Role Set

| Role | Capability |
|---|---|
| `PAUSER_ROLE` | Pause/unpause buys within bounded limits |
| `LIQUIDITY_EXECUTOR_ROLE` | Primary liquidity path before fallback deadline |
| `VAULT_MULTISIG_ROLE` | Dev/team/marketing vault withdrawals per policy |
| `DEFAULT_ADMIN_ROLE` | Role management only — no finalization bypass |

### Critical Non-Bypass Rules

- No privileged route to set `liquidityProvisioned` without real LP execution
- No route to enable claims before liquidity provisioning
- No route to spend MarketingVault pre-finalization
- No admin early-close path

## Reference Constants

| Constant | Value |
|---|---|
| `HARD_CAP` | `7,000,000e6` USDC |
| `PRESALE_TOKEN_CAP` | `500,000,000e18` AIC |
| `ROUTING_SPLIT` | 70 / 15 / 10 / 5 |
| `PRESALE_VESTING` | 30% / 35% / 35% |
| `DEV_STREAM_DURATION` | 180 days |
| `MAX_SINGLE_PAUSE` | 72 hours |
| `MAX_CUMULATIVE_PAUSE` | 14 days |
| `MAX_LIQUIDITY_DELAY` | 7 days |
