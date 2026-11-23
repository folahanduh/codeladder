---
id: enc-app-data
title: Encrypting sensitive data in your app (AES-GCM)
level: intermediate
minutes: 45
summary: Decide what to hash, what to encrypt and what to leave alone, then encrypt fields like phone numbers and users' API tokens with AES-256-GCM in Node, with unique IVs, authentication tags and keys kept out of the database.
---

## Hash, encrypt, or neither?

| Data | Do this | Why |
|---|---|---|
| Passwords | **Hash** with Argon2id (or bcrypt) | You never need the password back, only to check it |
| Data you must read back: phone numbers, addresses, date of birth, KYC documents, users' OAuth refresh tokens and API keys, private notes | **Encrypt** in your application (this lesson) | A stolen database or backup should be useless without a key held elsewhere |
| Public data: product names, prices, public wallet addresses | Neither | Encryption costs complexity; spend it where it protects someone |

"But my database is already encrypted at rest." Disk-level encryption in your cloud database protects against someone walking off with the physical disk. It does **not** help against SQL injection, a leaked database password, a too-wide backup bucket or a curious insider, because the database decrypts for anyone who can query it. **Application-level** encryption keeps those fields ciphertext everywhere except inside your app's memory.

## AES-256-GCM in one picture

**AES-GCM** is an **authenticated** cipher (AEAD): it encrypts *and* adds a 16-byte **authentication tag**, so any tampering with the ciphertext is detected on decryption. You need:

- a **key**: 32 random bytes for AES-256, stored outside the database,
- a fresh **IV** (also called a nonce) for every encryption: 12 random bytes, never reused with the same key,
- and you get back the **ciphertext** plus the **tag**.

Store `iv + tag + ciphertext` together (the IV and tag are not secret). Reusing an IV with the same key is catastrophic: it can reveal plaintexts and let attackers forge messages (the expert lesson shows exactly how).

## Try it in the browser first

The Web Crypto API does AES-GCM natively. Run this in the Playground:

```js try
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const data = new TextEncoder().encode('+1 415 555 0142');

const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
console.log('ciphertext bytes:', new Uint8Array(ciphertext));

const back = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
console.log('decrypted:', new TextDecoder().decode(back));
```

Change one byte of `ciphertext` before decrypting and you get an error instead of garbage. That is the authentication tag doing its job.

## Encrypting a field in Node

On the server, Node's built-in `crypto` module does the same. This function returns one Base64 string holding everything needed to decrypt later.

:::exercise Write encrypt()
@@file field-crypto.js
@@run false
@@prompt
Write the encryption half. Seven lines:

```js
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export function encrypt(plaintext, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}
```
@@solution
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export function encrypt(plaintext, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}
@@hint import\s*\{\s*randomBytes\s*,\s*createCipheriv\s*,\s*createDecipheriv\s*\}\s*from\s*['"]node:crypto['"]
Line 1: `import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';`
@@hint export\s+function\s+encrypt\(\s*plaintext\s*,\s*key\s*\)\s*\{
Line 2: `export function encrypt(plaintext, key) {`
@@hint const\s+iv\s*=\s*randomBytes\(\s*12\s*\)
A fresh random 12-byte IV every single time: `const iv = randomBytes(12);`
@@hint const\s+cipher\s*=\s*createCipheriv\(\s*['"]aes-256-gcm['"]\s*,\s*key\s*,\s*iv\s*\)
`const cipher = createCipheriv('aes-256-gcm', key, iv);`
@@hint const\s+data\s*=\s*Buffer\.concat\(\s*\[\s*cipher\.update\(\s*plaintext\s*,\s*['"]utf8['"]\s*\)\s*,\s*cipher\.final\(\s*\)\s*\]\s*\)
`const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);` (`update` encrypts, `final` finishes).
@@hint return\s+Buffer\.concat\(\s*\[\s*iv\s*,\s*cipher\.getAuthTag\(\s*\)\s*,\s*data\s*\]\s*\)\.toString\(\s*['"]base64['"]\s*\)
Pack IV (12 bytes), tag (16 bytes) and ciphertext together: `return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');`
@@hint ^\s*\}\s*$
Close the function with `}`.
@@explain
The tag is only available after `cipher.final()`, which is why `getAuthTag()` comes in the return line. The output looks like `k3Jd...==` and is safe to store in a normal text column.
:::

:::exercise Write decrypt()
@@file field-crypto.js
@@run false
@@prompt
Now reverse it: split the bytes back into IV (first 12), tag (next 16) and ciphertext (the rest), give the tag to the decipher, and decrypt. If anything was tampered with, `final()` throws.

```js
export function decrypt(payload, key) {
  const buf = Buffer.from(payload, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
}
```
@@solution
export function decrypt(payload, key) {
  const buf = Buffer.from(payload, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
}
@@hint export\s+function\s+decrypt\(\s*payload\s*,\s*key\s*\)\s*\{
Line 1: `export function decrypt(payload, key) {`
@@hint const\s+buf\s*=\s*Buffer\.from\(\s*payload\s*,\s*['"]base64['"]\s*\)
Line 2: `const buf = Buffer.from(payload, 'base64');`
@@hint const\s+decipher\s*=\s*createDecipheriv\(\s*['"]aes-256-gcm['"]\s*,\s*key\s*,\s*buf\.subarray\(\s*0\s*,\s*12\s*\)\s*\)
Line 3: the IV is the first 12 bytes: `createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12))`
@@hint decipher\.setAuthTag\(\s*buf\.subarray\(\s*12\s*,\s*28\s*\)\s*\)
Line 4: the tag is bytes 12 to 28: `decipher.setAuthTag(buf.subarray(12, 28));`
@@hint return\s+Buffer\.concat\(\s*\[\s*decipher\.update\(\s*buf\.subarray\(\s*28\s*\)\s*\)\s*,\s*decipher\.final\(\s*\)\s*\]\s*\)\.toString\(\s*['"]utf8['"]\s*\)
Line 5: decrypt everything from byte 28 on: `return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');`
@@hint ^\s*\}\s*$
Close the function with `}`.
@@explain
Never catch and ignore the error from `final()`: it means the data or the tag was changed, or the wrong key was used. Treat it as a security event, not a glitch.
:::

## Where the key lives

```bash
# Generate a key once
openssl rand -base64 32
```

```js
const key = Buffer.from(process.env.FIELD_KEY, 'base64'); // 32 bytes, from your secret store
```

- Load it from your host's secret store or a secrets manager (next lesson), **never** from code or the database.
- Use different keys for staging and production.
- For larger systems, do not hold the master key in the app at all: use **envelope encryption** with a KMS (the advanced lesson), so every decryption is permission-checked and logged.

## Two upgrades professionals add

**1. Bind the ciphertext to its row.** An attacker who can write to your database could copy Alice's encrypted phone number into Bob's row. Add **associated data** (AAD), such as the user ID, which is authenticated but not encrypted:

```js
cipher.setAAD(Buffer.from(userId));   // when encrypting
decipher.setAAD(Buffer.from(userId)); // when decrypting: a swapped value now fails
```

**2. Search without decrypting.** You cannot `WHERE phone = ?` on random-looking ciphertext. Store a **blind index** next to it: an HMAC of the normalised value with a *separate* key, which you can look up exactly without revealing the value.

```js
const phoneIndex = createHmac('sha256', indexKey).update(normalise(phone)).digest('hex');
```

:::tip Use a library in production
Writing these helpers teaches you how it works. In production, prefer a well-reviewed library that handles formats, key rotation and AAD for you: libsodium (`crypto_secretbox` or XChaCha20-Poly1305), Google's Tink, or your cloud provider's encryption SDK.
:::

## Quiz

? Your cloud database has "encryption at rest" turned on. An attacker finds a SQL injection bug. What do they get?
- [ ] Only ciphertext
- [x] Readable data, because the database decrypts for anyone who can query it; only application-level encryption keeps sensitive fields as ciphertext
- [ ] Nothing, encryption at rest blocks queries
> Disk encryption protects disks, not queries.

? Why must every AES-GCM encryption use a new IV with the same key?
- [ ] To make the ciphertext shorter
- [x] Reusing an IV can expose plaintexts and lets attackers forge valid ciphertexts
- [ ] Because IVs are secret and get used up
> IVs are not secret, but they must be unique per key.

? Which should you hash rather than encrypt?
- [x] User passwords
- [ ] Users' phone numbers
- [ ] Users' OAuth refresh tokens
> You need phone numbers and tokens back; you never need the password itself back.

? What does associated data (AAD) prevent?
- [ ] Brute-force attacks on the key
- [x] Someone moving a valid ciphertext from one user's row to another's without detection
- [ ] IV reuse
> AAD binds a ciphertext to its context, so a swapped value fails authentication.
