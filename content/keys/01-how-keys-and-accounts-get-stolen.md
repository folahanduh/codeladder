---
id: keys-basics
title: How keys and accounts get stolen
level: beginner
minutes: 30
summary: Passwords, sessions, API keys, OAuth tokens, private keys and seed phrases: what each one unlocks, the eight ways they are stolen, and why launchpads are a favourite target.
---

## The number one problem

Most money lost in crypto is not lost to clever maths or exotic smart contract bugs. It is lost because someone got hold of a **key** or took over an **account**: a private key, a seed phrase, an admin login, a session cookie, an API key, a social media account. The same is true for ordinary apps: account takeover is one of the most common and costly attacks on the web.

This track goes from "what is a key" to running production signing infrastructure and responding to a live compromise. Practise every lesson in the [Critical Moment](#critical-moment) simulator.

## What you are protecting

| Secret | What it unlocks | Typical lifetime |
|---|---|---|
| **Password** | Logging in to an account | Until changed |
| **Session cookie / token** | Being logged in *right now*, without the password or MFA | Minutes to weeks |
| **API key** | A service (payments, RPC, AI, email) on your behalf, often with full power | Until revoked |
| **OAuth access / refresh token** | A third-party app acting on your account within its scopes | Hours (access), months (refresh) |
| **Private key** | Signing transactions: total control of a wallet or contract role | Forever, no reset button |
| **Seed phrase** | Every private key derived from it | Forever |

Notice the last two: **there is no "forgot password" for a private key.** Anyone who has it can move the funds, and you cannot stop them.

## The eight ways secrets are stolen

1. **Phishing**: fake login pages, fake wallet pop-ups, fake support staff.
2. **Infostealer malware**: a fake app, game mod, pirated tool or "coding test" that copies browser cookies, saved passwords, wallet files and `.env` files.
3. **Leaks in code**: keys committed to GitHub, pasted in screenshots, logged to error trackers, bundled into front-end JavaScript.
4. **Password reuse**: one leaked site's password tried everywhere (credential stuffing).
5. **SIM swaps**: your phone number moved to an attacker, who then receives your SMS codes.
6. **Over-permissioned third parties**: an OAuth app or API key with far more access than it needs gets compromised.
7. **Insiders and ex-team members** whose access was never removed.
8. **Supply chain**: a compromised library or tool that reads secrets from every machine it runs on.

## Why launchpads are prime targets

A token launchpad (or any launch: presale, airdrop, NFT mint) concentrates every kind of key in one place, under time pressure:

- **Deployer and owner keys** for the token and sale contracts.
- **Presale and treasury wallets** filling with buyers' funds.
- **Whitelist or claim signing keys** on a server that approves who can buy or claim.
- **Admin panels** for setting prices, dates and allocations.
- **Social accounts** (X, Discord, Telegram) that thousands of people trust for the official link.

Attackers know launches are rushed. A hijacked project X account posting a "mint is live" link to a drainer site, or a deployer key in a leaked `.env`, has ended many launches in minutes.

## Recognising a secret in the wild

Good engineers can spot secrets at a glance, which is the first step to keeping them out of code. A raw Ethereum private key is `0x` followed by 64 hex characters.

:::exercise Spot a private key
@@file detect.js
@@prompt
Write a check that flags a string that looks like an Ethereum private key. Three lines:

1. `const looksLikeKey = (value) => /^0x[0-9a-fA-F]{64}$/.test(value);`
2. `console.log(looksLikeKey('0x' + 'ab'.repeat(32)));`
3. `console.log(looksLikeKey('hello world'));`
@@solution
const looksLikeKey = (value) => /^0x[0-9a-fA-F]{64}$/.test(value);
console.log(looksLikeKey('0x' + 'ab'.repeat(32)));
console.log(looksLikeKey('hello world'));
@@also
const looksLikeKey = value => /^0x[0-9a-fA-F]{64}$/.test(value);
console.log(looksLikeKey('0x' + 'ab'.repeat(32)));
console.log(looksLikeKey('hello world'));
@@hint const\s+looksLikeKey\s*=\s*\(?\s*value\s*\)?\s*=>
Line 1 starts `const looksLikeKey = (value) =>`
@@hint /\^0x\[0-9a-fA-F\]\{64\}\$/\.test\(\s*value\s*\)
The pattern: `/^0x[0-9a-fA-F]{64}$/.test(value)`. `^` and `$` anchor the start and end; `{64}` means exactly 64 hex characters.
@@hint looksLikeKey\(\s*['"]0x['"]\s*\+\s*['"]ab['"]\.repeat\(\s*32\s*\)\s*\)
Line 2 builds a fake 64-character key: `'0x' + 'ab'.repeat(32)`
@@hint looksLikeKey\(\s*['"]hello world['"]\s*\)
Line 3 tests a normal string: `looksLikeKey('hello world')`
@@explain
Output: `true`, then `false`. Secret scanners (GitHub secret scanning, gitleaks) use thousands of patterns like this one. You will turn it into a pre-commit hook that blocks commits in the "Secrets out of code" lesson.
:::

## The golden rules

- **Unique password for every account**, from a password manager.
- **Phishing-resistant MFA** (passkeys or hardware keys) on email, GitHub, cloud, registrar, exchanges and social accounts.
- **Never type a seed phrase into anything except a hardware wallet or a wallet you are restoring on purpose.**
- **Least privilege everywhere**: scoped API keys, minimal OAuth scopes, separate wallets for separate jobs.
- **Assume any secret that touched an untrusted place is already compromised**, and rotate it.

## Quiz

? Which stolen secret lets an attacker skip both your password and your MFA?
- [ ] An old password
- [x] A valid session cookie or token
- [ ] Your email address
> A session token is proof you already logged in; whoever presents it is treated as you.

? What happens if your private key leaks?
- [ ] You reset it with your email
- [ ] The blockchain freezes the funds
- [x] Anyone with it can move the funds, and there is no reset; move what you can and treat the key as burned
> Private keys have no recovery process. Prevention is everything.

? Why are token launches especially risky for key theft?
- [x] Many powerful keys and accounts are concentrated in one rushed event that thousands of people are watching
- [ ] Launchpads use weaker cryptography
- [ ] Tokens are easy to forge
> Deployer keys, presale wallets, signing servers and social accounts all become targets at once.

? A popular app asks for "full access to your GitHub account" to show you a badge. What principle does that violate?
- [ ] Defence in depth
- [x] Least privilege
- [ ] Availability
> A badge needs read access to public data at most.
