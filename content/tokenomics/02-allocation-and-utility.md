---
id: tok-allocation
title: Allocation and utility
level: beginner
minutes: 25
summary: Who receives tokens and why, what a token is actually for, and how value flows (or does not) to holders.
---

## Who gets the tokens

Every token's supply is split between groups. A typical launch includes some of these:

| Group | Purpose | What to look for |
|---|---|---|
| **Team** | Pay and motivate builders | Long vesting (3 to 4 years) with a 12-month cliff |
| **Investors** | Funding before launch | Vesting; their entry price versus yours |
| **Advisors** | Expertise and network | Small share, vested |
| **Community / ecosystem** | Grants, rewards, incentives, partnerships | Who controls it, and how it is released |
| **Treasury** | Long-term operations, run by the project or a DAO | Transparency, multisig or governance control |
| **Liquidity** | Seeding trading pools at launch | Locked or protocol-owned |
| **Airdrop** | Reward early users, decentralise ownership | Sybil resistance (one person, many wallets) |

There is no perfect split. Combined team, investor and advisor ("insider") shares are frequently somewhere in the 30 to 50% range at launch; much higher than that tells you who the project is really built for. Context matters: what matters most is that the split is justified, disclosed and vested.

## What is the token for?

A token needs a job. Common **utilities**:

| Utility | Example | Creates demand because |
|---|---|---|
| **Gas / fees** | ETH pays for every Ethereum transaction | Using the network requires it |
| **Staking / security** | Validators stake ETH to secure the chain | Locked tokens earn rewards and secure the system |
| **Governance** | Holders vote on protocol upgrades and treasury spend | Control over something valuable |
| **Collateral** | Deposited to borrow against | Unlocks liquidity for the holder |
| **Access** | Hold or spend to use features, content or communities | The product requires it |
| **Rewards / points** | Earned for activity | Drives usage (but is also new supply to sell) |
| **Fee share / buybacks** | Protocol revenue flows to stakers or buys tokens | Links token value to real business performance |

:::exercise Check an allocation adds up
@@file allocation.js
@@prompt
Three lines:

1. `const allocation = { team: 18, investors: 17, community: 45, treasury: 20 };`
2. `const total = Object.values(allocation).reduce((sum, pct) => sum + pct, 0);`
3. `console.log(total === 100 ? 'Adds up' : 'Check the numbers');`
@@solution
const allocation = { team: 18, investors: 17, community: 45, treasury: 20 };
const total = Object.values(allocation).reduce((sum, pct) => sum + pct, 0);
console.log(total === 100 ? 'Adds up' : 'Check the numbers');
@@hint const\s+allocation\s*=\s*\{\s*team\s*:\s*18\s*,\s*investors\s*:\s*17\s*,\s*community\s*:\s*45\s*,\s*treasury\s*:\s*20\s*\}
Line 1 is an object: `{ team: 18, investors: 17, community: 45, treasury: 20 }`
@@hint Object\.values\(\s*allocation\s*\)
Line 2 starts from `Object.values(allocation)`, which gives `[18, 17, 45, 20]`.
@@hint \.reduce\(\s*\(\s*sum\s*,\s*pct\s*\)\s*=>\s*sum\s*\+\s*pct\s*,\s*0\s*\)
then `.reduce((sum, pct) => sum + pct, 0)`
@@hint total\s*===\s*100\s*\?\s*['"]Adds up['"]\s*:\s*['"]Check the numbers['"]
Line 3: `console.log(total === 100 ? 'Adds up' : 'Check the numbers');`
:::

## The two questions that matter most

**1. Would the product work just as well without the token?** If yes, the token is probably a fundraising tool, and its price depends on speculation alone.

**2. How does value flow to holders?** A protocol can make lots of money while its token captures none of it. Look for a clear, sustainable link: fees used to buy back and burn, real yield to stakers, or demand created by using the product.

## Sources and sinks

Think of a token economy as a bathtub:

- **Sources (taps)**: unlocks, emissions, rewards, airdrops. Each adds supply that someone might sell.
- **Sinks (drains)**: fees burned, tokens locked for staking or governance, tokens spent on in-app items, buybacks.

If the taps run faster than the drains and demand is not growing, the price falls. Most failed tokens simply had more taps than drains.

:::warn Red flags in an allocation
Insiders above about 40%. Short or no vesting for team and investors. A large "marketing" or "ecosystem" bucket controlled by one wallet with no schedule. Undisclosed allocations. A token whose only use is "staking to earn more of the same token".
:::

:::pro For marketers and founders
If you help brands launch tokens or token-gated communities, lead with utility and fairness, not price. Projects that publish clear allocations, on-chain vesting contracts and a real reason to hold the token build trust that hype cannot.
:::

:::exercise Flag insider-heavy allocations
@@file insiders.js
@@prompt
Four lines: `const team = 18;`, `const investors = 17;`, `const insiders = team + investors;`, then print `insiders > 40 ? 'Red flag' : 'OK'`.
@@solution
const team = 18;
const investors = 17;
const insiders = team + investors;
console.log(insiders > 40 ? 'Red flag' : 'OK');
@@hint const\s+team\s*=\s*18
Line 1: `const team = 18;`
@@hint const\s+investors\s*=\s*17
Line 2: `const investors = 17;`
@@hint const\s+insiders\s*=\s*team\s*\+\s*investors
Line 3: `const insiders = team + investors;`
@@hint insiders\s*>\s*40\s*\?\s*['"]Red flag['"]\s*:\s*['"]OK['"]
Line 4: `console.log(insiders > 40 ? 'Red flag' : 'OK');`
:::

## Quiz

? What is the main risk if team and investors hold 60% of supply with short vesting?
- [x] Insiders can sell large amounts early and control governance votes
- [ ] The token becomes deflationary
- [ ] Gas fees rise
> Concentrated, quickly-unlocking insider supply is one of the clearest red flags.

? A protocol earns millions in fees, but none of it reaches token holders and the token has no use in the product. What does that mean?
- [ ] The token price must rise with revenue
- [x] The token captures little or none of the protocol's value, so its price relies on speculation
- [ ] The protocol is illegal
> Revenue and token value are separate unless there is a mechanism linking them.

? Which of these is a token sink?
- [ ] A monthly team unlock
- [ ] Staking rewards paid in new tokens
- [x] A fee that is burned every time the product is used
> Sinks remove or lock supply. Unlocks and emissions are sources.
