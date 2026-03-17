---
title: Deployment Tutorial
description: Step-by-step Foundry deployment guide for all 8 presale contracts on Ethereum Sepolia.
section: Token (AIC)
order: 5
---

## Overview

This tutorial is a Sepolia-specific deployment runbook for the full WebAI3 presale contract stack using Foundry (`forge`, `cast`).

**Target network:** Ethereum Sepolia (Chain ID: 11155111)

## Prerequisites

```bash
forge --version
cast --version
jq --version
```

You also need:
- A funded Sepolia deployer wallet (Sepolia ETH from a faucet)
- A Sepolia USDC-compatible token address with 6 decimals
- An Etherscan API key for source verification (optional but recommended)

## 1. Environment Setup

Create `.env.sepolia`:

```bash
cat > .env.sepolia <<'EOF_ENV'
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
DEPLOYER=0xYOUR_DEPLOYER_ADDRESS

# Tokens
USDC=0xUSDC_6_DECIMALS_TOKEN

# Operators
PAUSER=0xPAUSER_ADDRESS
LIQUIDITY_OPERATOR=0xLIQUIDITY_OPERATOR_ADDRESS
DEV_OPERATOR=0xDEV_OPERATOR_ADDRESS
TEAM_OPERATOR=0xTEAM_OPERATOR_ADDRESS
MARKETING_OPERATOR=0xMARKETING_OPERATOR_ADDRESS

# Beneficiaries
DEV_BENEFICIARY=0xDEV_BENEFICIARY_ADDRESS
TEAM_BENEFICIARY=0xTEAM_BENEFICIARY_ADDRESS
MARKETING_BENEFICIARY=0xMARKETING_BENEFICIARY_ADDRESS

# Address receiving USDC when liquidity is provisioned
LIQUIDITY_RECIPIENT=0xLIQUIDITY_RECIPIENT_ADDRESS
EOF_ENV
```

Load it:

```bash
set -a; source .env.sepolia; set +a
```

## 2. Deploy AIC Token

The `ClaimModule` requires a deployed AIC token address. For Sepolia testing, you can point all allocations to the deployer (all 1B tokens in one wallet — you'll need 500M for the ClaimModule in step 9).

```bash
export TOKEN_ADMIN="$DEPLOYER"
export TOKEN_TREASURY="$DEPLOYER"
export TOKEN_COMMUNITY="$DEPLOYER"
export TOKEN_INVESTORS="$DEPLOYER"
export TOKEN_TEAM="$DEPLOYER"
export TOKEN_INCENTIVES="$DEPLOYER"
export TOKEN_LIQUIDITY="$DEPLOYER"

forge script script/DeployWebAI3Token.s.sol \
  --chain sepolia \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Set the deployed address and append to your env file:

```bash
AIC_TOKEN=0xYOUR_DEPLOYED_AIC_ADDRESS
echo "AIC_TOKEN=$AIC_TOKEN" >> .env.sepolia
```

Verify:

```bash
cast call "$AIC_TOKEN" "decimals()(uint8)" --rpc-url "$SEPOLIA_RPC_URL"
# expected: 18

cast call "$AIC_TOKEN" "totalSupply()(uint256)" --rpc-url "$SEPOLIA_RPC_URL"
# expected: 1000000000000000000000000000  (1B × 1e18)
```

## 3. Preflight Checks

```bash
cast chain-id --rpc-url "$SEPOLIA_RPC_URL"
# expected: 11155111

cast call "$USDC" "decimals()(uint8)" --rpc-url "$SEPOLIA_RPC_URL"
# expected: 6

forge build && forge test
```

## 4. Set Deployment Parameters

```bash
NOW=$(date +%s)
PRESALE_START=$((NOW + 3600))                   # +1 hour
PRESALE_END=$((PRESALE_START + 120*24*60*60))   # +120 days
TGE=$((PRESALE_END + 24*60*60))                 # +1 day after end

TEAM_STREAM_DURATION=$((365*24*60*60))          # 365 days
MARKETING_WITHDRAW_DELAY=$((2*24*60*60))        # 2 days
```

## 5. Deploy Contracts

Deploy in this order — each contract depends on the address of previous ones.

### LiquidityVault

```bash
LIQUIDITY_VAULT=$(forge create src/presale/LiquidityVault.sol:LiquidityVault \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$LIQUIDITY_RECIPIENT" \
  | jq -r '.deployedTo')
echo "LIQUIDITY_VAULT=$LIQUIDITY_VAULT"
```

### DevRunwayVault

```bash
DEV_VAULT=$(forge create src/presale/DevRunwayVault.sol:DevRunwayVault \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$DEV_BENEFICIARY" "$PRESALE_START" \
  | jq -r '.deployedTo')
echo "DEV_VAULT=$DEV_VAULT"
```

### TeamStreamVault

```bash
TEAM_VAULT=$(forge create src/presale/TeamStreamVault.sol:TeamStreamVault \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$TEAM_BENEFICIARY" "$PRESALE_START" "$TEAM_STREAM_DURATION" \
  | jq -r '.deployedTo')
echo "TEAM_VAULT=$TEAM_VAULT"
```

### MarketingVault

```bash
MARKETING_VAULT=$(forge create src/presale/MarketingVault.sol:MarketingVault \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$MARKETING_BENEFICIARY" "$MARKETING_WITHDRAW_DELAY" \
  | jq -r '.deployedTo')
echo "MARKETING_VAULT=$MARKETING_VAULT"
```

### PresaleVault

```bash
PRESALE_VAULT=$(forge create src/presale/PresaleVault.sol:PresaleVault \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$LIQUIDITY_VAULT" "$DEV_VAULT" "$TEAM_VAULT" "$MARKETING_VAULT" \
  | jq -r '.deployedTo')
echo "PRESALE_VAULT=$PRESALE_VAULT"
```

### ClaimModule

```bash
CLAIM_MODULE=$(forge create src/presale/ClaimModule.sol:ClaimModule \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$AIC_TOKEN" "$TGE" \
  | jq -r '.deployedTo')
echo "CLAIM_MODULE=$CLAIM_MODULE"
```

### WebAI3Presale

```bash
PRESALE=$(forge create src/WebAI3Presale.sol:WebAI3Presale \
  --chain sepolia --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" \
  --broadcast --json \
  --constructor-args "$DEPLOYER" "$USDC" "$PRESALE_VAULT" "$CLAIM_MODULE" "$PRESALE_START" "$PRESALE_END" \
  | jq -r '.deployedTo')
echo "PRESALE=$PRESALE"
```

Persist addresses:

```bash
cat > deployed.sepolia.presale.env <<EOF
LIQUIDITY_VAULT=$LIQUIDITY_VAULT
DEV_VAULT=$DEV_VAULT
TEAM_VAULT=$TEAM_VAULT
MARKETING_VAULT=$MARKETING_VAULT
PRESALE_VAULT=$PRESALE_VAULT
CLAIM_MODULE=$CLAIM_MODULE
PRESALE=$PRESALE
EOF
```

## 6. One-Time Wiring

Wire the vault contracts to know about each other:

```bash
cast send "$LIQUIDITY_VAULT" "setPresaleVault(address)" "$PRESALE_VAULT" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$DEV_VAULT" "setPresaleVault(address)" "$PRESALE_VAULT" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$TEAM_VAULT" "setPresaleVault(address)" "$PRESALE_VAULT" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$MARKETING_VAULT" "setPresaleVault(address)" "$PRESALE_VAULT" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"

cast send "$PRESALE_VAULT" "setPresale(address)" "$PRESALE" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$CLAIM_MODULE" "setPresale(address)" "$PRESALE" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
```

## 7. Grant Operational Roles

Read role IDs from chain, then grant:

```bash
PAUSER_ROLE=$(cast call "$PRESALE" "PAUSER_ROLE()(bytes32)" --rpc-url "$SEPOLIA_RPC_URL")
LIQ_OP_ROLE=$(cast call "$LIQUIDITY_VAULT" "LIQUIDITY_OPERATOR_ROLE()(bytes32)" --rpc-url "$SEPOLIA_RPC_URL")
DEV_ROLE=$(cast call "$DEV_VAULT" "DEV_OPERATOR_ROLE()(bytes32)" --rpc-url "$SEPOLIA_RPC_URL")
TEAM_ROLE=$(cast call "$TEAM_VAULT" "TEAM_OPERATOR_ROLE()(bytes32)" --rpc-url "$SEPOLIA_RPC_URL")
MARKETING_ROLE=$(cast call "$MARKETING_VAULT" "MARKETING_OPERATOR_ROLE()(bytes32)" --rpc-url "$SEPOLIA_RPC_URL")

cast send "$PRESALE" "grantRole(bytes32,address)" "$PAUSER_ROLE" "$PAUSER" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$LIQUIDITY_VAULT" "grantRole(bytes32,address)" "$LIQ_OP_ROLE" "$LIQUIDITY_OPERATOR" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$DEV_VAULT" "grantRole(bytes32,address)" "$DEV_ROLE" "$DEV_OPERATOR" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$TEAM_VAULT" "grantRole(bytes32,address)" "$TEAM_ROLE" "$TEAM_OPERATOR" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send "$MARKETING_VAULT" "grantRole(bytes32,address)" "$MARKETING_ROLE" "$MARKETING_OPERATOR" --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
```

## 8. Fund ClaimModule with Presale AIC

Transfer exactly 500,000,000 AIC (50% of total supply) to the ClaimModule:

```bash
PRESALE_AIC_AMOUNT=500000000000000000000000000  # 500M × 1e18

cast send "$AIC_TOKEN" "transfer(address,uint256)" "$CLAIM_MODULE" "$PRESALE_AIC_AMOUNT" \
  --rpc-url "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"

# Verify
cast call "$AIC_TOKEN" "balanceOf(address)(uint256)" "$CLAIM_MODULE" --rpc-url "$SEPOLIA_RPC_URL"
```

## 9. Post-Deploy Verification

```bash
# Chain ID check
cast chain-id --rpc-url "$SEPOLIA_RPC_URL"  # must be 11155111

# Wiring checks
cast call "$LIQUIDITY_VAULT" "presaleVault()(address)" --rpc-url "$SEPOLIA_RPC_URL"
cast call "$DEV_VAULT" "presaleVault()(address)" --rpc-url "$SEPOLIA_RPC_URL"
cast call "$PRESALE_VAULT" "presale()(address)" --rpc-url "$SEPOLIA_RPC_URL"
cast call "$CLAIM_MODULE" "presale()(address)" --rpc-url "$SEPOLIA_RPC_URL"

# Presale state
cast call "$PRESALE" "HARD_CAP()(uint256)" --rpc-url "$SEPOLIA_RPC_URL"
cast call "$PRESALE" "isFinalizable()(bool)" --rpc-url "$SEPOLIA_RPC_URL"

# Gate states (both must be false before launch)
cast call "$PRESALE_VAULT" "liquidityProvisioned()(bool)" --rpc-url "$SEPOLIA_RPC_URL"
cast call "$CLAIM_MODULE" "claimsEnabled()(bool)" --rpc-url "$SEPOLIA_RPC_URL"
```

## 10. Etherscan Verification (Optional)

```bash
forge verify-contract --chain sepolia \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  "$PRESALE" src/WebAI3Presale.sol:WebAI3Presale \
  --constructor-args $(cast abi-encode "constructor(address,address,address,address,uint64,uint64)" \
    "$DEPLOYER" "$USDC" "$PRESALE_VAULT" "$CLAIM_MODULE" "$PRESALE_START" "$PRESALE_END")
```

Repeat for each contract with the correct constructor args.

## Common Failures

| Error | Cause | Fix |
|---|---|---|
| `PresaleNotFinalizable` | Finalize called too early | Wait for hard cap or end timestamp |
| `PhaseCapExceeded` | Buy exceeds remaining phase capacity | No partial fills — reduce amount |
| `HardCapExceeded` | Buy exceeds remaining hard cap | Reduce amount to exactly the remaining cap |
| `LiquidityFallbackNotAvailable` | Fallback called within operator window | Wait 7 days after finalization |
| `LiquidityNotProvisioned` | Claims enabled before liquidity | Provision liquidity first |
| `MarketingLocked` | Marketing withdraw before finalization | Finalize the presale first |
| Allowance / balance failures | Buyer didn't approve USDC or has insufficient balance | Approve USDC first, fund account |

## Security Notes

- Do **not** reuse testnet EOAs as mainnet privileged wallets
- Use multisigs for all operator and admin roles on mainnet
- `LIQUIDITY_RECIPIENT` is a critical trust anchor — all liquidity USDC goes there
- Lock down role grants immediately after deployment — deployer should not retain permanent admin after handoff
- Perform a full end-to-end Sepolia rehearsal before mainnet deployment
