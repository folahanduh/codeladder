---
id: tok-mechanisms
title: "Mechanism design: ve-tokens, bonding curves and game theory"
level: advanced
minutes: 40
summary: The designs advanced protocols use to align incentives, the maths behind them, and how they fail.
---

## Thinking in incentives

**Mechanism design** is designing the rules of a game so that people acting in their own interest produce the outcome you want. Every token system is a game: holders, stakers, traders, LPs, insiders, attackers. For each design decision, ask: *what is the most profitable thing a selfish, well-funded, clever person could do here?* Then make sure that thing is good for the system, or impossible.

## Game theory you will use

- **Nash equilibrium**: a situation where nobody gains by changing strategy alone. Your design's equilibrium is what will actually happen, whatever the whitepaper hopes.
- **Prisoner's dilemma**: everyone would be better off if all held, but each individual is better off selling first. Unlock events often play out this way.
- **Coordination and Schelling points**: people converge on obvious focal points (round-number prices, unlock dates, snapshot rumours).
- **Reflexivity**: price affects fundamentals, which affect price. Rising price raises collateral values and staking APY in dollar terms, attracting more buyers, until it reverses and the loop runs backwards.

## Vote-escrow (ve) tokenomics

Popularised by Curve: you lock tokens for a chosen time (up to 4 years) and receive non-transferable **veTokens**.

```text
voting power = tokens locked x (time remaining / maximum lock time)
```

Lock 1,000 tokens for 4 years: 1,000 veTokens. For 1 year: 250. Power decays linearly as the unlock date approaches, unless you extend the lock.

veToken holders typically get:

- **Governance votes**, including **gauge votes** that direct where new emissions go.
- **Boosted rewards** on their own liquidity.
- A **share of protocol fees**.

Why it works: it rewards long-term commitment and removes supply from the market. Side effects: protocols compete to direct emissions, creating **bribe markets** where projects pay veToken holders to vote for their pools, and meta-protocols that pool locks. Liquidity of locked positions becomes a problem of its own.

:::exercise Vote-escrow voting power
@@file ve.js
@@prompt
Write an arrow function `votingPower` that takes `tokens` and `yearsLocked` and returns `tokens * (yearsLocked / 4)`. Print `votingPower(2000, 2)`.
@@solution
const votingPower = (tokens, yearsLocked) => tokens * (yearsLocked / 4);
console.log(votingPower(2000, 2));
@@hint const\s+votingPower\s*=\s*\(\s*tokens\s*,\s*yearsLocked\s*\)\s*=>
Line 1 starts `const votingPower = (tokens, yearsLocked) =>`
@@hint tokens\s*\*\s*\(\s*yearsLocked\s*\/\s*4\s*\)
then `tokens * (yearsLocked / 4);`
@@hint votingPower\(\s*2000\s*,\s*2\s*\)
Line 2: `console.log(votingPower(2000, 2));`
:::

## Bonding curves

A **bonding curve** is a contract that mints tokens when you buy and burns them when you sell, at a price set by a formula of the current supply:

```text
linear curve:  price(s) = m * s + b
cost to buy from supply s1 to s2 = area under the curve
                                 = m/2 * (s2^2 - s1^2) + b * (s2 - s1)
```

```js try
// Linear bonding curve: price rises 0.000001 USDC per token minted, starting at 0.01
const m = 0.000001, b = 0.01;
const price = (s) => m * s + b;
const cost = (s1, s2) => (m / 2) * (s2 ** 2 - s1 ** 2) + b * (s2 - s1);

let supply = 0;
for (const buy of [10_000, 10_000, 10_000]) {
  const paid = cost(supply, supply + buy);
  supply += buy;
  console.log(`bought ${buy}, paid ${paid.toFixed(2)} USDC, price now ${price(supply).toFixed(4)}`);
}
console.log('reserve held by the curve:', cost(0, supply).toFixed(2), 'USDC');
```

Properties: always liquid (the contract is the counterparty), price discovery without an order book, and the reserve always covers selling everyone back down the curve. Risks: early buyers profit directly from later buyers, which drives speculation; front-running on each purchase; the shape of the curve hard-codes who wins. Many token launchpads use curves to bootstrap a token before moving it to an AMM.

:::exercise Cost to buy on a bonding curve
@@file curve.js
@@prompt
Write `cost` as an arrow function of `s1` and `s2`: `(0.000001 / 2) * (s2 ** 2 - s1 ** 2) + 0.01 * (s2 - s1)`. Print `cost(0, 10000)`.
@@solution
const cost = (s1, s2) => (0.000001 / 2) * (s2 ** 2 - s1 ** 2) + 0.01 * (s2 - s1);
console.log(cost(0, 10000));
@@hint const\s+cost\s*=\s*\(\s*s1\s*,\s*s2\s*\)\s*=>
Line 1 starts `const cost = (s1, s2) =>`
@@hint \(\s*0\.000001\s*\/\s*2\s*\)\s*\*\s*\(\s*s2\s*\*\*\s*2\s*-\s*s1\s*\*\*\s*2\s*\)
first term: `(0.000001 / 2) * (s2 ** 2 - s1 ** 2)`
@@hint \+\s*0\.01\s*\*\s*\(\s*s2\s*-\s*s1\s*\)
second term: `+ 0.01 * (s2 - s1);`
@@hint cost\(\s*0\s*,\s*10000\s*\)
Line 2: `console.log(cost(0, 10000));`
@@explain
Output: about `150`: the first 10,000 tokens cost 150 USDC in total, matching the lesson's example (floating-point maths may show a tiny rounding tail).
:::

## Governance attacks

If voting power is just token balance at the time of voting, an attacker can **borrow** tokens with a flash loan, vote, and repay in one transaction. In 2022 the Beanstalk protocol lost around $180 million this way: the attacker borrowed enough to pass a proposal sending the treasury to themselves.

Defences:

- **Snapshot** voting power at a past block, before the proposal.
- **Timelocks** between a vote passing and execution, so users can react.
- **Quorums**, vote delays, and guardians who can veto clearly malicious proposals.
- Locked voting (ve-tokens) where power cannot be borrowed.

## When designs fail: stablecoin death spirals

Algorithmic stablecoins that rely on a sister token to absorb volatility are the textbook reflexivity failure. In May 2022, TerraUSD lost its peg; redemptions minted ever more LUNA, LUNA's price collapsed, which made the peg less credible, which caused more redemptions. Tens of billions of dollars of value disappeared within days. The lesson: a mechanism that only works while confidence holds will eventually be tested by a loss of confidence.

:::pro Stress-test every mechanism
For each design, write down: the intended equilibrium; what a whale with $50 million and a flash loan does; what happens if the price falls 90% in a week; what happens if the team disappears. If any answer is "it collapses", redesign before launch.
:::

## Quiz

? You lock 2,000 tokens for 2 years in a ve system with a 4-year maximum. What is your initial voting power?
- [ ] 2,000
- [x] 1,000
- [ ] 4,000
> 2,000 x (2 / 4) = 1,000, decaying to zero as the unlock approaches.

? How did the 2022 Beanstalk governance attack work?
- [x] The attacker flash-borrowed voting power, passed a malicious proposal and repaid within one transaction
- [ ] The attacker guessed the admin's private key
- [ ] A bug in an AMM pool
> Voting power based on current balance can be borrowed. Snapshots and timelocks prevent it.

? On a linear bonding curve, who profits most if lots of people buy later?
- [x] Early buyers, because later buys raise the price they can sell at
- [ ] Late buyers
- [ ] Nobody, prices are fixed
> The curve guarantees rising prices with supply, transferring value from later to earlier buyers.

? What is reflexivity in token economies?
- [ ] Tokens that reflect light
- [x] A feedback loop where price changes alter fundamentals, which push price further the same way
- [ ] Mirroring a token on another chain
> Reflexive loops amplify booms and busts. Algorithmic stablecoins are the classic example.
