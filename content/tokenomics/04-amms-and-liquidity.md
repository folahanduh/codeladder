---
id: tok-amm
title: AMMs, liquidity and price impact
level: intermediate
minutes: 35
summary: How x*y=k sets prices, why big trades move them, what liquidity providers earn and risk, and how launches use pools.
---

## From order books to formulas

Traditional exchanges match buyers and sellers in an **order book**. An **Automated Market Maker (AMM)** replaces that with a pool of two tokens and a formula. Anyone can trade against the pool at any time, and anyone can add liquidity to it.

## The constant product formula

Uniswap v2 popularised the simplest design. A pool holds `x` of TOKEN and `y` of USDC, and trades must keep:

```text
x * y = k   (constant)
price of TOKEN in USDC = y / x
```

When you buy TOKEN, you add USDC (y goes up) and remove TOKEN (x goes down). To keep `k` constant, each extra token costs more than the last. The pool can never run out: the price just rises towards infinity.

## A worked trade

Pool: 1,000,000 TOKEN and 250,000 USDC, so the price is **$0.25**. Fee: 0.3%. You buy with 10,000 USDC.

```text
USDC in after fee = 10,000 x 0.997                = 9,970
TOKEN out         = x * in / (y + in)
                  = 1,000,000 x 9,970 / 259,970   = 38,350.6 TOKEN
Your average price = 10,000 / 38,350.6            = $0.2608
Pool price after   = 260,000 / 961,649.4           = $0.2704
```

You paid an average of 4.3% more than the starting price: about 4% from your own trade moving the price along the curve (**price impact**), plus the 0.3% fee. Bigger trades and smaller pools mean more impact. Run the numbers yourself in the [AMM Lab](#amm-lab).

```js try
function quote({ x, y, fee = 0.003 }, usdcIn) {
  const inAfterFee = usdcIn * (1 - fee);
  const out = (x * inAfterFee) / (y + inAfterFee);
  const avg = usdcIn / out;
  return { out, avg, impact: avg / (y / x) - 1, newPrice: (y + usdcIn) / (x - out) };
}

const pool = { x: 1_000_000, y: 250_000 };
for (const size of [100, 1_000, 10_000, 50_000]) {
  const q = quote(pool, size);
  console.log(`Spend ${size} USDC: get ${q.out.toFixed(0)} TOKEN, impact ${(q.impact * 100).toFixed(2)}%`);
}
```

:::exercise Write the swap formula
@@file amm.js
@@prompt
Write `getAmountOut(amountIn, reserveIn, reserveOut)` with a 0.3% fee: `inWithFee` is `amountIn * 0.997`, and the function returns `(reserveOut * inWithFee) / (reserveIn + inWithFee)`. Then print `getAmountOut(10000, 250000, 1000000)`.
@@solution
function getAmountOut(amountIn, reserveIn, reserveOut) {
  const inWithFee = amountIn * 0.997;
  return (reserveOut * inWithFee) / (reserveIn + inWithFee);
}
console.log(getAmountOut(10000, 250000, 1000000));
@@hint function\s+getAmountOut\s*\(\s*amountIn\s*,\s*reserveIn\s*,\s*reserveOut\s*\)\s*\{
Line 1: `function getAmountOut(amountIn, reserveIn, reserveOut) {`
@@hint const\s+inWithFee\s*=\s*amountIn\s*\*\s*0\.997
Line 2: `const inWithFee = amountIn * 0.997;`
@@hint return\s*\(\s*reserveOut\s*\*\s*inWithFee\s*\)\s*\/\s*\(\s*reserveIn\s*\+\s*inWithFee\s*\)
Line 3: `return (reserveOut * inWithFee) / (reserveIn + inWithFee);`
@@hint getAmountOut\(\s*10000\s*,\s*250000\s*,\s*1000000\s*\)
Last line: `console.log(getAmountOut(10000, 250000, 1000000));`
@@explain
Output: about `38350.58` tokens, matching the worked example. This is the same maths Uniswap v2's contracts run, written with integers on-chain.
:::

## Slippage protection

Between signing your swap and it landing in a block, other trades can move the price. Your **slippage tolerance** sets the worst price you accept (as a minimum amount out). Too tight and the transaction fails; too loose and bots can sandwich you. A deadline stops a stale transaction executing hours later.

## Liquidity providers

Anyone can deposit both tokens (at the current ratio) and receive **LP tokens** representing their share of the pool. Every trade's fee stays in the pool, so LP shares grow in value with trading volume.

The catch is **impermanent loss**: when the price moves, the pool automatically sells the rising token and buys the falling one. Compared with simply holding both, an LP ends up with less.

```text
IL = 2 * sqrt(r) / (1 + r) - 1      where r = new price / old price

price x2   -> about -5.7%
price x4   -> -20%
price x0.5 -> about -5.7%
```

LPs profit only when fees earned exceed impermanent loss. Pools of two assets that move together (like two stablecoins) have little IL.

:::exercise Impermanent loss in one line
@@file il.js
@@prompt
Write an arrow function `il` that takes `r` and returns `(2 * Math.sqrt(r)) / (1 + r) - 1`, then print `il(2)` and `il(4)`.
@@solution
const il = (r) => (2 * Math.sqrt(r)) / (1 + r) - 1;
console.log(il(2));
console.log(il(4));
@@also
const il = r => (2 * Math.sqrt(r)) / (1 + r) - 1;
console.log(il(2));
console.log(il(4));
@@hint const\s+il\s*=\s*\(?\s*r\s*\)?\s*=>
Line 1 starts `const il = (r) =>`
@@hint \(\s*2\s*\*\s*Math\.sqrt\(\s*r\s*\)\s*\)\s*\/\s*\(\s*1\s*\+\s*r\s*\)\s*-\s*1
The formula: `(2 * Math.sqrt(r)) / (1 + r) - 1`
@@hint console\.log\(\s*il\(\s*2\s*\)\s*\)
`console.log(il(2));`
@@hint console\.log\(\s*il\(\s*4\s*\)\s*\)
`console.log(il(4));`
@@explain
Output: about `-0.057` (a 5.7% loss when the price doubles) and `-0.2` (20% when it quadruples), compared with just holding.
:::

## Concentrated liquidity

Uniswap v3 and later designs let LPs provide liquidity only within a price range. Capital is far more efficient (deeper liquidity near the current price), but positions need active management: if the price leaves your range, you earn no fees and hold only one token.

## Liquidity at launch

New tokens usually launch by seeding a pool. The ratio chosen sets the launch price, and the size sets how much price impact traders suffer.

- **Thin liquidity** means wild price swings; a few buyers can pump it and a few sellers can crash it.
- If the team holds the LP tokens, they can withdraw all the liquidity at any time. That is the classic **rug pull**. Locked or burned LP tokens, or protocol-owned liquidity, are signs of good faith.

:::warn Check before you trade a new token
Is the LP locked, and until when? Can the owner mint, pause or blacklist? Are buy and sell taxes adjustable? Who holds the top wallets? Block explorers' holder tabs and token scanners help, but reading the verified contract is best.
:::

## Quiz

? A pool holds 500,000 TOKEN and 100,000 USDC. What is TOKEN's price?
- [ ] $5.00
- [x] $0.20
- [ ] $0.50
> Price = y / x = 100,000 / 500,000.

? Why does a large buy get a worse average price than a small one in the same pool?
- [x] Each unit bought moves the price along the x*y=k curve, so later units cost more
- [ ] Large traders pay a higher fee percentage
- [ ] Pools refuse large orders
> That is price impact. Deeper pools reduce it.

? TOKEN's price doubles after you provide liquidity. Ignoring fees, compared with holding, you have:
- [ ] About 5.7% more
- [x] About 5.7% less
- [ ] Exactly the same
> Impermanent loss at 2x is about -5.7%. Fees have to make up the difference.

? What makes a "rug pull" possible after a launch?
- [ ] Locked LP tokens
- [x] The team holding unlocked LP tokens and withdrawing all the liquidity
- [ ] Using a 0.3% fee
> Whoever holds the LP tokens controls the liquidity.
