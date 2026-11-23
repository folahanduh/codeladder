---
id: keys-launchpad
title: Launchpad and token-launch key security
level: advanced
minutes: 45
summary: Protect a launch end to end, covering deployer and owner keys, presale wallets, whitelist signers, admin panels and the social accounts thousands of buyers trust.
---

## A launch is a key-management event

During a launch (a presale, an IDO on a launchpad, an airdrop claim, an NFT mint), more value moves through more keys in less time than at any other point in a project's life. Attackers plan around launch dates. The most common launch disasters are key and account failures:

- A **deployer key** in a leaked `.env` lets an attacker take ownership and mint.
- A **whitelist signer** key on a web server is stolen and used to sign unlimited allocations.
- The project's **X or Discord** account is hijacked to post a "mint is live" link to a drainer site.
- The **website's domain or front-end library** is compromised to serve malicious transactions.
- A **launchpad admin panel** login is phished, letting the attacker change the sale's receiving address.

## Map every key before launch day

| Key / account | Power | Control it should have |
|---|---|---|
| Deployer | Deploys contracts, often becomes owner | Fresh hardware wallet; transfers ownership to the multisig immediately |
| Owner / admin roles | Mint, pause, upgrade, set prices and recipients | Multisig (for example 3 of 5) plus a timelock on dangerous changes |
| Sale receiving wallet | Receives raised funds | Multisig; address published and verified on the explorer |
| Whitelist / claim signer | Authorises who may buy or claim | Dedicated key in a KMS or HSM, behind a service with rate limits and logs |
| Liquidity tokens | Can pull the trading pool | Locked or held by the multisig with a public lock |
| Launchpad dashboard | Configures the sale | SSO plus hardware security keys; minimal admins |
| Domain, DNS, hosting | Controls what buyers see | Registrar lock, hardware keys, change alerts |
| X, Discord, Telegram | Where buyers get "the link" | Hardware keys on every admin; few admins; Discord bots with minimal permissions; links pinned in advance |

## Signature-based whitelists, done safely

Many launchpads approve buyers off-chain: a server signs `(buyer, maxAmount)` and the contract checks the signature. Done carelessly, a single leaked or replayed signature lets attackers buy far more than allowed. A safe claim must bind the signature to **one buyer, one contract, one chain, one use and a deadline**, which EIP-712 structured data and OpenZeppelin's `EIP712`, `ECDSA` and `Nonces` give you.

:::exercise Make claim signatures single-use and expiring
@@file Presale.sol
@@prompt
Inside the presale's `claim` function, before verifying the signature, add the three checks every signed allowance needs. Three lines:

1. `require(block.timestamp <= deadline, "Signature expired");`
2. `require(!usedNonces[nonce], "Signature already used");`
3. `usedNonces[nonce] = true;`
@@solution
require(block.timestamp <= deadline, "Signature expired");
require(!usedNonces[nonce], "Signature already used");
usedNonces[nonce] = true;
@@hint require\(\s*block\.timestamp\s*<=\s*deadline\s*,\s*["']Signature expired["']\s*\)\s*;
Line 1: `require(block.timestamp <= deadline, "Signature expired");`
@@hint require\(\s*!\s*usedNonces\[\s*nonce\s*\]\s*,\s*["']Signature already used["']\s*\)\s*;
Line 2: `require(!usedNonces[nonce], "Signature already used");` (the `!` means "not").
@@hint usedNonces\[\s*nonce\s*\]\s*=\s*true\s*;
Line 3 marks it spent: `usedNonces[nonce] = true;`
@@explain
The signed message must also include the buyer's address, the amount, the nonce, the deadline, the chain ID and this contract's address (EIP-712's domain covers the last two). Then a leaked signature is useful only to the buyer it names, once, until the deadline, on this contract.
:::

## The signer service

The server that signs allowances holds a **hot key**: it must sign automatically, so it cannot be a hardware wallet in someone's drawer. Contain it:

- Store the key in a **KMS or HSM** so the server can request signatures but can never read the key (next lesson).
- Put **policy** in front of it: maximum amount per signature, maximum signatures per minute, only addresses from the allow-list, alerts when limits are hit.
- Make it a **separate service** with its own minimal API, not a function inside the public web server.
- Give the contract a way to **rotate the signer address** (through the multisig) and to pause claims.

## Social accounts are part of the attack surface

Buyers trust whatever the project's official accounts post. Before launch:

- Every admin of X, Discord and Telegram uses a **hardware security key**, and the list of admins is as short as possible.
- Discord: no bots with Administrator permission; restrict who can post in announcement channels; disable `@everyone` pings except for a locked role.
- Publish the official contract address and mint URL **days before** launch, pinned everywhere, and say "we will never post a different link on launch day".
- Prepare the incident message in advance ("Our X account is compromised; do not click any links") and decide who posts it, from where.

## Launch-day runbook (excerpt)

1. Deployer deploys, verifies the contracts, and transfers ownership to the multisig. Confirm on the explorer.
2. Deployer wallet is emptied and retired.
3. Monitoring is live for owner changes, signer changes, large transfers, DNS and front-end changes.
4. War room open with the guardian who can pause, a comms lead, and a direct line to the launchpad.
5. Any anomaly: pause first, investigate second.

## Quiz

? Why must a whitelist signature include a nonce and a deadline?
- [ ] To make the signature shorter
- [x] So each signature can be used once and only until it expires, stopping replay
- [ ] Wallets require it
> Plus buyer, amount, chain ID and contract address, so it cannot be reused anywhere else either.

? Where should a launchpad's automatic whitelist signing key live?
- [ ] In the public web server's .env file
- [x] In a KMS or HSM behind a separate signing service with rate limits and policy
- [ ] In a hardware wallet that someone plugs in for every buyer
> It must sign automatically, so protect it with infrastructure and limits.

? The project's X account posts an unexpected "mint is live" link an hour early. What is the most likely explanation?
- [ ] An early mint
- [x] The account has been hijacked to send buyers to a drainer site
- [ ] A scheduling mistake
> Pre-announced links and a prepared incident message limit the damage.

? What should happen to the deployer wallet straight after deployment?
- [x] Ownership transfers to the multisig, then the deployer wallet is emptied and retired
- [ ] It stays as the owner for convenience
- [ ] It is shared with the team for emergencies
> The deployer is a single point of failure.
