---
id: sec-wallet-opsec
title: Wallet, key and team operational security
level: intermediate
minutes: 35
summary: How teams protect deployer and admin keys with multisigs and hardware, what blind signing is, and the social-engineering playbook used against crypto builders.
---

## The keys are the castle

In a protocol, a handful of keys can often upgrade contracts, move the treasury, mint tokens or pause everything. If one of those keys is stolen, perfect contract code does not matter. **Operational security (opsec)** is how you protect those keys and the people who hold them.

## Kinds of key in a project

| Key | Power | How to hold it |
|---|---|---|
| **Deployer** | Deploys contracts; often the initial owner | Fresh hardware wallet; hand ownership to a multisig straight after deployment |
| **Admin / owner** | Upgrades, parameters, treasury | A multisig (for example Safe) with several hardware-wallet signers, behind a timelock |
| **Guardian / pauser** | Emergency pause only | Small trusted group, fast to act, cannot move funds |
| **Operational bots** | Oracles, keepers, rebalancing | Narrow on-chain permissions; spending limits; alerts |
| **Developers' personal wallets** | Everyday testing | Never hold project funds; testnet only on dev machines |

## Multisig done right

A **multisig** wallet needs, say, 3 of 5 signers to approve any transaction. One stolen key is not enough.

- Signers use **hardware wallets** and are **different people in different places** (a 3-of-5 where one person holds 3 keys is a 1-of-1).
- Every signer **independently verifies** what they sign: the target contract, function and parameters, on their hardware device's screen if possible, and ideally with an independent simulation tool, not just the same web page.
- Pair the multisig with a **timelock** for upgrades, so the community gets time to react to a malicious change.

## Blind signing: how the largest hack happened

**Blind signing** means approving a transaction you cannot actually read: a hash or raw data instead of human-readable details. In February 2025, attackers stole roughly 1.5 billion dollars from the exchange Bybit. They compromised the infrastructure behind the multisig web interface its signers used, so the signers saw what looked like a routine transfer while their hardware wallets actually signed a transaction that handed control of the wallet to the attackers. Every signer followed the process; the process trusted one web page.

Lessons:

- Verify transaction details on an **independent** source (a second machine, a separate simulation tool, the hardware wallet's own screen).
- Understand **calldata**: the first 4 bytes of a transaction's data identify the function being called.

| Function | 4-byte selector |
|---|---|
| `transfer(address,uint256)` | `0xa9059cbb` |
| `approve(address,uint256)` | `0x095ea7b3` |

:::exercise Recognise an approval in raw calldata
@@file selector.js
@@prompt
Warn when a transaction's data is an ERC-20 approval. Five lines:

1. `const APPROVE = '0x095ea7b3';`
2. `const data = '0x095ea7b3000000000000000000000000';`
3. `if (data.startsWith(APPROVE)) {`
4. `console.log('Warning: this transaction grants a token approval');`
5. `}`
@@solution
const APPROVE = '0x095ea7b3';
const data = '0x095ea7b3000000000000000000000000';
if (data.startsWith(APPROVE)) {
  console.log('Warning: this transaction grants a token approval');
}
@@hint const\s+APPROVE\s*=\s*['"]0x095ea7b3['"]
Line 1: `const APPROVE = '0x095ea7b3';` (capitals for the constant's name).
@@hint const\s+data\s*=\s*['"]0x095ea7b3000000000000000000000000['"]
Line 2: the selector followed by 24 zeros: `'0x095ea7b3000000000000000000000000'`
@@hint if\s*\(\s*data\.startsWith\(\s*APPROVE\s*\)\s*\)\s*\{
Line 3: `if (data.startsWith(APPROVE)) {`
@@hint console\.log\(\s*['"]Warning: this transaction grants a token approval['"]\s*\)
Line 4: the warning text exactly.
@@explain
Wallet security features and transaction simulators decode calldata in exactly this way. When a "claim your airdrop" page asks you to sign something starting with `0x095ea7b3`, you are not claiming anything: you are approving someone to spend your tokens.
:::

## The social-engineering playbook against developers

State-backed groups have run long campaigns against crypto developers. Patterns to recognise:

- **Fake job offers** with a "take-home coding test" repo whose install script or dependencies run malware that steals wallet keys and browser sessions.
- **Fake investors or partners** who ask you to join a call through a "special" meeting app you must download.
- **Compromised contacts**: a real colleague's hacked account sends you a file or link.
- **Poisoned packages** with names one letter away from popular ones.

Defences: run unknown code only in a disposable VM or container; keep keys off development machines entirely; verify unusual requests through a second channel (call the person); hardware wallets for anything that signs.

:::warn Separate your worlds
The machine where you run random npm projects, browser extensions and downloads should never be the machine that holds admin keys or seed phrases. Many teams use a dedicated device, used for nothing but signing.
:::

## Quiz

? A 3-of-5 multisig has three keys held by the same person on one laptop. What is its real security?
- [ ] 3-of-5
- [x] Effectively 1-of-1: compromising that person or laptop is enough
- [ ] 5-of-5
> Independence of signers is the whole point.

? What is blind signing?
- [ ] Signing with your eyes closed
- [x] Approving a transaction whose real details you cannot read or have not independently verified
- [ ] Signing with a hardware wallet
> If you cannot see what you sign, the screen in front of you decides for you.

? Calldata starts with 0xa9059cbb. Which function is being called?
- [x] transfer(address,uint256)
- [ ] approve(address,uint256)
- [ ] mint(address)
> 0xa9059cbb is the selector for ERC-20 transfer; 0x095ea7b3 is approve.

? A recruiter's coding test asks you to run npm install on their repo. What is the safe move?
- [ ] Run it on your main laptop
- [x] Read it first and run it only in an isolated VM or container with no keys, wallets or saved logins
- [ ] Refuse all job tests forever
> Install scripts run arbitrary code with your user's permissions.
