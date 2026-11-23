# Code Ladder

**Live site: <https://folahanduh.github.io/codeladder/>**

A self-paced coding school that runs on your own computer. It takes you from your first HTML tag to building full-stack websites, writing and securing smart contracts, and designing token economies.

- **72 lessons** in six tracks (Foundations, Web Development, Cryptography & Blockchain, Cybersecurity, Keys & Accounts, Tokenomics), from Beginner through Intermediate and Advanced, up to **Expert** in the two security tracks. Starts from coding basics (integers, decimals, characters, strings, decisions, loops and functions).
- **Cybersecurity track (14 lessons)**: security mindset and the law, passwords/MFA/phishing, networks, Linux, hacking web apps, applied cryptography, supply-chain security, wallet and key opsec, blockchain threats beyond the contract, running an audit, incident response, formal verification, ethical exploit development, and a capstone on securing a blockchain launch.
- **Keys & Accounts track (10 lessons)**: the number one way blockchains, apps and launchpads get drained. How keys and accounts get stolen, setting up wallets safely, sessions and cookies, keeping secrets out of code (with a pre-commit hook), third-party APIs and **OAuth with PKCE**, stopping account takeover (rate limits, breached-password checks, passkeys), launchpad signing with EIP-712, KMS/HSM/MPC signers, compromise recovery, and detection scripts that alert and auto-pause.
- **Critical Moment**: an attack simulator. A live attack unfolds on a virtual machine with a clock (3, 5 or 10 minutes): watch the attacker's activity feed, **identify the attack type**, **decode the evidence** (Base64, hex, URL, JWT and transaction calldata decoders built in) and **respond in the right order** before their next move lands. Then a full debrief: what happened, the attacker's methods, the professional response, prevention steps and a defensive script. Six built-in scenarios (café Wi-Fi interception, phishing proxy, wallet drainer, malicious OAuth app, leaked deployer key, blind-signing a multisig), or **describe any scenario and the AI builds it**.
- **AI coach**: ask questions while you learn. It sits beside every Critical Moment run (hints only while the clock runs, full explanations afterwards) and opens from every lesson with **Ask the AI coach**. See [Turn on the AI coach](#turn-on-the-ai-coach).
- **Hackathons & CTF**: the **Ladder CTF** (15 capture-the-flag challenges you play in the browser, beginner to expert, with answers checked by SHA-256 hash and a live SQL-injection lab), plus three timed build hackathons with milestones, rules and judging rubrics: **Secure the Shop** (48 hours, web security), **Lock the Keys: Accounts & Signing** (48 hours, logins, OAuth, signing keys and detection) and **Build & Break: DeFi Security** (72 hours, smart contracts). Also a list of real CTFs, hackathons, audit contests and bug bounties to enter.
- **147 hands-on coding exercises** in a built-in editor that looks and behaves like VS Code (line numbers, syntax colours, auto-indent). Type the code, press **Check**, get a tip on every wrong try, and after **5 wrong tries in a row** the answer appears as faded **ghost text** that you type over, character by character. JavaScript, HTML and CSS exercises also **run** so you see the result.
- **272 quiz questions**, with progress, XP and ranks saved in your browser
- **Install everything**: copy-paste install commands for 77 professional tools (including security tools), for macOS, Windows and Linux
- **5 interactive labs**: a code Playground, a SHA-256 Hash Lab with a proof-of-work miner, a Tokenomics Simulator, an AMM Lab and Critical Moment
- **26 projects**, a **12-month roadmap**, **67 tips and tricks** and a **128-term glossary**

No frameworks. The whole site is plain HTML, CSS and JavaScript, so once you have done a few lessons you can read and change every line of it. The only dependency is the optional Anthropic SDK, used by the local server for the AI coach.

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

### Turn on the AI coach

The AI coach and custom Critical Moment scenarios call Claude. On your own computer they run through the local server, using **your** Anthropic API key (get one at <https://console.anthropic.com>; usage is billed to your account).

```bash
cd code-ladder
npm install
```

Then start it with your key in the environment. macOS or Linux:

```bash
ANTHROPIC_API_KEY=your-key npm start
```

Windows PowerShell:

```powershell
$env:ANTHROPIC_API_KEY="your-key"; npm start
```

The terminal says `AI coach: ON` when it worked. How it stays safe:

- **Your key never reaches the browser.** The page asks the local server, and the server calls Claude. Never put a key in front-end code.
- The server listens on `127.0.0.1` only, so nobody else on your network can spend your key. It also checks the `Host` and `Origin` headers (so other websites cannot call it), only accepts JSON, limits request sizes and rate-limits questions.
- Requests use the `claude-opus-5-5` model with **server-side fallback** turned on (`fallbacks: "default"`): if the model declines a request for policy reasons, which security topics occasionally trigger, the API retries it on a fallback model instead of failing. Set `CODE_LADDER_MODEL` to use a different model.
- Never paste real private keys, seed phrases or passwords into the coach. The coach is told to treat any that appear as compromised.

Without a key (or on GitHub Pages, which only serves static files) everything else works and the coach explains how to turn it on.

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
    data.js               toolkit, tips, projects, roadmap, glossary, resources, hackathons and CTF challenges
    content.js            GENERATED from /content by `npm run build`; do not edit by hand
    vendor/               highlight.js (syntax colouring), bundled so it works offline
  content/
    setup/  web/  crypto/  security/  keys/  tokenomics/    one Markdown file per lesson
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

MIT. Third-party: [highlight.js](https://highlightjs.org) 11.9.0, BSD-3-Clause (see `assets/vendor/highlight.LICENSE.txt`); the optional [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript), MIT, installed by `npm install`.

All Critical Moment scenarios, names, domains and addresses are fictional. Practise attacks only on systems you own or legal training labs.

The lessons are educational material, not financial or legal advice. Smart contracts and tokens carry real financial and legal risk; use test networks while learning and take professional advice before launching anything.
