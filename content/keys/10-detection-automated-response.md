---
id: keys-detection
title: Detecting compromise and responding automatically
level: expert
minutes: 45
summary: Build the monitoring and response scripts that catch stolen keys and hijacked accounts in seconds, covering treasury watchers, approval alerts, admin-change alarms and safe auto-pause bots.
---

## Detection is a race against automation

Attackers use bots that act within seconds of getting a key. If your team learns about a compromise from users on X an hour later, it is already over. Expert teams have **machines watching machines**, with a human paged within a minute.

## What to watch

| Signal | Where it shows up | Likely meaning |
|---|---|---|
| Transfer out of the treasury or presale wallet | `Transfer` events from that address | Theft, or an unplanned payment |
| New `Approval` from a protocol wallet | `Approval` events | Someone preparing a drain |
| Owner, admin or signer changed | `OwnershipTransferred`, `RoleGranted`, custom events | Takeover of the contract's controls |
| Upgrade or implementation change | `Upgraded` events on proxies | Malicious code being swapped in |
| Login from a new country or device on an admin account | Identity provider logs | Stolen credentials or session |
| New OAuth app, API key or deploy key | Platform audit logs | Attacker persistence |
| DNS records or served JavaScript changed | DNS and front-end monitors | Front-end hijack |

## Script: watch the treasury

viem can subscribe to contract events and run your code for each new one. Point it at transfers **from** the treasury address, and send an alert to Slack, Discord, Telegram or a paging service.

:::exercise Alert on treasury transfers
@@file watch-treasury.ts
@@prompt
Write the watcher in this shape (the `client`, `TOKEN`, `TREASURY`, `erc20Abi` and `sendAlert` already exist):

```ts
client.watchContractEvent({
  address: TOKEN,
  abi: erc20Abi,
  eventName: 'Transfer',
  args: { from: TREASURY },
  onLogs: (logs) => sendAlert(`Treasury transfer: ${logs.length} event(s)`),
});
```
@@solution
client.watchContractEvent({
  address: TOKEN,
  abi: erc20Abi,
  eventName: 'Transfer',
  args: { from: TREASURY },
  onLogs: (logs) => sendAlert(`Treasury transfer: ${logs.length} event(s)`),
});
@@also
client.watchContractEvent({
  address: TOKEN,
  abi: erc20Abi,
  eventName: 'Transfer',
  args: { from: TREASURY },
  onLogs: logs => sendAlert(`Treasury transfer: ${logs.length} event(s)`),
});
@@hint ^\s*client\.watchContractEvent\(\s*\{\s*$
Line 1: `client.watchContractEvent({`
@@hint address\s*:\s*TOKEN\s*,
`address: TOKEN,`
@@hint abi\s*:\s*erc20Abi\s*,
`abi: erc20Abi,`
@@hint eventName\s*:\s*['"]Transfer['"]\s*,
`eventName: 'Transfer',`
@@hint args\s*:\s*\{\s*from\s*:\s*TREASURY\s*\}\s*,
Filter on the indexed `from` argument: `args: { from: TREASURY },`
@@hint onLogs\s*:\s*\(?\s*logs\s*\)?\s*=>\s*sendAlert\(\s*`Treasury transfer: \$\{logs\.length\} event\(s\)`\s*\)
`onLogs: (logs) => sendAlert(...)` with a template literal: `Treasury transfer: ${logs.length} event(s)`
@@hint ^\s*\}\s*\)\s*;?\s*$
Close with `});`
@@explain
Run it as a small always-on service (with a second, independent RPC provider as backup). Add the same pattern for `Approval` events from protocol wallets and for ownership and role events on every contract you own.
:::

## Automated response: powerful, so be careful

Some teams let a **guardian bot** pause the protocol automatically when a rule fires (for example, outflow above 10% of TVL within ten minutes). It can save everything, or cause an outage on a false alarm. Rules for doing it safely:

- The bot holds a key that can **only pause**: never move funds, never unpause, never upgrade.
- Pausing must be **safe to do wrongly**: users' funds stay withdrawable, or the pause is short and reviewed.
- Thresholds are tuned on real history, and every automatic pause pages a human immediately.
- The bot's own key lives in a KMS with tight IAM, and the bot is monitored too.

```js
// Sketch of a guardian rule (pseudocode-level JavaScript)
if (outflowLast10Min > 0.1 * totalValueLocked) {
  await guardian.writeContract({ address: VAULT, abi: vaultAbi, functionName: 'pause' });
  await sendAlert('Auto-paused: outflow above 10% of TVL in 10 minutes. Investigate now.');
}
```

## Detection for accounts and APIs

- Turn on and **export audit logs**: GitHub organisation audit log, cloud provider logs, identity provider sign-in logs, launchpad admin logs.
- Alert on: new admin, new OAuth app authorised, new personal access token, MFA removed, login from a new country, repository made public, branch protection disabled.
- Use **canary tokens**: fake credentials planted where a thief would find them (in an old `.env`, a password manager folder, a cloud bucket). Any use of one is a guaranteed alarm, with no false positives.

## Practise under pressure

The [Critical Moment](#critical-moment) simulator puts you in these situations against a clock: identify the attack from live evidence, decode what the attacker is doing, and choose the right containment steps in the right order. The [Keys & Accounts hackathon](#hackathons) has you build these monitors for real.

## Quiz

? Why should an auto-pause bot's key be able to pause but not unpause?
- [x] If the bot or its key is compromised or wrong, the worst it can do is pause; restarting needs human review
- [ ] Unpausing costs more gas
- [ ] Contracts cannot be unpaused
> Limit automated keys to the safest possible action.

? What makes a canary token a good alarm?
- [ ] It encrypts your secrets
- [x] It is never used legitimately, so any use means a real intruder found it
- [ ] It blocks attackers
> Zero false positives by design.

? Which event would reveal an attacker preparing to drain a protocol wallet's tokens?
- [ ] A Transfer into the wallet
- [x] A new Approval from the wallet to an unknown spender
- [ ] A new block
> Approvals usually come before the drain.
