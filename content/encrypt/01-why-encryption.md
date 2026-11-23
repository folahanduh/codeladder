---
id: enc-why
title: Encryption, your last line of defence
level: beginner
minutes: 30
summary: What encryption protects (and what it cannot), data in transit versus at rest, why the key is everything, and why US breach laws reward you for encrypting.
---

## Why encrypt at all?

Security is layers. Passwords, MFA and careful code try to stop attackers getting in. **Encryption decides what they get when they do.** A stolen laptop, a leaked database backup or a sniffed Wi-Fi connection is a disaster if the data is readable, and close to a non-event if it is properly encrypted and the key was not taken too.

Encryption turns readable data (**plaintext**) into scrambled data (**ciphertext**) that only someone holding the right **key** can turn back.

## Data has three states

| State | Example | Protected by |
|---|---|---|
| **In transit** (moving across a network) | Logging in from café Wi-Fi, your app calling an API | HTTPS/TLS, encrypted DNS, VPNs on untrusted networks |
| **At rest** (stored) | A laptop's disk, a database, a backup in the cloud, a USB stick | Full-disk encryption, encrypted backups, encrypted fields and files |
| **In use** (being worked on) | Data in memory while your app or you are using it | Mostly *not* encryption: device security, least privilege, isolation |

Real systems need the first two everywhere. The third is the gap attackers aim for.

## What encryption stops, and what it does not

| Threat | Does encryption help? |
|---|---|
| Laptop or phone stolen while locked | **Yes**, with full-disk encryption and a strong passcode |
| Someone sniffing café Wi-Fi | **Yes**, with HTTPS (and the attacker can still see *which* sites you visit) |
| A database backup leaks from a misconfigured bucket | **Yes**, if the backup was encrypted and the key is stored elsewhere |
| Your cloud provider is breached | **Yes**, if you encrypted the data yourself before uploading (client-side) |
| Malware running on your unlocked laptop | **No.** Your data is decrypted while you use it, and the malware sees what you see |
| You type your password into a phishing site | **No.** The connection to the attacker is encrypted too |

So encryption is not a replacement for the rest of security: it is what limits the damage when the rest fails.

## The key is everything

Modern ciphers like **AES-256** and **ChaCha20** are not broken by guessing; there are far too many keys. Encryption fails because of the **key**:

- The key is stored **next to the data** (a key in the same database, in the front-end JavaScript, or in the repo). That is a locked door with the key taped to it.
- The key comes from a **weak password** that can be guessed offline.
- The key **leaks** with everything else because nobody thought about where it lives.

Good encryption is mostly good key management, which is why later lessons cover password managers, secret stores, KMS and envelope encryption.

:::exercise A key is just random bytes
@@file key.js
@@prompt
An AES-256 key is 32 random bytes (256 bits). Generate one with the browser's secure random generator and print its size in bits:

```js
const key = crypto.getRandomValues(new Uint8Array(32));
console.log(key.length * 8, 'bits');
```
@@solution
const key = crypto.getRandomValues(new Uint8Array(32));
console.log(key.length * 8, 'bits');
@@hint const\s+key\s*=\s*crypto\.getRandomValues\(\s*new\s+Uint8Array\(\s*32\s*\)\s*\)
Line 1: `const key = crypto.getRandomValues(new Uint8Array(32));` A `Uint8Array(32)` is 32 bytes; `getRandomValues` fills it with cryptographically secure randomness.
@@hint console\.log\(\s*key\.length\s*\*\s*8\s*,\s*['"]bits['"]\s*\)
Line 2: `console.log(key.length * 8, 'bits');` (8 bits per byte).
@@explain
It prints `256 bits`. Never use `Math.random()` for keys: it is predictable. Always use `crypto.getRandomValues` in the browser or `crypto.randomBytes` in Node.
:::

## Encoding, hashing and encryption are different things

| | Reversible? | Needs a key? | Use it for |
|---|---|---|---|
| **Encoding** (Base64, hex) | Yes, by anyone | No | Moving binary data around as text. **Not secret at all.** |
| **Hashing** (SHA-256, Argon2) | No | No | Fingerprints, integrity checks, and (with a slow hash like Argon2) storing passwords |
| **Encryption** (AES-GCM, ChaCha20-Poly1305) | Yes, with the key | Yes | Keeping data secret while still being able to read it later |

:::exercise Base64 is not encryption
@@file encoding.js
@@prompt
A developer "hid" a password by Base64-encoding it. Show that anyone can reverse it in one line:

```js
const hidden = btoa('hunter2');
console.log(hidden);
console.log(atob(hidden));
```
@@solution
const hidden = btoa('hunter2');
console.log(hidden);
console.log(atob(hidden));
@@hint const\s+hidden\s*=\s*btoa\(\s*['"]hunter2['"]\s*\)
Line 1: `const hidden = btoa('hunter2');` (`btoa` encodes text as Base64).
@@hint console\.log\(\s*hidden\s*\)
Line 2: `console.log(hidden);`
@@hint console\.log\(\s*atob\(\s*hidden\s*\)\s*\)
Line 3: `console.log(atob(hidden));` (`atob` decodes it straight back).
@@explain
It prints `aHVudGVyMg==` and then `hunter2`. Base64, hex and URL-encoding are formats, not protection. If you see "encrypted" data that ends in `=` or `==`, try decoding it: the Critical Moment simulator and the CTF are full of exactly this mistake.
:::

## Encryption and US law

US law gives you a strong financial reason to encrypt, on top of the security one. This is general awareness, not legal advice:

- **State breach-notification laws.** Every US state requires businesses to notify people when their personal information is breached, and most give a **safe harbor for encrypted data**: if the stolen data was encrypted and the key was not taken too, notification is usually not required.
- **California (CCPA).** Californians can sue a business, for statutory damages of roughly 100 to 750 dollars per person per incident (adjusted for inflation), when their **nonencrypted and nonredacted** personal information is breached because the business did not keep reasonable security. For a leak of 100,000 users, that number gets very large very fast.
- **The FTC Safeguards Rule** requires many non-bank financial companies to encrypt customer information both in transit and at rest.

Encrypt personal data, and keep the keys somewhere else.

## Quiz

? Your laptop is stolen while it is locked. What protects the files on it?
- [ ] HTTPS
- [x] Full-disk encryption plus a strong login password
- [ ] Your antivirus
> Without full-disk encryption, a thief can pull the drive and read everything on it.

? Malware is running on your unlocked laptop. Does disk encryption stop it reading your files?
- [ ] Yes, the files are encrypted
- [x] No: the disk is decrypted while you are logged in, so the malware sees what you see
- [ ] Only if you use AES-256
> Encryption protects data at rest and in transit, not data in use on a compromised device.

? A company encrypts its customer database but stores the key in the same database. What is the problem?
- [ ] AES is too weak for databases
- [x] Anyone who steals the database also gets the key, so the encryption adds almost nothing
- [ ] Nothing, that is standard practice
> Keep keys separate from the data they protect.

? Why do many US companies encrypt personal data even beyond the security benefit?
- [x] Most state breach laws give a safe harbor when breached data was encrypted and the key was not taken
- [ ] Encryption is illegal to skip in every state
- [ ] It makes databases faster
> Encrypted data that leaks without its key usually does not trigger the costly notification duties.
