---
id: tok-vesting
title: Vesting, cliffs and unlock schedules
level: intermediate
minutes: 30
summary: Calculate exactly how many tokens are unlocked on any date, read unlock charts, and spot dangerous cliffs.
---

## The vocabulary

- **TGE (token generation event)**: launch day, when trading starts.
- **TGE unlock**: the percentage of an allocation released immediately.
- **Cliff**: a waiting period with no further unlocks.
- **Vesting period**: the time over which the rest unlocks, usually monthly or continuously (every block).
- **Linear vesting**: equal amounts per period.

## Two common cliff styles

**Style A: linear from the cliff.** "12-month cliff, then 24 months linear." Nothing until month 12, then an equal slice every month until month 36.

**Style B: lump at the cliff.** "36-month vesting with a 12-month cliff." Tokens accrue from day one, but none can be claimed until month 12, when everything accrued so far (12/36 = 33%) unlocks at once. Then the rest vests monthly. This is common in employment-style deals and creates a big one-day **unlock wall**.

The [Tokenomics Simulator](#token-sim) has a switch for each style. Try both with the same numbers and watch the bars.

## The maths

For one allocation, the fraction unlocked at month `m`:

```js try
function unlockedFraction(m, { tge = 0, cliff = 0, vest = 0, lumpAtCliff = false }) {
  if (m < cliff) return tge;                          // only the TGE unlock so far
  if (vest === 0) return 1;                           // everything at the cliff
  const vested = lumpAtCliff
    ? Math.min(1, m / (cliff + vest))                 // accrued since launch
    : Math.min(1, (m - cliff) / vest);                // linear starting at the cliff
  return tge + (1 - tge) * vested;
}

const team = { tge: 0, cliff: 12, vest: 24 };
for (const m of [0, 6, 11, 12, 13, 24, 36, 48]) {
  console.log(`month ${m}: ${(unlockedFraction(m, team) * 100).toFixed(1)}% of team tokens unlocked`);
}

const teamLump = { ...team, lumpAtCliff: true };
console.log('lump style at month 12:', (unlockedFraction(12, teamLump) * 100).toFixed(1) + '%');
```

Add every allocation together, multiply by max supply, and you have the circulating supply curve.

## Why vesting matters to price

Every unlock gives someone tokens they may sell. Investors who bought at $0.02 are very happy to sell at $0.30. What matters is not only how much unlocks, but:

- **Relative size**: a 2% unlock when 10% circulates grows supply by 20% in a day.
- **Holder cost basis**: early investors are deep in profit; airdrop recipients paid nothing.
- **Holder intent**: a treasury unlock that goes to a grants programme is different from a seed investor unlock.

Markets tend to anticipate large unlocks, so price pressure often appears in the weeks before, not just on the day.

## Reading an unlock chart

Sites like Tokenomist (formerly Token Unlocks) show schedules for live tokens. Look for:

1. The **circulating supply today** versus max supply.
2. **Steps** in the curve: cliff dates for insiders.
3. The **slope** after the cliffs: steady monthly pressure.
4. **When the curve flattens**: after that, new supply comes only from emissions.

## Vesting on-chain

Promises in a PDF are not vesting. Trustworthy projects lock allocations in **vesting contracts** anyone can inspect. OpenZeppelin's `VestingWallet` releases tokens linearly between a start time and an end time to a beneficiary, and its cliff variant adds a cliff. Projects often use audited vesting platforms too. Either way, verify on a block explorer that the tokens are really locked.

:::tip Design guidelines that build trust
Team and investors: a 12-month cliff and 2 to 4 years of vesting. Avoid one-day walls by vesting monthly (or per block) after the cliff. Publish the schedule and contract addresses. Avoid tiny launch floats that let insiders print a huge paper valuation.
:::

## Quiz

? Team allocation: 0% at TGE, 12-month cliff, then 24 months linear (style A). What fraction is unlocked at month 24?
- [ ] 100%
- [x] 50%
- [ ] 33%
> (24 - 12) / 24 = 0.5. Fully unlocked at month 36.

? Same numbers, but style B (lump at cliff, 36 months total). What unlocks at month 12?
- [ ] Nothing
- [x] About 33% in one go
- [ ] 50%
> 12 of 36 months have accrued, all released together when the cliff ends.

? 10% of supply circulates. A 3% unlock happens next week. By how much does circulating supply grow?
- [ ] 3%
- [x] 30%
- [ ] 13%
> 3 / 10 = 30% more circulating tokens. Relative size matters more than the headline number.

? What makes a vesting schedule trustworthy?
- [ ] It is described in the whitepaper
- [ ] The team promises on social media
- [x] The tokens are locked in a public vesting contract you can verify on-chain
> Code anyone can read beats promises anyone can break.
