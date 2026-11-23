---
id: enc-envelope
title: Envelope encryption, key rotation and crypto-shredding
level: advanced
minutes: 45
summary: How production systems encrypt huge amounts of data without the master key ever leaving a KMS, using data keys, key hierarchies, rotation without re-encrypting everything, encrypted backups that survive a public bucket, and deleting data by deleting keys.
---

## The problem with one big key

In the last lessons your app held the encryption key. That works, but if the app server is compromised, the key goes with it, and every record it ever encrypted is exposed. You also cannot tell who decrypted what.

A **KMS** (AWS KMS, Google Cloud KMS, Azure Key Vault) keeps master keys inside hardware security modules: the key material never leaves, and every use is permission-checked and logged. But you cannot send gigabytes through it: KMS calls are slow, cost money, and AWS KMS will only encrypt up to 4 KB directly.

**Envelope encryption** gets the best of both.

## How the envelope works

| Step | What happens |
|---|---|
| 1 | Your app asks KMS for a **data key** (`GenerateDataKey`). KMS returns it twice: in **plaintext**, and **encrypted** under the master key (the "key encryption key", KEK) |
| 2 | The app encrypts the data locally with AES-256-GCM using the plaintext data key (fast, any size) |
| 3 | The app stores the **ciphertext** together with the **encrypted data key**, then throws the plaintext data key away |
| 4 | To decrypt later, the app sends the encrypted data key to KMS (`Decrypt`). KMS checks the caller is allowed, logs the request, and returns the plaintext data key |
| 5 | The app decrypts the data locally, then forgets the data key again |

The data is sealed in an envelope (the data key), and the envelope is sealed by a key that never leaves the HSM.

:::exercise Get a data key from AWS KMS
@@file backup.js
@@run false
@@prompt
With the AWS SDK for JavaScript v3, request a 256-bit data key. `kms` is a `KMSClient` and `GenerateDataKeyCommand` is already imported. Three lines:

```js
const { Plaintext, CiphertextBlob } = await kms.send(
  new GenerateDataKeyCommand({ KeyId: process.env.KMS_KEY_ID, KeySpec: 'AES_256' })
);
```

`Plaintext` is the 32-byte key for AES-GCM; `CiphertextBlob` is the encrypted copy you store next to your data.
@@solution
const { Plaintext, CiphertextBlob } = await kms.send(
  new GenerateDataKeyCommand({ KeyId: process.env.KMS_KEY_ID, KeySpec: 'AES_256' })
);
@@hint const\s*\{\s*Plaintext\s*,\s*CiphertextBlob\s*\}\s*=\s*await\s+kms\.send\(
Line 1: `const { Plaintext, CiphertextBlob } = await kms.send(`
@@hint new\s+GenerateDataKeyCommand\(\s*\{\s*KeyId\s*:\s*process\.env\.KMS_KEY_ID\s*,\s*KeySpec\s*:\s*['"]AES_256['"]\s*\}\s*\)
Line 2: `new GenerateDataKeyCommand({ KeyId: process.env.KMS_KEY_ID, KeySpec: 'AES_256' })`
@@hint ^\s*\)\s*;?\s*$
Line 3: close the call with `);`
@@explain
Then call your `encrypt()` from the AES-GCM lesson with `Plaintext` as the key, save `{ encryptedKey: CiphertextBlob, data }`, and overwrite the plaintext key buffer with `Plaintext.fill(0)` when you are done.
:::

:::exercise Unwrap the data key to decrypt
@@file restore.js
@@run false
@@prompt
To read a record back, ask KMS to decrypt the stored data key. Naming the key you expect (`KeyId`) is best practice, so a swapped envelope cannot trick you into using a different key:

```js
const { Plaintext } = await kms.send(
  new DecryptCommand({ CiphertextBlob: record.encryptedKey, KeyId: process.env.KMS_KEY_ID })
);
```
@@solution
const { Plaintext } = await kms.send(
  new DecryptCommand({ CiphertextBlob: record.encryptedKey, KeyId: process.env.KMS_KEY_ID })
);
@@hint const\s*\{\s*Plaintext\s*\}\s*=\s*await\s+kms\.send\(
Line 1: `const { Plaintext } = await kms.send(`
@@hint new\s+DecryptCommand\(\s*\{\s*CiphertextBlob\s*:\s*record\.encryptedKey\s*,\s*KeyId\s*:\s*process\.env\.KMS_KEY_ID\s*\}\s*\)
Line 2: `new DecryptCommand({ CiphertextBlob: record.encryptedKey, KeyId: process.env.KMS_KEY_ID })`
@@hint ^\s*\)\s*;?\s*$
Line 3: `);`
@@explain
Every one of these calls appears in CloudTrail with the caller's identity and time. If an attacker steals your database, they get ciphertext and encrypted data keys: useless without permission to call `Decrypt` on that KMS key. Watching for unusual `Decrypt` volume is one of the best breach alarms you can have.
:::

## What the envelope buys you

- **The master key never leaves the HSM.** An attacker on your server can only decrypt while they have access, and every attempt is logged.
- **Access control in one place.** A KMS key policy says which roles may encrypt and which may decrypt. Your backup job can be allowed to encrypt but *not* decrypt, so a compromised backup server cannot read old backups.
- **Rotation without re-encrypting.** Turn on automatic key rotation: KMS creates new key material on a schedule but keeps the old versions to decrypt old envelopes. New data uses the new material; nothing has to be rewritten.
- **Emergency re-wrap.** If you suspect a master key is compromised, decrypt and re-encrypt only the small data keys under a new master key, not terabytes of data.

## Backups that survive a public bucket

Storage services encrypt at rest by default, but that encryption is transparent: anyone the bucket lets in gets plaintext. Two layers fix that:

1. **SSE-KMS** on the bucket, with a key policy that only your restore role can use. Requests for SSE-KMS objects must be signed by an identity with `kms:Decrypt`, so even if someone accidentally makes the bucket public, anonymous downloads fail.
2. **Client-side encryption** before upload (envelope encryption as above, or `age` from the beginner lesson), so the file is ciphertext no matter where it ends up:

```bash
pg_dump "$DATABASE_URL" | gzip | age -R backup-recipients.txt > db-$(date +%F).sql.gz.age
aws s3 cp db-$(date +%F).sql.gz.age s3://launchpad-backups/ --sse aws:kms --sse-kms-key-id "$BACKUP_KMS_KEY"
```

Always test restores. An encrypted backup you cannot decrypt is the same as no backup.

## Crypto-shredding: deleting data by deleting keys

Deleting a user's data everywhere (databases, replicas, logs, years of backups) is close to impossible. Encrypting each user's records with **their own data key** makes it easy: delete the key and every copy becomes permanent noise. This is called **crypto-shredding**, and it is a practical way to honour deletion requests under laws like California's CCPA.

## A typical key hierarchy

| Level | Example | Lives in | Rotated |
|---|---|---|---|
| Root / master key (KEK) | `alias/launchpad-data` | KMS / HSM, never exported | Automatically, yearly or faster |
| Data keys (DEK) | One per file, per backup, or per user | Stored encrypted next to the data | New key for each new object |
| Derived keys | Blind-index HMAC key, per-tenant keys | Derived or wrapped from the above | With their parent |

## Quiz

? In envelope encryption, what is stored next to the encrypted data?
- [ ] The master key
- [x] The data key, encrypted under the master key
- [ ] The plaintext data key
> The encrypted data key is useless without permission to ask KMS to decrypt it.

? Why can a backup job be allowed to encrypt but not decrypt?
- [x] So a compromised backup server cannot read past backups, while still being able to create new ones
- [ ] Because KMS does not support decryption
- [ ] To make backups smaller
> Separate permissions limit what any one compromised system can do.

? A bucket of database backups is accidentally made public. Which setup keeps the data safe?
- [ ] Default storage encryption at rest
- [x] Backups encrypted client-side (or with SSE-KMS and a restrictive key policy) before upload
- [ ] Long file names that are hard to guess
> Default at-rest encryption decrypts transparently for anyone the bucket allows.

? What is crypto-shredding?
- [ ] Encrypting data twice
- [ ] Shredding old hard drives
- [x] Deleting the key that encrypts a user's data, making every copy, including backups, unreadable
> It turns "find and delete every copy" into "delete one key".
