---
id: keys-wallet-setup
title: Setting up wallets safely
level: beginner
minutes: 30
summary: Seed phrases, hardware wallets, passphrases and the four-wallet system that keeps a single mistake from costing you everything.
---

## One wallet is a single point of failure

If the wallet you use to try new dApps is the same wallet that holds your savings, one bad signature can take everything. Professionals separate wallets by job, the same way businesses separate a till from a safe.

## The four-wallet system

| Wallet | Used for | Holds | Kind |
|---|---|---|---|
| **Vault** | Long-term holdings | Most of your value | Hardware wallet, rarely connected |
| **Daily** | Trusted apps you use often | A spending amount | Hardware wallet or well-kept browser wallet |
| **Burner** | New mints, airdrops, unknown sites | Only what one action needs | Browser wallet, disposable |
| **Dev** | Development, testnets, scripts | Testnet tokens only | Separate browser profile; never real funds |

Move funds **from** the vault, never connect the vault to random sites, and never let a dev key hold real money.

## Seed phrases: the master key

When you create a wallet you get a 12 or 24-word **seed phrase**. Every account in that wallet is derived from it.

- Write it on paper or stamp it on metal. **Never** a photo, cloud note, email, password manager entry for a vault, or text file.
- Store it somewhere safe from fire and flood, and from other people.
- **Test the backup**: on a spare device or the hardware wallet's check feature, confirm the words restore the same first address *before* you send funds.
- Consider an optional **passphrase** (sometimes called the 25th word): it creates a completely different set of accounts. Someone who finds the 24 words without the passphrase finds only a decoy wallet. Lose the passphrase and you lose the funds, so back it up separately.

## Hardware wallets

A hardware wallet keeps the private key on a small device and signs **inside** it. Your computer only ever sees signatures. Even a fully infected laptop cannot extract the key; the worst it can do is trick you into approving a bad transaction, which is why you **read the device's screen** before every approval.

Buy only from the manufacturer or an authorised reseller, never second-hand, and set it up yourself (a device that arrives with a seed phrase already written on a card is a scam).

## Development wallets

For development, generate throwaway keys in code. They never hold real funds.

:::exercise Generate a development wallet
@@file dev-wallet.ts
@@prompt
Using viem, generate a throwaway mnemonic and derive its first account. Three lines (the imports are already in place):

1. `const mnemonic = generateMnemonic(english);`
2. `const account = mnemonicToAccount(mnemonic);`
3. `console.log('Dev address:', account.address);`
@@starter
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';
// Testnet only. Never send real funds to an address created in code.
@@solution
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';
const mnemonic = generateMnemonic(english);
const account = mnemonicToAccount(mnemonic);
console.log('Dev address:', account.address);
@@hint const\s+mnemonic\s*=\s*generateMnemonic\(\s*english\s*\)
Line 1: `const mnemonic = generateMnemonic(english);`
@@hint const\s+account\s*=\s*mnemonicToAccount\(\s*mnemonic\s*\)
Line 2: `const account = mnemonicToAccount(mnemonic);`
@@hint console\.log\(\s*['"]Dev address:['"]\s*,\s*account\.address\s*\)
Line 3: `console.log('Dev address:', account.address);`
@@explain
Keep the import line from the starter. Notice what the code does not do: it never prints the mnemonic. Logging secrets, even in development, is how they end up in terminal history, CI logs and screenshots.
:::

## Signing safely, every time

1. **Check the site**: typed by you or from a bookmark, never from a DM, ad or reply.
2. **Read what you sign**: an approval (`approve`, `setApprovalForAll`, `permit`) gives someone power over your tokens. A "free claim" never needs one.
3. **Simulate**: wallets like Rabby, and transaction simulation features, show what will leave your wallet before you sign.
4. **Revoke** old approvals regularly with a revoke tool or your wallet's approval manager.

## Quiz

? Which wallet should you use to try a brand-new mint site?
- [ ] Your vault
- [ ] Your dev wallet with real funds
- [x] A burner wallet holding only what that one action needs
> If the site is malicious, the damage is limited to the burner.

? Your hardware wallet arrived with a card showing a pre-written seed phrase. What should you do?
- [ ] Use it; the manufacturer generated it for you
- [x] Do not use it: it is a scam device, and whoever wrote the phrase can take the funds
- [ ] Add a passphrase and use it
> Legitimate devices always generate a new seed during your own setup.

? Why can a hardware wallet protect you even on an infected computer?
- [x] The private key never leaves the device; it signs internally and shows the real details on its own screen
- [ ] It installs antivirus software
- [ ] It encrypts your internet traffic
> Malware can still try to trick you, so always read the device screen.

? What does testing your seed backup mean?
- [ ] Taking a photo of it
- [x] Confirming the written words restore the same first address before you put funds in
- [ ] Reading it aloud
> An untested backup is a guess.
