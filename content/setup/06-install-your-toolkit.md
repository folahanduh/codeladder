---
id: setup-install
title: Install your developer toolkit
level: beginner
minutes: 30
summary: Set up VS Code, Git, Node.js and a GitHub account, then prove each one works.
---

## The Day 1 setup

Open the [Install everything](#toolkit) page, choose your operating system at the top, and work through the **Day one** section in order. It has copy-paste commands for macOS, Windows and Linux. Tick each item when it works.

The minimum before your next lesson:

1. A package manager (Homebrew on Mac, winget on Windows, apt on Linux)
2. **VS Code** with Prettier, Error Lens and Live Server
3. **Git**, with your name and email configured
4. A **GitHub** account and the `gh` CLI, logged in
5. **Node.js LTS**

:::tip Windows users
Install WSL2 too (`wsl --install` in an administrator PowerShell). You can do web development on plain Windows, but blockchain tools like Foundry expect Linux, and most tutorials assume a Unix terminal.
:::

## Prove it works

Close and reopen your terminal (new installs often need a fresh terminal), then run:

```bash
git --version
node -v
npm -v
gh auth status
code --version
```

Each should print a version number or "Logged in". If one says "command not found", that tool is not installed or not on your **PATH** (the list of folders your terminal searches for programs). Reopening the terminal fixes most PATH problems; reinstalling fixes most of the rest.

:::exercise Check your tools are installed
@@file Terminal
@@lang bash
@@prompt
Type the three commands that print the versions of Node.js, npm and Git, one per line, in that order. (Use the short `-v` flag for Node and npm, and `--version` for Git.)
@@solution
node -v
npm -v
git --version
@@hint ^\s*node\s+-v\s*$
Line 1: `node -v`
@@hint ^\s*npm\s+-v\s*$
Line 2: `npm -v`
@@hint ^\s*git\s+--version\s*$
Line 3: Git uses the long form with two hyphens: `git --version`
@@explain
Each command prints a version number if the tool is installed and on your PATH. "command not found" means it is not installed, or your terminal needs reopening.
:::

## Set up VS Code like a professional

Press [[Ctrl+Shift+P]] ([[Cmd+Shift+P]] on Mac), type *Open User Settings (JSON)*, and add:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "files.autoSave": "onFocusChange",
  "editor.bracketPairColorization.enabled": true
}
```

Format-on-save means your code always looks consistent, which makes mistakes easier to spot.

:::exercise Write VS Code settings
@@file settings.json
@@prompt
Write a small settings file that turns on format-on-save and sets the tab size to 2. It is JSON: keys in double quotes, a colon, then the value, with a comma between entries.

```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2
}
```
@@solution
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2
}
@@hint ^\s*\{
Start with an opening curly brace `{` on its own line.
@@hint "editor\.formatOnSave"\s*:\s*true\s*,
Line 2: `"editor.formatOnSave": true,` with a comma at the end, because another entry follows.
@@hint "editor\.tabSize"\s*:\s*2\s*$
Line 3: `"editor.tabSize": 2` with **no** comma, because it is the last entry.
@@hint ^\s*\}\s*$
Close with `}` on the last line.
@@explain
JSON is strict: double quotes only, commas between entries, no comma after the last one. A single misplaced comma makes the whole file invalid, which is why editors highlight JSON errors in red.
:::

## Your first Node.js program

```bash
mkdir -p ~/code/hello-node && cd ~/code/hello-node
echo 'console.log("Node is working. 2 + 2 =", 2 + 2);' > hello.js
node hello.js
```

You just ran JavaScript outside a browser. That is how build tools, servers and smart-contract scripts run.

## How to organise your projects

Keep every project in one place, one folder per project:

```text
~/code/
  hello-node/
  about-me/
  weather-app/
  my-first-token/
```

Never put code in Downloads or on the Desktop, and avoid cloud-synced folders (iCloud, OneDrive) for code: they fight with Git and `node_modules`.

## Quiz

? You install Node but `node -v` says "command not found". What should you try first?
- [ ] Reinstall your operating system
- [x] Close and reopen the terminal, then try again
- [ ] Install a different code editor
> New installs update your PATH, but already-open terminals do not see the change.

? Why turn on format-on-save?
- [ ] It makes code run faster
- [x] Your code stays consistently formatted, so structure and mistakes are easier to see
- [ ] GitHub requires it
> Consistent formatting is a basic professional habit, and Prettier does it for free.

? Where is the best place to keep your code projects?
- [ ] On the Desktop
- [ ] In a OneDrive or iCloud folder
- [x] A dedicated folder like ~/code with one subfolder per project
> Sync services and code tooling do not get along. Keep code in a plain local folder and back it up with Git and GitHub.
