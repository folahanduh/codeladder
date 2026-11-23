---
id: sec-blockchain-threats
title: Attacking blockchain systems beyond the contract
level: advanced
minutes: 40
summary: Bridges, oracles, consensus, MEV, nodes and front ends. The whole system an attacker sees, the incidents that taught each lesson, and the controls that work.
---

## The protocol is more than its contracts

The [smart contract security](#lesson-crypto-security) lesson covered bugs inside contracts. Real protocols are systems: contracts plus oracles, bridges, nodes, keys, front ends, governance and people. Attackers pick the weakest part.

```text
users -> front end (DNS, CDN, JS libraries) -> wallet -> RPC node -> chain
                                                                    |-- your contracts
                                                                    |-- oracles (prices)
                                                                    |-- bridges (other chains)
                                         admin keys / multisig / governance --^
```

## Bridges: the biggest honeypots

A bridge locks assets on one chain and mints a representation on another. Whoever can convince the bridge that a deposit happened can mint unbacked tokens. Some of the largest losses in crypto history were bridges:

- **Ronin (2022)**: attackers obtained enough validator keys (5 of 9) to approve fake withdrawals. A key-management failure, not a code bug.
- **Wormhole (2022)**: a signature-verification flaw let an attacker mint wrapped ETH without depositing.
- **Nomad (2022)**: an initialisation mistake made every message look valid; hundreds of people copied the first attacker's transaction.

Controls: many independent validators with hardware-protected keys, rate limits on withdrawals, delays on large transfers, and monitoring that can pause the bridge.

## Oracles

Contracts cannot see the outside world, so **oracles** report prices and data. If an attacker can move the price your protocol reads, they can borrow too much or liquidate others unfairly. Defences: decentralised oracle networks, time-weighted prices, sanity bounds, and checking that data is fresh.

:::exercise Reject stale or broken prices
@@file PriceCheck.sol
@@prompt
After reading a Chainlink-style feed, reject bad data. Three lines:

1. `(, int256 price, , uint256 updatedAt, ) = feed.latestRoundData();`
2. `require(price > 0, "Bad price");`
3. `require(block.timestamp - updatedAt < 1 hours, "Stale price");`
@@solution
(, int256 price, , uint256 updatedAt, ) = feed.latestRoundData();
require(price > 0, "Bad price");
require(block.timestamp - updatedAt < 1 hours, "Stale price");
@@hint ^\s*\(\s*,\s*int256\s+price\s*,\s*,\s*uint256\s+updatedAt\s*,\s*\)\s*=\s*feed\.latestRoundData\(\s*\)\s*;
Line 1 destructures five return values, keeping only the 2nd and 4th: `(, int256 price, , uint256 updatedAt, ) = feed.latestRoundData();`
@@hint require\(\s*price\s*>\s*0\s*,\s*["']Bad price["']\s*\)\s*;
Line 2: `require(price > 0, "Bad price");`
@@hint require\(\s*block\.timestamp\s*-\s*updatedAt\s*<\s*1\s+hours\s*,\s*["']Stale price["']\s*\)\s*;
Line 3: `require(block.timestamp - updatedAt < 1 hours, "Stale price");`
@@explain
Feeds can stop updating (network trouble, a paused feed, a sequencer outage on an L2). Without these checks, your protocol keeps trusting yesterday's price while the market has moved 30%. Pick the freshness window from the feed's documented update interval.
:::

## Consensus and the chain itself

- **51% attacks**: on smaller proof-of-work chains, renting enough hash power to rewrite recent blocks has enabled double-spends against exchanges. Defence for integrators: wait for more confirmations on smaller chains.
- **Reorgs and finality**: never treat a transaction as final until the chain's finality rules say so.
- **L2 sequencers**: most rollups have a single sequencer today; if it goes down, price feeds and liquidations behave strangely. Chainlink publishes sequencer-uptime feeds for this.

## MEV and the public mempool

Pending transactions are visible. Searchers reorder, insert and copy them to extract value (**MEV**): sandwiching swaps, front-running liquidations, copying profitable transactions. Builder defences: slippage limits and deadlines, commit-reveal designs, batch auctions, and offering private transaction submission to users.

## Nodes and RPC

Your node or RPC provider is part of your trust chain. A malicious or compromised RPC can lie about balances and state to your front end. Use reputable providers, compare results across more than one for critical reads, never expose admin RPC methods publicly, and protect validator keys with remote signers and slashing protection.

## Governance

If tokens vote on upgrades, an attacker who can borrow or buy enough votes can pass a malicious proposal (the Beanstalk governance attack in 2022 used a flash loan to do exactly that). Snapshot voting power before proposals, add timelocks, and give a guardian the power to veto obviously malicious actions.

## Quiz

? The Ronin bridge loss happened mainly because:
- [ ] Of a reentrancy bug
- [x] Attackers gained control of enough validator keys to approve fake withdrawals
- [ ] Of a 51% attack on Ethereum
> Key management, not contract code, was the weak point.

? Why check updatedAt on an oracle price?
- [x] Feeds can stop updating, and a stale price can be badly wrong
- [ ] It saves gas
- [ ] It prevents reentrancy
> Freshness checks stop your protocol acting on outdated data.

? A user's large swap gets sandwiched. Which setting most directly limits the damage?
- [ ] A higher gas price
- [x] A tight slippage limit (minimum amount out) with a deadline
- [ ] A longer approval
> The swap reverts instead of executing at a manipulated price.

? Why compare critical reads across more than one RPC provider?
- [ ] To save money
- [x] A single compromised or faulty RPC could return false state to your app
- [ ] Providers require it
> Your RPC is part of what you trust; reduce single points of failure.
