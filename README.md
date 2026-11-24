# Code Ladder

**Live site: <https://folahanduh.github.io/codeladder/>**

A self-paced coding school that runs on your own computer. It takes you from your first HTML tag to building full-stack websites, writing and securing smart contracts, and designing token economies.

- **82 lessons** in seven tracks (Foundations, Web Development, Cryptography & Blockchain, Cybersecurity, Keys & Accounts, Encryption, Tokenomics), from Beginner through Intermediate and Advanced, up to **Expert** in the three security tracks. Starts from coding basics (integers, decimals, characters, strings, decisions, loops and functions).
- **Cybersecurity track (14 lessons)**: security mindset and the law, passwords/MFA/phishing, networks, Linux, hacking web apps, applied cryptography, supply-chain security, wallet and key opsec, blockchain threats beyond the contract, running an audit, incident response, formal verification, ethical exploit development, and a capstone on securing a blockchain launch.
- **Keys & Accounts track (10 lessons)**: the number one way blockchains, apps and launchpads get drained. How keys and accounts get stolen, setting up wallets safely, sessions and cookies, keeping secrets out of code (with a pre-commit hook), third-party APIs and **OAuth with PKCE**, stopping account takeover (rate limits, breached-password checks, passkeys), launchpad signing with EIP-712, KMS/HSM/MPC signers, compromise recovery, and detection scripts that alert and auto-pause.
- **Encryption track (10 lessons)**: make every hack worth less. Encrypt your devices, backups and messages; encrypt files with age; HTTPS, HSTS and secure cookies; AES-256-GCM field encryption in your app; encrypted secrets with SOPS, secret managers and CI; envelope encryption with a KMS and backups that survive a public bucket; end-to-end and client-side encryption; how real encryption gets broken (you carry out a nonce-reuse attack yourself); and post-quantum cryptography with crypto agility.
- **US law throughout**: the legal sections follow United States law, since most blockchain companies operate in or serve the US. Hacking and testing (the CFAA, the Wiretap Act, state laws), token launches (the SEC and the Howey test, CFTC, FinCEN, OFAC, FTC disclosure rules, IRS, state licences), data breaches (state breach-notification laws and their encryption safe harbor, the CCPA) and reporting crime (the FBI's IC3). General awareness, not legal advice.
- **Critical Moment**: an attack simulator. A live attack unfolds on a virtual machine with a clock (3, 5 or 10 minutes): watch the attacker's activity feed, **identify the attack type**, **decode the evidence** (Base64, hex, URL, JWT and transaction calldata decoders built in) and **respond in the right order** before their next move lands. Then a full debrief: what happened, the attacker's methods, the professional response, prevention steps and a defensive script. Seven built-in scenarios (café Wi-Fi interception, phishing proxy, wallet drainer, malicious OAuth app, leaked deployer key, blind-signing a multisig, a public bucket of unencrypted backups), or **describe any scenario and the AI builds it**.
- **Mini projects, examined**: every track ends with three mini projects to choose from (21 in all), such as an "about me" web page, a letter page or a photo gallery in Foundations, a tip jar smart contract, a security headers file, an XSS-proof comment wall, a passphrase-encrypted notes app or an honest token one-pager. Build it in the browser with a live preview (your work saves as you type), then press **Examine my project**: an examiner checks every requirement, by reading your files and by actually using your page (typing, clicking, submitting forms), and gives a hint for each one you miss. Passing earns 100 XP. **Ask the AI examiner** gives written feedback and a mark out of 10.
- **Explore your code**: when you finish an exercise, the editor switches to Explore mode. Hover over (or tap) any word to see what it is, how it works and why it is on that line; highlight several words to explain them together; or send any of it to the AI coach. Built-in functions, keywords, commands and flags come from a dictionary of over 500 entries (`assets/code-docs.js`); names you chose are explained from where you defined them; and each line's reason comes from the exercise's own hints. Arrow keys work too.
- **Mind refresh**: every lesson you finish ends with a recap (what you covered, the code you wrote) and memory cards you answer in your head before revealing. Finishing a whole level unlocks a **level recap**. The cards then come back in a daily **Mind refresh** on a spaced-repetition schedule: remember a card and it waits longer (1, 3, 7, 16, then 35 days); forget it and it returns tomorrow. Mastered cards earn XP.
- **AI coach**: ask questions while you learn. It sits beside every Critical Moment run (hints only while the clock runs, full explanations afterwards) and opens from every lesson with **Ask the AI coach**. No API key needed, and it works from the GitHub Pages site too: see [Turn on the AI coach](#turn-on-the-ai-coach-no-api-key).
- **Hackathons & CTF**: the **Ladder CTF** (17 capture-the-flag challenges you play in the browser, beginner to expert, with answers checked by SHA-256 hash and a live SQL-injection lab), plus three timed build hackathons with milestones, rules and judging rubrics: **Secure the Shop** (48 hours, web security), **Lock the Keys: Accounts & Signing** (48 hours, logins, OAuth, signing keys and detection) and **Build & Break: DeFi Security** (72 hours, smart contracts). Also a list of real CTFs, hackathons, audit contests and bug bounties to enter.
- **165 hands-on coding exercises** in a built-in editor that looks and behaves like VS Code (line numbers, syntax colours, auto-indent). Type the code, press **Check**, get a tip on every wrong try, and after **5 wrong tries in a row** the answer appears as faded **ghost text** that you type over, character by character. JavaScript, HTML and CSS exercises also **run** so you see the result.
- **311 quiz questions**, with progress, XP and ranks saved in your browser
- **Install everything**: copy-paste install commands for 83 professional tools (including security and encryption tools), for macOS, Windows and Linux
- **5 interactive labs**: a code Playground, a SHA-256 Hash Lab with a proof-of-work miner, a Tokenomics Simulator, an AMM Lab and Critical Moment
- **31 projects**, a **12-month roadmap**, **70 tips and tricks** and a **147-term glossary**

No frameworks and no `npm install`. The whole site is plain HTML, CSS and JavaScript, so once you have done a few lessons you can read and change every line of it.

## Run it

### Option 1: just open it

Double-click `index.html`. It opens in your browser and works offline.

### Option 2: run it on localhost (recommended)

You need [Node.js](https://nodejs.org) (the LTS version). In a terminal:

```bash
cd code-ladder
npm start
```

Then open <http://localhost:3000>. Press `Ctrl+C` in the terminal to stop it.

### Turn on the AI coach (no API key)

The AI coach and custom Critical Moment scenarios need **no API key**. When you run `npm start`, the local server looks for one of these on your computer and uses the first it finds:

1. **Claude Code, signed in with your Claude account.** Install Claude Code (see <https://code.claude.com>), run `claude` once in a terminal and type `/login`. The coach then runs on your Claude plan, so its usage counts towards your plan's normal limits.
2. **Ollama**, a free app that runs open models entirely on your computer, offline. Install it from <https://ollama.com>, then download a model:

```bash
ollama pull llama3.1
```

Then start Code Ladder as usual:

```bash
npm start
```

The terminal says `AI coach: ON, using ...` with the one it picked. Local models are smaller than Claude, so their answers and generated scenarios are simpler, but they cost nothing and nothing leaves your computer.

Options, set as environment variables when you start (for example `CODE_LADDER_AI=ollama npm start`):

| Variable | What it does |
|---|---|
| `CODE_LADDER_AI` | `claude-code`, `ollama` or `off`. Unset means try Claude Code first, then Ollama |
| `CODE_LADDER_MODEL` | A Claude model for Claude Code to use (default: Claude Code's own default) |
| `CODE_LADDER_OLLAMA_MODEL` | Which Ollama model to use (default: the first chat model you have installed) |
| `CODE_LADDER_ALLOW_ORIGIN` | Extra websites allowed to use your coach, comma-separated (your GitHub Pages address is allowed automatically) |

How it stays safe:

- **No API key is used, even if you have one.** The server removes `ANTHROPIC_API_KEY` from what it passes to Claude Code, so the coach always runs on your Claude login.
- **Claude Code runs with every tool switched off**: no shell, no file access, no MCP servers, and none of your Claude Code settings or hooks. It runs in an empty temporary folder, and your questions go in through standard input, never on the command line. It can only write text back.
- The server listens on `127.0.0.1` only, so nobody else on your network can use your coach. It also checks the `Host` and `Origin` headers (so other websites cannot call it), only accepts JSON, limits request sizes and rate-limits questions.
- Coach chats are not saved to your Claude Code history.
- Never paste real private keys, seed phrases or passwords into the coach. The coach is told to treat any that appear as compromised.

#### Use the coach on the GitHub Pages site

GitHub Pages only hosts files, so the coach cannot run *there*, but the Pages site can use the coach running on **your computer**:

1. Once: get Code Ladder onto your computer and sign in to Claude Code (or install Ollama, as above).

```bash
git clone https://github.com/folahanduh/codeladder
```

2. Each time: start it in the `codeladder` folder and leave the window open. It should print `Your website can use this coach too: https://folahanduh.github.io`.

```bash
npm start
```

3. On the GitHub Pages site, open any lesson's **Ask the AI coach** (or Critical Moment) and press **Connect to my computer**. Chrome and Edge ask whether the site may reach apps on your device: choose **Allow**. The site remembers this, so next time it reconnects by itself.

It works in Chrome, Edge, Brave and Firefox on the same computer that runs `npm start`. Safari may block it, and it cannot work from your phone (your phone has no coach server). Use the [claude.ai version](https://claude.ai/artifact/RTPZojurfsM5KL6rzzaQyd) on a phone: it has the coach built in, using your Claude account.

How it stays safe: the server accepts cross-site requests only from **your** Pages address, which it works out from this folder's GitHub remote and the `homepage` in `package.json`; every other website is refused. If you fork Code Ladder, your own Pages address is picked up automatically from your fork's remote; to add another, start with `CODE_LADDER_ALLOW_ORIGIN=https://your-site.example npm start`. Websites connect to port 3000, so keep the default port.

Without any of this, everything else on the site works and the coach explains how to turn it on.

### Option 3: put it on the internet with GitHub Pages

1. Push this folder to a GitHub repository.
2. On GitHub, open the repository's **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now publishes the site to `https://<your-username>.github.io/<repo-name>/` (see `.github/workflows/pages.yml`).

## Your progress

Progress (completed lessons, solved exercises, quiz results, CTF flags, hackathon milestones, Critical Moment best scores, ticked tools, project status) is saved in your browser's local storage. It is per browser and per address, so `localhost:3000` and the GitHub Pages site keep separate progress. To move it, use **My progress > Copy backup code** on one, and **Restore** on the other. Scenarios you generate are kept in the same browser (up to six).

## Project structure

```text
code-ladder/
  index.html              the page shell
  assets/
    styles.css            all styling (colour tokens at the top, light and dark themes)
    app.js                routing, lesson pages, quizzes, progress, search
    tools.js              four of the interactive labs
    exercises.js          the code editor and the exercise checker (hints, 5 tries, ghost text)
    critical.js           the Critical Moment simulator (timer, feed, decoders, scoring, debrief)
    scenarios.js          the built-in Critical Moment scenarios
    ai.js                 the AI coach chat panel and how the page reaches Claude
    ai-prompts.js         the coach's instructions and the scenario schema (shared with the server)
    mini-projects.js      the 21 mini projects: briefs, starter files and the examiner's checks
    mini.js               the mini project workspace and examiner
    project-img/          illustrations learners can use in their pages
    explain.js            Explore mode: hover or tap any word in finished code to see what it means
    code-docs.js          the explanations behind Explore mode (add a word here to explain it)
    data.js               toolkit, tips, projects, roadmap, glossary, resources, hackathons and CTF challenges
    content.js            GENERATED from /content by `npm run build`; do not edit by hand
    vendor/               highlight.js (syntax colouring), bundled so it works offline
  content/
    setup/  web/  crypto/  security/  keys/  encrypt/  tokenomics/    one Markdown file per lesson
  scripts/
    build.mjs             turns the Markdown lessons into assets/content.js
    serve.mjs             the localhost web server and the AI coach endpoints (read it: it is a lesson in itself)
  .github/workflows/pages.yml   publishes to GitHub Pages
```

## Add or edit a lesson

Lessons are Markdown files in `content/<track>/`. Files are ordered by name within each level. After editing, run `npm run build` and refresh the browser.

````markdown
---
id: web-my-lesson            # unique, used in the URL (#lesson-web-my-lesson)
title: My new lesson
level: beginner              # beginner | intermediate | advanced | expert
minutes: 15
summary: One sentence shown in lists and search.
---

## A heading

Normal Markdown: **bold**, *italic*, `code`, [links](https://developer.mozilla.org), lists and tables.
Keyboard keys: [[Ctrl+C]].

```js try
// "try" adds a "Run in Playground" button (works for html, css and js)
console.log('hello');
```

:::tip Optional title
Callout boxes: tip, warn, pro and try.
:::

:::exercise Store an integer
@@file stock.js
@@prompt
Create a constant `stock` holding `12`, then print it.
@@starter
// optional code already in the editor
@@solution
const stock = 12;
console.log(stock);
@@also
let stock = 12;
console.log(stock);
@@hint const\s+stock\s*=
Shown if the learner's code does NOT match this regular expression.
@@hint console\.log\(\s*stock\s*\)
Hints are checked in order; the first one that fails is shown.
@@explain
Optional Markdown shown once the exercise is solved.
:::

## Quiz

? The question
- [ ] A wrong answer
- [x] The right answer
> The explanation shown after checking.
````

### How exercises are checked

- The learner's code is compared with `@@solution` and every `@@also`, ignoring blank lines, comment-only lines, spacing, quote style (`'` or `"`) and, for JavaScript, TypeScript and CSS, semicolons at line ends. Python keeps indentation, because indentation is meaning in Python.
- The file extension in `@@file` sets the language (`.js .ts .tsx .html .css .py .sol .sql .json .sh`), or use `@@lang bash` for a terminal (`@@file Terminal`).
- JavaScript, HTML and CSS exercises get a **Run it** button. Add `@@html` to give JavaScript or CSS a page to work on, or `@@run false` to hide the button.
- Each wrong try shows the first failing `@@hint`; from try 2 it also points at the first line that differs; from try 3 it shows that line's shape (`c____.l__(s____)`); after try 5 the solution becomes ghost text.
- `npm run build` checks that every accepted answer satisfies every hint, so a hint can never contradict the answer.

## Customise it

- **Tools, tips, projects, roadmap, glossary**: edit `assets/data.js`. No build step needed.
- **Critical Moment scenarios**: add one to `assets/scenarios.js`, following the shape of the existing ones (the evidence is written in plain text and encoded by the page).
- **Colours and fonts**: change the tokens at the top of `assets/styles.css`.

## Licence

MIT. Third-party: [highlight.js](https://highlightjs.org) 11.9.0, BSD-3-Clause (see `assets/vendor/highlight.LICENSE.txt`).

All Critical Moment scenarios, names, domains and addresses are fictional. Practise attacks only on systems you own or legal training labs.

Legal content follows United States law and is general awareness, not legal advice. If you live outside the US, your own country's laws apply to you as well.

The lessons are educational material, not financial or legal advice. Smart contracts and tokens carry real financial and legal risk; use test networks while learning and take professional advice before launching anything.
