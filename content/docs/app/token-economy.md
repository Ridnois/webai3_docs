---
title: Token Economy in the Inference App
description: How AIC integrates into the inference platform — staking discounts, native token payments, burn mechanics, and the economic flywheel that connects token holders to inference demand.
section: Inference App
order: 3
---

## The Problem with Pure USDC Payments

The baseline inference app settles every request in USDC at a flat rate of `$0.001 / second`. This works for anonymous users who just want to run a model, but it creates no reason to hold AIC. Every buyer from the presale has tokens that — without this integration — sit idle after the TGE.

The token economy solves this by making AIC ownership and usage **measurably cheaper** than paying in stablecoin, and by creating a compounding reason to stake rather than sell.

---

## Payment Modes

There are two ways to pay for inference in the app.

### Mode 1 — USDC (default)

The standard x402 flow. The server issues an HTTP 402 challenge, the client signs an EIP-3009 `TransferWithAuthorization` message, and the facilitator settles the on-chain USDC transfer before inference runs. No AIC is involved.

**Cost example** — a text-to-image request at 10 seconds:

```
base rate:    $0.001000 / sec
duration:     10 seconds
cost:         $0.0100 USDC
```

### Mode 2 — AIC (native token payment)

Users with AIC in their wallet can opt to pay in the native token. AIC implements EIP-2612 (`permit`) and will be upgraded to support EIP-3009 (`transferWithAuthorization`) to keep the payment path uniform with USDC.

The server includes two entries in the `accepts[]` array of the 402 challenge — one for USDC, one for AIC. The client picks its preferred asset and signs the corresponding authorization.

**AIC pricing:** AIC is not a stablecoin. The server converts the USD cost to an AIC amount using an operator-configured rate (`AIC_USDC_RATE`) initially, graduating to a Uniswap v3 on-chain TWAP once the AIC/USDC pool is live.

```
usdc cost:          $0.0100
aic/usdc rate:      $0.10 per AIC (example)
aic amount charged: 0.10 AIC
```

### Burn-on-use

When a user pays in AIC, the received tokens are split:

| Portion | Destination |
|---|---|
| `burnBps` (e.g. 20%) | Burned permanently (`token.burn()`) |
| Remainder | Protocol treasury |

At 20% burn: every $1 of inference value paid in AIC permanently removes $0.20 of token supply. Burn rate is controlled by the `AIC_BURN_BPS` env var (range 0–10000) and can later be governed on-chain by AIC holders.

---

## Staking

Staking is the primary incentive to hold and commit AIC long-term. Stakers lock tokens in a dedicated `AICStak.sol` contract in exchange for a lower per-second inference rate applied to every request they make.

### How staking works

```
1. User calls AICStak.stake(amount)
   → AIC is transferred from wallet to staking contract
   → stakedBalance(userAddress) increases

2. User makes an inference request
   → Server reads stakedBalance(userAddress) via viem
   → Server computes discounted rate from the staking tier table
   → Discounted rate applied to the 402 challenge amount

3. User calls AICStak.unstake(amount)
   → Tokens enter a cooldown period
   → User calls AICStak.withdraw() after cooldown
   → AIC returns to wallet
```

The server is the authoritative source — discount is computed on the API side using the staked balance read at request time, not trusted input from the client.

### Discount tiers

| Staked AIC | Discount | Effective rate (base $0.001/s) |
|---|---|---|
| 0 | 0% | $0.001000 / sec |
| ≥ 1,000 | 10% | $0.000900 / sec |
| ≥ 10,000 | 20% | $0.000800 / sec |
| ≥ 50,000 | 35% | $0.000650 / sec |
| ≥ 200,000 | 50% | $0.000500 / sec |

The discount applies regardless of which payment method the user chooses (USDC or AIC). Staking reduces the USD-equivalent cost — it just means fewer USDC or fewer AIC tokens are charged per request.

### Concrete savings example

A power user running 500 inference seconds per month:

| Staked | Rate | Monthly cost | Savings vs unstaked |
|---|---|---|---|
| 0 | $0.001000 / sec | $0.50 | — |
| 1,000 | $0.000900 / sec | $0.45 | $0.05 (10%) |
| 10,000 | $0.000800 / sec | $0.40 | $0.10 (20%) |
| 50,000 | $0.000650 / sec | $0.325 | $0.175 (35%) |
| 200,000 | $0.000500 / sec | $0.25 | $0.25 (50%) |

At scale (developers, agents running thousands of seconds per month), the savings become significant enough to justify acquiring and staking AIC rather than paying the flat rate indefinitely.

---

## Model Access Tiers

In addition to pricing discounts, AIC balance unlocks access to more capable models. Holding AIC is enough for the Standard tier; staked AIC is required for Premium.

| Tier | AIC Requirement | Examples |
|---|---|---|
| Free | 0 AIC | Base Stable Diffusion, small LLMs |
| Standard | ≥ 500 AIC held | Mid-range diffusion, mid-size LLMs |
| Premium | ≥ 5,000 AIC staked | SDXL, large LLMs, high-quality audio |

"Held" checks the wallet's `balanceOf`. "Staked" checks the staking contract's `stakedBalance`. The server is the authoritative gate — client-side model lock UI is UX only.

---

## USDC vs AIC — Side-by-Side Comparison

| | USDC | AIC |
|---|---|---|
| **Stability** | Pegged to $1 | Volatile — price fluctuates |
| **Discount from staking** | Yes (same tiers) | Yes (same tiers) |
| **Burn mechanics** | No | Yes (20% burned on every AIC payment) |
| **Rate source** | Fixed $0.001/s (env var) | Converted via AIC/USDC rate (TWAP eventually) |
| **Settlement** | EIP-3009 + facilitator | EIP-3009 (after token upgrade) + facilitator |
| **Best for** | Casual users, agents without AIC | AIC holders wanting to reduce net cost and support deflation |

**Choosing AIC is not just cheaper — it's deflationary.** Each AIC payment reduces total supply, which benefits all remaining holders, including the user making the request.

---

## End-to-End Workflow

### New user — USDC payment

```
1. Wallet connect (wagmi)
2. SIWE sign-in → session cookie
3. POST /api/inference/estimate
   ← { estimatedCostUsdc: 0.010, estimatedSeconds: 10 }
4. POST /api/inference  (no payment header)
   ← 402 { accepts: [{ asset: USDC, amount: "10000" }] }
5. Client signs EIP-712 TransferWithAuthorization for 0.01 USDC
6. POST /api/inference  (with Payment-Signature header)
   Server:
     a. Validate + verify with facilitator
     b. Settle on-chain USDC transfer
     c. Run Replicate model
     d. Upload output to R2
     e. INSERT inference record
   ← 200 { id, output, status }
```

### AIC holder with staked tokens

```
1. Wallet connect + SIWE sign-in
2. User goes to Wallet panel → stakes 10,000 AIC
   → calls AICStak.stake(10_000 * 1e18)
   → stakedBalance(address) = 10,000

3. POST /api/inference/estimate
   Server:
     a. readStakedAic(address) → 10,000
     b. discountedRate(0.001, 10_000) → 0.0008
   ← { estimatedCostUsdc: 0.008, estimatedSeconds: 10 }

4. POST /api/inference  (no payment header)
   Server builds 402 challenge with discounted amounts:
   ← 402 {
       accepts: [
         { asset: USDC, amount: "8000" },   // 0.008 USDC
         { asset: AIC,  amount: "80000000000000000" }, // 0.08 AIC at $0.10/AIC
       ]
     }

5. Client selects AIC, signs EIP-712 TransferWithAuthorization
6. POST /api/inference  (with Payment-Signature header)
   Server:
     a. Validate AIC payment payload
     b. Verify with facilitator
     c. Settle on-chain AIC transfer
     d. Split: 20% burned, 80% to treasury
     e. Run Replicate model
     f. INSERT inference record with:
          staked_aic_at_time = 10000
          discount_pct = 20.00
          effective_rate_usdc = 0.000800
   ← 200 { id, output, status }
```

### Inference failure after settlement

Settlement is irrevocable. If Replicate fails after the on-chain transfer:

```
Server:
  c. Replicate.run() throws
  d. INSERT inference record with status = "failed", payment_tx_hash = <hash>
← 500 { error: "inference failed", inferenceId: <id> }
```

The payment tx hash is stored in the inference record for investigation and potential manual refund. Automatic refunds are not implemented — this is a known tradeoff of pre-settlement payment.

---

## The Economic Flywheel

The three mechanics — staking discounts, AIC payments, and burn — reinforce each other:

```
Presale buyers receive AIC
         │
         ▼
Stake AIC in inference app
         │
    Lower per-request cost
         │
     More inference usage
         │
  More AIC payments accepted
         │
      AIC supply decreases (burn)
         │
  Remaining supply more scarce
         │
  Higher AIC/USDC rate (if demand holds)
         │
  Discount in USDC terms grows for stakers
         │
    Incentive to stake AIC grows
         │
         └──────────────────── (loop)
```

The burn is the key link. Without it, AIC payments just move tokens from users to treasury — no supply pressure. With burn, every inference paid in AIC permanently removes tokens, creating a deflationary force proportional to network usage.

---

## Implementation Status

| Feature | Status |
|---|---|
| USDC payment via x402 | Implemented |
| Staking contract (`AICStak.sol`) | Planned |
| Server-side staked balance read | Planned |
| Discount tier application in pricing | Planned |
| AIC EIP-3009 support (for payment) | Planned — requires `WebAI3Token` upgrade |
| Dual-asset `accepts[]` in 402 challenge | Planned |
| Burn splitter contract (`AICSplitter.sol`) | Planned |
| Uniswap v3 TWAP for AIC/USDC rate | After liquidity pool launch |
| Model access gating (server-side) | Planned |

Full implementation detail — code snippets, contract interfaces, env vars — in [AIC Integration](/docs/app/aic-integration).
