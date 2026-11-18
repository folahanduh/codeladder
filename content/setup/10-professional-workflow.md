---
id: setup-pro-workflow
title: The professional workflow
level: advanced
minutes: 25
summary: Pull requests, code review, conventional commits, CI with GitHub Actions, secrets management and documentation.
---

## How teams ship code

On a professional team, nobody pushes straight to `main`. The flow looks like this:

1. Pull the latest `main` and create a branch: `git switch -c feat/checkout-validation`.
2. Make small commits as you go.
3. Push the branch and open a **pull request** (PR) describing what changed and why.
4. **Automated checks** (lint, type-check, tests, build) run on the PR.
5. A teammate **reviews** the code and comments.
6. You address feedback, checks go green, the PR is merged.
7. Merging to `main` triggers a **deployment**.

Even working alone, using PRs on your own projects builds the habit and gives you a clean history.

```bash
git push -u origin feat/checkout-validation
gh pr create --fill
gh pr checks          # watch the automated checks
gh pr merge --squash
```

## Conventional commits

Many teams prefix commit messages with a type. It makes history scannable and lets tools generate changelogs:

```text
feat: add discount code field to checkout
fix: round VAT to the nearest penny
docs: explain local setup in README
refactor: extract price formatting helper
test: cover empty cart edge case
chore: bump vite to 6.0.5
```

:::exercise Ship a fix the professional way
@@file Terminal
@@lang bash
@@prompt
Type the four commands to: create a branch `fix/vat-rounding`, commit with the conventional message `fix: round VAT to the nearest penny`, push the branch to `origin` (setting it as upstream), and open a pull request that fills in its title and body from your commits.
@@solution
git switch -c fix/vat-rounding
git commit -m "fix: round VAT to the nearest penny"
git push -u origin fix/vat-rounding
gh pr create --fill
@@hint ^\s*git\s+switch\s+-c\s+fix/vat-rounding\s*$
Line 1: `git switch -c fix/vat-rounding`
@@hint git\s+commit\s+-m\s+["']fix: round VAT to the nearest penny["']
Line 2: the message starts with the type `fix:` then a space.
@@hint ^\s*git\s+push\s+-u\s+origin\s+fix/vat-rounding\s*$
Line 3: `git push -u origin fix/vat-rounding` (`-u` links the local branch to the remote one).
@@hint ^\s*gh\s+pr\s+create\s+--fill\s*$
Line 4: `gh pr create --fill`
:::

## Code review: what reviewers look for

- **Correctness**: does it do what it claims? What about empty, huge or invalid inputs?
- **Security**: is input validated? Are secrets kept out? Could a user see someone else's data?
- **Readability**: would a new teammate understand it? Are names clear?
- **Tests**: is the new behaviour covered?
- **Scope**: is the PR focused on one thing? Small PRs get better reviews.

Review your own diff first (`git diff main`). You will catch half the issues yourself.

## Continuous integration with GitHub Actions

CI runs your checks on every push, so broken code never reaches `main`. Save this as `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Environment variables and secrets

Configuration that changes between environments (local, staging, production), and anything secret, lives outside the code:

```bash
# .env  (listed in .gitignore, never committed)
DATABASE_URL=postgres://localhost:5432/shop
STRIPE_SECRET_KEY=sk_test_...
```

- Commit a `.env.example` with the variable **names** and fake values, so others know what to set.
- In production, set real values in your host's dashboard (Vercel, Netlify, Railway) or a secrets manager.
- In GitHub Actions, use **repository secrets** (`${{ secrets.STRIPE_SECRET_KEY }}`).
- For smart contracts, never put a private key with real funds in a `.env` file. Use Foundry's encrypted keystore (`cast wallet import`) or a hardware wallet.

:::exercise Write a .env.example
@@file .env.example
@@lang bash
@@prompt
Write a `.env.example` with two variables, using placeholder values only:

- `DATABASE_URL` set to `postgres://localhost:5432/shop`
- `STRIPE_SECRET_KEY` set to `sk_test_replace_me`

No spaces around the `=` sign.
@@solution
DATABASE_URL=postgres://localhost:5432/shop
STRIPE_SECRET_KEY=sk_test_replace_me
@@hint ^DATABASE_URL=postgres://localhost:5432/shop\s*$
Line 1: `DATABASE_URL=postgres://localhost:5432/shop`
@@hint ^STRIPE_SECRET_KEY=sk_test_replace_me\s*$
Line 2: `STRIPE_SECRET_KEY=sk_test_replace_me`
@@explain
This file is committed so teammates know which variables to set. The real `.env`, with real secrets, stays in `.gitignore`.
:::

## Documentation that pays off

- **README.md**: what the project is, how to run it, how to test it, how to deploy it.
- **Decision records**: a short note whenever you make a significant choice ("We chose Postgres over MongoDB because..."). Six months later this is gold.
- **Comments** explain *why*, not *what*. The code already says what.

## Guard rails that catch mistakes early

- **Prettier** and **ESLint** in the project, run in CI.
- **TypeScript** in strict mode.
- **Pre-commit hooks** (e.g. with `husky` and `lint-staged`) that format and lint staged files before every commit.
- **Branch protection** on GitHub: require passing checks and a review before merging to `main`.

:::pro Working with AI tools professionally
AI coding assistants are now part of most teams' workflow. Treat their output exactly like a teammate's PR: read every line, run the tests, check for security issues and invented APIs. You are responsible for every line you merge, whoever or whatever typed it.
:::

## Quiz

? Why do teams use pull requests instead of pushing straight to main?
- [ ] GitHub charges for direct pushes
- [x] So changes are reviewed and automatically checked before they reach the shared, deployable branch
- [ ] Pull requests make the code smaller
> PRs combine human review and automated checks as a gate in front of main.

? Which commit message follows conventional commits?
- [ ] "stuff"
- [ ] "Fixed it!!"
- [x] "fix: prevent negative quantities in cart"
> type: short imperative description.

? What belongs in .env.example?
- [ ] Your real API keys, so teammates can use them
- [x] The variable names with placeholder values
- [ ] Nothing: it should stay empty
> It documents what configuration is needed without exposing secrets.

? What is the main job of CI?
- [x] Automatically run lint, tests and build on every push or PR so broken code is caught before merging
- [ ] Write code for you
- [ ] Back up your laptop
> Continuous integration checks every change the same way, every time.
