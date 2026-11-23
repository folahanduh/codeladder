---
id: enc-post-quantum
title: Post-quantum encryption and crypto agility
level: expert
minutes: 40
summary: What quantum computers would break and what they would not, "harvest now, decrypt later", the new NIST standards and the US migration timeline, what it means for blockchains, and how to build systems that can swap algorithms without a rewrite.
---

## What a quantum computer would break

A large, error-corrected quantum computer does not exist yet, and nobody knows exactly when one will. If one is built, two algorithms matter:

| Algorithm | Affects | Impact |
|---|---|---|
| **Shor's algorithm** | RSA, Diffie-Hellman, elliptic curves (ECDH, ECDSA, Ed25519, and the **secp256k1** curve behind Bitcoin and Ethereum signatures) | **Broken.** Private keys can be computed from public keys |
| **Grover's algorithm** | Symmetric ciphers and hashes (AES, ChaCha20, SHA-256, Keccak) | Weakened, roughly halving the security level. **AES-256 and SHA-256 remain fine** |

So symmetric encryption, the subject of most of this track, survives. The public-key parts (key exchange and signatures) need replacing.

## Harvest now, decrypt later

Why worry before the machine exists? Because encrypted traffic can be **recorded today and decrypted later**. Anything that must stay secret for ten or more years (medical records, state secrets, long-lived business data, private keys sent over a network) is already at risk if its key exchange is classical.

Signatures are less urgent in that respect: a forged signature only matters once a quantum computer can produce it. The exception is anything long-lived that is anchored to a public key, such as root certificates, firmware signing keys, and blockchain accounts.

## The new standards

In August 2024 NIST published the first post-quantum standards:

| Standard | Formerly | Job |
|---|---|---|
| **FIPS 203: ML-KEM** | Kyber | Key exchange (replaces ECDH) |
| **FIPS 204: ML-DSA** | Dilithium | Digital signatures (replaces ECDSA and RSA signatures) |
| **FIPS 205: SLH-DSA** | SPHINCS+ | Hash-based signatures, slower and larger but based on very conservative assumptions |

NIST later picked **HQC** as a backup key-exchange algorithm built on different maths, and a further signature standard (FN-DSA, from Falcon) is on the way.

## The US timeline

- **2022**: National Security Memorandum 10 set the goal of moving US federal systems to quantum-resistant cryptography by **2035**, and the Quantum Computing Cybersecurity Preparedness Act required agencies to inventory their quantum-vulnerable systems.
- **NSA's CNSA 2.0** sets deadlines for national security systems to prefer and then require post-quantum algorithms, finishing in the early to mid 2030s.
- **NIST's draft transition plan (IR 8547)** proposes deprecating today's quantum-vulnerable public-key algorithms around **2030** and disallowing them by **2035**.

Government suppliers and regulated industries will follow these dates, and everyone else's vendors will follow them.

## It is already happening

- **Hybrid key exchange** (classical X25519 plus ML-KEM, so you stay safe even if one of them is broken) is on by default in current Chrome, Edge and Firefox, and on Cloudflare and other big providers. A large share of web traffic already uses it.
- **OpenSSH 10** made a hybrid ML-KEM key exchange its default.
- **Signal** (PQXDH) and **Apple iMessage** (PQ3) added post-quantum protection to their messaging protocols.

:::exercise Check your SSH supports post-quantum key exchange
@@file Terminal
@@lang bash
@@prompt
List the key-exchange algorithms your SSH client supports and filter for the post-quantum ones:

```bash
ssh -Q kex | grep -i -e mlkem -e sntrup
```

`mlkem768x25519-sha256` and `sntrup761x25519-sha512` are hybrid post-quantum key exchanges. No output means your OpenSSH is old: update it.
@@solution
ssh -Q kex | grep -i -e mlkem -e sntrup
@@hint ^\s*ssh\s+-Q\s+kex\s*\|
Start with `ssh -Q kex |` (`-Q kex` queries the supported key-exchange algorithms).
@@hint \|\s*grep\s+-i\s+-e\s+mlkem\s+-e\s+sntrup\s*$
Then `| grep -i -e mlkem -e sntrup` (each `-e` adds a pattern).
@@explain
Your servers decide too: check `sshd -T | grep kexalgorithms` on a server you run. For TLS, a recent OpenSSL (3.5 or later) supports ML-KEM hybrids, and most CDNs enable them for you.
:::

## What it means for blockchains

Bitcoin and Ethereum accounts are secured by ECDSA on secp256k1, which Shor's algorithm would break. The details matter:

- An address is a **hash** of a public key. While the public key has never been revealed, a quantum attacker has nothing to work on.
- The public key is revealed the first time an account **sends** a transaction (and was revealed immediately in early Bitcoin "pay to public key" outputs). Those accounts would be exposed.
- Migrating means new signature schemes, new address types and a way to move funds safely before attackers can. Proposals exist in both ecosystems, and smart-contract wallets (account abstraction) make it easier on Ethereum to change how an account verifies signatures.

The practical takeaways today: avoid reusing addresses where you can, keep an eye on your chain's migration plans, and design new protocols so the signature scheme can change.

## Crypto agility: build for change

The real lesson of post-quantum is that **algorithms have a shelf life**. Systems that hard-code one cipher everywhere need a rewrite to change it. Agile systems can rotate algorithms like they rotate keys:

- **Version every ciphertext and signature** with the algorithm and key that produced it.
- **Keep crypto behind one module** in your codebase, so a change happens in one place.
- **Keep an inventory**: where do you use RSA, ECDH, ECDSA, and which data must stay secret for how long?
- **Test rotation**: decrypt old versions, write new ones, and migrate in the background.

:::exercise Version your ciphertexts
@@file envelope-format.js
@@run false
@@prompt
Write a tiny format that records the version and key ID with every ciphertext, and refuses versions it does not know:

```js
const VERSION = 'v1';

export const pack = (keyId, iv, data) => [VERSION, keyId, iv.toString('base64'), data.toString('base64')].join(':');

export function unpack(text) {
  const [version, keyId, iv, data] = text.split(':');
  if (version !== VERSION) throw new Error(`Unsupported ciphertext version: ${version}`);
  return { keyId, iv: Buffer.from(iv, 'base64'), data: Buffer.from(data, 'base64') };
}
```
@@solution
const VERSION = 'v1';

export const pack = (keyId, iv, data) => [VERSION, keyId, iv.toString('base64'), data.toString('base64')].join(':');

export function unpack(text) {
  const [version, keyId, iv, data] = text.split(':');
  if (version !== VERSION) throw new Error(`Unsupported ciphertext version: ${version}`);
  return { keyId, iv: Buffer.from(iv, 'base64'), data: Buffer.from(data, 'base64') };
}
@@hint const\s+VERSION\s*=\s*['"]v1['"]
Line 1: `const VERSION = 'v1';`
@@hint export\s+const\s+pack\s*=\s*\(\s*keyId\s*,\s*iv\s*,\s*data\s*\)\s*=>\s*\[\s*VERSION\s*,\s*keyId\s*,\s*iv\.toString\(\s*['"]base64['"]\s*\)\s*,\s*data\.toString\(\s*['"]base64['"]\s*\)\s*\]\.join\(\s*['"]:['"]\s*\)
`pack` joins the four parts with colons (Base64 never contains a colon): `export const pack = (keyId, iv, data) => [VERSION, keyId, iv.toString('base64'), data.toString('base64')].join(':');`
@@hint export\s+function\s+unpack\(\s*text\s*\)\s*\{
`export function unpack(text) {`
@@hint const\s*\[\s*version\s*,\s*keyId\s*,\s*iv\s*,\s*data\s*\]\s*=\s*text\.split\(\s*['"]:['"]\s*\)
Split it back with array destructuring: `const [version, keyId, iv, data] = text.split(':');`
@@hint if\s*\(\s*version\s*!==\s*VERSION\s*\)\s*throw\s+new\s+Error\(\s*`Unsupported ciphertext version: \$\{version\}`\s*\)
Refuse unknown versions loudly: `if (version !== VERSION)` then `throw new Error(...)` with a template literal (backticks) containing Unsupported ciphertext version: ${version}
@@hint return\s*\{\s*keyId\s*,\s*iv\s*:\s*Buffer\.from\(\s*iv\s*,\s*['"]base64['"]\s*\)\s*,\s*data\s*:\s*Buffer\.from\(\s*data\s*,\s*['"]base64['"]\s*\)\s*\}
Return the parts as bytes: `return { keyId, iv: Buffer.from(iv, 'base64'), data: Buffer.from(data, 'base64') };`
@@hint ^\s*\}\s*$
Close the function with `}`.
@@explain
A stored value now looks like `v1:kms-2026-11:Hq3...:9fK...`. When you move to a new algorithm (or a hybrid post-quantum scheme for anything public-key), add `v2`, teach `unpack` to read both, write only `v2`, and re-encrypt `v1` records in the background. The key ID tells you which key to fetch, so key rotation works the same way.
:::

## Quiz

? Which survives a large quantum computer with only a modest loss of security?
- [ ] ECDSA on secp256k1
- [ ] RSA-2048
- [x] AES-256 and SHA-256
> Grover's algorithm roughly halves symmetric security; 256-bit keys leave plenty.

? What is "harvest now, decrypt later"?
- [x] Recording encrypted traffic today to decrypt once a quantum computer can break the key exchange
- [ ] Mining tokens now to sell later
- [ ] Backing up keys before they expire
> It is why post-quantum key exchange is being deployed years before such a computer exists.

? Why is hybrid key exchange (X25519 plus ML-KEM) used rather than ML-KEM alone?
- [ ] ML-KEM does not work on phones
- [x] The connection stays secure as long as either algorithm holds, which protects against a flaw in the newer one
- [ ] It is required for HTTP/1.1
> Defence in depth applies to algorithms too.

? Why put a version and key ID on every ciphertext?
- [ ] To make it longer
- [x] So you can rotate keys and change algorithms later while still reading old data
- [ ] Because AES requires it
> That is crypto agility: change is a deployment, not a rewrite.
