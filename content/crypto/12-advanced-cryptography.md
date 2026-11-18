---
id: crypto-advanced-crypto
title: "Advanced cryptography: curves, Merkle proofs and zero knowledge"
level: advanced
minutes: 40
summary: How elliptic curves and ECDSA work, build and verify Merkle proofs, and an honest introduction to zero-knowledge proofs.
---

## Elliptic curves in one page

An elliptic curve is a set of points satisfying an equation like `y² = x³ + 7` (Bitcoin and Ethereum's **secp256k1**), computed over a huge prime field so all numbers wrap around.

You can "add" two points on the curve to get a third. Adding a starting point **G** to itself `k` times is called **scalar multiplication**: `P = k × G`.

- Computing `P` from `k` is fast (using doubling, about 256 steps).
- Recovering `k` from `P` and `G` is the **elliptic curve discrete logarithm problem**: no known method does it in any practical time for well-chosen curves.

That one-way function is the whole trick: your **private key** is `k`, your **public key** is `P = k × G`.

## ECDSA and why nonces matter

To sign a message hash `z`, the signer picks a secret one-time number `k` (the **nonce**), computes a point from it, and produces a signature `(r, s)` from `z`, `k` and the private key. Anyone can verify `(r, s)` against the public key.

:::warn Never reuse an ECDSA nonce
If the same `k` is used for two different messages, simple algebra reveals the private key. This famously broke the PlayStation 3's code-signing key in 2010, and weak random number generators have emptied Bitcoin wallets. Modern libraries derive `k` deterministically (RFC 6979). Another reason never to implement signatures yourself.
:::

**Ed25519** (an Edwards curve signature scheme) is designed to avoid these pitfalls and is the default for SSH keys, Solana and many modern systems.

## Merkle trees and proofs

A Merkle tree hashes items in pairs, then hashes those hashes in pairs, until one **root** remains.

```text
                 root = H(H12 + H34)
               /                     \
        H12 = H(H1+H2)          H34 = H(H3+H4)
         /        \               /        \
     H1=H(A)   H2=H(B)       H3=H(C)    H4=H(D)
```

To prove `C` is in the set, you only need `H4` and `H12`: hash `C`, combine with `H4`, combine with `H12`, and compare with the root. For a million items, a proof is only about 20 hashes.

This is how airdrops work cheaply: store only the 32-byte root on-chain; each user submits their own proof.

```js try
// A tiny Merkle tree with SHA-256 and sorted pairs (the convention OpenZeppelin uses, with keccak256)
const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const hash = async (s) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const pair = (a, b) => hash(a < b ? a + b : b + a);

const items = ['alice:100', 'bob:250', 'carol:75', 'dave:300'];
const leaves = await Promise.all(items.map(hash));

// build the tree level by level
const levels = [leaves];
while (levels.at(-1).length > 1) {
  const prev = levels.at(-1), next = [];
  for (let i = 0; i < prev.length; i += 2) next.push(await pair(prev[i], prev[i + 1] ?? prev[i]));
  levels.push(next);
}
const root = levels.at(-1)[0];
console.log('root', root);

// proof for carol: the sibling at each level
function proofFor(index) {
  const proof = [];
  for (const level of levels.slice(0, -1)) {
    const sibling = index % 2 ? level[index - 1] : level[index + 1] ?? level[index];
    proof.push(sibling);
    index = Math.floor(index / 2);
  }
  return proof;
}
const proof = proofFor(2);

async function verify(item, proof, root) {
  let h = await hash(item);
  for (const sib of proof) h = await pair(h, sib);
  return h === root;
}
console.log('carol:75 included?', await verify('carol:75', proof, root));   // true
console.log('carol:999 included?', await verify('carol:999', proof, root)); // false
```

In Solidity, OpenZeppelin's `MerkleProof.verify(proof, root, leaf)` does the checking. Off-chain, `@openzeppelin/merkle-tree` builds compatible trees. Hash leaves twice (or with a distinct prefix) to prevent a known second-preimage trick where an inner node is passed off as a leaf.

## Zero-knowledge proofs

A **zero-knowledge proof** convinces a verifier that a statement is true without revealing why:

- "I know a password that hashes to this value" without revealing the password.
- "I am over 18" without revealing a birthdate.
- "These 10,000 transactions were all executed correctly" with one short proof (this is what ZK rollups do).

In practice you write the statement as a **circuit** (a program with arithmetic constraints), and a proving system produces a proof that verifies quickly.

| Family | Proof size | Trusted setup? | Notes |
|---|---|---|---|
| **SNARKs** (Groth16, PLONK) | Tiny, cheap to verify on-chain | Often (or universal) | Most common on Ethereum |
| **STARKs** | Larger | No | Transparent, based on hashes |

Tools to explore later: **Circom** with snarkjs, **Noir** (a Rust-like ZK language), and zkVMs like RISC Zero and SP1 that prove ordinary Rust programs. Start with Noir's tutorials once you are solid in Solidity.

## Looking ahead: post-quantum cryptography

Large quantum computers would break elliptic-curve and RSA cryptography (not hash functions or AES-256 to the same degree). In 2024, NIST published the first post-quantum standards, including ML-KEM for key exchange and ML-DSA for signatures, and browsers and messaging apps have begun adopting hybrid schemes. Blockchains are researching migration paths. You do not need to act now, but you should know why "harvest now, decrypt later" matters for long-lived secrets.

## Quiz

? What makes scalar multiplication on an elliptic curve useful for keys?
- [x] k x G is easy to compute, but recovering k from the result is infeasible
- [ ] It is reversible with the right password
- [ ] It produces 12-word phrases
> That one-way function turns a private key into a public key safely.

? An ECDSA signer reuses the same nonce for two different messages. What happens?
- [ ] Both signatures are invalid
- [x] Anyone can compute the private key from the two signatures
- [ ] Nothing, nonces are optional
> Nonce reuse is catastrophic for ECDSA.

? A Merkle tree has about one million leaves. Roughly how many hashes are in an inclusion proof?
- [ ] 1,000,000
- [ ] 1,000
- [x] About 20
> Proof size grows with log2 of the number of leaves.

? What do ZK rollups use zero-knowledge proofs for?
- [ ] Hiding all transactions forever
- [x] Proving to Ethereum that a large batch of transactions was executed correctly
- [ ] Generating seed phrases
> One small validity proof replaces re-executing every transaction on L1.
