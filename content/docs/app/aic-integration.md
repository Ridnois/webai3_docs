---
title: AIC Integration
description: Technical specification for integrating the AIC token into the inference app — staking discounts, AIC-as-payment, burn mechanics, and access gating.
section: Inference App
order: 2
---

## Current Architecture Baseline

### Authentication

Users authenticate via SIWE (EIP-4361). Session stores only `{ address, chainId }` — no private keys. Sessions are encrypted HTTP-only cookies via `iron-session`.

### Inference Payment Flow

```
1. Client → POST /api/inference/estimate
           ← { estimatedCostUsdc, estimatedSeconds }

2. Client → POST /api/inference  (no Payment-Signature header)
           ← 402 Payment Required

3. Client signs EIP-712 TransferWithAuthorization (EIP-3009)

4. Client → POST /api/inference  (with Payment-Signature header)
   a. Validate payment payload (Zod)
   b. Verify with x402 facilitator
   c. Settle on-chain USDC transfer
   d. Run Replicate inference  ← AFTER settlement
   e. Upload to R2 (if media)
   f. INSERT into inferences table
   ← 200 { id, output, status, metrics }
```

### Pricing

`src/lib/pricing.ts` computes costs from time:

```ts
estimateCostUsdc(task, ratePerSec, overrideSeconds?)
actualCostUsdc(predictTimeMs, ratePerSec)
```

Default rate: `$0.001 USDC / second`. The server queries historical average `predict_time_ms` per model for accurate estimates.

## Tier 1 — Staking Discounts

### Overview

1. **Hold AIC → stake it → get a lower inference rate.** Stakers pay less per second of compute.
2. **Pay with AIC instead of USDC.** AIC holders can route payment through AIC rather than stablecoin.

Both independently increase demand to hold AIC.

### Required: AIC Staking Contract

A new `AICStak.sol` contract must be deployed. Minimum interface:

```solidity
interface IAICStaking {
    function stakedBalance(address account) external view returns (uint256);
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function withdraw() external;
}
```

The address becomes `NEXT_PUBLIC_AIC_STAKING_ADDRESS` (client) and `AIC_STAKING_ADDRESS` (server).

### Discount Tiers

| Staked AIC | Discount | Effective rate (at $0.001/s) |
|---|---|---|
| 0 | 0% | $0.001000 / sec |
| ≥ 1,000 | 10% | $0.000900 / sec |
| ≥ 10,000 | 20% | $0.000800 / sec |
| ≥ 50,000 | 35% | $0.000650 / sec |
| ≥ 200,000 | 50% | $0.000500 / sec |

### Implementation: `src/lib/pricing.ts`

```ts
const DISCOUNT_TIERS = [
  { minStaked: 200_000, discount: 0.50 },
  { minStaked:  50_000, discount: 0.35 },
  { minStaked:  10_000, discount: 0.20 },
  { minStaked:   1_000, discount: 0.10 },
] as const;

export function discountMultiplier(stakedAic: number): number {
  for (const tier of DISCOUNT_TIERS) {
    if (stakedAic >= tier.minStaked) return 1 - tier.discount;
  }
  return 1;
}

export function discountedRate(baseRatePerSec: number, stakedAic: number): number {
  return roundUsdc(baseRatePerSec * discountMultiplier(stakedAic));
}
```

### Implementation: `src/lib/staking.ts` (server-side)

The server reads staked balance on-chain via viem (no wagmi on the server):

```ts
export async function readStakedAic(
  userAddress: Address,
  chainId: number
): Promise<number> {
  const env = getServerEnv();
  if (!env.AIC_STAKING_ADDRESS) return 0;

  const client = createPublicClient({ chain, transport: http(rpcUrl) });
  const raw = await client.readContract({
    address: env.AIC_STAKING_ADDRESS as Address,
    abi: STAKING_ABI,
    functionName: "stakedBalance",
    args: [userAddress],
  });
  return Number(raw) / 1e18;
}
```

On failure (RPC error, contract not deployed), returns `0` — user is not blocked.

### Applying the Discount in the Route Handler

```ts
// In src/app/api/inference/route.ts
const stakedAic = await readStakedAic(auth.address as Address, chainId)
  .catch((e) => { console.error("[inference] staking read failed:", e); return 0; });

const ratePerSec = discountedRate(parseFloat(env.INFERENCE_RATE_PER_SEC), stakedAic);
// All subsequent cost calculations use this discounted ratePerSec
```

### Schema Additions

```ts
// src/lib/db/schema.ts
stakedAicAtTime:   numeric("staked_aic_at_time",   { precision: 30, scale: 18 }),
discountPct:       numeric("discount_pct",           { precision: 5,  scale: 2  }),
effectiveRateUsdc: numeric("effective_rate_usdc",    { precision: 18, scale: 9  }),
```

## AIC-as-Payment

### Design Constraints

The current x402 flow wraps USDC's EIP-3009 `transferWithAuthorization`. AIC implements EIP-2612 (`permit`) but **not** EIP-3009.

**Recommended approach (Option B):** Upgrade `WebAI3Token` to also implement EIP-3009, or deploy a thin wrapper. This keeps the x402 integration uniform — same path, different asset address.

### Dual-Asset Payment Requirement

Extend `src/lib/x402.ts` to emit two entries in `accepts[]`:

```ts
accepts: [
  {
    scheme: "exact",
    network,
    asset: usdcConfig.address,
    amount: usdcAmountOnChain.toString(),
    payTo: env.RECEIVER_ADDRESS,
    maxTimeoutSeconds: 60,
    extra: { name: "USD Coin", version: "2" },
  },
  ...(aicConfig ? [{
    scheme: "exact",
    network,
    asset: aicConfig.tokenAddress,
    amount: aicAmountOnChain.toString(),
    payTo: env.RECEIVER_ADDRESS,
    maxTimeoutSeconds: 60,
    extra: { name: "WebAI3 Token", version: "1" },
  }] : []),
],
```

The client selects the preferred asset and signs the appropriate EIP-712 domain.

### AIC Pricing

AIC is not a stablecoin. Rate sources (ordered by preference):

1. On-chain TWAP from a Uniswap v3 AIC/USDC pool (most decentralized)
2. Off-chain price API (CoinGecko, CoinMarketCap)
3. Fixed admin-set rate via `AIC_USDC_RATE` env var (simplest for early rollout)

Use option 3 initially; graduate to on-chain TWAP once the liquidity pool is established.

## Tier 2 — Burn-on-Use + Access Gating

### Burn-on-Use

When a user pays in AIC, a configurable percentage (e.g., 20%) is burned permanently:

```solidity
contract AICSplitter {
    address public immutable treasury;
    uint256 public immutable burnBps;  // e.g. 2000 = 20%

    function split(IERC20Burnable token, uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        uint256 burnAmount = amount * burnBps / 10_000;
        token.burn(burnAmount);
        token.transfer(treasury, amount - burnAmount);
    }
}
```

> **Note:** This requires adding a `burn(uint256)` function to `WebAI3Token`. The current contract does not have one. This is a new deployment or wrapper — the existing contract is immutable.

Burn rate controlled by `AIC_BURN_BPS` env var (integer 0–10000). Future: put on-chain for AIC governance vote.

### Access Gating

Three model tiers with AIC requirements:

| Tier | AIC Required | Examples |
|---|---|---|
| Free | 0 AIC | Base Stable Diffusion, small LLMs |
| Standard | ≥ 500 AIC held | Mid-range diffusion, mid-size LLMs |
| Premium | ≥ 5,000 AIC staked | SDXL, large LLMs, high-quality audio |

"Held" = raw wallet balance (`balanceOf`). "Staked" = locked in staking contract (`stakedBalance`).

### Gating Logic: `src/lib/access.ts`

```ts
const TIER_REQUIREMENTS = {
  free:     { heldAic: 0,     stakedAic: 0     },
  standard: { heldAic: 500,   stakedAic: 0     },
  premium:  { heldAic: 0,     stakedAic: 5_000 },
};

export function hasAccess(
  tier: ModelTier,
  heldAic: number,
  stakedAic: number
): boolean {
  const req = TIER_REQUIREMENTS[tier];
  return heldAic >= req.heldAic && stakedAic >= req.stakedAic;
}
```

The server is the authoritative gate — client-side gating is UI-only.

### Rate Limit Tiers

```ts
const RATE_LIMITS = {
  free:     { windowMs: 60_000, max: 5  },
  standard: { windowMs: 60_000, max: 20 },
  premium:  { windowMs: 60_000, max: 60 },
};
```

## Implementation Order

1. Deploy the AIC staking contract (prerequisite for everything)
2. Add discount tiers in `pricing.ts` + server-side staking read
3. Show AIC balance + stake info in the wallet UI
4. Add model tier annotations + client-side lock UI (UI only, no enforcement yet)
5. Deploy on testnet, validate discount math with real staked balances
6. Enforce gating server-side once tier assignments are finalized
7. Add EIP-3009 support to `WebAI3Token` for AIC payments
8. Update x402 flow to support dual-asset `accepts[]`
9. Deploy splitter contract, wire `AIC_BURN_BPS`
10. Add `aicBurnedAmount` to stats API and surface on landing/dashboard

## Environment Variables (Complete Post-Integration)

### Client

```
NEXT_PUBLIC_ETHEREUM_RPC_URL
NEXT_PUBLIC_SEPOLIA_RPC_URL
NEXT_PUBLIC_AIC_TOKEN_ADDRESS        # AIC token address
NEXT_PUBLIC_AIC_STAKING_ADDRESS      # Staking contract address
```

### Server

```
REPLICATE_API_TOKEN
DATABASE_URL
SESSION_SECRET
RECEIVER_ADDRESS
INFERENCE_RATE_PER_SEC               # Base rate, default 0.001
X402_FACILITATOR_URL
AIC_TOKEN_ADDRESS                    # Server-side balance reads
AIC_STAKING_ADDRESS                  # Server-side staked balance reads
AIC_USDC_RATE                        # AIC per 1 USDC (e.g. "10" = $0.10/AIC)
AIC_BURN_BPS                         # Basis points burned on AIC payment
```
