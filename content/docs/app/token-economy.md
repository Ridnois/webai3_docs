---
title: AIC in the Inference App
description: How holding and staking AIC makes every AI request cheaper, unlocks better models, and creates a self-reinforcing economy where using the platform benefits every token holder.
section: Inference App
order: 3
---

## The short version

AIC is the native token of the WebAI3 ecosystem. In the inference app, it does three concrete things for you:

1. **Stake it → pay less for every AI request.** Lock AIC in the staking contract and the app automatically charges you a lower rate on every inference — whether you pay in USDC or AIC.
2. **Use it to pay directly → burn some of it in the process.** When you pay with AIC instead of USDC, a portion of those tokens is destroyed forever. Less supply, same demand — that's good for everyone holding AIC.
3. **Hold it → get access to better models.** Some of the more capable AI models are gated behind an AIC balance. You don't need to do anything special — just hold AIC in your connected wallet.

None of this is points, credits, or loyalty tiers in a database. Every benefit is enforced on-chain, in real time, against your actual wallet.

---

## Why AIC in the first place?

Without a token, the inference app is a simple vending machine: you put USDC in, you get AI output out. That works fine, but it means every dollar you spend on inference is gone — there's no reason to stay, no incentive to participate in the ecosystem, and no connection between your usage and the protocol's growth.

AIC changes the relationship. When you hold and stake AIC:

- Your inference costs go down the longer you stay
- The tokens you spend on AI requests don't just move to someone else — a portion disappear from existence, which benefits everyone who holds the rest
- You get access to better models that casual users can't touch
- You have a say in how the protocol evolves (governance is built into the token)

The goal is a system where **heavy users of the platform are also the people most incentivized to hold and stake the token**, and where the token becomes more valuable precisely because the platform gets used more.

---

## How paying for inference works

Every AI request costs a small amount of compute time — measured in seconds. The default rate is `$0.001 per second`. A typical text-to-image request takes about 10 seconds, so it costs roughly **$0.01**.

You can pay in two ways.

### Pay with USDC

USDC is a dollar-pegged stablecoin. You always know exactly what you're paying. Connect your wallet, approve the transaction, and the inference runs. Clean and predictable.

This is the default option and works for anyone, even if they've never heard of AIC.

### Pay with AIC

If you hold AIC, you can choose to pay with it instead. The app calculates the USD cost of your request, converts it to the equivalent amount of AIC at the current market rate, and charges that amount from your wallet.

The difference: **when you pay with AIC, 20% of those tokens are burned on the spot.** They don't go to a treasury, they don't go to anyone — they're permanently removed from the total supply. The remaining 80% goes to the protocol.

This matters because the total supply of AIC is fixed at 1 billion and never increases. Every time someone pays for inference with AIC, the circulating supply shrinks a little. If usage grows, the burn compounds.

---

## Staking — the main lever

Staking is the simplest and most direct way to get value from AIC in the app. You lock tokens into the staking contract, and from that moment on, every inference request you make is automatically cheaper.

### How to stake

1. Go to the Wallet panel inside the app
2. Choose how much AIC to stake and confirm the transaction
3. Your tokens move from your wallet to the staking contract — they're still yours, just locked
4. Every request you make from that point will use your discounted rate automatically
5. When you want them back, you request unstaking, wait out the cooldown, and withdraw

You don't need to do anything special per request. The app reads your staked balance on-chain when you hit the API, and the price you see is already discounted.

### What the discount looks like

| AIC staked | Discount | Rate per second | Cost per 10s request |
|---|---|---|---|
| Nothing | 0% | $0.001000 | $0.0100 |
| 1,000 AIC | 10% | $0.000900 | $0.0090 |
| 10,000 AIC | 20% | $0.000800 | $0.0080 |
| 50,000 AIC | 35% | $0.000650 | $0.0065 |
| 200,000 AIC | 50% | $0.000500 | $0.0050 |

Half price. That's a real, permanent reduction that applies to every single request for as long as your tokens are staked.

### Does staking pay off?

It depends how much you use the platform. At 500 inference seconds per month — which isn't a lot for a developer or anyone building on top of the API — here's what the savings look like:

| AIC staked | Monthly cost | You save vs unstaked |
|---|---|---|
| 0 | $0.50 | — |
| 1,000 | $0.45 | $0.05 |
| 10,000 | $0.40 | $0.10 |
| 50,000 | $0.325 | $0.175 |
| 200,000 | $0.25 | $0.25 |

For an individual running occasional requests, the savings are modest. For a developer making hundreds of requests a day, or an autonomous agent running inference continuously, staking at the top tier literally cuts the operating cost in half.

---

## Model access tiers

Not all AI models are available to everyone. The more capable models — SDXL, large language models, high-quality audio generation — require AIC to access.

| Access level | What you need | What it unlocks |
|---|---|---|
| **Free** | Nothing — just a wallet | Base image models, small text models |
| **Standard** | Hold ≥ 500 AIC in your wallet | Better diffusion models, mid-size LLMs |
| **Premium** | Stake ≥ 5,000 AIC | SDXL, large LLMs, high-quality audio |

"Hold" means the tokens can just sit in your wallet. "Stake" means they need to be locked in the staking contract.

If you staked 5,000 AIC to hit Premium, those same tokens are also earning you a 10% discount (you'd be in the 1,000 tier — a bit above it, but the discount applies from whatever tier your staked amount falls into).

The app checks your balance on-chain when you make a request. There's no registration, no approval process — the access is a direct consequence of what's in your wallet.

---

## USDC vs AIC — which should you use?

| | Pay with USDC | Pay with AIC |
|---|---|---|
| Predictability | Exact dollar amount every time | Amount varies with AIC price |
| Staking discount | Yes — applies to both | Yes — applies to both |
| Burn effect | No | 20% of payment destroyed permanently |
| Best for | Casual use, low frequency | AIC holders who want to reduce net supply and support the ecosystem |

Staking discounts work the same regardless of which token you pay with. The distinction is whether you want to participate in the deflationary mechanic.

If you're a long-term AIC holder, paying with AIC rather than USDC makes sense: you're spending tokens that were always going to be used anyway, and you're taking a small amount of supply off the table in the process.

---

## Seeing the full picture

Here's how a user who has staked AIC experiences the app from start to finish:

**First time setup**

You connect your wallet and sign in. Nothing about this is different from any Web3 app. Then, from the Wallet panel, you open the staking interface, choose an amount, and confirm the transaction. Your staked balance is now on-chain. Done.

**Running a request**

You type a prompt or select a model. Before you confirm, the app shows you an estimated cost — this number is already your discounted price, based on your staked balance. You see `$0.0080` instead of `$0.0100` because you staked 10,000 AIC.

You can choose to pay in USDC or AIC. You click confirm. The payment happens on-chain first. Then the model runs. Your output appears.

If you paid with AIC: 20% of those tokens were just burned. The other 80% went to the protocol. The inference record in the app's database logs your staked balance at the time, the discount applied, and the effective rate — you can see this in your request history.

**Getting tokens back**

When you want to unstake, you request it from the Wallet panel. After a cooldown period, you can withdraw your AIC back to your wallet. Your discount drops back to whatever tier your remaining stake (if any) earns.

---

## The bigger picture — why this creates a healthy economy

The mechanics above aren't arbitrary. They're designed so that the growth of the platform and the health of the token reinforce each other:

**More users → more AIC burned.** Every time someone pays with AIC for inference, some tokens disappear. The busier the platform gets, the more supply contracts.

**Cheaper inference → more staking.** Staking cuts costs in half at the top tier. For developers and agents who run a lot of inference, this is a real financial incentive to acquire and lock AIC rather than just buying USDC each time.

**More staking → less circulating supply.** Locked AIC can't be sold. A larger percentage of the supply in the staking contract means less tokens available on the open market.

**Less circulating supply + growing demand → upward price pressure.** As the platform grows, AIC demand comes from new users trying to access Standard/Premium models and from developers trying to reduce their costs through staking.

**Higher AIC price → existing stakers benefit more.** A staker with 50,000 AIC gets the same 35% discount whether AIC is at $0.01 or $0.10. But their 50,000 AIC is worth more. The staking deposit becomes an appreciating asset, not just a key to a cheaper rate.

This is the loop the token economy is built on:

```
Use the platform → burn AIC → supply decreases
Stake AIC → inference is cheaper → more platform usage
More usage → more burn → more staking incentive
```

None of this is guaranteed — token economies can fail if the platform doesn't grow, if the discount isn't compelling enough, or if the AIC price collapses and staking doesn't feel worth it. But the design is intentional: every mechanic points in the same direction.

---

## Current status

The USDC payment flow is live. The staking contract, native AIC payments, model access gating, and burn mechanics are all planned for deployment after the presale closes and liquidity is established.

| Feature | Status |
|---|---|
| USDC payments | Live |
| Staking discounts | Planned |
| AIC as payment currency | Planned (requires token upgrade) |
| Burn-on-use mechanic | Planned |
| Model access tiers | Planned |
| On-chain AIC/USDC price (TWAP) | After DEX liquidity launches |

Technical implementation details — contract interfaces, API flows, code — are in [AIC Integration](/docs/app/aic-integration).
