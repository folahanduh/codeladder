---
id: enc-attacks
title: How encryption gets broken (and how not to be next)
level: expert
minutes: 50
summary: Real attacks on real encryption, done hands-on: nonce reuse, unauthenticated ciphertext, padding oracles, keys shipped to the client, weak password-derived keys and side channels, plus how professionals test crypto code.
---

## AES is fine. The way it is used is not.

Nobody breaks AES-256 by brute force. Real-world encryption fails through **misuse**: a reused nonce, a missing integrity check, a key in the wrong place, a password too weak for the KDF protecting it. This lesson goes deeper than the [applied cryptography](#lesson-sec-crypto-in-practice) lesson: you will carry out the most common attack yourself.

## Attack 1: nonce reuse (the two-time pad)

AES-CTR, AES-GCM and ChaCha20 are **stream ciphers** under the hood: they generate a **keystream** from the key and nonce, and XOR it with your data.

```text
ciphertext = plaintext XOR keystream(key, nonce)
```

Reuse the same key and nonce for two messages and the keystream cancels out:

```text
c1 XOR c2 = (p1 XOR ks) XOR (p2 XOR ks) = p1 XOR p2
```

If the attacker knows or guesses *either* message (a greeting, a JSON field name, a file header), they recover the other one completely. With AES-GCM it is even worse: a repeated nonce also leaks the internal authentication key, letting the attacker **forge** messages that pass verification.

:::exercise Recover a message from a reused nonce
@@file two-time-pad.js
@@prompt
A team chat encrypted two messages with AES-CTR using the same key and the same nonce. You do not know the key. You do know the first message, because it was the daily standup reminder. Add three lines to recover the second message:

```js
const xor = (a, b) => a.map((byte, i) => byte ^ b[i]);
const recovered = xor(xor(c1, c2), p1);
console.log(new TextDecoder().decode(recovered));
```
@@starter
const hex = (h) => Uint8Array.from(h.match(/../g), (x) => parseInt(x, 16));
const c1 = hex('4be3e688dd732b01479edbe3528e2b0a376d4782a76564b9b032a80e5c166dd826c814ba6d');
const c2 = hex('48cbb690d76b235f4781d6ff529f3e08327c42d2ee7b2ba0bb76fc12561631c42fc8349449');
const p1 = new TextEncoder().encode('GM team, the standup moved to 3pm now');

@@solution
const hex = (h) => Uint8Array.from(h.match(/../g), (x) => parseInt(x, 16));
const c1 = hex('4be3e688dd732b01479edbe3528e2b0a376d4782a76564b9b032a80e5c166dd826c814ba6d');
const c2 = hex('48cbb690d76b235f4781d6ff529f3e08327c42d2ee7b2ba0bb76fc12561631c42fc8349449');
const p1 = new TextEncoder().encode('GM team, the standup moved to 3pm now');

const xor = (a, b) => a.map((byte, i) => byte ^ b[i]);
const recovered = xor(xor(c1, c2), p1);
console.log(new TextDecoder().decode(recovered));
@@hint const\s+xor\s*=\s*\(\s*a\s*,\s*b\s*\)\s*=>\s*a\.map\(\s*\(\s*byte\s*,\s*i\s*\)\s*=>\s*byte\s*\^\s*b\[\s*i\s*\]\s*\)
Line 1, a byte-by-byte XOR helper: `const xor = (a, b) => a.map((byte, i) => byte ^ b[i]);` (`^` is XOR in JavaScript).
@@hint const\s+recovered\s*=\s*xor\(\s*xor\(\s*c1\s*,\s*c2\s*\)\s*,\s*p1\s*\)
Line 2: `c1 XOR c2` gives `p1 XOR p2`; XOR that with the known `p1` to get `p2`: `const recovered = xor(xor(c1, c2), p1);`
@@hint console\.log\(\s*new\s+TextDecoder\(\s*\)\.decode\(\s*recovered\s*\)\s*\)
Line 3: turn the bytes back into text: `console.log(new TextDecoder().decode(recovered));`
@@explain
Press **Run it** and read the secret message. You never touched the key. The fix: a fresh random 96-bit nonce for every AES-GCM message (as in the intermediate lesson), a counter you can prove never repeats, or a cipher with a 192-bit nonce such as **XChaCha20-Poly1305**, where random nonces are safe even for huge numbers of messages. **AES-GCM-SIV** goes further and stays safe even if a nonce does repeat (it only reveals that two messages were identical).
:::

## Attack 2: ciphertext without integrity

Encryption alone hides data; it does not stop someone **changing** it. With CTR mode, flipping a bit in the ciphertext flips the same bit in the plaintext, so `"amount":100` can become `"amount":900` without knowing the key. With CBC mode, flipping bits in one block makes controlled changes in the next.

**Padding oracle attacks** are the famous version: if a server using CBC answers "bad padding" differently from "bad data", an attacker can decrypt any ciphertext a byte at a time just by sending modified versions and watching the replies. This broke real systems for over a decade (the 2002 Vaudenay attack, POODLE against SSL 3.0, Lucky 13 against TLS).

**The fix is non-negotiable: use authenticated encryption** (AES-GCM, ChaCha20-Poly1305, libsodium's secretbox) so any modification fails to decrypt. If you are stuck with CBC in a legacy system, encrypt-then-MAC and compare MACs in constant time before decrypting anything.

## Attack 3: the key went to the client

If your front-end JavaScript, mobile app or browser extension contains the key, so does every attacker's copy of it. Bundles are readable (view source, DevTools, or `apktool` for Android apps), and a "hidden" key is found in minutes. Common versions:

- an API "encryption key" in a React bundle,
- a hard-coded AES key in a mobile app that "encrypts" local data,
- a launchpad front end that signs claim messages with a private key it ships to the browser.

Anything the client can decrypt, the user (and malware on their machine) can decrypt. Keep keys server-side or in a KMS, or use public-key designs where the client only needs a public key.

## Attack 4: weak keys from weak passwords

When a key comes from a password, the attacker does not attack AES; they guess passwords offline, as fast as their GPUs allow. Password managers are the classic example: after a 2022 breach at a major password manager, attackers stole encrypted vaults. Vaults protected by strong master passwords and high KDF settings held; some older accounts still used far lower PBKDF2 iteration counts than current guidance, and investigators have since linked large crypto thefts to vaults that were cracked.

Defences: Argon2id or scrypt with real memory cost, or PBKDF2 with 600,000+ iterations; a minimum passphrase strength; and **re-encrypting old data when you raise the cost**, not only new data.

## Attack 5: side channels

The maths can be perfect while the implementation leaks:

- **Timing**: comparing a MAC or token with `===` stops at the first wrong byte, so response times reveal how many bytes were right. Use a constant-time comparison (`crypto.timingSafeEqual` in Node).
- **Error messages**: "invalid padding" versus "invalid MAC" versus "user not found" are all oracles.
- **Compression before encryption**: if attacker-controlled text is compressed together with a secret, the ciphertext length reveals the secret (the CRIME and BREACH attacks on HTTPS).

## Attack 6: downgrade and confusion

Attackers love making you use the weaker option:

- **Protocol downgrade**: forcing old TLS versions or ciphers. Disable everything below TLS 1.2.
- **Algorithm confusion**: a JWT library that trusts the token's own `alg` header can be tricked into accepting `alg: none`, or into verifying an RS256 token with HMAC using the public key as the secret. Always pin the algorithm you expect.

## How professionals test crypto code

- **Use high-level, misuse-resistant libraries** (libsodium, Tink, age) instead of raw primitives.
- **Run known-answer and attack test vectors**: Project Wycheproof publishes thousands of test cases for edge cases and known attacks against common algorithms.
- **Grep for red flags**: `Math.random`, `createCipher(` (the old, deprecated Node API), `'aes-256-cbc'` without a MAC, `'ecb'`, constant IVs, keys in source, `===` on MACs.
- **Get crypto-heavy code reviewed by someone who does this for a living.** Audits of wallets and bridges routinely find exactly these bugs.

## Quiz

? Two messages were encrypted with AES-CTR under the same key and nonce. What does XOR-ing the two ciphertexts give an attacker?
- [ ] The key
- [x] The XOR of the two plaintexts, so knowing one message reveals the other
- [ ] Nothing useful
> The keystream cancels out. That is why nonces must never repeat.

? Why is AES-CBC without a MAC dangerous?
- [ ] CBC is too slow
- [x] Ciphertext can be modified undetectably, and padding errors can become an oracle that decrypts data
- [ ] CBC cannot encrypt text
> Integrity is not optional. Use authenticated encryption.

? A mobile app encrypts local data with an AES key hard-coded in the app. Who can decrypt it?
- [ ] Only the company
- [x] Anyone who downloads the app and extracts the key
- [ ] Nobody, AES-256 is unbreakable
> A key you ship to users is a key you have published.

? Why compare MACs with crypto.timingSafeEqual instead of ===?
- [x] === can stop at the first different byte, and the timing difference lets attackers guess the MAC byte by byte
- [ ] === does not work on strings
- [ ] timingSafeEqual is faster
> Constant-time comparison removes the timing side channel.
