---
id: sec-audit-process
title: Running a professional security audit
level: advanced
minutes: 40
summary: Scope, review, prove and report. The end-to-end process auditors follow, how to rate severity, and how to write a finding developers act on.
---

## What an audit is, and is not

A security audit is a time-boxed, expert review of a specific version of code against its intended behaviour. It **reduces** risk; it does not prove there are no bugs. Many exploited protocols had been audited. The best teams combine audits with testing, a bug bounty, monitoring and conservative launches.

## The audit process

1. **Scoping**: exact commit hash, which files, which chains, what is out of scope, how long, and what the protocol is supposed to do.
2. **Understanding**: read the docs and specs; list the actors and their powers; draw the money flows. Write down the **invariants**: things that must always be true.
3. **Automated pass**: compile, run the tests, coverage, Slither or Aderyn, and a quick fuzz run. Triage everything they report.
4. **Manual review**: line by line, with a checklist (access control, external calls, maths, oracles, upgrades, signatures, denial of service, economic attacks).
5. **Prove it**: write a **proof-of-concept test** for every real finding. If you cannot demonstrate it, rate it lower or keep digging.
6. **Report**: findings with severity, impact, proof and fix.
7. **Fix review**: verify every fix, and check the fixes did not introduce new bugs.

## Rating severity

Severity combines **impact** (how bad if it happens) and **likelihood** (how easy and probable):

| | Low likelihood | Medium likelihood | High likelihood |
|---|---|---|---|
| **High impact** (funds lost or stuck) | Medium | High | Critical |
| **Medium impact** (temporary loss, griefing) | Low | Medium | High |
| **Low impact** (minor, no fund risk) | Informational | Low | Medium |

Be honest. Inflating severity damages your credibility; downplaying it can cost users their money.

## Writing a finding

```text
[H-01] Reentrancy in Vault.withdraw allows draining all deposits

Severity: High (impact: total loss of funds; likelihood: high, any user can call it)

Description: withdraw() sends ETH before setting the caller's balance to zero.
A contract whose receive() calls withdraw() again is paid repeatedly.

Proof of concept: test/Exploit.t.sol::test_Exploit_Reentrancy drains 10 ETH
from a vault in which the attacker deposited 1 ETH.

Recommendation: set balances[msg.sender] = 0 before the external call
(checks-effects-interactions) and add OpenZeppelin's ReentrancyGuard.
```

## The proof-of-concept test

A finding with a passing exploit test gets fixed. A finding with only a paragraph gets debated.

:::exercise Write the proof-of-concept test
@@file Exploit.t.sol
@@prompt
Write the PoC test for the finding above. Five lines:

1. `function test_Exploit_Reentrancy() public {`
2. Deploy the attacker against the vault: `Attacker attacker = new Attacker(vault);`
3. Give it 1 ETH: `vm.deal(address(attacker), 1 ether);`
4. Run the attack: `attacker.attack();`
5. Prove the vault is empty: `assertEq(address(vault).balance, 0);`

Then close the function with `}`.
@@solution
function test_Exploit_Reentrancy() public {
    Attacker attacker = new Attacker(vault);
    vm.deal(address(attacker), 1 ether);
    attacker.attack();
    assertEq(address(vault).balance, 0);
}
@@hint function\s+test_Exploit_Reentrancy\s*\(\s*\)\s*public\s*\{
Line 1: `function test_Exploit_Reentrancy() public {`
@@hint Attacker\s+attacker\s*=\s*new\s+Attacker\(\s*vault\s*\)\s*;
Line 2: `Attacker attacker = new Attacker(vault);`
@@hint vm\.deal\(\s*address\(\s*attacker\s*\)\s*,\s*1\s+ether\s*\)\s*;
Line 3: `vm.deal(address(attacker), 1 ether);`
@@hint attacker\.attack\(\s*\)\s*;
Line 4: `attacker.attack();`
@@hint assertEq\(\s*address\(\s*vault\s*\)\.balance\s*,\s*0\s*\)\s*;
Line 5: `assertEq(address(vault).balance, 0);`
@@explain
Run it with `forge test --match-test test_Exploit_Reentrancy -vvvv` to see the full call trace, including every re-entry. After the fix, the same test should fail, so turn it into a regression test that expects the attack to revert.
:::

## Where to practise auditing

- Read real reports: public audits from established firms, and **Solodit**, a searchable database of thousands of past audit findings.
- **Competitive audits** (Code4rena, Sherlock, Cantina, CodeHawks): anyone can audit live codebases for a prize pool. Judges grade your findings, which is the fastest feedback loop available.
- Re-audit old contest codebases and compare your findings with the official report.

## Quiz

? What does an audit guarantee?
- [ ] That the code has no bugs
- [x] Nothing absolute: it is a time-boxed expert review that reduces risk for one specific version
- [ ] That the protocol is profitable
> Audited code is still exploited sometimes. Audits are one layer of defence.

? A bug lets any user permanently lock all funds, and anyone can trigger it. Severity?
- [ ] Low
- [ ] Medium
- [x] Critical (high impact, high likelihood)
> Loss or freezing of all funds by anyone is as serious as it gets.

? Why should every finding include a proof-of-concept test?
- [x] It proves the issue is real, shows its impact, and becomes a regression test after the fix
- [ ] Clients require it for payment
- [ ] It makes the report longer
> Demonstrated bugs get fixed; arguments get ignored.

? What is a fix review?
- [ ] A second audit of the whole codebase
- [x] Checking that each fix resolves its finding without introducing new problems
- [ ] Reviewing the auditor's invoice
> Fixes are new code, and new code can have new bugs.
