---
id: crypto-intro
title: Cryptography 101
level: beginner
minutes: 20
summary: What cryptography protects, the four building blocks behind HTTPS, WhatsApp and every blockchain, and the one rule you must never break.
---

## What cryptography is for

Cryptography uses maths to protect information from people who should not read it or change it. It gives you four guarantees:

| Goal | Question it answers | Everyday example |
|---|---|---|
| **Confidentiality** | Can anyone else read this? | Your card number over HTTPS |
| **Integrity** | Has this been changed? | Checking a downloaded file is not tampered with |
| **Authenticity** | Who really sent this? | Your bank's website certificate |
| **Non-repudiation** | Can the sender deny it later? | Signing a blockchain transaction |

## The four building blocks

### 1. Hash functions

Turn any data into a short, fixed-size fingerprint. One-way: you cannot get the data back. Used for integrity, passwords and linking blocks in a blockchain. Next lesson, plus the [Hash Lab](#hash-lab).

### 2. Symmetric encryption

One shared secret key locks and unlocks. Fast, used for bulk data. The standard is **AES** (in GCM mode, which also detects tampering). The hard part: how do two people agree a secret key over the internet without anyone overhearing?

### 3. Asymmetric (public-key) cryptography

Each person has a **key pair**: a **private key** they keep secret and a **public key** they share. What one key does, only the other can undo. This solves the key-sharing problem and enables signatures.

### 4. Digital signatures

Sign with your private key; anyone verifies with your public key. Proves who sent a message and that it was not altered. **Every blockchain transaction is a digital signature.**

Real systems combine them. HTTPS uses public-key crypto to agree a shared key, symmetric encryption for the data, hashes for integrity, and signed certificates for authenticity.

## Try encryption in your browser

The Web Crypto API is built into every modern browser. This encrypts and decrypts a message with AES-GCM:

```js try
const enc = new TextEncoder();
const dec = new TextDecoder();

// 1. Make a random 256-bit key (in real life, store or derive this safely)
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);

// 2. A fresh random "nonce" (iv) for every message. Never reuse one with the same key.
const iv = crypto.getRandomValues(new Uint8Array(12));

// 3. Encrypt
const secret = enc.encode('Launch date: 14 March');
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secret);
console.log('Encrypted bytes:', [...new Uint8Array(ciphertext)].slice(0, 16).join(','), '...');

// 4. Decrypt with the same key and iv
const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
console.log('Decrypted:', dec.decode(plain));
```

:::exercise Encrypt and decrypt with AES-GCM
@@file aes.js
@@prompt
Using the example above as your guide, write five lines:

1. `const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);`
2. `const iv = crypto.getRandomValues(new Uint8Array(12));`
3. `const secret = new TextEncoder().encode('Launch date: 14 March');`
4. `const box = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secret);`
5. `console.log(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, box)));`
@@solution
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const secret = new TextEncoder().encode('Launch date: 14 March');
const box = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secret);
console.log(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, box)));
@@hint crypto\.subtle\.generateKey\(\s*\{\s*name\s*:\s*['"]AES-GCM['"]\s*,\s*length\s*:\s*256\s*\}
Line 1 calls `crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, ...)`
@@hint \[\s*['"]encrypt['"]\s*,\s*['"]decrypt['"]\s*\]
The key's allowed uses go in an array: `['encrypt', 'decrypt']`
@@hint const\s+iv\s*=\s*crypto\.getRandomValues\(\s*new\s+Uint8Array\(\s*12\s*\)\s*\)
Line 2: a fresh 12-byte nonce: `const iv = crypto.getRandomValues(new Uint8Array(12));`
@@hint new\s+TextEncoder\(\s*\)\.encode\(\s*['"]Launch date: 14 March['"]\s*\)
Line 3 turns text into bytes with `new TextEncoder().encode(...)`.
@@hint const\s+box\s*=\s*await\s+crypto\.subtle\.encrypt\(\s*\{\s*name\s*:\s*['"]AES-GCM['"]\s*,\s*iv\s*\}\s*,\s*key\s*,\s*secret\s*\)
Line 4: `const box = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secret);`
@@hint crypto\.subtle\.decrypt\(\s*\{\s*name\s*:\s*['"]AES-GCM['"]\s*,\s*iv\s*\}\s*,\s*key\s*,\s*box\s*\)
Line 5 decrypts with the same key and iv: `crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, box)`, wrapped in `new TextDecoder().decode(await ...)`.
@@explain
`box` is unreadable bytes. Only the same key and nonce turn it back into the message. Change one byte of `box` and decryption throws an error instead: GCM mode detects tampering, giving you integrity as well as confidentiality.
:::

## Randomness matters

Keys must be unpredictable. Use `crypto.getRandomValues()` or `crypto.randomUUID()`. **Never** use `Math.random()` for anything security-related; it is predictable.

:::exercise Generate secure random values
@@file random.js
@@prompt
Make a 16-byte random key and a random ID the safe way. Three lines:

1. `const key = crypto.getRandomValues(new Uint8Array(16));`
2. `console.log(Array.from(key));`
3. `console.log(crypto.randomUUID());`

Run it a few times: every result is different and unpredictable.
@@solution
const key = crypto.getRandomValues(new Uint8Array(16));
console.log(Array.from(key));
console.log(crypto.randomUUID());
@@hint const\s+key\s*=\s*crypto\.getRandomValues\(
Line 1 starts `const key = crypto.getRandomValues(`
@@hint new\s+Uint8Array\(\s*16\s*\)
Inside: `new Uint8Array(16)`: an empty box of 16 bytes for it to fill.
@@hint console\.log\(\s*Array\.from\(\s*key\s*\)\s*\)
Line 2: `console.log(Array.from(key));`
@@hint crypto\.randomUUID\(\s*\)
Line 3: `console.log(crypto.randomUUID());` (UUID in capitals).
@@explain
16 bytes is 128 bits of randomness, the size of an AES-128 key. `Math.random()` would look random but is predictable; these functions use the operating system's cryptographically secure generator.
:::

## Kerckhoffs's principle

A system must be secure **even if everything about it except the key is public**. Good algorithms (AES, SHA-256, Ed25519) are published and studied by thousands of experts. Secret, home-made algorithms are almost always broken.

:::warn The one rule: do not roll your own crypto
Never invent your own algorithm, and avoid implementing standard ones yourself for real use. Subtle mistakes (reused nonces, timing leaks, bad randomness) break systems completely. Use well-reviewed libraries: the Web Crypto API, libsodium, @noble/hashes and @noble/curves, OpenZeppelin for contracts. (The SHA-256 in this site's Hash Lab is hand-written for learning only.)
:::

## Quiz

? Which building block lets anyone verify that a message really came from you?
- [ ] Symmetric encryption
- [x] Digital signatures
- [ ] Hash functions alone
> You sign with your private key; anyone checks with your public key.

? What is the main weakness of symmetric encryption on its own?
- [ ] It is too slow
- [x] Both sides need the same secret key, and sharing it safely is hard
- [ ] It cannot encrypt text
> Public-key cryptography solves key exchange; symmetric encryption then does the fast bulk work.

? Which should you use to generate a secret key in JavaScript?
- [ ] Math.random()
- [x] crypto.getRandomValues() or crypto.subtle.generateKey()
- [ ] Date.now()
> Only cryptographically secure randomness is unpredictable enough for keys.

? Why are published algorithms like AES trusted more than secret ones?
- [x] Thousands of experts have tried to break them and failed
- [ ] Secret algorithms are illegal
- [ ] Published algorithms are faster
> Kerckhoffs's principle: security should rest on the key, not on hiding the method.
