---
id: tok-basics
title: "Tokenomics 101: supply, market cap and FDV"
level: beginner
minutes: 20
summary: The numbers every token has, how to calculate them, and why a "cheap" token often is not.
---

## What tokenomics is

**Tokenomics** (token economics) is the design of a token's supply, distribution and incentives: how many exist, who gets them and when, what they are used for, and what makes people want to hold or use them. Good tokenomics cannot save a useless product, but bad tokenomics can sink a good one.

## The three supply numbers

| Metric | Meaning |
|---|---|
| **Max supply** | The most that can ever exist. Bitcoin: 21 million. Some tokens have no cap. |
| **Total supply** | Tokens created so far (minus any burned), including locked ones. |
| **Circulating supply** | Tokens actually unlocked and able to trade today. |

## Market cap and FDV

```text
Market cap = price x circulating supply
FDV (fully diluted valuation) = price x max supply
```

**Example.** A token trades at $0.50. Max supply is 1,000,000,000. Only 100,000,000 (10%) circulate.

- Market cap = $0.50 x 100M = **$50 million**
- FDV = $0.50 x 1B = **$500 million**
- FDV is **10x** the market cap.

That gap is the supply still to come. If the other 900 million tokens unlock over four years, demand must grow roughly tenfold just to keep the price at $0.50. This **low float, high FDV** pattern has burned many buyers.

## Price is not value

A token at $0.0001 is not "cheap" and a token at $3,000 is not "expensive". Price on its own means nothing without supply.

| Token | Price | Circulating supply | Market cap |
|---|---|---|---|
| A | $0.0001 | 900 trillion | $90 billion |
| B | $40.00 | 2 million | $80 million |

Token A "only" needs to reach $1 to make you rich? That would be a market cap of $900 trillion, many times the value of every company on Earth. This trap is called **unit bias**.

## Supply over time

- **Fixed supply** (Bitcoin): new coins are issued on a schedule that halves roughly every four years, approaching 21 million.
- **Inflationary**: new tokens keep being created (often as staking rewards). Holders who do not earn the new tokens are diluted.
- **Deflationary pressure**: tokens are **burned** (destroyed). Ethereum burns the base fee of every transaction, so its supply can shrink when the network is busy.
- **Elastic / stable**: supply expands and contracts to hold a target price (stablecoins). Fiat-backed stablecoins like USDC instead mint and redeem against real reserves.

## Questions to ask about any token

1. What is the max supply, and how much circulates today?
2. What is the FDV to market cap ratio?
3. When do the locked tokens unlock, and who gets them?
4. Is new supply being created? By whom, and why?
5. What is the token **used for**, and would anyone want it if the price stopped going up?

:::try Try it
Open the [Tokenomics Simulator](#token-sim) and load the **Low float, high FDV** preset. Look at the FDV to market cap ratio, then the circulating supply curve. That gap is what this lesson is about.
:::

## Quiz

? Price $2, circulating supply 50 million, max supply 500 million. What is the market cap?
- [x] $100 million
- [ ] $1 billion
- [ ] $250 million
> Market cap uses circulating supply: 2 x 50M = $100M. FDV would be $1B.

? In the same example, what does the 10x gap between FDV and market cap suggest?
- [ ] The token is undervalued by 10x
- [x] 90% of the supply is still to arrive, which will dilute holders unless demand grows a lot
- [ ] The token has no max supply
> The gap is future supply. It has to be absorbed by future demand.

? Token X costs $0.00001. Why is it not necessarily cheap?
- [ ] Low-priced tokens are always scams
- [x] Value depends on price times supply; with a huge supply, the market cap may already be enormous
- [ ] Prices below one cent are not allowed on exchanges
> Unit bias: always compare market caps, never prices.

? What does burning tokens do?
- [x] Permanently removes them from supply
- [ ] Locks them for a year
- [ ] Sends them to the team
> Burned tokens are destroyed. Whether that supports price depends on how burning compares with new issuance and demand.
