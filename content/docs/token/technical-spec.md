---
title: Technical Spec
description: Full technical specification of the WebAI3Token (AIC) ERC-20 contract.
section: Token (AIC)
order: 2
---

## Overview

`WebAI3Token` is an immutable ERC-20 governance token deployed on Ethereum. The entire token supply (1B AIC) is minted at deployment through genesis allocations. No post-deployment minting is possible.

- **Symbol:** AIC
- **Decimals:** 18
- **Max Supply:** 1,000,000,000 (1B tokens, 10^27 base units)
- **Network:** Ethereum Mainnet (Chain ID: 1)
- **Testnet:** Ethereum Sepolia (Chain ID: 11155111)

## Contract Design

### Core Principles

1. **Immutable Supply** — 1B tokens minted once, never more
2. **Audited Primitives** — All functionality inherited from OpenZeppelin v5 (no custom logic)
3. **Fixed Allocations** — Distribution determined at deployment, cannot change
4. **Operational Safety** — Pause mechanism for emergency response
5. **Governance Compatible** — Supports delegation and voting

### Inheritance Chain

```
WebAI3Token
├── ERC20
│   └── Standard token operations (transfer, approve, balanceOf)
├── ERC20Pausable
│   └── pause/unpause — freezes all transfers
├── ERC20Permit
│   └── EIP-2612 permit() for gasless approvals
├── ERC20Votes
│   └── Delegation and voting power tracking
└── AccessControl
    └── Role-based permissions (admin, pauser)
```

## Constructor

```solidity
constructor(address admin, Allocation[] memory allocations)
```

| Parameter | Type | Description |
|---|---|---|
| `admin` | `address` | Receives `DEFAULT_ADMIN_ROLE` and `PAUSER_ROLE`. Must not be zero. |
| `allocations` | `Allocation[]` | Recipients and amounts. Sum must equal `MAX_SUPPLY`. |

### Allocation Struct

```solidity
struct Allocation {
    address recipient;  // Must not be zero
    uint256 amount;     // Base units (1e18 = 1 token)
}
```

### Custom Errors

| Error | Meaning |
|---|---|
| `InvalidAdmin(address)` | Admin is zero address |
| `EmptyAllocations()` | No allocations array provided |
| `InvalidAllocationRecipient(uint256 index)` | Zero-address recipient |
| `InvalidAllocationTotal(uint256 expected, uint256 actual)` | Sum ≠ MAX_SUPPLY |

## Public Functions

### Standard ERC-20

```solidity
function transfer(address to, uint256 value) external returns (bool)
function transferFrom(address from, address to, uint256 value) external returns (bool)
function approve(address spender, uint256 value) external returns (bool)
function balanceOf(address account) external view returns (uint256)
function allowance(address owner, address spender) external view returns (uint256)
function totalSupply() external view returns (uint256)  // Always 1_000_000_000 ether
function decimals() external pure returns (uint8)       // Always 18
function name() external pure returns (string)          // "WebAI3 Token"
function symbol() external pure returns (string)        // "AIC"
```

### Pausable

```solidity
function pause() external onlyRole(PAUSER_ROLE)
function unpause() external onlyRole(PAUSER_ROLE)
function paused() external view returns (bool)
```

Pausing freezes all transfers. Approvals and delegation still work while paused.

### Voting and Delegation

```solidity
function delegate(address delegatee) external
function getVotes(address account) external view returns (uint256)
function getPastVotes(address account, uint256 blockNumber) external view returns (uint256)
function getPastTotalSupply(uint256 blockNumber) external view returns (uint256)
```

> Voting power is **not** automatically self-delegated. Holders must call `delegate(address)` to activate their voting weight. This is standard ERC20Votes behavior.

### Permit (Gasless Approvals — EIP-2612)

```solidity
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external
function nonces(address owner) external view returns (uint256)
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

The presale contract uses `permit()` to approve USDC spending without a separate on-chain approval transaction.

### Access Control

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
function grantRole(bytes32 role, address account) external
function revokeRole(bytes32 role, address account) external
function renounceRole(bytes32 role, address caller) external
```

Roles:

| Role | Holder | Capability |
|---|---|---|
| `DEFAULT_ADMIN_ROLE` | Admin (multisig) | Grant/revoke any role |
| `PAUSER_ROLE` | Admin (multisig) | Call pause/unpause |

## Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
event Approval(address indexed owner, address indexed spender, uint256 value)
event Paused(address indexed account)
event Unpaused(address indexed account)
event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```

## Security Properties

### Immutability

No `mint()` or `burn()` functions exist. No upgrade mechanism (not a proxy). Supply is hardcoded to `MAX_SUPPLY = 1_000_000_000 ether` and validated at construction.

### Permit Replay Protection

Nonce increments on each permit call. `deadline` prevents stale signatures. EIP-712 domain separator ties signatures to the specific chain ID.

### Flash Loan Attack Resistance

Voting power uses historical checkpoints (`getPastVotes`). Governance contracts should reference the block number when a proposal was created — not the current block — preventing flash loan governance attacks.

### Reentrancy

ERC-20 has no transfer hooks (unlike ERC-777). All `_update()` calls are internal. No external calls in the contract.

## Gas Reference

| Operation | Gas (approx) |
|---|---|
| Transfer (cold slots) | ~51k |
| Transfer (warm slots) | ~29k |
| Delegate | ~30k–50k |
| Permit | ~2.5k |
| Constructor (1B tokens, 6 allocations) | ~200k (one-time) |

## Production Checklist

- [ ] Admin address is a Gnosis Safe multisig (M-of-N)
- [ ] All 6 allocations verified to sum to exactly `1,000,000,000 ether`
- [ ] Recipient addresses verified (no typos, no zero addresses)
- [ ] Full test suite: `forge test --gas-report`
- [ ] pause/unpause tested on Sepolia
- [ ] delegation and permit tested on Sepolia
- [ ] Deployed address recorded and propagated to all consumer repos
