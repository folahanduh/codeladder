---
id: keys-recovery
title: "Compromise recovery: rescuing assets and rotating keys"
level: expert
minutes: 45
summary: The first hour after a key or account is compromised, including sweeper bots, private transaction bundles, revoking approvals, ownership races and EIP-7702 delegation traps.
---

## Assume the worst, move fast, in the right order

When a key or account is compromised, the attacker is usually automated and already acting. Your priorities, in order:

1. **Stop the bleeding**: pause what can be paused, revoke what can be revoked.
2. **Secure what can still move**: rescue assets and powers that remain.
3. **Rotate everything the attacker could have touched.**
4. **Investigate and communicate.**

Investigation comes last. Every minute spent reading logs while the key is live is a minute the attacker uses.

## Account compromises (web2)

| Step | Why |
|---|---|
| Sign out all sessions and revoke tokens | Stolen sessions keep working after a password change |
| Change the password, from a clean device | The infected device may be how they got in |
| Remove unknown MFA devices, recovery emails and phone numbers | Attackers add their own to keep access |
| Revoke OAuth apps, API keys and personal access tokens created recently | Persistence: they may have created long-lived keys |
| Check forwarding rules, webhooks, deploy keys and SSH keys | Quiet ways to keep reading your data |
| Rotate every secret the account could see | Assume it was all copied |

## Private key compromises (web3)

A compromised private key cannot be "secured"; the goal is to **get value and powers out** before the attacker does, then never use that key again.

### The sweeper bot problem

Attackers attach **sweeper bots** to compromised wallets. The instant ETH arrives (for example, you send gas to rescue tokens), the bot spends it first. Sending gas money to a compromised wallet usually just donates it.

### Private bundles

The standard rescue is a **private bundle** (for example via Flashbots or another private builder): one atomic package of transactions, submitted privately and never visible in the public mempool, that:

1. Funds the compromised wallet with just enough gas, **and**
2. Transfers the tokens or NFTs out to a safe wallet, **and**
3. Uses up the gas, so nothing is left to sweep,

all in the same block, or not at all. The bot never sees the funding transaction in time. Volunteer white-hat responders (such as SEAL 911) help with exactly this; contact them rather than improvising under stress.

### Revoke approvals

If the issue is a malicious **approval** rather than a stolen key, revoking it stops further drains. Revoking an ERC-20 approval means setting the allowance to zero.

:::exercise Revoke a token approval
@@file revoke.ts
@@prompt
With wagmi or viem's `writeContract`, set the allowance for `spender` back to zero. One call (on one line):

`writeContract({ address: TOKEN, abi: erc20Abi, functionName: 'approve', args: [spender, 0n] });`
@@solution
writeContract({ address: TOKEN, abi: erc20Abi, functionName: 'approve', args: [spender, 0n] });
@@hint ^\s*writeContract\(\s*\{\s*address\s*:\s*TOKEN\s*,\s*abi\s*:\s*erc20Abi\s*,
Start `writeContract({ address: TOKEN, abi: erc20Abi,`
@@hint functionName\s*:\s*['"]approve['"]
Revoking is just another approval: `functionName: 'approve'`
@@hint args\s*:\s*\[\s*spender\s*,\s*0n\s*\]
with an amount of zero, as a BigInt: `args: [spender, 0n]`
@@hint \}\s*\)\s*;?\s*$
Close with `});`
@@explain
Revoke tools do exactly this for every approval you hold. For NFTs, the equivalent is `setApprovalForAll(operator, false)`. Revoking from a compromised wallet only helps if the attacker does not also hold the key, so for a stolen key, rescue the assets with a private bundle instead.
:::

### Ownership races

If a compromised key is the **owner** of a contract, both you and the attacker can call `transferOwnership`. Whoever lands first wins. Send the transfer to your multisig via a private bundle immediately, with a high priority fee. Contracts owned by a multisig behind a timelock never put you in this race, which is the real lesson.

### EIP-7702 delegation traps

Since Ethereum's 2025 Pectra upgrade, an ordinary wallet (EOA) can **delegate** to smart-contract code (EIP-7702). Attackers who obtain a key, or trick a user into signing a delegation, can point the wallet at a malicious contract that drains anything sent to it automatically, acting like a permanent on-chain sweeper. After a compromise, check whether the address has a delegation set, and never sign an authorisation you do not fully understand.

## After the fire

- Write the timeline while memories are fresh.
- Find the root cause (how did the key leak?) and fix that, not just the symptom.
- Rotate everything in the same trust zone, not only the key you know about.
- Publish an honest post-mortem if users were affected.

## Quiz

? Why does sending ETH for gas to a compromised wallet usually fail?
- [x] A sweeper bot spends any incoming ETH immediately, before your rescue transaction runs
- [ ] The network blocks compromised wallets
- [ ] Gas prices double
> Use a private bundle that funds and rescues atomically.

? A contract's owner key leaks. What is the fastest protective move?
- [ ] Investigate the leak first
- [x] Transfer ownership to the multisig through a private bundle with a high priority fee, before the attacker acts
- [ ] Post on social media
> It is a race. Better still: never let a single key own a contract.

? After an account takeover you change the password. What else is essential?
- [ ] Nothing
- [x] Revoke sessions, remove attacker-added MFA and recovery methods, and revoke new tokens and OAuth apps
- [ ] Delete the account
> Attackers set up persistence; remove all of it.
