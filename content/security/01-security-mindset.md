---
id: sec-mindset
title: The security mindset
level: beginner
minutes: 25
summary: What security protects, who attacks and why, how to think about threats, and the law that keeps your learning legal.
---

## Why a whole track on security

A website with a bug is embarrassing. A blockchain with a bug can lose millions of dollars in a single transaction, publicly, with no bank to call and no undo button. Blockchain projects are some of the most attacked software on earth because the money is right there in the code.

So security is not a separate job you hand to someone at the end. It is a way of thinking that every developer needs from day one. This track takes you from that mindset to the level where you could help secure a real protocol launch.

## The CIA triad

Almost every security goal fits one of three words:

| Goal | Means | Broken when |
|---|---|---|
| **Confidentiality** | Only the right people can read it | Customer emails leak; a private key is exposed |
| **Integrity** | Nobody can change it without permission | An attacker edits an order total; a contract's owner is swapped |
| **Availability** | It works when people need it | A DDoS takes the shop offline; a contract is permanently frozen |

When you ask "is this secure?", ask instead: **secure against what, for which of these three?**

## Who attacks, and why

| Attacker | Motivation | Typical methods |
|---|---|---|
| Opportunistic criminals | Quick money | Phishing, stolen passwords, automated scanners |
| Organised groups and state-backed teams | Large-scale theft (crypto is a major target) | Social engineering of developers, malware, supply-chain attacks |
| Insiders | Money, revenge, mistakes | Abusing access they already have |
| Researchers and white hats | Bounties, reputation | The same techniques, but they report what they find |

The uncomfortable truth: the most damaging crypto thefts have often come from **people being tricked** (signing a malicious transaction, running a fake "coding test" from a fake recruiter, leaking a key), not from clever maths.

## Thinking like an attacker: threat modelling

A **threat model** is a structured answer to four questions:

1. **What are we building?** Draw it: users, servers, contracts, wallets, admins.
2. **What can go wrong?** For every arrow and box, imagine abuse.
3. **What are we going to do about it?** Prevent, detect, or accept each risk.
4. **Did we do a good job?** Test it, then revisit after every big change.

The **attack surface** is everything an attacker can touch: every form, API endpoint, contract function, dependency, admin key and human with access. Smaller attack surface, fewer ways in.

## Principles you will use forever

- **Least privilege**: give every person, key and service the minimum access it needs, and nothing more.
- **Deny by default**: allow specific things; block everything else. An allow-list beats a block-list.
- **Defence in depth**: assume any single protection will fail, and layer them (validation, then authorisation, then monitoring, then a pause switch).
- **Fail safely**: when something goes wrong, the system should lock up, not open up.
- **Don't trust, verify**: input from users, other contracts, oracles and even your own front end must be checked.

:::exercise Deny by default
@@file permissions.js
@@prompt
Write a function that only allows refunds for an allow-list of roles. Everyone else is denied by default. Four lines:

1. `function canRefund(user) {`
2. `return user.role === 'admin' || user.role === 'support';`
3. `}`
4. `console.log(canRefund({ role: 'customer' }));`
@@solution
function canRefund(user) {
  return user.role === 'admin' || user.role === 'support';
}
console.log(canRefund({ role: 'customer' }));
@@hint function\s+canRefund\s*\(\s*user\s*\)\s*\{
Line 1: `function canRefund(user) {`
@@hint user\.role\s*===\s*['"]admin['"]\s*\|\|\s*user\.role\s*===\s*['"]support['"]
Line 2 returns true only for the two allowed roles: `user.role === 'admin' || user.role === 'support'`
@@hint canRefund\(\s*\{\s*role\s*:\s*['"]customer['"]\s*\}\s*\)
Last line tests a customer: `console.log(canRefund({ role: 'customer' }));`
@@explain
It prints `false`. Any role you forgot to think about (a new "intern" role, a typo like "Admin") is denied automatically. The opposite design, "allow unless the role is banned", fails open the moment someone invents a new role.
:::

## Stay legal: the rules of hacking

In the UK, the **Computer Misuse Act 1990** makes it a criminal offence to access a computer system without authorisation, even "just to look", and even if it is easy. Most countries have similar laws (the US Computer Fraud and Abuse Act, for example).

The rule is simple: **only test systems you own, or have written permission to test.** That still leaves plenty to practise on:

- Your own machines and apps.
- Deliberately vulnerable practice apps (OWASP Juice Shop, DVWA).
- Legal training platforms and CTFs (TryHackMe, Hack The Box, PortSwigger Web Security Academy, picoCTF, Ethernaut).
- Bug bounty programmes, which give written permission within a published scope.
- The [Ladder CTF](#hackathons) on this site.

:::warn Never "test" a live protocol with real funds
Exploiting a bug in a live smart contract, even to "prove a point" or "rescue" funds, can be theft in law. If you find a bug in something live, stop, write it up privately, and report it through the project's bug bounty or security contact.
:::

## Quiz

? A hacker changes the delivery address on someone else's order. Which part of the CIA triad is broken?
- [ ] Confidentiality
- [x] Integrity
- [ ] Availability
> Data was changed without permission: that is integrity.

? What does least privilege mean?
- [ ] Give everyone admin so work is faster
- [x] Give each person, key or service only the access it needs
- [ ] Remove all passwords
> Limiting access limits the damage when any one account or key is compromised.

? You find a website with an obvious security hole. What is the legal and ethical move?
- [ ] Test it a bit more to be sure, then tell them
- [ ] Post about it publicly so they fix it fast
- [x] Do not probe further; report it privately through their security contact or bug bounty
> Testing without permission can be a crime under the Computer Misuse Act, however good your intentions.

? Why do attackers so often target people rather than code?
- [x] Tricking a person into signing, clicking or running something is often easier than breaking well-tested code
- [ ] People are always more secure than code
- [ ] Code cannot be attacked
> Social engineering is behind many of the largest crypto thefts.
