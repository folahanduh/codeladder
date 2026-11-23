---
id: keys-ato-defence
title: Stopping account takeover in your own app
level: intermediate
minutes: 40
summary: The defences and scripts that stop credential stuffing, brute force, SIM swaps and session theft in an app or exchange-style platform you build.
---

## Your users will be attacked

If your app has logins, it will face **account takeover (ATO)** attempts: bots trying leaked username and password lists, phishing kits copying your login page, SIM swappers and support-desk social engineers. For an app that holds money or wallets (a launchpad, an exchange, a dashboard with withdrawals), ATO is the attack that matters most.

## The defence stack

| Layer | Stops | How |
|---|---|---|
| **Rate limiting** | Brute force and stuffing | Limit attempts per account, per IP and globally; slow down, then challenge |
| **Breached-password checks** | Reused leaked passwords | Reject passwords found in known breaches at sign-up and change |
| **Phishing-resistant MFA** | Stolen passwords and most phishing | Offer passkeys (WebAuthn); authenticator apps as a fallback; avoid SMS for high-value accounts |
| **Session hygiene** | Stolen sessions | Rotation, short lifetimes, revoke on password or MFA change |
| **Step-up authentication** | A stolen session doing damage | Re-check MFA before withdrawals, address changes, API key creation |
| **Withdrawal protections** | Fast cash-out after takeover | Address allow-lists, a 24 to 48 hour delay on newly added addresses, email confirmation and alerts |
| **Anomaly alerts** | Takeovers in progress | New device, location or IP; impossible travel; many failed logins |
| **Recovery flow security** | Social engineering the support team | No password resets over chat; strong identity checks; a cooling-off delay |

## Script 1: a login rate limiter

A minimal in-memory limiter shows the idea. Production systems keep the counters in Redis or a database and expire them over time.

:::exercise Build a login rate limiter
@@file limiter.js
@@prompt
Allow at most 5 login attempts per IP, then block. Write it in this shape:

```js
const attempts = new Map();
function allowLogin(ip) {
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  return count <= 5;
}
for (let i = 1; i <= 7; i++) console.log(i, allowLogin('203.0.113.9'));
```
@@solution
const attempts = new Map();
function allowLogin(ip) {
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  return count <= 5;
}
for (let i = 1; i <= 7; i++) console.log(i, allowLogin('203.0.113.9'));
@@hint const\s+attempts\s*=\s*new\s+Map\(\s*\)
Line 1: `const attempts = new Map();` (a Map stores a count for each IP).
@@hint function\s+allowLogin\s*\(\s*ip\s*\)\s*\{
Line 2: `function allowLogin(ip) {`
@@hint const\s+count\s*=\s*\(\s*attempts\.get\(\s*ip\s*\)\s*\|\|\s*0\s*\)\s*\+\s*1
Line 3: `const count = (attempts.get(ip) || 0) + 1;`
@@hint attempts\.set\(\s*ip\s*,\s*count\s*\)
Line 4: `attempts.set(ip, count);`
@@hint return\s+count\s*<=\s*5
Line 5: `return count <= 5;`
@@hint for\s*\(\s*let\s+i\s*=\s*1\s*;\s*i\s*<=\s*7\s*;\s*i\+\+\s*\)\s*console\.log\(\s*i\s*,\s*allowLogin\(\s*['"]203\.0\.113\.9['"]\s*\)\s*\)
Last line tests 7 attempts: `for (let i = 1; i <= 7; i++) console.log(i, allowLogin('203.0.113.9'));`
@@explain
Attempts 1 to 5 print `true`, then 6 and 7 print `false`. Real limiters also count per account (attackers rotate IPs), reset after a time window, and add a CAPTCHA or delay rather than a hard block, so attackers cannot lock real users out on purpose.
:::

## Script 2: checking breached passwords privately

The Have I Been Pwned "Pwned Passwords" service lets you check whether a password appears in known breaches **without sending it**. You send only the first 5 characters of its SHA-1 hash; the service returns every breached hash with that prefix, and you look for the rest locally. This technique is called **k-anonymity**.

```js
async function isBreached(password) {
  const bytes = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
  const hash = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
  return (await res.text()).includes(hash.slice(5));
}
```

(SHA-1 is fine here because it is only an index into a public list, not how you store passwords. Store passwords with Argon2id.)

## Passkeys: the strongest login

**Passkeys** (WebAuthn / FIDO2) replace passwords with a key pair: the private key stays in the user's device or password manager, and the browser only signs challenges for the **real** domain. A phishing site gets nothing usable. Libraries such as SimpleWebAuthn make adding them to a Node app a day's work, and they are the single biggest ATO reduction you can ship.

## Withdrawal protections (for apps that hold funds)

Takeover is usually followed by a race to cash out. Slow the cash-out down:

- New withdrawal address? Require MFA, email confirmation, and a **24 to 48 hour lock** before it can be used.
- Large or unusual withdrawals trigger manual review.
- Every security change (password, MFA, email, API key, address) sends an alert to the **old** contact details, with a "this wasn't me" link that freezes the account.

## Quiz

? Why limit login attempts per account as well as per IP?
- [ ] It is faster
- [x] Attackers rotate through thousands of IPs, so per-IP limits alone miss slow, distributed attacks on one account
- [ ] IP addresses are not recorded
> Count both, and globally too.

? How does the Pwned Passwords range API protect the password being checked?
- [x] Only the first 5 characters of its hash are sent; matching happens on your side
- [ ] The password is encrypted in transit
- [ ] It deletes the password after checking
> That is k-anonymity: the service never learns which password you checked.

? An attacker steals a session and tries to add a new withdrawal address. Which control stops the cash-out?
- [ ] A longer password policy
- [x] Step-up MFA plus a time lock on newly added addresses, with an alert to the real user
- [ ] Logging the request
> Assume sessions can be stolen; protect the dangerous actions themselves.

? Which MFA option resists phishing sites by design?
- [ ] SMS codes
- [ ] Email codes
- [x] Passkeys (WebAuthn)
> The browser only signs for the genuine domain.
