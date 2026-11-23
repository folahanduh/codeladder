---
id: tok-launch
title: Launch playbook, red flags and the rules
level: advanced
minutes: 35
summary: How serious teams launch tokens, a checklist for judging any token, and the US rules (SEC, CFTC, FinCEN, OFAC, FTC, IRS and the states) you must know before selling or marketing one.
---

## A responsible launch, step by step

1. **Product first.** A live product with real users, and a clear answer to "why does this need a token?"
2. **Design and model** supply, allocation, vesting and incentives. Stress-test them (see the modelling lesson).
3. **Legal review** in every country where you will market or sell. Do this before you announce anything.
4. **Build and audit** the token, vesting, staking and any distribution contracts. Publish the audit.
5. **Distribution plan**: who gets tokens and how. Airdrops need sybil filtering (one person, one allocation).
6. **Liquidity plan**: how the first pools are seeded and whether LP tokens are locked or protocol-owned. If market makers are involved, publish the terms.
7. **Transparency**: publish the full allocation, the vesting schedule and every contract address before launch.
8. **Launch day**: monitor contracts, pools and social channels; have an incident plan.
9. **After launch**: report regularly on treasury, unlocks and emissions. Trust is earned over years.

## Distribution methods

| Method | How it works | Watch out for |
|---|---|---|
| **Airdrop** | Free tokens to past users or a community | Farmers with thousands of wallets; instant sell pressure |
| **Points then airdrop** | Track activity, convert to tokens later | Users feel misled if conversion disappoints |
| **Fair launch** | No pre-sale; everyone buys at the same terms | Bots and snipers at launch |
| **Liquidity bootstrapping pool (LBP)** | Price starts high and falls over days so buyers can find a fair price | Complex for newcomers |
| **Public sale (ICO / IDO)** | Sell tokens for funds | Heavy securities-law implications |
| **Bonding curve launchpad** | Price rises with each mint, then migrates to an AMM | Highly speculative; early-buyer advantage |

## Red-flag checklist for any token

Use this before buying, promoting or advising on a token:

- **Contract**: unverified source code; owner can mint without limit, pause trading, blacklist wallets, or change fees and taxes; a proxy that the team can upgrade instantly.
- **Liquidity**: LP tokens unlocked or held by one wallet; tiny liquidity relative to market cap.
- **Holders**: a handful of wallets hold most of the supply (check the explorer's holders tab).
- **Tokenomics**: low float with a huge FDV; insiders above about 40%; short or no vesting; undisclosed allocations.
- **Yield**: high APY with no revenue source.
- **Team and marketing**: anonymous team plus pressure to buy now; paid promotions without disclosure; guaranteed returns.
- **Honeypot behaviour**: you can buy but cannot sell (test with a tiny amount, or use a scanner, before anything else).

:::exercise An automated red-flag checker
@@file redflags.js
@@prompt
Six lines:

1. `const token = { insiderShare: 0.55, lpLocked: false, ownerCanMint: true };`
2. `const flags = [];`
3. `if (token.insiderShare > 0.4) flags.push('Insiders above 40%');`
4. `if (!token.lpLocked) flags.push('Liquidity not locked');`
5. `if (token.ownerCanMint) flags.push('Owner can mint');`
6. `console.log(flags);`
@@solution
const token = { insiderShare: 0.55, lpLocked: false, ownerCanMint: true };
const flags = [];
if (token.insiderShare > 0.4) flags.push('Insiders above 40%');
if (!token.lpLocked) flags.push('Liquidity not locked');
if (token.ownerCanMint) flags.push('Owner can mint');
console.log(flags);
@@hint const\s+token\s*=\s*\{\s*insiderShare\s*:\s*0\.55\s*,\s*lpLocked\s*:\s*false\s*,\s*ownerCanMint\s*:\s*true\s*\}
Line 1: `const token = { insiderShare: 0.55, lpLocked: false, ownerCanMint: true };`
@@hint const\s+flags\s*=\s*\[\s*\]
Line 2: an empty array: `const flags = [];`
@@hint if\s*\(\s*token\.insiderShare\s*>\s*0\.4\s*\)\s*flags\.push\(\s*['"]Insiders above 40%['"]\s*\)
Line 3: `if (token.insiderShare > 0.4) flags.push('Insiders above 40%');`
@@hint if\s*\(\s*!\s*token\.lpLocked\s*\)\s*flags\.push\(\s*['"]Liquidity not locked['"]\s*\)
Line 4 uses `!` for "not": `if (!token.lpLocked) flags.push('Liquidity not locked');`
@@hint if\s*\(\s*token\.ownerCanMint\s*\)\s*flags\.push\(\s*['"]Owner can mint['"]\s*\)
Line 5: `if (token.ownerCanMint) flags.push('Owner can mint');`
@@hint console\.log\(\s*flags\s*\)
Line 6: `console.log(flags);`
:::

## The rules: US regulation you must know

This course follows **United States law**: most token projects, exchanges and launchpads either operate in the US or serve US users, and US agencies have been the most active enforcers. This is general awareness, **not legal advice**. US crypto rules have been changing quickly since 2025, through new laws, court cases and agency guidance, so speak to a qualified US securities lawyer before launching or promoting a token.

| Who | What they police | Why it matters for a token |
|---|---|---|
| **SEC** (Securities and Exchange Commission) | Securities: offering, selling and promoting investments | If your token is an investment contract, selling it needs registration or an exemption, and promoters must disclose that they are paid |
| **CFTC** (Commodity Futures Trading Commission) | Commodities and their derivatives (bitcoin and ether have been treated as commodities) | Fraud and manipulation in commodity markets, and anything leveraged or derivative |
| **FinCEN** (Treasury) | The Bank Secrecy Act: money transmission and anti-money-laundering | Businesses that transmit value for others may need to register as a money services business and run KYC and AML programmes |
| **OFAC** (Treasury) | Sanctions | Dealing with sanctioned people, countries or listed crypto addresses is illegal for US persons |
| **FTC** (Federal Trade Commission) | Deceptive advertising and paid endorsements | Influencers and agencies must clearly disclose paid promotions; misleading claims are illegal |
| **IRS** | Tax | Digital assets are treated as property; trades, airdrops and staking rewards usually create tax events, and brokers now report crypto sales on Form 1099-DA |
| **States** | Money transmitter licences, plus regimes such as New York's BitLicense and California's Digital Financial Assets Law | Serving residents of some states needs a licence |

### Is your token a security? The Howey test

The SEC and the courts apply the **Howey test** (from a 1946 Supreme Court case about orange groves): it is an **investment contract**, and so a security, if people **invest money** in a **common enterprise** expecting **profits from the efforts of others**. The label does not matter; the economic reality does. Selling tokens to fund development while promising the team will make them valuable is the classic way to fail the test.

Since 2025 the SEC has narrowed its approach to crypto (for example, staff statements that typical meme coins are not securities), and Congress has passed stablecoin legislation (the **GENIUS Act**, 2025) and worked on wider market-structure rules. Treat any summary, including this one, as a starting point for a lawyer, not an answer.

### Marketing a token in the US

- **Disclose payment, every time.** The FTC's Endorsement Guides require a clear disclosure of any paid relationship ("#ad", "Paid partnership"), and if the token is a security, Section 17(b) of the Securities Act requires promoters to disclose what they were paid. In 2022 a celebrity agreed to pay the SEC 1.26 million dollars over an Instagram post promoting a crypto token without disclosing that she had been paid for it.
- **No promises of returns.** Saying a token will rise in value is exactly what makes it look like an investment contract, and can be fraud if untrue.
- **Know who you are selling to.** Many launches block US users or restrict sales to accredited investors under exemptions such as Regulation D, precisely because of these rules.

### If you also sell outside the US

Other regions have their own regimes, for example the EU's **MiCA** regulation (white papers and licensed service providers) and the UK's FCA financial promotion rules for crypto marketing. A US-compliant launch is not automatically compliant elsewhere.

:::warn Never promise price or returns
"This will 10x", "guaranteed APY", "get in before the pump": statements like these can turn marketing into an unlawful financial promotion or misrepresentation, and they destroy trust when they fail. Talk about the product, the utility and the risks.
:::

## Quiz

? A token's contract owner can change the sell tax to 99% at any time. What is this?
- [ ] A normal feature
- [x] A major red flag: the owner could stop holders selling profitably (a honeypot)
- [ ] A way to reduce gas
> Adjustable taxes, blacklists and unlimited minting give the owner power over your money.

? A brand pays you to post about its new token to your US followers. What do US rules require at a minimum?
- [ ] Nothing, social posts are free speech
- [ ] Only that you own some of the token yourself
- [x] A clear disclosure that you are paid (FTC), plus disclosure of your compensation under securities law if the token is a security, and no promises of returns
> Undisclosed paid promotion has cost promoters dearly: one celebrity paid the SEC 1.26 million dollars over a single Instagram post.

? Which US agency maintains the sanctions list that includes specific crypto addresses?
- [ ] The SEC
- [x] OFAC, part of the Treasury
- [ ] The FTC
> US persons must not deal with sanctioned people or addresses; screen deposits and claims against the list.

? Under the Howey test, what makes a token sale look like a securities offering?
- [x] People invest money expecting profits from the efforts of the team
- [ ] The token uses the ERC-20 standard
- [ ] The token has a fixed supply
> The economic reality matters, not the label.

? What is a sensible first step before launching a token?
- [ ] Announce the launch date to build hype
- [x] Make sure there is a real product and a clear reason for the token, then get legal advice
- [ ] List it on as many exchanges as possible
> A token amplifies a product; it cannot replace one. Legal review comes before any announcement.
