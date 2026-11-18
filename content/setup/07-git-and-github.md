---
id: setup-git
title: Git and GitHub basics
level: beginner
minutes: 20
summary: Save snapshots of your work, undo mistakes, and publish your code to GitHub.
---

## What Git is

Git is a save-game system for code. Every **commit** is a snapshot of your whole project with a message saying what changed. You can jump back to any snapshot, see exactly what changed between two of them, and work on experiments without breaking the working version.

**GitHub** is a website that hosts Git repositories online. It is your backup, your collaboration space and your public portfolio. Employers and clients look at it.

## The three places your changes live

1. **Working folder**: the files you are editing.
2. **Staging area**: changes you have chosen to include in the next commit (`git add`).
3. **Repository history**: commits saved forever (`git commit`).

This two-step add-then-commit lets you save related changes together, even if you edited several things.

## Your first repository

```bash
cd ~/code
mkdir about-me && cd about-me
git init
echo "# About me" > README.md
git status
git add README.md
git commit -m "Add README"
git log --oneline
```

`git status` is the command you will run more than any other. It tells you what changed and what is staged.

:::exercise Your first commit
@@file Terminal
@@lang bash
@@prompt
Inside a project folder that has a `README.md`, type the three commands that: start a Git repository, stage `README.md`, and commit it with the message `Add README`.
@@solution
git init
git add README.md
git commit -m "Add README"
@@hint ^\s*git\s+init\s*$
Line 1: `git init` creates the repository.
@@hint ^\s*git\s+add\s+README\.md\s*$
Line 2: `git add README.md` stages the file (README in capitals, like the file name).
@@hint git\s+commit\s+-m\s+
Line 3 starts `git commit -m` (m for message).
@@hint -m\s+["']Add README["']
The message goes in quotes: `"Add README"`
@@explain
`init` creates the hidden `.git` folder that stores history. `add` moves changes into the staging area. `commit` saves a permanent snapshot with your message. Run `git log --oneline` afterwards to see it.
:::

## The daily loop

```bash
git status                # what changed?
git diff                  # show the exact lines
git add index.html        # stage one file (or: git add . for everything)
git commit -m "Add hero section with brand photo"
git push                  # upload to GitHub
```

## Publish to GitHub

With the GitHub CLI logged in (`gh auth login`), one command creates the online repository and pushes your code:

```bash
gh repo create about-me --public --source=. --push
```

Your code is now at `github.com/your-username/about-me`.

## Ignore files that should never be committed

Create a file called `.gitignore` in the project root:

```text
node_modules/
.env
.DS_Store
dist/
```

- `node_modules/` can be rebuilt with `npm install`, and is huge.
- `.env` holds secrets like API keys. Committing it leaks them.
- Build output (`dist/`) is generated from your source.

:::warn Secrets in Git are forever
If you commit an API key, deleting it in the next commit does not remove it: it stays in the history. Treat it as leaked: revoke the key and make a new one. Add `.env` to `.gitignore` before your first commit, every time.
:::

## Branches in one minute

A branch is a separate line of work. Keep `main` always working, and build new things on a branch:

```bash
git switch -c add-contact-form    # create and switch to a new branch
# ...edit, add, commit...
git switch main
git merge add-contact-form
```

:::exercise Work on a branch, then merge it
@@file Terminal
@@lang bash
@@prompt
Type the five commands for this workflow:

1. Create and switch to a new branch called `add-contact-form`.
2. Stage everything.
3. Commit with the message `Add contact form`.
4. Switch back to `main`.
5. Merge `add-contact-form` into it.
@@solution
git switch -c add-contact-form
git add .
git commit -m "Add contact form"
git switch main
git merge add-contact-form
@@hint ^\s*git\s+switch\s+-c\s+add-contact-form\s*$
Line 1: `git switch -c add-contact-form` (`-c` means create).
@@hint ^\s*git\s+add\s+\.\s*$
Line 2: `git add .` (the dot means "everything in this folder").
@@hint git\s+commit\s+-m\s+["']Add contact form["']
Line 3: `git commit -m "Add contact form"`
@@hint ^\s*git\s+switch\s+main\s*$
Line 4: `git switch main` (no `-c`: main already exists).
@@hint ^\s*git\s+merge\s+add-contact-form\s*$
Line 5: `git merge add-contact-form`
@@explain
The branch let you build the form without touching `main`. Merging brings those commits into `main` once they are ready. On teams, step 5 happens through a pull request instead.
:::

## Free hosting with GitHub Pages

For plain HTML/CSS/JS sites: on GitHub open your repo, then **Settings, Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. A minute later your site is live at `your-username.github.io/about-me`.

:::pro Good commit messages
Write them as commands, describing what the commit does: "Add product grid", "Fix mobile menu overlap", "Remove unused images". Future you, reading the log at 11pm, will be grateful.
:::

## Quiz

? What does `git add` do?
- [ ] Uploads files to GitHub
- [x] Moves changes into the staging area, ready for the next commit
- [ ] Creates a new repository
> add stages, commit saves a snapshot, push uploads.

? You accidentally committed your .env file with an API key and pushed it. What is the right response?
- [ ] Delete the file in a new commit and move on
- [ ] Make the repository private
- [x] Revoke the key immediately and create a new one, then remove the file and add .env to .gitignore
> The key is in the history and may already have been scraped. Revoking is the only safe fix.

? Why work on a branch instead of directly on main?
- [x] So main always stays working while you experiment
- [ ] Branches make the code run faster
- [ ] GitHub does not allow commits to main
> Branches isolate unfinished work. You merge only when it is ready.

? Which command do professionals run most often?
- [ ] git init
- [x] git status
- [ ] git clone
> git status shows what changed and what is staged. Run it before every add and commit.
