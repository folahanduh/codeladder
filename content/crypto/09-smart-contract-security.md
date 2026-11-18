---
id: crypto-security
title: Smart contract security
level: advanced
minutes: 45
summary: The vulnerability classes behind billions in losses (reentrancy, access control, oracle manipulation, replay and more) and how to prevent them.
---

## Why security is different here

Web bugs can be patched in minutes. Smart contracts are usually immutable, hold real money, run in public, and can be attacked by anyone, instantly, with borrowed millions (flash loans). Billions of dollars have been lost to contract bugs and key compromises. Security is not a final step; it is the job.

## 1. Reentrancy

A contract sends ETH (or calls an unknown contract) **before** updating its own state. The receiver's code calls back in and repeats the withdrawal while the balance still looks full. This drained The DAO in 2016 and still appears today.

```solidity
// VULNERABLE
function withdraw() external {
    uint256 amount = balances[msg.sender];
    (bool ok, ) = msg.sender.call{value: amount}("");   // attacker re-enters here...
    require(ok);
    balances[msg.sender] = 0;                             // ...before this runs
}
```

```solidity
// SAFE: checks, effects, interactions
function withdraw() external nonReentrant {
    uint256 amount = balances[msg.sender];
    if (amount == 0) revert NothingToWithdraw();   // checks
    balances[msg.sender] = 0;                       // effects (update state first)
    (bool ok, ) = msg.sender.call{value: amount}(""); // interactions (external calls last)
    if (!ok) revert TransferFailed();
}
```

Follow **checks-effects-interactions** everywhere and add OpenZeppelin's `ReentrancyGuard` (`nonReentrant`) to functions that move value. Watch for **read-only reentrancy** too: other protocols reading your state mid-update.

## 2. Access control

Missing `onlyOwner` on a mint or upgrade function. An `initialize` function anyone can call first. Using `tx.origin` (the original signer) instead of `msg.sender` for auth, which lets a malicious contract act on a user's behalf.

- Use OpenZeppelin `Ownable2Step` or `AccessControl` with named roles.
- Put privileged roles behind a **multisig** (Safe) and a **timelock** so users can see changes coming.
- Write a test for every privileged function proving strangers are rejected.

## 3. Oracle and price manipulation

If your protocol reads a token's price from a single DEX pool's current reserves, an attacker can borrow millions in a **flash loan**, skew that pool, exploit your protocol at the fake price, and repay the loan, all in one transaction.

- Use robust oracles (Chainlink price feeds) or time-weighted average prices (TWAPs), never spot prices from one pool.
- Check oracle data is fresh and within sane bounds.

## 4. Arithmetic and precision

Solidity 0.8+ reverts on overflow, but precision bugs remain:

```solidity
uint256 fee = amount / 1000 * 3;   // BAD: divides first, small amounts round to zero
uint256 fee = amount * 3 / 1000;   // better: multiply before dividing
```

- Decide who rounding should favour (almost always the protocol, never the user who can repeat it).
- Be careful with `unchecked` blocks and with tokens that have different decimals (USDC has 6, most have 18).

## 5. Front-running and MEV

Pending transactions are public. Bots can see your large swap and trade before and after it ("sandwich"), profiting from the price movement they caused.

- Swaps need a **slippage limit** (`minAmountOut`) and a **deadline**.
- Commit-reveal schemes hide sensitive values until it is too late to front-run.

## 6. Signature replay

A signed message (a permit, an off-chain order) must be usable once, on one chain, for one contract. Include a **nonce**, the **chain ID**, the **contract address** and an **expiry**: exactly what EIP-712 domains and OpenZeppelin's `EIP712` and `Nonces` give you. Use `ECDSA.recover` from OpenZeppelin, which rejects malleable signatures.

## 7. Denial of service

- Looping over an array that users can grow will eventually exceed the block gas limit and brick the function.
- Sending ETH to a list of addresses in one loop fails entirely if one recipient reverts. Prefer **pull payments**: record what each user is owed and let them withdraw.

## 8. Unsafe token interactions

Some tokens do not return `true` from `transfer`, charge fees on transfer, or rebase balances. Use OpenZeppelin's `SafeERC20` (`safeTransfer`, `safeTransferFrom`), and measure balances before and after if fee-on-transfer tokens are possible.

## 9. Upgrade and initialisation bugs

Proxies separate storage from logic. Mistakes in storage layout or unprotected initialisers have caused major losses. See the upgradeability lesson before using proxies.

## 10. Keys and operations

Many of the largest losses were not code bugs at all but compromised private keys (bridges, exchanges, deployer keys). Use multisigs, hardware wallets, separate deployer and admin keys, monitoring and an incident plan.

## The pre-deployment checklist

- Every external function: who can call it, and with what inputs?
- Checks-effects-interactions everywhere; `nonReentrant` where value moves.
- No `tx.origin` auth. No unbounded loops. Pull over push payments.
- Oracles are robust and freshness-checked. Slippage and deadlines on swaps.
- Signatures include nonce, chain ID, contract and expiry.
- 100% of business logic has unit, fuzz and invariant tests.
- Slither and at least one other analyser run clean (or every finding explained).
- An independent audit or competitive audit for anything holding significant value.
- Admin keys in a multisig behind a timelock. A pause switch and an incident plan.

:::pro Learn by breaking things
Play **Ethernaut** (OpenZeppelin), then **Damn Vulnerable DeFi**. Read post-mortems on rekt.news and audit reports from firms like Trail of Bits, OpenZeppelin, Spearbit and Cyfrin. Auditing contests (Code4rena, Sherlock, Cantina) pay for found bugs and are a recognised path into a security career.
:::

## Quiz

? What is the core fix for reentrancy?
- [ ] Use tx.origin instead of msg.sender
- [x] Update state before making external calls (checks-effects-interactions), plus a reentrancy guard
- [ ] Use a newer compiler version
> If balances are zeroed first, re-entering finds nothing left to take.

? A lending protocol prices collateral using one DEX pool's current reserves. What attack does this invite?
- [ ] Signature replay
- [x] Flash-loan price manipulation
- [ ] Denial of service
> Spot prices can be moved within one transaction. Use robust oracles or TWAPs.

? Which fee calculation loses the least precision?
- [ ] amount / 1000 * 3
- [x] amount * 3 / 1000
- [ ] They are identical
> Integer division truncates, so divide last.

? A signed permit can be reused on another chain where the same contract is deployed. What is missing?
- [ ] A higher gas price
- [x] The chain ID (and contract address) in the signed data, as EIP-712 domains provide
- [ ] An event
> Domain separation and nonces make each signature valid exactly once, in one place.
