---
id: sec-mindset
title: The security mindset
level: beginner
minutes: 25
summary: What security protects, who attacks and why, how to think about threats, and the US laws (the CFAA and friends) that keep your learning legal.
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

## Stay legal: the rules of hacking (US law)

This course follows **United States law**, because most blockchain companies, exchanges and launchpads operate there or serve US users. It is general awareness, not legal advice.

| Law | What it covers | What it means for you |
|---|---|---|
| **Computer Fraud and Abuse Act (CFAA)**, 18 U.S.C. § 1030 | Accessing a computer "without authorization" or "exceeding authorized access", and causing damage | Logging in, scanning for holes or pulling data from a system you have no permission to test can be a federal crime, even "just to look", and even if it was easy. Victims can also sue under the CFAA. |
| **Wiretap Act** (part of the ECPA), 18 U.S.C. § 2511 | Intercepting other people's communications | Sniffing someone else's network traffic (on café Wi-Fi, say) is illegal. Capture only your own traffic or a lab network. |
| **State computer crime laws** | Every state has its own (for example California Penal Code § 502) | They can apply even where federal prosecutors would not. |
| **DMCA § 1201** | Breaking technical protections on software and devices | The Copyright Office grants an exemption for good-faith security research on devices and software you lawfully own, within limits. |

Two developments help researchers, but neither is a free pass:

- In **Van Buren v. United States (2021)** the Supreme Court narrowed "exceeds authorized access" to entering parts of a system that are off-limits to you, rather than misusing data you were allowed to see.
- In **2022 the Department of Justice** said it will not charge **good-faith security research** under the CFAA. That is a charging policy, not a law: states and companies can still act, and "I was only testing" has to be true and provable.

If you live outside the US, your own country's law applies to you as well (in the UK, for example, the Computer Misuse Act 1990).

The rule is simple: **only test systems you own, or have written permission to test.** That still leaves plenty to practise on:

- Your own machines and apps.
- Deliberately vulnerable practice apps (OWASP Juice Shop, DVWA).
- Legal training platforms and CTFs (TryHackMe, Hack The Box, PortSwigger Web Security Academy, picoCTF, Ethernaut).
- Bug bounty programmes, which give written permission (and usually a legal "safe harbor") within a published scope.
- The [Ladder CTF](#hackathons) on this site.

:::warn Never "test" a live protocol with real funds
Exploiting a bug in a live smart contract, even to "prove a point" or "rescue" funds, can be theft in law. US prosecutors have brought wire fraud, commodities fraud and market manipulation charges against people who drained protocols and argued that "the code allowed it". If you find a bug in something live, stop, write it up privately, and report it through the project's bug bounty or security contact.
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
> Testing without permission can be a federal crime under the Computer Fraud and Abuse Act (and break state law too), however good your intentions.

? Why do attackers so often target people rather than code?
- [x] Tricking a person into signing, clicking or running something is often easier than breaking well-tested code
- [ ] People are always more secure than code
- [ ] Code cannot be attacked
> Social engineering is behind many of the largest crypto thefts.
