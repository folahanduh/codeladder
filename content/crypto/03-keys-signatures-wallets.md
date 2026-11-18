---
id: crypto-keys
title: Keys, signatures and wallets
level: beginner
minutes: 25
summary: How a private key becomes an address, how signing works, what seed phrases really are, and how to keep funds safe.
---

## From random number to address

On Ethereum (and Bitcoin), your identity is a key pair on the **secp256k1** elliptic curve:

1. **Private key**: a random 256-bit number. About 10^77 possibilities, so guessing one is hopeless if it is truly random.
2. **Public key**: calculated from the private key with elliptic-curve multiplication. Easy forwards, practically impossible backwards.
3. **Address**: the last 20 bytes of the Keccak-256 hash of the public key, written in hex: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`.

```text
private key  --(curve maths, one-way)-->  public key  --(keccak256, last 20 bytes)-->  address
```

Anyone can know your address. Only the private key can spend from it.

## Signatures

To send a transaction, your wallet **signs** it with the private key using **ECDSA**. Every node then checks the signature against your address. Nobody needs your private key to verify; nobody can forge a signature without it.

```ts
// npm install viem
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { verifyMessage } from 'viem';

const privateKey = generatePrivateKey();          // a throwaway key for learning only
const account = privateKeyToAccount(privateKey);
console.log('Address:', account.address);

const message = 'I agree to the Code Ladder terms';
const signature = await account.signMessage({ message });

const valid = await verifyMessage({ address: account.address, message, signature });
console.log('Signature valid?', valid);                                  // true
console.log(await verifyMessage({ address: account.address, message: message + '!', signature })); // false
```

Change one character of the message and verification fails. That is integrity plus authenticity in one step.

:::exercise Sign and verify a message
@@file sign.ts
@@prompt
With viem's functions already imported, write four lines:

1. `const account = privateKeyToAccount(generatePrivateKey());`
2. `const signature = await account.signMessage({ message: 'I agree' });`
3. `const valid = await verifyMessage({ address: account.address, message: 'I agree', signature });`
4. `console.log(valid);`
@@solution
const account = privateKeyToAccount(generatePrivateKey());
const signature = await account.signMessage({ message: 'I agree' });
const valid = await verifyMessage({ address: account.address, message: 'I agree', signature });
console.log(valid);
@@hint privateKeyToAccount\(\s*generatePrivateKey\(\s*\)\s*\)
Line 1: `const account = privateKeyToAccount(generatePrivateKey());`
@@hint account\.signMessage\(\s*\{\s*message\s*:\s*['"]I agree['"]\s*\}\s*\)
Line 2: `await account.signMessage({ message: 'I agree' })`
@@hint verifyMessage\(\s*\{\s*address\s*:\s*account\.address\s*,\s*message\s*:\s*['"]I agree['"]\s*,\s*signature\s*\}\s*\)
Line 3: `verifyMessage({ address: account.address, message: 'I agree', signature })`
@@hint console\.log\(\s*valid\s*\)
Line 4: `console.log(valid);`
@@explain
This needs viem installed (`npm install viem`), so there is no Run button here. It prints `true`. Change the message in line 3 and it prints `false`: the signature only matches the exact message it signed.
:::

## Seed phrases

Managing raw private keys is error-prone, so wallets use a **seed phrase** (also called a recovery phrase or mnemonic): 12 or 24 words from a standard list of 2,048 (BIP-39). From that one phrase, a wallet deterministically derives a tree of private keys (BIP-32 / BIP-44). The first Ethereum account uses the path `m/44'/60'/0'/0/0`.

That is why restoring your 12 words in any compatible wallet brings back every account.

:::warn Your seed phrase IS your money
Anyone who sees your seed phrase controls every account derived from it, forever. Write it on paper (or metal), store it offline, never photograph it, never type it into a website, chat, email, cloud note or code file. No legitimate support person, airdrop or "wallet sync" will ever ask for it. If one does, it is a scam.
:::

## Types of wallet

| Type | What it is | Good for |
|---|---|---|
| **Browser or mobile wallet** (MetaMask, Rabby, Rainbow) | Keys stored, encrypted, on your device | Daily use, development |
| **Hardware wallet** (Ledger, Trezor) | Keys never leave a separate device; you confirm on its screen | Holding meaningful amounts |
| **Smart contract wallet** (Safe, ERC-4337 wallets) | A contract controls funds, with rules like multi-signature or spending limits | Teams, treasuries, better recovery |
| **Custodial** (exchange accounts) | Someone else holds the keys | Convenience, with counterparty risk ("not your keys, not your coins") |

## Developer key hygiene

- Make a **separate development wallet** that only ever holds testnet tokens.
- Never paste a private key with real funds into code, a `.env` file, or a terminal command.
- For deployments, use Foundry's encrypted keystore (`cast wallet import`) or a hardware wallet.
- Read what you are signing. Malicious sites ask for signatures that approve transfers of your tokens.

## Quiz

? What can someone do with only your Ethereum address?
- [x] Send you tokens and see your public balance and history
- [ ] Spend your tokens
- [ ] Work out your private key
> Addresses are public by design. Only the private key can authorise spending.

? How does a node know a transaction really came from your account?
- [ ] You email it your private key
- [x] It verifies the transaction's signature against your address
- [ ] The wallet company confirms it
> Signatures prove control of the private key without revealing it.

? A "support agent" in a Discord DM asks for your 12-word phrase to fix a stuck transaction. What should you do?
- [ ] Send the first six words only
- [ ] Send it, then change it afterwards
- [x] Refuse and report it: it is a scam
> Nobody legitimate ever needs your seed phrase. Six words also massively weakens it.

? Why does restoring a seed phrase bring back all your accounts?
- [x] All private keys are derived deterministically from the seed
- [ ] The blockchain stores your accounts by seed phrase
- [ ] Wallets back up keys to the cloud
> BIP-32/39/44 derive a whole tree of keys from one seed.
