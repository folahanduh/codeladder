---
id: crypto-advanced-eng
title: Upgradeability, gas optimisation and Layer 2s
level: advanced
minutes: 35
summary: When and how to use proxies safely, where gas really goes, and how rollups and account abstraction change deployment.
---

## Upgradeability: a trade-off, not a default

Deployed bytecode cannot change. **Proxy patterns** work around that: users call a proxy contract that holds the storage and forwards every call (with `delegatecall`) to a separate **implementation** contract. To upgrade, the admin points the proxy at a new implementation.

| Pattern | Upgrade logic lives in | Notes |
|---|---|---|
| **Transparent proxy** | The proxy (with a separate admin) | Simple mental model, slightly more gas |
| **UUPS** | The implementation | Cheaper; you must keep the upgrade function in every version |
| **Beacon** | A shared beacon contract | Upgrade many proxies at once |

Rules that prevent disasters:

- Use OpenZeppelin's upgradeable contracts and their **Foundry Upgrades** plugin, which checks storage layout between versions.
- **Never reorder, remove or change the type of existing storage variables.** Only append new ones. Otherwise the new code reads old data in the wrong slots.
- Constructors do not run for proxies. Use an `initializer` function, protect it, and call `_disableInitializers()` in the implementation's constructor.
- Put upgrade rights behind a multisig and a timelock.

The honest trade-off: an upgradeable contract is only as trustworthy as whoever can upgrade it. Many protocols launch upgradeable, then renounce or restrict upgrades once mature. Immutability is a feature users value.

## Where gas actually goes

Storage is by far the most expensive thing a contract does. Writing a new non-zero storage slot costs about 20,000 gas; reading a slot for the first time in a transaction costs about 2,100; memory and arithmetic cost a few gas each.

Optimisations that matter, in order:

1. **Touch storage less.** Read a storage variable into a local variable once, use it, write it back once.
2. **Pack variables.** Several small types declared next to each other share one 32-byte slot.

```solidity
// 3 slots
uint256 amount;
uint64 start;
uint256 total;

// 2 slots: start and duration are packed together
uint256 amount;
uint64 start;
uint64 duration;
```

3. **Use `constant` and `immutable`** for values that never change; they live in the bytecode, not storage.
4. **Use `calldata`** for read-only array and string parameters.
5. **Custom errors** instead of revert strings.
6. **Emit events** for data only off-chain apps need, instead of storing it.

Then measure with `forge test --gas-report` and `forge snapshot`. Never sacrifice readability or safety for tiny savings; a gas optimisation that introduces a bug is the most expensive kind.

## Layer 2 rollups

Rollups run transactions off Ethereum mainnet, then post the data (and proofs) back to it, inheriting much of its security at a fraction of the cost.

| Type | How correctness is ensured | Withdrawal to L1 | Examples |
|---|---|---|---|
| **Optimistic** | Assumed valid; anyone can submit a fraud proof during a challenge window | About 7 days via the native bridge | Arbitrum, Optimism, Base |
| **ZK (validity)** | A cryptographic proof is verified on L1 for every batch | Faster, once the proof is verified | zkSync, Starknet, Scroll, Linea |

For developers: most EVM rollups run the same Solidity, the same Foundry and the same viem, with a different chain ID and RPC URL. Watch for differences in `block.number` and timestamps, precompiles, and gas pricing (L2 fees include the cost of posting data to L1). Bridges between chains are a major source of hacks; use canonical bridges and well-audited messaging.

## Account abstraction

Traditional accounts (EOAs) are a single private key: lose it and everything is lost; every action needs ETH for gas.

- **ERC-4337** smart accounts are contracts: they can have multiple signers, spending limits, social recovery, session keys, batched actions, and **paymasters** that sponsor gas (users can pay in USDC or not at all).
- **EIP-7702** (live since Ethereum's 2025 Pectra upgrade) lets an existing EOA delegate to smart-account code, bringing batching and sponsorship to normal wallets.

For dApp builders this means far better onboarding: users sign in with a passkey and never touch a seed phrase or buy ETH for gas first.

## Quiz

? Version 2 of an upgradeable contract inserts a new variable above existing ones. What goes wrong?
- [ ] Nothing, the compiler fixes it
- [x] Storage slots shift, so the new code reads existing data from the wrong places
- [ ] Gas costs double
> Only append new storage variables. Use tooling that validates layouts.

? Which change usually saves the most gas?
- [x] Reducing storage reads and writes
- [ ] Shortening variable names
- [ ] Removing comments
> Storage operations cost thousands of gas; names and comments cost nothing at runtime.

? Why do withdrawals from optimistic rollups to Ethereum take about a week via the native bridge?
- [ ] Validators are slow
- [x] There is a challenge window for fraud proofs before the withdrawal is final
- [ ] Ethereum limits withdrawals
> Optimistic rollups assume validity unless challenged within the window.

? What can an ERC-4337 paymaster do?
- [ ] Mine blocks
- [x] Sponsor users' gas fees, or let them pay in another token
- [ ] Recover lost seed phrases
> Paymasters enable gasless and token-paid transactions for smart accounts.
