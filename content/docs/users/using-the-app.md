---
title: Using the Inference App
description: Step-by-step guide to running AI inference on WebAI3 — connecting your wallet, choosing a model, paying with USDC, and viewing results.
section: User Guide
order: 6
---

The inference app runs AI models on [Replicate](https://replicate.com) and charges you per second of compute. There's no account signup, no credits to buy in advance, no subscription — you pay exactly for what you use.

---

## What You Need

- An Ethereum wallet (MetaMask, Coinbase Wallet, Rainbow, or any EIP-712 compatible wallet)
- USDC on Ethereum mainnet (or Sepolia for testing)
- A small amount of ETH for gas (inference requires signing a payment, which costs gas)

---

## Step-by-Step: Running an Inference

### 1. Connect your wallet

Visit the inference app and click **Connect Wallet**. Choose your wallet provider.

The app uses SIWE (Sign-In With Ethereum) for authentication. You'll be prompted to sign a message — this is a free, off-chain signature that proves you control the wallet. No gas required.

### 2. Choose a task type

Three task types are available:

| Task | What it produces | Avg. cost |
|---|---|---|
| Text-to-image | Image from a text prompt | ~$0.01 |
| Text-to-text | Language model response | ~$0.003 |
| Text-to-sound | Audio from a text prompt | ~$0.015 |

### 3. Choose a model

Each task type has a collection of models pulled from Replicate. Models are sorted by usage count. Choose based on your use case:

- **Text-to-image:** FLUX Schnell (fast, general), Stable Diffusion 3.5 (quality), or others
- **Text-to-text:** Llama 3 70B, Mixtral 8x7B, or other language models
- **Text-to-sound:** ElevenLabs, MiniMax, Stability AI audio models

### 4. Fill in your prompt

Each task type has specific input fields:

- **Text-to-image:** Prompt, optional negative prompt, number of outputs (1–4)
- **Text-to-text:** Prompt, max tokens (1–4096)
- **Text-to-sound:** Prompt, duration (1–30 seconds)

### 5. See the cost estimate

Before you pay, the app shows you the estimated cost. This is calculated as:

```
estimated cost = estimated seconds × rate per second
```

The rate per second depends on your staked AIC balance (if staking is active). The base rate is $0.001 USDC/second.

The estimate is based on historical average execution time for that model. Actual cost may differ slightly.

### 6. Sign the payment

Click **Run**. Your wallet opens a signing prompt for the payment authorization. This is an EIP-712 structured signature — it authorizes the payment of a specific USDC amount to the protocol's receiver address.

This signature is *not* a transaction yet. No USDC has moved. You're authorizing a future transfer.

### 7. The inference runs

After signing, the app submits your authorization to the x402 facilitator, which verifies the signature and settles the USDC on-chain. Then your inference runs on Replicate.

The USDC transfer happens **before** the model runs. Once settled, the payment is irrevocable. If the model fails after payment, the error is logged and you can try again.

### 8. View your result

When the model finishes:

- **Images and audio** are uploaded to permanent public storage (Cloudflare R2) and displayed immediately
- **Text outputs** are displayed inline

All your results are saved in your inference history and accessible with the same wallet.

---

## Viewing Your History

The history page shows all your past inferences — model used, task type, cost, output, and timestamp. You can also toggle whether an inference is public (visible in the gallery).

---

## Pricing Details

The base inference rate is **$0.001 USDC per second** of compute time.

Costs are tracked two ways:
- **Estimated cost** — calculated before the model runs, based on historical average time
- **Actual cost** — calculated after the model finishes, based on the real execution time in milliseconds

The payment is settled for the *estimated* amount. The actual cost is recorded for your reference but doesn't affect what you paid.

---

## Networks

| Network | Chain ID | Use |
|---|---|---|
| Ethereum mainnet | 1 | Production |
| Ethereum Sepolia | 11155111 | Testnet |
| Anvil (local) | 31337 | Development |

The app currently runs on Sepolia. Mainnet launch is pending audit.

---

## Common Issues

**"Insufficient USDC balance"**
You need USDC in your wallet on the same network the app is running on. For Sepolia testing, you need Sepolia USDC (the test USDC contract address differs from mainnet).

**"User rejected request"**
You cancelled the signing prompt. The inference was not run and no USDC was spent.

**"Payment already used"**
Each payment authorization can only be used once. If you see this, it means the signature was already submitted — check your history to see if the inference ran.

**Model takes too long / times out**
Some models are slow for certain inputs. If the model times out after payment is settled, the error is recorded in your history. The cost for that inference is lost — try a faster model or simpler prompt.
