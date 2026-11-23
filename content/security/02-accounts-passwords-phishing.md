---
id: sec-accounts
title: Passwords, MFA and phishing
level: beginner
minutes: 30
summary: Protect the accounts and wallets everything else depends on. Password strength in numbers, which MFA actually works, and how to spot a phish.
---

## Your accounts are the keys to everything

Your GitHub account can push code to your projects. Your email can reset every other password. Your wallet signs transactions. Attackers know this, so before you secure any app, secure yourself.

## Password strength is maths

A password's strength is measured in **bits of entropy**: how many guesses an attacker needs, as a power of two.

```text
entropy (bits) = length x log2(size of character set)
```

| Password style | Character set | Example length | Entropy |
|---|---|---|---|
| Lower-case word | 26 | 8 | about 38 bits (instant to crack) |
| Random, all keyboard symbols | 94 | 16 | about 105 bits (safe) |
| Diceware passphrase | 7,776 words | 6 words | about 78 bits (strong and memorable) |

Humans are bad at randomness, so the real answer is: **use a password manager** (Bitwarden, 1Password, or your browser's built-in one) to generate a unique random password for every site. Then a leak at one site cannot unlock the others (that attack is called **credential stuffing**).

:::exercise Measure a password's entropy
@@file entropy.js
@@prompt
Calculate the entropy of a random 16-character password using all 94 printable keyboard characters. Four lines:

1. `const length = 16;`
2. `const charset = 94;`
3. `const bits = length * Math.log2(charset);`
4. `console.log(Math.round(bits));`
@@solution
const length = 16;
const charset = 94;
const bits = length * Math.log2(charset);
console.log(Math.round(bits));
@@hint const\s+length\s*=\s*16
Line 1: `const length = 16;`
@@hint const\s+charset\s*=\s*94
Line 2: `const charset = 94;`
@@hint const\s+bits\s*=\s*length\s*\*\s*Math\.log2\(\s*charset\s*\)
Line 3: `const bits = length * Math.log2(charset);` (log2 with a lower-case L).
@@hint console\.log\(\s*Math\.round\(\s*bits\s*\)\s*\)
Line 4: `console.log(Math.round(bits));`
@@explain
About **105 bits**. Each extra bit doubles the attacker's work, so 105 bits is far beyond any brute-force attack. Try `length = 8` and `charset = 26`: about 38 bits, which a modern GPU rig cracks quickly.
:::

## Multi-factor authentication (MFA)

A second factor means a stolen password alone is not enough. Not all factors are equal:

| Factor | Strength | Why |
|---|---|---|
| SMS codes | Weak | SIM-swap attacks move your number to an attacker's phone |
| Authenticator app codes (TOTP) | Good | But a fake login page can still ask you for the code in real time |
| Push approvals | Good, with care | "MFA fatigue" attacks spam you until you tap Approve |
| **Passkeys / hardware keys (FIDO2)** | Best | Cryptographically bound to the real website, so phishing sites cannot use them |

Turn on the strongest option for email, GitHub, cloud providers, domain registrar and exchanges. For crypto: protect your exchange account with a hardware key, and use a hardware wallet for real funds.

## Phishing: the attack that works

Phishing tricks you into handing over credentials, approving something, or running something. Red flags:

- **Urgency or fear**: "Your wallet will be frozen in 24 hours."
- **A lookalike address**: `rnetamask.io`, `uniswap-app.co`, `github.com.login-verify.dev`.
- **An unexpected attachment, link or download**, especially "a quick coding test" from a recruiter you have never met.
- **A request for a seed phrase or private key.** Always a scam. Always.

Crypto-specific scams to know:

- **Drainer sites**: a fake airdrop or mint page asks you to sign an approval or permit that lets them take your tokens.
- **Address poisoning**: scammers send you tiny transactions from an address that looks like one you use (same first and last characters), hoping you copy it from your history next time.
- **Fake support**: in Discord or Telegram, "support" DMs you first. Real support never does.

## Checking a link the right way

Attackers hide the real domain inside a longer one. The part that matters is the end of the hostname.

:::exercise Spot the lookalike domain
@@file domain.js
@@prompt
Show why `includes` is a dangerous check and `endsWith` is the safe one. Three lines:

1. `const url = new URL('https://wallet.example.com.evil.io/login');`
2. `console.log(url.hostname.includes('example.com'));`
3. `console.log(url.hostname.endsWith('.example.com'));`
@@solution
const url = new URL('https://wallet.example.com.evil.io/login');
console.log(url.hostname.includes('example.com'));
console.log(url.hostname.endsWith('.example.com'));
@@hint const\s+url\s*=\s*new\s+URL\(\s*['"]https://wallet\.example\.com\.evil\.io/login['"]\s*\)
Line 1: `const url = new URL('https://wallet.example.com.evil.io/login');`
@@hint url\.hostname\.includes\(\s*['"]example\.com['"]\s*\)
Line 2: `console.log(url.hostname.includes('example.com'));`
@@hint url\.hostname\.endsWith\(\s*['"]\.example\.com['"]\s*\)
Line 3 checks the ending, with the leading dot: `url.hostname.endsWith('.example.com')`
@@explain
Output: `true` then `false`. The site is really `evil.io`; `example.com` is just a decoration in front of it. Any code (or human) that checks "does it contain the brand name?" gets fooled. Check the end of the hostname, including the dot, or compare against an exact allow-list.
:::

:::pro Your personal security baseline
Password manager with unique passwords everywhere. Passkeys or hardware keys on email, GitHub and exchanges. A separate browser profile for crypto. A hardware wallet for anything you cannot afford to lose. Never run code or open files from strangers on the machine that holds your keys.
:::

## Quiz

? Why is SMS the weakest form of MFA?
- [ ] Texts are too slow
- [x] SIM-swap attacks can move your phone number to an attacker
- [ ] SMS codes are too short
> Attackers persuade or bribe mobile carriers to transfer your number.

? Which MFA type resists phishing sites by design?
- [ ] Authenticator app codes
- [ ] Email codes
- [x] Passkeys and hardware security keys (FIDO2)
> They cryptographically check the real website's domain, so a fake site gets nothing useful.

? You receive 0 USDC from an address starting 0x71C7 and ending 976F, just like a friend's. What is likely happening?
- [ ] An airdrop
- [x] Address poisoning: they hope you will copy their lookalike address from your history
- [ ] A refund
> Always copy addresses from a trusted source, and check the whole address.

? A recruiter sends a "take-home test" repo and asks you to run npm install and start it. What is the safe approach?
- [x] Treat it as untrusted code: read it first and run it only in an isolated machine or container with no wallets or keys
- [ ] Run it on your main laptop; recruiters are trustworthy
- [ ] Run it but close your wallet extension first
> Fake job tests delivering malware are a known technique used against crypto developers.
