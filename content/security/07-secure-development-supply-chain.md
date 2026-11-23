---
id: sec-secure-dev
title: Secure development and supply-chain security
level: intermediate
minutes: 35
summary: Threat-model before you build, scan code and dependencies automatically, keep secrets out of Git, and harden CI against the attacks that have hit crypto projects.
---

## Security built in, not bolted on

Fixing a design flaw on the whiteboard costs minutes. Fixing it after launch can cost the whole treasury. A **secure development lifecycle** puts a security step into each phase:

| Phase | Security activity |
|---|---|
| Design | Threat model; decide trust boundaries and admin powers |
| Build | Secure defaults, input validation, reviewed libraries |
| Review | Peer code review with a security checklist |
| Test | Unit, fuzz and invariant tests; static analysis (SAST) |
| Release | Dependency and secret scanning in CI; signed releases |
| Operate | Monitoring, alerting, incident response, bug bounty |

## STRIDE: a checklist for "what can go wrong?"

| Letter | Threat | Example | Typical defence |
|---|---|---|---|
| **S** | Spoofing | Faking another user or contract | Authentication, signatures |
| **T** | Tampering | Changing data or a transaction | Integrity checks, access control |
| **R** | Repudiation | "I never did that" | Logs, events, signatures |
| **I** | Information disclosure | Leaked keys, private data | Encryption, least privilege |
| **D** | Denial of service | Unbounded loops, spam | Limits, rate limiting, pull payments |
| **E** | Elevation of privilege | User becomes admin | Role checks, deny by default |

Walk through every component of your diagram with these six letters. It takes an hour and finds real problems.

## The software supply chain

Your app is mostly other people's code: hundreds of npm packages, GitHub Actions, Docker images, compilers. Attackers increasingly go after that chain instead of you:

- **event-stream (2018)**: a popular npm package was handed to a new "maintainer", who added code targeting a Bitcoin wallet app's users.
- **Ledger Connect Kit (2023)**: a compromised library used by many dApp front ends briefly served wallet-draining code.
- **2025 npm compromises**: attackers phished maintainers of very widely used packages and published versions that tried to swap crypto addresses in web pages.

Defences:

1. **Commit your lockfile** and install with `npm ci` in CI, so versions cannot silently change.
2. **Fewer, well-known dependencies.** Each one is code you are trusting.
3. **Scan automatically**: `npm audit`, GitHub Dependabot, and supply-chain tools that flag suspicious new versions.
4. **Delay upgrades slightly** for critical apps; most malicious versions are caught within days.
5. **Protect your own publishing**: hardware-key 2FA on npm and GitHub, so you never become the compromised maintainer.

## Secrets scanning and static analysis

```bash
npm audit --audit-level=high       # known vulnerable dependencies
gitleaks git -v                    # secrets anywhere in your Git history
semgrep scan --config auto         # code patterns that look like vulnerabilities
```

:::exercise Run the three scanners
@@file Terminal
@@lang bash
@@prompt
Type the three scanning commands from above, in the same order: an npm audit that fails only on high or critical issues, a verbose gitleaks scan of the Git history, and a Semgrep scan with automatic rules.
@@solution
npm audit --audit-level=high
gitleaks git -v
semgrep scan --config auto
@@hint ^\s*npm\s+audit\s+--audit-level=high\s*$
Line 1: `npm audit --audit-level=high`
@@hint ^\s*gitleaks\s+git\s+-v\s*$
Line 2: `gitleaks git -v`
@@hint ^\s*semgrep\s+scan\s+--config\s+auto\s*$
Line 3: `semgrep scan --config auto`
@@explain
Put all three in CI so every pull request is checked automatically. Install gitleaks and Semgrep from the Security tools section of [Install everything](#toolkit).
:::

## Hardening GitHub Actions

CI has access to your code, your secrets and often your deployments, which makes it a prime target.

- Give the workflow's built-in token **read-only** permissions by default, and grant more only to the job that needs it.
- Pin third-party actions to a full commit SHA rather than a tag that can be moved.
- Never run untrusted pull-request code with access to secrets.
- Keep deployment keys in protected environments that need approval.

:::exercise Read-only CI by default
@@file .github/workflows/ci.yml
@@lang yaml
@@prompt
At the top level of a workflow, set the default token permissions so it can only read the repository's contents. Two lines; the second is indented by two spaces.

```yaml
permissions:
  contents: read
```
@@solution
permissions:
  contents: read
@@hint ^permissions\s*:\s*$
Line 1: `permissions:` at the very start of the line.
@@hint ^ {2}contents\s*:\s*read\s*$
Line 2, indented by exactly two spaces: `contents: read`
@@explain
Now a compromised step cannot push code, create releases or change settings with the workflow's token. In YAML, indentation is structure, which is why this exercise checks your spaces.
:::

## Quiz

? Which STRIDE letter covers a normal user gaining admin powers?
- [ ] S
- [ ] T
- [x] E
> Elevation of privilege.

? Why install dependencies with npm ci in CI?
- [x] It installs exactly what the lockfile says, so versions cannot silently change between builds
- [ ] It is the only command that works in CI
- [ ] It skips all security checks
> Reproducible installs are a supply-chain defence.

? What is the safest default for a GitHub Actions workflow token?
- [ ] Write access to everything
- [x] Read-only contents, with extra permissions granted only to jobs that need them
- [ ] No token at all, ever
> Least privilege applies to automation too.

? Several crypto front ends briefly served wallet-draining code without their own code being hacked. How?
- [ ] Their smart contracts were upgraded
- [x] A library they depended on was compromised upstream
- [ ] Their users had weak passwords
> That is a supply-chain attack: compromise one popular package, reach thousands of apps.
