---
title: AIC in the Inference App
description: How holding and staking AIC makes every AI request cheaper, unlocks better models, and creates a self-reinforcing economy where using the platform benefits every token holder.
section: Inference App
order: 3
---

## What is this doc?

This isn't a whitepaper. It's a plain-English explanation of what AIC actually does for you inside the WebAI3 inference app — what you get for holding it, why staking it makes financial sense, what happens when you pay with it, and how all of it connects into an economy that's designed to grow with the platform.

If you bought AIC in the presale and you're wondering what happens after the TGE, this is the answer.

If you're a developer evaluating whether to build on WebAI3 and thinking about whether AIC matters to you, this is the answer too.

---

## The 30-second summary

AIC gives you three things inside the app:

**1. Cheaper AI inference.** Stake AIC and your per-request cost drops automatically — anywhere from 10% to 50% depending on how much you've staked. This applies to every request, forever, without doing anything extra each time.

**2. Access to better models.** The most capable AI models in the platform — SDXL, large language models, high-quality audio — are only available to people who hold AIC. No AIC, no access, regardless of how much USDC you have.

**3. A reason to pay with the token.** When you pay for inference with AIC instead of USDC, 20% of those tokens are permanently destroyed. That's real deflationary pressure tied directly to platform usage — the more people use the app and pay with AIC, the smaller the total supply gets.

None of this lives in a database as points or credits. Every benefit is read directly from your wallet and the staking contract, on-chain, at the moment you make a request.

---

## Why this matters — the problem it's solving

Without AIC utility in the app, the token would have no reason to exist beyond the presale. You buy it, you get it at TGE, you sell it. That's the typical lifecycle of tokens without real product integration, and it leads to the same outcome every time: price dumps, nobody holds, the ecosystem never takes off.

WebAI3 is trying to break that pattern by making AIC genuinely useful inside the product from day one after launch.

Think about what it means for a developer who builds on the WebAI3 API. They're making thousands of inference requests per month. At the base rate, that costs real money. If they stake enough AIC to hit the 50% discount tier, they've cut their infrastructure cost in half — permanently, for as long as they keep the tokens staked. At that point, acquiring AIC isn't a speculative bet, it's a business decision. The token pays for itself in reduced operating costs.

Now think about what that means for the supply side. Every developer staking to reduce costs is locking tokens that would otherwise be circulating. Every user paying with AIC is burning a fifth of what they spend. As the platform grows, both of these forces grow with it. The token economy is designed so that the more useful the platform becomes, the more demand for AIC, and the less of it exists.

That's the design intention. Whether it plays out depends on adoption — but the mechanics are there.

---

## How inference payments work

Before getting into AIC specifically, it helps to understand how paying for inference works in general.

Every AI request runs for some number of seconds on a compute GPU. The app charges `$0.001 per second` of that compute time. A typical text-to-image request takes about 10 seconds, so it costs roughly $0.01. A quick text-to-text response might be 3 seconds — $0.003. A high-quality audio generation is closer to 15 seconds — $0.015.

These aren't arbitrary prices. They're set to cover the actual cost of the underlying Replicate inference plus a margin that funds protocol development. You're not paying for storage, bandwidth, or a subscription — just the raw compute you use.

The payment happens on-chain, before the inference runs. This is important: the model doesn't start until your payment is settled. If inference fails after that, the payment is already gone — this is a known tradeoff and the failure is recorded for investigation. But it also means there's no billing cycle, no invoices, no monthly caps. You pay for exactly what you use, in real time.

---

## Paying with USDC

USDC is the default and works for everyone. It's a dollar-pegged stablecoin, so $0.01 is always exactly $0.01. You connect your wallet, see the estimated cost, approve the transaction, and your output appears.

This is the zero-friction path. No AIC required. If you just want to run models without thinking about the token economy, this is all you need to know.

---

## Paying with AIC

If you hold AIC, you have a second option: pay directly with the token instead of USDC.

Here's what happens when you do:

The app knows the USD cost of your request ($0.01, for example). It checks the current AIC/USDC exchange rate and converts that to an AIC amount. If AIC is worth $0.10 each, your $0.01 request costs 0.1 AIC. You approve that transfer from your wallet, and the payment settles on-chain in AIC instead of USDC.

The key difference from USDC is what happens to those tokens after you pay:

- **20% are burned immediately.** Destroyed. Sent to the zero address. Gone from the total supply permanently.
- **80% go to the protocol treasury.** Used to fund ongoing development, liquidity, and operations.

That 20% burn is the part that matters economically. The total supply of AIC is fixed at 1 billion and can never be increased. Every time someone pays for inference with AIC, the supply decreases. If 1,000 people each spend $10 worth of AIC per month, that's $10,000 * 20% = $2,000 worth of AIC removed from circulation every month. At scale, this is significant.

You're not just spending tokens when you pay with AIC — you're actively making the remaining supply scarcer, which benefits every person still holding the token, including you.

### A note on AIC price volatility

Unlike USDC, AIC's value fluctuates. This means the AIC amount you're charged will vary day to day based on market price. If AIC is worth more, you spend fewer tokens for the same request. If it's worth less, you spend more.

Early on, the exchange rate used in the app will be set by the protocol operator. Once the AIC/USDC liquidity pool is live on a DEX, the app will switch to reading a time-weighted average price (TWAP) from the pool directly — which is more decentralized and manipulation-resistant.

---

## Staking — the most powerful thing you can do with AIC

Staking is where the most direct and immediate value comes from as an app user.

The concept is simple: you lock AIC tokens in a smart contract (the staking contract), and in return, every inference request you make is automatically cheaper. The more you stake, the bigger the discount. The discount applies from the moment you stake until the moment you unstake — no renewal, no claiming, no expiry.

### What the staking tiers look like

| AIC staked | Discount | Rate per second | Cost of a 10s request |
|---|---|---|---|
| 0 AIC | 0% | $0.001000 | $0.0100 |
| 1,000 AIC | 10% | $0.000900 | $0.0090 |
| 10,000 AIC | 20% | $0.000800 | $0.0080 |
| 50,000 AIC | 35% | $0.000650 | $0.0065 |
| 200,000 AIC | 50% | $0.000500 | $0.0050 |

The top tier is half price. Permanently. For every single request you make while that AIC is staked.

### Does this actually pay off?

That depends on how much you use the platform. Here's what the math looks like for a few different usage levels:

**Casual user — 100 inference seconds per month**

| AIC staked | Monthly cost | Monthly savings |
|---|---|---|
| 0 | $0.10 | — |
| 10,000 | $0.08 | $0.02 |
| 200,000 | $0.05 | $0.05 |

At this usage level, staking 200k AIC to save $0.05/month doesn't make financial sense. The savings are real but small.

**Regular user — 1,000 inference seconds per month**

| AIC staked | Monthly cost | Monthly savings | Annual savings |
|---|---|---|---|
| 0 | $1.00 | — | — |
| 1,000 | $0.90 | $0.10 | $1.20 |
| 10,000 | $0.80 | $0.20 | $2.40 |
| 50,000 | $0.65 | $0.35 | $4.20 |
| 200,000 | $0.50 | $0.50 | $6.00 |

**Developer or power user — 50,000 inference seconds per month**

| AIC staked | Monthly cost | Monthly savings | Annual savings |
|---|---|---|---|
| 0 | $50.00 | — | — |
| 1,000 | $45.00 | $5.00 | $60 |
| 10,000 | $40.00 | $10.00 | $120 |
| 50,000 | $32.50 | $17.50 | $210 |
| 200,000 | $25.00 | $25.00 | $300 |

**Heavy API consumer or autonomous agent — 500,000 inference seconds per month**

| AIC staked | Monthly cost | Monthly savings | Annual savings |
|---|---|---|---|
| 0 | $500.00 | — | — |
| 10,000 | $400.00 | $100.00 | $1,200 |
| 50,000 | $325.00 | $175.00 | $2,100 |
| 200,000 | $250.00 | $250.00 | $3,000 |

For anyone running inference at scale — developers building products, agents running autonomously, teams processing large batches — the discount at the top tier is worth thousands of dollars a year. At that point, staking AIC isn't a "nice to have" — it's a rational infrastructure decision.

The staked tokens aren't spent either. You get the discount for free in the sense that the AIC stays yours. It's locked, not consumed. You can always unstake and get it back after the cooldown period.

### How staking actually works, step by step

**Staking your tokens:**
1. Open the Wallet panel in the app
2. Go to the staking section
3. Enter how much AIC you want to stake
4. Confirm the transaction — this sends your AIC to the staking contract on-chain
5. Your staked balance is now live. The next time you make an inference request, the app reads it and applies your discount

**Using your discount:**
You don't do anything. The app checks your staked balance automatically on every request. The price you see in the estimate is already your discounted price. You just run your requests as normal.

**Getting your tokens back:**
1. Open the Wallet panel and go to staking
2. Request to unstake the amount you want
3. Wait out the cooldown period (this exists to prevent gaming — you can't stake right before a big batch of requests and immediately unstake after)
4. After the cooldown, withdraw your AIC back to your wallet
5. Your discount drops to whatever tier your remaining staked amount earns (or disappears entirely if you unstake everything)

---

## Model access tiers

Separate from pricing, AIC determines which models you can access at all.

The inference platform has three tiers of models. The division roughly follows cost and capability — higher-tier models produce better results but require more compute. The platform uses AIC holdings as the gate, not a monthly subscription.

| Tier | What you need | What you can run |
|---|---|---|
| **Free** | Just a connected wallet | Base image generation, small text models — good for experimentation |
| **Standard** | Hold ≥ 500 AIC in your wallet | Mid-range diffusion models, mid-size LLMs — solid quality for most use cases |
| **Premium** | Stake ≥ 5,000 AIC | SDXL, large language models, high-quality audio — the best the platform offers |

A few things worth noting:

**"Hold" and "stake" are different.** Standard just requires you to have 500 AIC sitting in your wallet — nothing locked, nothing at risk, just held. Premium requires 5,000 AIC actively staked in the staking contract. Staked AIC counts toward both the access tier and the discount tier simultaneously.

**There's no approval or sign-up.** When you make a request for a model, the server checks your wallet balance and staked balance on-chain in real time. If you qualify, you get access. If you don't, you don't. It's automatic and immediate in both directions — acquire enough AIC and access unlocks, sell below the threshold and it locks again.

**The gate is server-side.** The client app will show locks or labels on models you can't access, but that's just UI. The actual enforcement happens on the server — you can't bypass it by manipulating the frontend.

---

## USDC vs AIC — deciding which to use

Both payment methods give you the same staking discount. The choice is really about what kind of participant you want to be in the ecosystem.

### If you just want to use the app

Pay with USDC. It's stable, predictable, and requires no extra thought. You know exactly what every request costs before you confirm it. This is the right default for most users.

### If you hold AIC and care about the ecosystem

Pay with AIC. Here's why this is the better choice if you're a long-term holder:

Every time you pay with USDC, USDC goes to the treasury. The AIC in your wallet doesn't change. The total supply of AIC doesn't change.

Every time you pay with AIC, 20% of those tokens are burned. The total supply goes down. You've just made every other AIC token slightly more scarce.

You're going to pay for inference either way. The question is whether that payment also benefits you and every other AIC holder by reducing supply, or whether it just moves stablecoin from your wallet to the treasury without any effect on the token economy.

The practical tradeoff is that AIC's price fluctuates, so you can't predict the exact token amount you'll pay. But if you're a holder who believes in the project, the volatility is something you're already accepting. You might as well get the deflationary benefit while you're at it.

### Side-by-side

| | USDC | AIC |
|---|---|---|
| Price predictability | Fixed — always dollar-for-dollar | Variable — depends on AIC/USDC rate |
| Staking discount | Yes, same tiers | Yes, same tiers |
| Deflationary effect | None | 20% of payment permanently burned |
| What happens to payment | Goes to treasury | 80% to treasury, 20% gone forever |
| Best for | Anyone — simple, no moving parts | AIC holders who use the platform regularly |

---

## The complete journey — from first request to long-term user

Here's what the full experience looks like for someone who goes all-in on the AIC economy inside the app.

**Day 1 — Getting started**

You've received AIC from the presale. You connect your wallet to the WebAI3 app and sign in. You can already run Free tier models without doing anything else.

You stake 5,000 AIC. This takes two minutes: open the Wallet panel, enter the amount, confirm the transaction. Your staked balance goes live on-chain. You now have access to Premium models and a 10% discount (you're at the 1,000+ tier).

You run a text-to-image request. The app shows you $0.009 instead of $0.010. Small difference, but you didn't have to do anything to get it — it was automatic.

**Week 1 — Exploring the platform**

You run more requests. You try SDXL image generation (Premium tier, available because you staked). The outputs are noticeably better. You try a large language model. You run a few audio generations.

You choose to pay some requests with AIC. You see the burn counter in your request history — small amounts each time, but each one is permanent.

**Month 1 — Evaluating the ROI**

You've run 2,000 inference seconds this month. With your 10% discount, you paid $1.80 instead of $2.00. You saved $0.20.

You decide to stake more — up to 10,000 AIC total. Your discount jumps to 20%. Now you save $0.40 per 2,000 seconds. At 12 months, that's $4.80 back from the staking alone — and your original 10,000 AIC is still there, still yours.

**6 months in — The compounding effect**

You're building a product on top of the WebAI3 API. You're running 50,000+ inference seconds per month. You've staked 200,000 AIC to hit the 50% discount tier. Your monthly bill is $25 instead of $50. You're saving $300/year.

Your staked AIC is worth more than when you staked it, because more developers are doing the same thing — staking to reduce costs, buying AIC to unlock Premium, paying with AIC and burning it. Supply is lower. Demand is higher.

The discount was the entry point. The staking deposit became an investment.

---

## Why the economy works — and what could break it

The entire system is built on one assumption: **that the platform is actually useful enough that people want to use it**. If nobody's running inference, nothing else matters. No burn, no staking demand, no token utility.

Assuming the platform does get used, here's the reinforcing loop:

**People use the platform → some pay with AIC → supply burns.** This is the deflationary engine. It only runs when the platform runs.

**Developers want to reduce costs → they stake AIC → supply locks up.** Every developer staking to get the 50% discount is a token that can't be sold. If 100 developers each stake 200,000 AIC, that's 20 million tokens locked — 2% of total supply — with an economic reason to stay locked as long as they keep using the platform.

**New users need AIC to access good models → they buy AIC → demand rises.** Standard and Premium access require AIC. A new user who wants the best models has to acquire AIC first. This isn't a paywall — it's aligned incentives. The people who can afford to use the best models are also contributing to the token economy.

**Less circulating supply + more demand → upward price pressure.** As the platform grows and burn accumulates, there's less AIC available to buy at each price level. Combined with growing demand, this creates the conditions for price appreciation — not guaranteed, but structurally supported.

**Higher AIC price → stakers benefit.** A developer who staked 200,000 AIC at $0.01 is holding $2,000 of staked tokens. If the token is at $0.05, that's $10,000. The discount they're getting on inference is still the same 50% — but the deposit backing it is worth five times more. The staking position becomes an appreciating asset.

This loop doesn't require anything exotic — just consistent platform usage and a reasonable exchange rate for AIC. It can break if the platform fails to retain users, if the discount tiers aren't compelling enough to justify staking, or if a large holder dumps supply faster than burn can absorb it. These are real risks, and it would be dishonest not to name them. But the design minimizes each one: the discount is substantial (50% is real money at scale), the burn is perpetual (it never stops as long as the platform runs), and the access gating creates a floor of demand.

---

## Current status

Everything in this doc describes the intended design. Here's where things stand right now:

| Feature | Status |
|---|---|
| USDC payments via x402 | **Live** |
| Staking contract (`AICStak.sol`) | Planned — deploys after presale close |
| Server-side staking discount | Planned |
| AIC as direct payment currency | Planned — requires minor token upgrade |
| Burn-on-use (20% of AIC payments) | Planned |
| Model access tier enforcement | Planned |
| On-chain AIC/USDC price feed (TWAP) | After DEX liquidity pool launches |

The x402 USDC payment flow is running in production. The AIC layer is being built on top of it. Everything described above will be live before or shortly after TGE.

For the full technical implementation — smart contract interfaces, API flow diagrams, code snippets, and env vars — see [AIC Integration](/docs/app/aic-integration).
