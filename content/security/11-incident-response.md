---
id: sec-incident-response
title: Monitoring and incident response for protocols
level: advanced
minutes: 35
summary: Detect attacks in minutes, pause safely, run a war room, communicate honestly, and learn from every incident with a blameless post-mortem.
---

## Assume it will happen

Even well-audited protocols get attacked. The difference between a small incident and a catastrophe is often **how quickly the team detects it and what it can do in the first ten minutes**. That has to be designed and rehearsed before launch.

## Detect: monitoring and alerting

Watch for the signs of an attack in progress:

- Unusual outflows: TVL dropping sharply, large withdrawals, a new address draining a pool.
- Admin activity: ownership changes, upgrades, role grants, pauses you did not plan.
- Oracle anomalies: prices far from other sources, or stale feeds.
- Mempool signals: a newly deployed contract calling your protocol in strange ways.
- Off-chain: DNS records or served JavaScript changing, unusual logins to the registrar or cloud account.

Tools such as Forta, Tenderly alerts and Hypernative (and your own scripts reading events) can page the team within seconds. Alerts go to phones, not just email.

## Contain: the pause switch

A **pause** stops the most dangerous functions while letting users keep their funds safe. OpenZeppelin's `Pausable` and `AccessControl` make this straightforward. Give pause power to a small, fast **guardian** group, but never the power to move funds.

:::exercise Add an emergency pause
@@file Vault.sol
@@prompt
Write two functions, using OpenZeppelin `Pausable` and `AccessControl`:

1. A `deposit` that is `external payable whenNotPaused` and adds `msg.value` to `balances[msg.sender]`.
2. A `pause` that is `external onlyRole(GUARDIAN_ROLE)` and calls `_pause();`
@@solution
function deposit() external payable whenNotPaused {
    balances[msg.sender] += msg.value;
}
function pause() external onlyRole(GUARDIAN_ROLE) {
    _pause();
}
@@hint function\s+deposit\s*\(\s*\)\s*external\s+payable\s+whenNotPaused\s*\{
Line 1: `function deposit() external payable whenNotPaused {`
@@hint balances\[\s*msg\.sender\s*\]\s*\+=\s*msg\.value\s*;
Line 2: `balances[msg.sender] += msg.value;`
@@hint function\s+pause\s*\(\s*\)\s*external\s+onlyRole\(\s*GUARDIAN_ROLE\s*\)\s*\{
The pause function: `function pause() external onlyRole(GUARDIAN_ROLE) {`
@@hint _pause\(\s*\)\s*;
Inside it: `_pause();`
@@explain
While paused, `deposit` reverts. Think carefully about **which** functions to pause: pausing withdrawals during an attack may protect funds, but pausing them for too long traps honest users. Many teams let withdrawals continue while pausing deposits, borrowing and anything the attack uses.
:::

## Respond: the first hour

1. **Confirm**: is it real? Check the alert against the chain.
2. **Contain**: pause, raise the timelock, revoke a compromised role, or move remaining funds to safety through pre-approved procedures.
3. **War room**: a private channel with a named incident lead, a scribe, technical responders and a communications lead.
4. **Get help**: the security community runs emergency response for exactly this (for example **SEAL 911**, a volunteer hotline of experienced white hats). Prepare contacts in advance.
5. **Communicate**: a short, honest public update quickly ("We are investigating an incident affecting X. Deposits are paused. Do not interact with Y."), then regular updates. Silence breeds panic and scams.
6. **Trace and recover**: follow the funds, contact exchanges and stablecoin issuers that can freeze assets, and consider a public bounty offer for the return of funds.
7. **Report it (US)**: file a report with the **FBI's Internet Crime Complaint Center** (ic3.gov) including transaction hashes and addresses, as exchanges and issuers often need a law-enforcement report before they freeze funds. Bring in a lawyer early, because legal duties start running quickly:
   - If personal data was exposed, **state breach-notification laws** (every state has one) set deadlines for telling affected people, and sometimes the state attorney general.
   - A **public company** must disclose a material cybersecurity incident on SEC **Form 8-K** within four business days of deciding it is material.
   - Regulated firms have their own rules (New York's DFS, for example, requires notice within 72 hours for many incidents). CISA also takes voluntary reports and can help.

## Learn: the blameless post-mortem

Within days, publish what happened, the timeline, root cause, impact, what worked, what did not, and concrete changes. "Blameless" means focusing on system failures, not scapegoats, so people report problems honestly in future.

:::pro Rehearse before launch
Run a tabletop exercise: one person plays the attacker and describes events; the team responds in real time using the actual runbook, keys and tools. You will discover the multisig signer whose hardware wallet is in a drawer abroad, before it matters.
:::

## Quiz

? Who should hold the power to pause a protocol?
- [ ] Every token holder
- [x] A small, fast guardian group that can pause but cannot move funds
- [ ] Only the deployer key
> Speed matters in an incident, and limited powers limit the damage if a guardian key is lost.

? What should the first public update during an incident do?
- [ ] Say nothing until everything is fixed
- [x] Briefly and honestly say what is known, what is paused, and what users should avoid
- [ ] Blame the auditors
> Clear early communication protects users and reduces panic and scams.

? What is a blameless post-mortem?
- [x] An honest write-up focused on system failures and fixes rather than punishing individuals
- [ ] A report with no technical details
- [ ] A legal document
> Blame makes people hide problems; systems thinking prevents repeats.
