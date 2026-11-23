---
id: sec-crypto-in-practice
title: "Applied cryptography: using crypto correctly"
level: intermediate
minutes: 35
summary: The mistakes that break real systems (nonce reuse, ECB, fast password hashes, timing leaks, hard-coded keys) and the correct patterns, including HMAC-signed webhooks.
---

## Good algorithms, bad usage

Modern algorithms are rarely broken. Systems are broken because the algorithms are **used wrongly**. Learn these mistakes once and you will spot them in code reviews for the rest of your career.

| Mistake | Why it breaks things | Do this instead |
|---|---|---|
| Reusing a nonce/IV with the same key (AES-GCM, ECDSA) | Leaks plaintext or even the private key | Fresh random nonce every time; libraries that handle it |
| AES in **ECB** mode | Identical blocks encrypt identically, so patterns show through | AES-GCM or ChaCha20-Poly1305 |
| MD5/SHA-1/SHA-256 for passwords | Far too fast; billions of guesses per second | Argon2id, scrypt or bcrypt |
| Hard-coded keys in source code | Anyone with the code (or the app bundle) has the key | Environment secrets, a secrets manager, a KMS or HSM |
| Comparing secrets with `===` | Can leak, through timing, how many characters matched | Constant-time comparison |
| Encrypting without authenticating | Attackers can tamper with ciphertext undetected | Authenticated encryption (AEAD), or encrypt-then-MAC |
| `Math.random()` for tokens or keys | Predictable | `crypto.getRandomValues`, `crypto.randomUUID` |

## HMAC: proving a message came from someone who knows the secret

A **MAC** (message authentication code) is like a signature, but with a shared secret instead of a key pair. **HMAC-SHA256** is the standard. Payment providers like Stripe, and many crypto APIs, sign their webhooks this way: they send the message plus an HMAC, and you recompute the HMAC with your shared secret. If it matches, the message is genuine and unchanged.

:::exercise Sign and verify a webhook with HMAC
@@file hmac.js
@@prompt
Using the Web Crypto API, write five lines:

1. `const enc = new TextEncoder();`
2. `const key = await crypto.subtle.importKey('raw', enc.encode('webhook-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);`
3. `const sig = await crypto.subtle.sign('HMAC', key, enc.encode('order=42&amount=6800'));`
4. `const ok = await crypto.subtle.verify('HMAC', key, sig, enc.encode('order=42&amount=6800'));`
5. `console.log(ok);`

Then change the amount in line 4 only, run it again, and watch it fail.
@@solution
const enc = new TextEncoder();
const key = await crypto.subtle.importKey('raw', enc.encode('webhook-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
const sig = await crypto.subtle.sign('HMAC', key, enc.encode('order=42&amount=6800'));
const ok = await crypto.subtle.verify('HMAC', key, sig, enc.encode('order=42&amount=6800'));
console.log(ok);
@@hint const\s+enc\s*=\s*new\s+TextEncoder\(\s*\)
Line 1: `const enc = new TextEncoder();`
@@hint crypto\.subtle\.importKey\(\s*['"]raw['"]\s*,\s*enc\.encode\(\s*['"]webhook-secret['"]\s*\)
Line 2 starts `const key = await crypto.subtle.importKey('raw', enc.encode('webhook-secret'),`
@@hint \{\s*name\s*:\s*['"]HMAC['"]\s*,\s*hash\s*:\s*['"]SHA-256['"]\s*\}\s*,\s*false\s*,\s*\[\s*['"]sign['"]\s*,\s*['"]verify['"]\s*\]
then `{ name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);`
@@hint const\s+sig\s*=\s*await\s+crypto\.subtle\.sign\(\s*['"]HMAC['"]\s*,\s*key\s*,\s*enc\.encode\(\s*['"]order=42&amount=6800['"]\s*\)\s*\)
Line 3: `const sig = await crypto.subtle.sign('HMAC', key, enc.encode('order=42&amount=6800'));`
@@hint crypto\.subtle\.verify\(\s*['"]HMAC['"]\s*,\s*key\s*,\s*sig\s*,
Line 4: `const ok = await crypto.subtle.verify('HMAC', key, sig, enc.encode('order=42&amount=6800'));`
@@hint console\.log\(\s*ok\s*\)
Line 5: `console.log(ok);`
@@explain
It prints `true`. Change `6800` to `1` in line 4 and it prints `false`: an attacker who edits the amount cannot produce a valid HMAC without the secret. `crypto.subtle.verify` also compares in constant time, avoiding the timing-leak mistake from the table.
:::

## Password storage, properly

```js
// Node.js: npm install argon2
import argon2 from 'argon2';

const hash = await argon2.hash(password);          // salt is generated and stored inside the hash
const valid = await argon2.verify(hash, attempt);  // true or false
```

A **salt** (random data mixed into each password before hashing) means two users with the same password get different hashes, so attackers cannot use precomputed tables. Argon2id is also deliberately slow and memory-hungry, which cripples GPU cracking rigs.

## Key management is the hard part

Algorithms are free; protecting keys is the real work.

- **Never in Git.** Use environment variables locally and a secrets manager in production.
- **Rotate** keys on a schedule and immediately after any suspected leak.
- **Separate keys by purpose**: the key that signs webhooks is not the key that encrypts data.
- **Hardware for high-value keys**: HSMs, cloud KMS, hardware wallets, or MPC (multi-party computation, where no single device ever holds the whole key).

:::pro Constant-time comparison in Node
For comparing secrets yourself (API keys, HMACs computed manually), use `crypto.timingSafeEqual(a, b)` from Node's `crypto` module, on two buffers of equal length. A normal `===` returns as soon as one character differs, and that tiny timing difference can be measured.
:::

## Quiz

? Why is SHA-256 alone wrong for storing passwords?
- [ ] It is broken
- [x] It is designed to be fast, so attackers can try billions of guesses per second
- [ ] It produces hashes that are too long
> Use a slow, salted password hash like Argon2id.

? What does verifying an HMAC on a webhook prove?
- [x] The sender knows the shared secret and the message was not changed
- [ ] The message is encrypted
- [ ] The sender is a human
> HMAC gives integrity and authenticity, not confidentiality.

? What is a salt for?
- [ ] Making passwords shorter
- [x] Making identical passwords hash differently, defeating precomputed tables
- [ ] Encrypting the hash
> Each user's random salt is stored with their hash.

? Why is ECB mode dangerous?
- [ ] It is slow
- [x] Identical plaintext blocks become identical ciphertext blocks, revealing patterns
- [ ] It needs a nonce
> The famous "ECB penguin" image shows the outline surviving encryption.
