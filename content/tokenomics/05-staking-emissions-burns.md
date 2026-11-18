---
id: tok-incentives
title: Staking, emissions, burns and real yield
level: intermediate
minutes: 30
summary: Separate real returns from printed ones, design emission schedules, and understand when burns actually matter.
---

## Emissions: the printing press

**Emissions** are new tokens created over time, usually to reward stakers, validators or liquidity providers. They are a cost paid by every holder through dilution. Done well, they buy something valuable: network security, liquidity, early users. Done badly, they pay people to farm and dump.

Common schedules:

| Schedule | Shape | Example |
|---|---|---|
| Fixed per block | Same amount forever, so inflation % slowly falls | Many early chains |
| Halving | Cut in half on a schedule | Bitcoin, about every 4 years |
| Exponential decay | A % less each month | Many DeFi liquidity programmes |
| Dynamic | Depends on how much is staked or on usage | Ethereum's issuance under proof of stake |

## Nominal versus real yield

"Stake and earn 40% APY!" Paid in what?

If you earn 40% more tokens per year, and total supply also grows 40% per year from those same emissions, your **share of the network is unchanged**. You only avoided being diluted; non-stakers paid for it. And if the price falls because farmers sell their rewards, you can lose money while your token balance grows.

**Real yield** comes from actual revenue: trading fees, borrowing interest, protocol income, paid in ETH or stablecoins or used to buy tokens from the market. Ask every time: *where does this yield come from?* If the answer is "new tokens", it is dilution with extra steps. If nobody can answer, be very careful.

## Burns

Burning removes tokens permanently. It is often marketed as automatically good. It only helps when:

```text
net supply change = new issuance - tokens burned
```

is low or negative **and** demand holds up. Ethereum's EIP-1559 burns the base fee of every transaction, so when network usage is high, more ETH can be burned than issued. A "burn" of tokens the team never intended to sell, or a tiny burn alongside big emissions, changes little.

**Buybacks** use protocol revenue to buy tokens on the market (then burn them or send them to stakers or the treasury). They link token demand to business performance, which is why many mature protocols favour them.

:::exercise Inflationary or deflationary?
@@file net.js
@@prompt
Four lines: `const emitted = 10_000_000;`, `const burned = 1_000_000;`, `const net = emitted - burned;`, then print `net > 0 ? 'Inflationary' : 'Deflationary'` and `net` in the same `console.log`.
@@solution
const emitted = 10_000_000;
const burned = 1_000_000;
const net = emitted - burned;
console.log(net > 0 ? 'Inflationary' : 'Deflationary', net);
@@hint const\s+emitted\s*=\s*10_000_000
Line 1: `const emitted = 10_000_000;`
@@hint const\s+burned\s*=\s*1_000_000
Line 2: `const burned = 1_000_000;`
@@hint const\s+net\s*=\s*emitted\s*-\s*burned
Line 3: `const net = emitted - burned;`
@@hint net\s*>\s*0\s*\?\s*['"]Inflationary['"]\s*:\s*['"]Deflationary['"]\s*,\s*net
Line 4: `console.log(net > 0 ? 'Inflationary' : 'Deflationary', net);`
:::

## Mercenary capital

In 2020's "DeFi summer", protocols handed out huge token emissions to attract liquidity. Capital flooded in, farmed the rewards, sold them, and left the moment rewards dropped. Lessons the industry learned:

- Reward **behaviour you want to last** (long-term locking, real usage) rather than just parked capital.
- Taper emissions and announce schedules clearly.
- Measure **retention after rewards end**, not total value locked during them.

**Points programmes** (track activity now, convert to tokens later) are the modern version. Same economics, delayed.

## Model it

```js try
// 5 years of supply: 100M initial, 20M emitted in year 1 decaying 30% a year, plus fee burns
let supply = 100_000_000;
let emission = 20_000_000;
const yearlyBurn = 4_000_000; // assume steady usage burns 4M tokens a year

for (let year = 1; year <= 5; year++) {
  const before = supply;
  supply = supply + emission - yearlyBurn;
  const inflation = (supply / before - 1) * 100;
  console.log(`Year ${year}: emitted ${(emission / 1e6).toFixed(1)}M, supply ${(supply / 1e6).toFixed(1)}M, net inflation ${inflation.toFixed(1)}%`);
  emission *= 0.7;
}
```

Try changing the burn to 10M and the decay to 0.5. When does net inflation turn negative?

:::pro The sustainability test
Imagine the token price drops 80% and stays there for a year. Do validators or stakers still have a reason to stay? Does the treasury still cover two years of costs? Do users still use the product? Designs that pass this test survive bear markets.
:::

:::exercise Real return after dilution
@@file real.js
@@prompt
Three lines: `const apy = 0.25;`, `const inflation = 0.25;`, then print `((1 + apy) / (1 + inflation) - 1) * 100`.
@@solution
const apy = 0.25;
const inflation = 0.25;
console.log(((1 + apy) / (1 + inflation) - 1) * 100);
@@hint const\s+apy\s*=\s*0\.25
Line 1: `const apy = 0.25;`
@@hint const\s+inflation\s*=\s*0\.25
Line 2: `const inflation = 0.25;`
@@hint \(\s*\(\s*1\s*\+\s*apy\s*\)\s*\/\s*\(\s*1\s*\+\s*inflation\s*\)\s*-\s*1\s*\)\s*\*\s*100
Line 3: `console.log(((1 + apy) / (1 + inflation) - 1) * 100);` Count the brackets.
@@explain
Output: `0`. A 25% yield paid in new tokens, while supply grows 25%, leaves your real share exactly where it was.
:::

## Quiz

? Staking pays 25% APY in new tokens, and supply inflates 25% a year from those rewards. What happens to a staker's share of total supply?
- [ ] It grows 25% a year
- [x] It stays about the same; non-stakers are diluted instead
- [ ] It shrinks
> Nominal yield from emissions mostly redistributes value from non-stakers to stakers.

? Which is real yield?
- [ ] Rewards paid in newly minted governance tokens
- [x] Stakers receiving a share of trading fees paid in ETH or stablecoins
- [ ] A bonus for referring friends, paid in new tokens
> Real yield comes from revenue that users actually paid.

? A protocol emits 10M tokens a year and burns 1M a year. What is net issuance?
- [x] 9M tokens a year of new supply
- [ ] Deflationary, because it burns
- [ ] 11M tokens a year
> Net change is issuance minus burn. A small burn does not offset large emissions.
