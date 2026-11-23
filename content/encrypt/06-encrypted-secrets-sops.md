---
id: enc-secrets
title: "Encrypted secrets: SOPS, secret managers and CI"
level: intermediate
minutes: 35
summary: Stop passing .env files around. Keep secrets encrypted in Git with SOPS and age, inject them at run time from a secret manager, and give CI short-lived access instead of long-lived keys.
---

## The .env problem

Every team starts the same way: a `.env` file with the database URL, API keys and an RPC key, shared in a chat message "just this once". Copies end up in Slack history, on old laptops and in backups. When someone leaves or a laptop is stolen, nobody knows which keys to rotate.

The [secrets lesson](#lesson-keys-secrets-in-code) showed how to keep secrets **out of Git**. This lesson is about where they live instead, and how to keep them **encrypted** until the moment your app needs them.

## Three good options

| Option | How it works | Best for |
|---|---|---|
| **Secret manager** (AWS Secrets Manager, Google Secret Manager, Doppler, Infisical, 1Password) | Secrets live encrypted in a service; your app or CLI fetches them at run time with its own identity; every read is logged | Production and teams |
| **Encrypted files in Git** with **SOPS** + age (or a KMS) | The config file is committed, but every secret value inside it is encrypted; only people or machines with a key can decrypt | Small teams, infrastructure repos, GitOps |
| **CI platform secrets** (GitHub Actions secrets and environments) | Stored encrypted by the platform and injected into jobs | Deploy pipelines |

## SOPS: encrypted config you can still review

**SOPS** (Secrets OPerationS) encrypts the *values* in a YAML, JSON or `.env` file but leaves the *keys* readable. Diffs stay meaningful ("someone changed `RPC_URL`") without revealing anything.

```yaml
# secrets.enc.yaml (safe to commit)
RPC_URL: ENC[AES256_GCM,data:7Qmq...,iv:...,tag:...,type:str]
DATABASE_URL: ENC[AES256_GCM,data:Lw0f...,iv:...,tag:...,type:str]
sops:
  age:
    - recipient: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
```

Under the hood it is envelope encryption: a random data key encrypts the values with AES-256-GCM, and that data key is encrypted to each recipient (age keys, PGP keys or cloud KMS keys).

:::exercise Encrypt, read and use a secrets file with SOPS
@@file Terminal
@@lang bash
@@prompt
Three commands. Encrypt `secrets.yaml` to your team's age public key (kept in an environment variable), print the decrypted values, then run your app with the secrets injected as environment variables, without ever writing a plaintext file:

```bash
sops --encrypt --age "$AGE_PUBLIC_KEY" secrets.yaml > secrets.enc.yaml
sops --decrypt secrets.enc.yaml
sops exec-env secrets.enc.yaml 'npm start'
```
@@solution
sops --encrypt --age "$AGE_PUBLIC_KEY" secrets.yaml > secrets.enc.yaml
sops --decrypt secrets.enc.yaml
sops exec-env secrets.enc.yaml 'npm start'
@@hint ^\s*sops\s+--encrypt\s+--age\s+["']\$AGE_PUBLIC_KEY["']\s+secrets\.yaml\s*>\s*secrets\.enc\.yaml\s*$
Line 1: `sops --encrypt --age "$AGE_PUBLIC_KEY" secrets.yaml > secrets.enc.yaml`
@@hint ^\s*sops\s+--decrypt\s+secrets\.enc\.yaml\s*$
Line 2: `sops --decrypt secrets.enc.yaml` (it finds your age identity in `~/.config/sops/age/keys.txt` or `SOPS_AGE_KEY_FILE`).
@@hint ^\s*sops\s+exec-env\s+secrets\.enc\.yaml\s+["']npm start["']\s*$
Line 3: `sops exec-env secrets.enc.yaml 'npm start'` runs the command with the secrets as environment variables.
@@explain
After encrypting, delete the plaintext `secrets.yaml` and add it to `.gitignore`. To change a value later, run `sops secrets.enc.yaml`: it decrypts into your editor and re-encrypts when you save. A `.sops.yaml` file in the repository can list the recipients so nobody has to remember the flags.
:::

## Secret managers: nothing on disk at all

With a secret manager, the app asks for secrets when it starts, using an identity (a cloud role, a service token) rather than a key stored next to it. A neat pattern for local development is a template that contains only *references*:

```bash
# .env.tpl (safe to commit: no secrets, only pointers)
RPC_URL=op://Launchpad/RPC/url
DATABASE_URL=op://Launchpad/Postgres/connection-string
```

```bash
op run --env-file=.env.tpl -- npm start
```

The 1Password CLI swaps each `op://` reference for the real value in memory, only for that process. Doppler (`doppler run -- npm start`) and Infisical work the same way.

## CI: secrets in GitHub Actions

GitHub encrypts Actions secrets (with libsodium sealed boxes) before they are stored, masks them in logs, and only exposes them to the jobs you choose.

:::exercise Pass a secret to a deploy step
@@file .github/workflows/deploy.yml
@@prompt
Give the deploy step the `RPC_URL` secret as an environment variable. Four lines, indentation matters in YAML:

```yaml
steps:
  - run: npm run deploy
    env:
      RPC_URL: ${{ secrets.RPC_URL }}
```
@@solution
steps:
  - run: npm run deploy
    env:
      RPC_URL: ${{ secrets.RPC_URL }}
@@hint ^steps:\s*$
Line 1: `steps:` at the left edge.
@@hint ^ {2}-\s+run:\s*npm\s+run\s+deploy\s*$
Line 2: two spaces, then `- run: npm run deploy`
@@hint ^ {4}env:\s*$
Line 3: four spaces, then `env:` (it belongs to the same step as `run`).
@@hint ^ {6}RPC_URL:\s*\$\{\{\s*secrets\.RPC_URL\s*\}\}\s*$
Line 4: six spaces, then `RPC_URL: ${{ secrets.RPC_URL }}`
@@explain
Pass secrets only to the steps that need them, never to the whole job. Put production secrets in a GitHub **environment** with required reviewers, so a deploy needs a human approval. Never `echo` a secret, and remember that a pull request from a fork does not get your secrets, for good reason.
:::

## Better than any stored secret: short-lived credentials

The best long-lived cloud key is no key. With **OIDC**, GitHub Actions proves its identity to AWS, Google Cloud or Azure and receives credentials that expire in minutes, scoped to one repository and branch. Nothing to leak, nothing to rotate. Use it for every deploy pipeline that touches the cloud.

## Rules that keep secrets secret

- **One secret, one place.** If a value exists in three systems, you will forget one when rotating.
- **Least privilege.** Each app and pipeline reads only its own secrets.
- **Rotation is a feature.** If rotating a key takes a day of work, it will not happen during an incident. Practise it.
- **Revoke on departure.** When someone leaves, remove their age key from SOPS recipients and rotate every secret they could decrypt.

## Quiz

? What does SOPS encrypt in a YAML file?
- [ ] The whole file, including key names
- [x] The values, leaving key names readable so diffs and reviews still make sense
- [ ] Only comments
> Readable structure with encrypted values is what makes SOPS files safe to commit.

? Why is `op run --env-file=.env.tpl -- npm start` safer than a .env file?
- [x] The template holds only references; real values are fetched at run time and never written to disk
- [ ] It encrypts the npm packages
- [ ] It deletes the database after use
> Nothing secret sits in the project folder to be copied, committed or stolen.

? What is the advantage of OIDC for CI deployments?
- [ ] It makes builds faster
- [x] The pipeline gets short-lived cloud credentials on demand, so there is no long-lived key to leak or rotate
- [ ] It removes the need for tests
> The safest secret is the one that does not exist.

? A teammate with access to your SOPS files leaves the company. What should you do?
- [ ] Nothing, the files are encrypted
- [x] Remove their key from the recipients, re-encrypt, and rotate every secret they could read
- [ ] Delete the Git history
> They may still have decrypted copies: rotation is the only real fix.
