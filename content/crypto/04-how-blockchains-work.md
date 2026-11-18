---
id: crypto-blockchain
title: How blockchains work
level: beginner
minutes: 25
summary: Blocks, transactions, consensus, gas and accounts, explained with Ethereum, plus your first look at a real transaction.
---

## A shared ledger nobody owns

A blockchain is a database that thousands of independent computers (**nodes**) keep identical copies of. Nobody can change past entries, and anyone can verify everything. It is useful when people who do not trust each other need to agree on who owns what, without a bank or company in the middle.

## Blocks chained by hashes

Transactions are grouped into **blocks**. Each block includes the hash of the previous block:

```text
[Block 100]          [Block 101]               [Block 102]
 prev: 0x9a..   <--   prev: hash(Block 100)  <--  prev: hash(Block 101)
 txs: ...             txs: ...                     txs: ...
```

Change one transaction in block 100 and its hash changes, which breaks block 101's link, and 102's, all the way up. Everyone would see the forgery immediately.

## The life of a transaction

1. You build a transaction (send 0.1 ETH to Bob) and your wallet **signs** it.
2. It is broadcast to the network and waits in the **mempool** (pending transactions).
3. A **validator** includes it in a block, choosing transactions that pay higher fees first.
4. The block is shared, every node checks every signature and rule, and adds it to their copy.
5. After more blocks build on top, it becomes practically irreversible (**finality**).

## Consensus: agreeing without a boss

How do thousands of strangers agree on the next block?

- **Proof of Work** (Bitcoin): miners burn electricity searching for a hash below a target (try mining in the [Hash Lab](#hash-lab)). Rewriting history would need more computing power than the honest majority.
- **Proof of Stake** (Ethereum since 2022): validators lock up ETH as collateral (32 ETH per validator). They are randomly chosen to propose blocks and lose stake ("slashing") if they cheat. It uses vastly less energy than proof of work.

## Ethereum accounts

| Type | Controlled by | Has code? |
|---|---|---|
| **Externally owned account (EOA)** | A private key | No |
| **Contract account** | Its code | Yes: a smart contract |

Every EOA has a **nonce**: a counter of transactions sent. It stops the same signed transaction being replayed twice.

## Units and gas

ETH has 18 decimal places. The smallest unit is the **wei**:

| Unit | Wei | Used for |
|---|---|---|
| wei | 1 | Contract maths |
| gwei | 1,000,000,000 (10^9) | Gas prices |
| ether | 1,000,000,000,000,000,000 (10^18) | Human amounts |

**Gas** measures computation. A plain ETH transfer costs 21,000 gas; complex contract calls cost more. You pay `gas used x gas price`. Since EIP-1559, each block has a **base fee** (burned, destroyed forever) plus an optional **priority fee** (tip to the validator).

```text
Fee = 21,000 gas x (base 8 gwei + tip 1 gwei) = 189,000 gwei = 0.000189 ETH
```

:::exercise Calculate a gas fee in wei
@@file fee.js
@@prompt
Work out the fee for a plain transfer (21,000 gas) at 9 gwei, using BigInt (numbers ending in `n`). Four lines:

1. `const gasUsed = 21000n;`
2. `const gasPriceWei = 9n * 10n ** 9n;` (9 gwei)
3. `const feeWei = gasUsed * gasPriceWei;`
4. `console.log(feeWei.toString());`
@@solution
const gasUsed = 21000n;
const gasPriceWei = 9n * 10n ** 9n;
const feeWei = gasUsed * gasPriceWei;
console.log(feeWei.toString());
@@hint const\s+gasUsed\s*=\s*21000n
Line 1: `const gasUsed = 21000n;` (the `n` makes it a BigInt).
@@hint const\s+gasPriceWei\s*=\s*9n\s*\*\s*10n\s*\*\*\s*9n
Line 2: `const gasPriceWei = 9n * 10n ** 9n;`
@@hint const\s+feeWei\s*=\s*gasUsed\s*\*\s*gasPriceWei
Line 3: `const feeWei = gasUsed * gasPriceWei;`
@@hint feeWei\.toString\(\s*\)
Line 4: `console.log(feeWei.toString());`
@@explain
Output: `189000000000000` wei, which is 0.000189 ETH. Wallets do exactly this maths with integers, then format it for display.
:::

## Layer 1 and Layer 2

Ethereum mainnet (Layer 1) is secure but limited in throughput, so fees rise when busy. **Layer 2 rollups** (Arbitrum, Optimism, Base, zkSync, Starknet and others) execute transactions cheaply, then post compressed data and proofs back to Ethereum. Most everyday activity now happens on L2s. Same Solidity code, same tools.

## Testnets

**Sepolia** is Ethereum's main test network. Its ETH is free (from **faucets**) and worthless, so you can make every mistake there. Always deploy to a testnet first.

:::try Read a real transaction
Go to sepolia.etherscan.io (or etherscan.io for mainnet), open any recent block, click a transaction, and find: from, to, value, gas used, gas price, the block number, and the status. Every number in this lesson is on that page.
:::

You can also query the chain from your terminal once Foundry is installed:

```bash
cast block-number --rpc-url $SEPOLIA_RPC_URL
cast balance 0xYourAddress --ether --rpc-url $SEPOLIA_RPC_URL
cast to-wei 0.1
cast from-wei 189000000000000
```

:::exercise Query the chain with cast
@@file Terminal
@@lang bash
@@prompt
Two Foundry commands: get the latest block number using the RPC URL in `$SEPOLIA_RPC_URL`, then convert `0.1` ether to wei.
@@solution
cast block-number --rpc-url $SEPOLIA_RPC_URL
cast to-wei 0.1
@@hint ^\s*cast\s+block-number\s+--rpc-url\s+\$SEPOLIA_RPC_URL\s*$
Line 1: `cast block-number --rpc-url $SEPOLIA_RPC_URL`
@@hint ^\s*cast\s+to-wei\s+0\.1\s*$
Line 2: `cast to-wei 0.1`
:::

## Quiz

? Why can't someone quietly edit a transaction in an old block?
- [ ] Old blocks are encrypted
- [x] Its hash would change and break the link in every later block, which every node checks
- [ ] Only the original sender can read old blocks
> Hash links make history tamper-evident.

? Ethereum's consensus mechanism since 2022 is:
- [ ] Proof of Work
- [x] Proof of Stake
- [ ] Proof of Authority
> The Merge moved Ethereum to proof of stake, cutting its energy use dramatically.

? How many wei are in 1 ether?
- [ ] 1,000
- [ ] 10^9
- [x] 10^18
> 18 decimals. Gwei (10^9 wei) is the unit used for gas prices.

? What happens to the base fee under EIP-1559?
- [ ] It goes to the validator
- [x] It is burned (destroyed)
- [ ] It is refunded to the sender
> The base fee is burned; only the priority fee (tip) goes to the validator.
