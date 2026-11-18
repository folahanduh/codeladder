---
id: crypto-hashing
title: Hash functions hands-on
level: beginner
minutes: 20
summary: The properties that make SHA-256 and Keccak-256 secure fingerprints, and where hashes are used everywhere.
---

## A digital fingerprint

A **hash function** takes input of any size and returns a fixed-size output called a **hash** or **digest**.

```text
SHA-256("hello")  = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
SHA-256("Hello")  = 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969
```

Always 256 bits, shown as 64 hexadecimal characters (each hex character is 4 bits), whether the input is one letter or a whole film.

Open the [Hash Lab](#hash-lab) in another tab and type as you read.

## The properties that matter

| Property | Meaning | Why it matters |
|---|---|---|
| **Deterministic** | Same input, same hash, every time | Anyone can re-check it |
| **Fast to compute** | Milliseconds for normal data | Practical to use everywhere |
| **Pre-image resistant** | Given a hash, you cannot find an input that produces it | One-way: hashes do not reveal data |
| **Collision resistant** | You cannot find two different inputs with the same hash | A hash uniquely identifies data in practice |
| **Avalanche effect** | Change one bit of input and about half the output bits flip | No patterns to exploit |

## Where hashes are used

- **File integrity**: download pages publish a SHA-256. Hash your download; if it matches, nobody tampered with it.
- **Git**: every commit is identified by a hash of its contents and its parent's hash.
- **Blockchains**: each block contains the hash of the previous block. Change history and every later hash breaks.
- **Proof of work**: miners search for an input whose hash starts with many zeros.
- **Merkle trees**: summarise thousands of items in one hash, with tiny proofs that an item is included.
- **Commitments**: publish a hash of your answer now, reveal the answer later; everyone can check you did not change it.
- **Ethereum** uses **Keccak-256** for addresses, function selectors and storage locations.

## Hashing in code

```js try
async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

console.log(await sha256Hex('hello'));
console.log(await sha256Hex('hello '));   // one extra space: a completely different hash
```

In Solidity:

```solidity
bytes32 h = keccak256(abi.encodePacked("hello"));
```

:::exercise Hash text with SHA-256
@@file hash.js
@@prompt
Four lines:

1. `const bytes = new TextEncoder().encode('hello');`
2. `const digest = await crypto.subtle.digest('SHA-256', bytes);`
3. `const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');`
4. `console.log(hex);`

The output should start with `2cf24dba`.
@@solution
const bytes = new TextEncoder().encode('hello');
const digest = await crypto.subtle.digest('SHA-256', bytes);
const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
console.log(hex);
@@also
const bytes = new TextEncoder().encode('hello');
const digest = await crypto.subtle.digest('SHA-256', bytes);
const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
console.log(hex);
@@hint new\s+TextEncoder\(\s*\)\.encode\(\s*['"]hello['"]\s*\)
Line 1: `const bytes = new TextEncoder().encode('hello');`
@@hint await\s+crypto\.subtle\.digest\(\s*['"]SHA-256['"]\s*,\s*bytes\s*\)
Line 2: `const digest = await crypto.subtle.digest('SHA-256', bytes);`
@@hint Array\.from\(\s*new\s+Uint8Array\(\s*digest\s*\)\s*,
Line 3 starts `const hex = Array.from(new Uint8Array(digest),`
@@hint b\.toString\(\s*16\s*\)\.padStart\(\s*2\s*,\s*['"]0['"]\s*\)
Each byte becomes two hex characters: `b.toString(16).padStart(2, '0')`
@@hint \)\.join\(\s*['"]['"]\s*\)
Join them with an empty string: `.join('')`
@@explain
`padStart(2, '0')` matters: the byte 10 is `a` in hex, but it must be written `0a`. Without padding, some hashes would come out shorter than 64 characters and would never match.
:::

:::exercise Hash in Solidity
@@file Hash.sol
@@prompt
Write one Solidity line: a `bytes32` called `h` equal to `keccak256(abi.encodePacked("hello"))`.
@@solution
bytes32 h = keccak256(abi.encodePacked("hello"));
@@hint ^\s*bytes32\s+h\s*=
Start with the type and name: `bytes32 h =`
@@hint keccak256\(\s*abi\.encodePacked\(\s*["']hello["']\s*\)\s*\)
`keccak256(abi.encodePacked("hello"))`
@@hint \)\s*;\s*$
Solidity needs a semicolon at the end.
:::

## Hashes are not encryption

There is no key and no way back. That makes hashes perfect for checking, not for hiding data you need to read again.

:::warn Passwords need slow hashes
SHA-256 is designed to be fast, which is exactly wrong for passwords: attackers can try billions of guesses per second. Passwords need deliberately slow, salted algorithms like **Argon2id** or **bcrypt**.
:::

## Broken hashes

**MD5** and **SHA-1** have practical collision attacks. Do not use them for security. Modern choices: SHA-256, SHA-3 / Keccak-256, BLAKE2 and BLAKE3.

## Quiz

? You change one letter of a 10-page document. What happens to its SHA-256 hash?
- [ ] One character of the hash changes
- [x] It becomes completely different, with about half the bits flipped
- [ ] It stays the same
> The avalanche effect makes every change produce an unpredictable new hash.

? What does pre-image resistance mean?
- [x] Given a hash, you cannot work out an input that produces it
- [ ] Two inputs can never have the same hash
- [ ] Hashes are always 256 bits
> That one-way property is why hashes can be published safely.

? Which hash function does Ethereum use for addresses and function selectors?
- [ ] MD5
- [ ] SHA-1
- [x] Keccak-256
> Ethereum uses Keccak-256, a close relative of the SHA-3 standard.

? Why is plain SHA-256 a bad choice for storing passwords?
- [ ] It is too slow
- [x] It is so fast that attackers can try billions of guesses per second
- [ ] It produces collisions
> Password storage needs slow, salted algorithms like Argon2id or bcrypt.
