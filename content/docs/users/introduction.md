---
title: What is WebAI3?
description: A plain-English introduction to the WebAI3 platform — what it does, what the AIC token is for, and how the two products fit together.
section: User Guide
order: 1
---

WebAI3 is two things built on top of each other:

1. **An AI inference app** — pay per second of compute with USDC, run any model on Replicate
2. **A governance token (AIC)** — presale-funded, stake to get cheaper inference, vote on protocol parameters

You can use one without the other. But they're designed to work together: hold AIC, stake it in the inference app, pay less per inference.

---

## The Inference App

The inference app lets anyone run AI models and pay for exactly the compute they use — no subscription, no credits, no account required beyond an Ethereum wallet.

**How it works:**

1. Connect your Ethereum wallet (MetaMask, Coinbase Wallet, etc.)
2. Sign in with your wallet — no password, no email
3. Choose a model and task (generate an image, chat, create audio)
4. The app tells you the estimated cost before you commit
5. You sign a payment authorization for that USDC amount
6. The model runs, your output is ready, your USDC is settled on-chain

The payment happens via the [x402 protocol](https://x402.fi) — a standard for machine-readable HTTP payments. Your wallet signs an EIP-712 authorization; the protocol settles it on Ethereum.

**What it costs:** $0.001 USDC per second of compute at the base rate. A 10-second image generation costs about $0.01. If you stake AIC, you get up to 50% off.

---

## The AIC Token

AIC (symbol for WebAI3Token) is the protocol's governance token, deployed on Ethereum. It has a fixed supply of 1,000,000,000 tokens — no more can ever be created.

**What AIC does:**

- **Staking** — Lock AIC in the inference app to reduce your per-second inference rate by up to 50%
- **Governance** — Vote on protocol parameters like fee rates, model tiers, and treasury policy
- **Presale** — 50% of total supply (500 million AIC) is sold in a structured 7-phase presale

**Why fixed supply matters:** Once deployed, the contract has no `mint()` function. The 1B supply is set at genesis. No team, admin, or governance vote can inflate it.

---

## How the Two Products Connect

```
You stake AIC          →   You get a discount tier
You run an inference   →   You pay the discounted rate
You save USDC          →   You can buy more AIC (or stake more)
```

In practical terms: staking 10,000 AIC gives you a 20% discount. At $0.001/s base, you pay $0.0008/s instead. For heavy users running many inferences per day, that discount compounds into meaningful savings.

---

## Who This Is For

**If you're a user** — you care about cheap, pay-per-use AI inference and want to get discounts by holding AIC. Start with the [Presale Guide](/docs/users/presale-guide) or [Using the App](/docs/users/using-the-app).

**If you're a developer** — you want to integrate x402 payments, understand the smart contract system, or build on top of WebAI3. Start with [System Architecture](/docs/developers/architecture).

**If you're an investor** — you care about the token model, the presale structure, and how value accrues. Read [The AIC Token](/docs/users/aic-token) and [Presale Guide](/docs/users/presale-guide).

---

## What Exists Today

| Component | Status |
|---|---|
| AIC token contract | Deployed on Sepolia (testnet) |
| Presale contracts | Deployed on Sepolia (testnet) |
| Inference app | Running on Sepolia (testnet) |
| USDC payments | Live (testnet) |
| Staking discounts | Planned — Tier 1 |
| AIC-as-payment | Planned — Tier 1.5 |
| Mainnet launch | Pending audit |
