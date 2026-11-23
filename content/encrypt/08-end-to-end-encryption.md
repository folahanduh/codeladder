---
id: enc-e2e
title: End-to-end and client-side encryption
level: advanced
minutes: 45
summary: Build features where even your own servers cannot read users' data. Derive keys from passphrases safely, encrypt to someone's public key with sealed boxes, understand forward secrecy, and see how wallet keystores protect private keys.
---

## Why encrypt before the server sees it?

Everything so far trusted your servers: data was encrypted, but your app held or could fetch the keys. **Client-side** (or **end-to-end**) encryption removes that trust. Data is encrypted on the user's device, and the server stores only ciphertext it cannot read.

That is how password managers, Signal and encrypted-notes apps work. A full breach of the company's servers leaks nothing readable.

| You gain | You give up |
|---|---|
| A server breach exposes only ciphertext | Server-side search, sorting and analytics on that data |
| Insiders and subpoenas cannot reveal content | If the user loses their key or passphrase, the data is gone, unless you design recovery |
| A strong trust story for users | More complex code, and the client code itself must be trustworthy |

## Turning a passphrase into a key

Users remember passphrases, not 32 random bytes. A **key derivation function** (KDF) turns one into the other, deliberately slowly, with a random **salt** so identical passphrases give different keys:

- **Argon2id**: the best choice (memory-hard, so GPU cracking rigs struggle). Available in libsodium and most server languages.
- **scrypt**: also memory-hard. Used by age's passphrase mode and Ethereum keystores.
- **PBKDF2**: the only one built into the browser's Web Crypto API. Make it slow: OWASP recommends at least **600,000** iterations of PBKDF2-HMAC-SHA256.

:::exercise Derive an AES key from a passphrase in the browser
@@file vault.js
@@prompt
Derive a non-extractable AES-256-GCM key from a passphrase with PBKDF2. The passphrase and a random 16-byte salt are already there. Add the two `await` steps and log the result:

```js
const passphrase = 'correct horse battery staple';
const salt = crypto.getRandomValues(new Uint8Array(16));

const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
  material,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
console.log(key.algorithm);
```
@@starter
const passphrase = 'correct horse battery staple';
const salt = crypto.getRandomValues(new Uint8Array(16));

@@solution
const passphrase = 'correct horse battery staple';
const salt = crypto.getRandomValues(new Uint8Array(16));

const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
  material,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
console.log(key.algorithm);
@@hint const\s+material\s*=\s*await\s+crypto\.subtle\.importKey\(\s*['"]raw['"]\s*,\s*new\s+TextEncoder\(\s*\)\.encode\(\s*passphrase\s*\)\s*,\s*['"]PBKDF2['"]\s*,\s*false\s*,\s*\[\s*['"]deriveKey['"]\s*\]\s*\)
Step 1 imports the passphrase as PBKDF2 key material: `const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);`
@@hint const\s+key\s*=\s*await\s+crypto\.subtle\.deriveKey\(
Step 2 starts `const key = await crypto.subtle.deriveKey(`
@@hint \{\s*name\s*:\s*['"]PBKDF2['"]\s*,\s*salt\s*,\s*iterations\s*:\s*600000\s*,\s*hash\s*:\s*['"]SHA-256['"]\s*\}
The first argument sets the slowness: `{ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },`
@@hint ^\s*material\s*,\s*$
Then the key material: `material,`
@@hint \{\s*name\s*:\s*['"]AES-GCM['"]\s*,\s*length\s*:\s*256\s*\}
Then what kind of key you want: `{ name: 'AES-GCM', length: 256 },`
@@hint ^\s*false\s*,\s*$
`false,` makes the key non-extractable: JavaScript can use it but never read its bytes.
@@hint \[\s*['"]encrypt['"]\s*,\s*['"]decrypt['"]\s*\]
Then what it may be used for: `['encrypt', 'decrypt']` and close with `);`
@@hint console\.log\(\s*key\.algorithm\s*\)
Finally `console.log(key.algorithm);`
@@explain
Press **Run it**: there is a noticeable pause while 600,000 iterations run. That pause is the point: an attacker guessing passphrases pays it for every single guess. Store the salt (not secret) alongside the ciphertext so you can derive the same key next time.
:::

## Encrypting to someone else: sealed boxes

Sometimes the sender should be able to encrypt but not decrypt, like a user uploading ID documents that only your compliance team may read. Public-key encryption does this. With **libsodium**, a **sealed box** encrypts a message to a public key; only the holder of the matching private key can open it, and not even the sender can read it back.

```js
import sodium from 'libsodium-wrappers';
await sodium.ready;

// Compliance team, once: keep privateKey in their KMS or an offline machine
const { publicKey, privateKey } = sodium.crypto_box_keypair();

// In the user's browser: encrypt the document to the team's public key
const sealed = sodium.crypto_box_seal(documentBytes, publicKey);

// Only the compliance team can open it
const opened = sodium.crypto_box_seal_open(sealed, publicKey, privateKey);
```

GitHub uses exactly this to encrypt Actions secrets in your browser before they reach its servers.

## Forward secrecy: protecting yesterday's messages

If a long-term private key is stolen, can the attacker decrypt everything it ever protected? With simple public-key encryption, yes. **Forward secrecy** prevents that by using short-lived (ephemeral) keys for each session or message and deleting them afterwards:

- **TLS 1.3** always uses ephemeral key exchange, so a stolen server key does not decrypt recorded traffic.
- **Signal's protocol** goes further with a "double ratchet" that changes keys with every message, so compromising a phone today does not reveal last month's chats.

Never design your own messaging protocol. Use Signal's libraries or MLS (Messaging Layer Security, a 2023 IETF standard for group messaging).

## How wallets encrypt private keys

An Ethereum **keystore file** (what `cast wallet import` and many wallets create) is client-side encryption in action:

1. Your password goes through **scrypt** with a random salt to make a key.
2. That key encrypts the private key with **AES-128-CTR**.
3. A **MAC** (a Keccak hash of part of the derived key plus the ciphertext) detects a wrong password before anything is decrypted.

The file is safe to back up, *but only as strong as the password*. A stolen keystore with a short password can be cracked offline at leisure. Browser extension wallets also keep a password-encrypted vault file, which is why infostealer malware copies those vault files and cracks weak passwords later.

## Designing recovery honestly

If only the user holds the key, a forgotten passphrase means lost data. Real products offer recovery without breaking the model:

- a **recovery key** shown once at sign-up for the user to store offline,
- the key encrypted to **several of the user's devices**,
- **social or threshold recovery**: the key split into shares held by trusted contacts (Shamir's secret sharing), any few of which can restore it.

What you must not do is quietly keep a copy on the server "just in case". Then it is not end-to-end encryption any more.

## Quiz

? What does a salt add to passphrase-based key derivation?
- [ ] It makes the key secret
- [x] It makes identical passphrases produce different keys, which defeats precomputed cracking tables
- [ ] It replaces the need for many iterations
> Salts are not secret; they make each derivation unique.

? Why use 600,000 PBKDF2 iterations instead of 1,000?
- [x] Each passphrase guess costs an attacker 600 times more work
- [ ] It makes the ciphertext stronger against quantum computers
- [ ] Browsers require it
> Slowness is the defence against offline guessing.

? A user encrypts a document with crypto_box_seal to your team's public key. Who can decrypt it?
- [ ] The user and your team
- [x] Only whoever holds the team's private key
- [ ] Anyone with the public key
> Sealed boxes are anonymous and one-way: even the sender cannot open them again.

? An attacker steals a TLS server's private key and has recordings of last year's traffic. With TLS 1.3, can they decrypt it?
- [ ] Yes, all of it
- [x] No: TLS 1.3 uses ephemeral key exchange, so the server key does not reveal past session keys
- [ ] Only the cookies
> That is forward secrecy.
