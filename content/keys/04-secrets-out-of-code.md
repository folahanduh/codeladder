---
id: keys-secrets-in-code
title: Keeping secrets out of code
level: intermediate
minutes: 35
summary: Why a key pushed to GitHub is stolen in seconds, and the layered scripts that stop it, from .gitignore to pre-commit hooks, push protection and secret managers.
---

## Seconds, not days

Bots watch every public push to GitHub and npm. A private key or cloud API key that lands in a public repository is usually found and abused within **minutes**, sometimes seconds. Wallets with exposed keys are emptied by automated **sweeper bots** that take any ETH the moment it arrives. Deleting the file in a later commit does not help: the key is in the history, and the bots already have it.

So the rule is absolute: **a secret that was ever pushed is compromised. Rotate it.**

## Layer 1: never put it in a file Git sees

```text
# .gitignore
.env
.env.*
!.env.example
*.pem
*.key
keystore/
```

Commit a `.env.example` with variable names and fake values; keep the real `.env` local.

## Layer 2: a pre-commit hook that blocks secrets

A Git hook is a script Git runs automatically. A **pre-commit** hook runs before every commit and can refuse it. This one looks for anything shaped like a private key in the staged changes.

:::exercise Write a pre-commit hook that blocks private keys
@@file .git/hooks/pre-commit
@@lang bash
@@prompt
Write the hook script. Five lines:

```bash
#!/bin/sh
if git diff --cached | grep -Eq '0x[0-9a-fA-F]{64}'; then
  echo "Blocked: this commit contains what looks like a private key."
  exit 1
fi
```

Then make it executable with `chmod +x .git/hooks/pre-commit`. (Tools like gitleaks and the `pre-commit` framework do the same job with hundreds of patterns.)
@@solution
#!/bin/sh
if git diff --cached | grep -Eq '0x[0-9a-fA-F]{64}'; then
  echo "Blocked: this commit contains what looks like a private key."
  exit 1
fi
@@hint ^#!/bin/sh\s*$
Line 1 is the "shebang" that says which shell runs the script: `#!/bin/sh`
@@hint if\s+git\s+diff\s+--cached\s*\|
Line 2 starts `if git diff --cached |` (only what is staged for this commit).
@@hint grep\s+-Eq\s+['"]0x\[0-9a-fA-F\]\{64\}['"]\s*;\s*then
then `grep -Eq '0x[0-9a-fA-F]{64}'; then` (`-E` extended regex, `-q` quiet).
@@hint echo\s+["']Blocked: this commit contains what looks like a private key\.["']
Line 3 prints the reason.
@@hint ^\s*exit\s+1\s*$
Line 4: `exit 1`. Any non-zero exit makes Git cancel the commit.
@@hint ^\s*fi\s*$
Line 5 closes the `if`: `fi`
@@explain
Note: the first line looks like a comment to this checker, so it is not compared, but your real file must start with it. Hooks live only on your machine and are not shared through Git, which is why teams also run the same checks in CI and enable GitHub push protection: defence in depth.
:::

## Layer 3: the platform

- **GitHub push protection** blocks pushes containing known secret formats; **secret scanning** alerts on anything already in history. Turn both on for every repository and organisation.
- **CI checks**: run gitleaks on every pull request so nothing slips past a teammate's missing hook.

## Layer 4: do not keep secrets in files at all

| Instead of a plain `.env` | Use |
|---|---|
| Developer API keys | A password manager's CLI to inject them at run time (for example `op run -- npm start` with 1Password) |
| Production app secrets | Your host's secret store or a cloud secrets manager, with access logs |
| Deployment private keys | Foundry's encrypted keystore (`cast wallet import`) or, better, a hardware wallet |
| Production signing keys | A KMS, HSM or MPC signer (the expert lessons) |

## Layer 5: limit the blast radius

Even well-kept secrets leak eventually, so make each one worth as little as possible:

- **Scoped keys**: read-only where possible, restricted to specific domains, IPs or contracts.
- **Separate keys per environment**: staging keys cannot touch production.
- **Spending and rate limits** on paid APIs and hot wallets.
- **Short lifetimes and rotation** for everything that allows it.

## When a secret leaks: the five-minute checklist

1. **Revoke or rotate it now**, before investigating. Investigation can wait; attackers do not.
2. For a private key with funds: move remaining assets to a fresh, safe wallet (see the recovery lesson for sweeper bots).
3. Check logs for use of the leaked secret.
4. Remove it from history (`git filter-repo`) to stop new copies, while still treating it as compromised.
5. Add the check that would have caught it.

## Quiz

? A teammate pushed an API key and deleted it in the next commit five minutes later. Is the key safe?
- [ ] Yes, it is deleted
- [ ] Only if the repository is private
- [x] No: it is in the Git history and may already have been scraped, so revoke it and issue a new one
> Treat any pushed secret as compromised.

? What does a pre-commit hook do when it exits with code 1?
- [x] Git cancels the commit
- [ ] Git commits but warns
- [ ] Git deletes the file
> Non-zero exit means "stop".

? Why are local hooks not enough on their own?
- [ ] They are too slow
- [x] They live only on each developer's machine and can be skipped or missing, so CI and push protection add independent layers
- [ ] Git does not run them
> Defence in depth: assume any one layer can fail.
