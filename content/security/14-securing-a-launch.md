---
id: sec-launch-security
title: "Capstone: designing security for a blockchain launch"
level: expert
minutes: 45
summary: Bring every layer together into one security programme for a protocol launch, from threat model to bug bounty, with a readiness checklist you can reuse.
---

## Security is a programme, not a product

No single audit, tool or key setup makes a protocol safe. Expert teams run a **security programme**: overlapping layers, each assuming the others might fail. This capstone puts the whole track together as the plan you would present before launching a blockchain project.

## The layers

| Layer | What "good" looks like | Lessons |
|---|---|---|
| **Design** | Written threat model; minimal admin powers; upgradeability justified or avoided | Mindset, Secure development |
| **Code** | Audited libraries; checks-effects-interactions; no manipulable price sources | Smart contract security |
| **Testing** | Unit, fuzz and invariant tests; symbolic checks on core properties; fork tests | Auditing, Formal verification |
| **Review** | At least one independent audit (two for large TVL) plus a fix review; ideally a competitive audit | Running an audit |
| **Keys** | Multisig of independent hardware-wallet signers; timelock on upgrades; separate guardian | Wallet and key opsec |
| **Infrastructure** | Hardened registrar and DNS; locked-down CI; dependency and secret scanning | Networks, Supply chain |
| **Launch** | Guarded launch: deposit caps, gradual limits, rate limits on withdrawals and bridges | This lesson |
| **Operations** | 24/7 monitoring with phone alerts; pause runbook; rehearsed incident response | Incident response |
| **Community** | Public bug bounty sized to the value at risk; clear security contact; published audits | Exploit development |

## The guarded launch

Launch small on purpose:

1. **Caps**: limit total deposits (for example, a low TVL ceiling) and raise it in steps as the system proves itself.
2. **Rate limits**: cap how much can leave per hour or day, so a bug cannot drain everything at once.
3. **Kill switches with limits**: pausing is fast; unpausing and upgrades go through the multisig and timelock.
4. **Bug bounty live before launch**, so finders have a legal, paid path from day one.
5. **Staged rollout across chains**: one chain first; each new chain or bridge is a new attack surface.

## Budgeting

Security spend should scale with value at risk. A useful sanity check: if an attacker could take 10 million dollars, a 30,000 dollar maximum bounty tells them stealing pays far better than reporting. Many serious projects offer a percentage of funds at risk, with a high cap, for critical bugs.

## The readiness review

Before launch day, the team signs off on a checklist. Anything missing either gets done or is explicitly accepted as a risk by named people.

:::exercise Automate the launch readiness check
@@file readiness.js
@@prompt
Write a tiny readiness check. Three lines:

1. `const checks = { audited: true, bugBounty: true, multisig: true, monitoring: false };`
2. `const missing = Object.keys(checks).filter((k) => !checks[k]);`
3. Print the result with a ternary: `console.log(missing.length ? ... : 'Ready to launch');` where the `...` is a template literal (between backticks) reading `Not ready: ` followed by `${missing.join(', ')}`.
@@solution
const checks = { audited: true, bugBounty: true, multisig: true, monitoring: false };
const missing = Object.keys(checks).filter((k) => !checks[k]);
console.log(missing.length ? `Not ready: ${missing.join(', ')}` : 'Ready to launch');
@@also
const checks = { audited: true, bugBounty: true, multisig: true, monitoring: false };
const missing = Object.keys(checks).filter(k => !checks[k]);
console.log(missing.length ? `Not ready: ${missing.join(', ')}` : 'Ready to launch');
@@hint const\s+checks\s*=\s*\{\s*audited\s*:\s*true\s*,\s*bugBounty\s*:\s*true\s*,\s*multisig\s*:\s*true\s*,\s*monitoring\s*:\s*false\s*\}
Line 1: `const checks = { audited: true, bugBounty: true, multisig: true, monitoring: false };`
@@hint Object\.keys\(\s*checks\s*\)\.filter\(
Line 2 starts `const missing = Object.keys(checks).filter(`
@@hint \(?\s*k\s*\)?\s*=>\s*!\s*checks\[\s*k\s*\]
Keep the keys whose value is false: `(k) => !checks[k]`
@@hint missing\.length\s*\?\s*`Not ready: \$\{missing\.join\(\s*['"], ['"]\s*\)\}`\s*:\s*['"]Ready to launch['"]
Line 3: a ternary: `missing.length ? ` then a template literal `Not ready: ${missing.join(', ')}` then `: 'Ready to launch'`
@@explain
It prints `Not ready: monitoring`. Real teams keep a much longer version of this list in their repository and treat it like a test suite: launch is blocked until every item passes or is formally accepted.
:::

## Your launch checklist

- Threat model written, reviewed and kept up to date.
- All admin powers documented publicly, with who holds them.
- Ownership transferred from the deployer to the multisig; deployer key retired.
- Timelock on upgrades and sensitive parameters.
- Unit, fuzz, invariant and symbolic tests passing in CI; coverage reviewed.
- Static analysis triaged; audits complete, published, and fixes reviewed.
- Bug bounty live, sized to the value at risk.
- Monitoring and paging in place for outflows, admin actions, oracles and DNS.
- Incident runbook rehearsed in a tabletop exercise; emergency contacts ready.
- Deposit caps and rate limits configured for the guarded launch.
- Registrar, DNS, CI and npm accounts protected with hardware keys.
- Legal review of the launch and any token (see the [launch playbook](#lesson-tok-launch)).

:::pro Where to go from here
Build the [DeFi Security Hackathon](#hackathons) project end to end using this checklist, then publish your threat model and report in its README. That single repository demonstrates more senior security skill than a pile of certificates.
:::

## Quiz

? Why launch with deposit caps?
- [x] So an undiscovered bug can only put a limited amount at risk while the system proves itself
- [ ] To make the token scarce
- [ ] Because audits require it
> Guarded launches limit the blast radius of unknown bugs.

? An attacker could steal 10 million dollars, but the bug bounty pays at most 30,000. What is the problem?
- [ ] The bounty is too generous
- [x] The incentive to steal is far larger than the incentive to report
- [ ] Bounties should be secret
> Bounties should be sized to the value at risk.

? Which step should happen immediately after deploying the contracts?
- [ ] Post the deployer's private key backup to the team chat
- [x] Transfer ownership and admin roles from the deployer to the multisig (behind a timelock)
- [ ] Remove the pause function
> The deployer key is a single point of failure; retire it.
