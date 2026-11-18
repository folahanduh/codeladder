# Code Ladder

**Live site: <https://folahanduh.github.io/codeladder/>**

A self-paced coding school that runs on your own computer. It takes you from your first HTML tag to building full-stack websites, writing and securing smart contracts, and designing token economies.

- **48 lessons** in four tracks (Foundations, Web Development, Cryptography & Blockchain, Tokenomics), each at Beginner, Intermediate and Advanced level, starting from coding basics (integers, decimals, characters, strings, decisions, loops and functions)
- **118 hands-on coding exercises** in a built-in editor that looks and behaves like VS Code (line numbers, syntax colours, auto-indent). Type the code, press **Check**, get a tip on every wrong try, and after **5 wrong tries in a row** the answer appears as faded **ghost text** that you type over, character by character. JavaScript, HTML and CSS exercises also **run** so you see the result.
- **185 quiz questions**, with progress, XP and ranks saved in your browser
- **Install everything**: copy-paste install commands for 66 professional tools, for macOS, Windows and Linux
- **4 interactive labs**: a code Playground, a SHA-256 Hash Lab with a proof-of-work miner, a Tokenomics Simulator and an AMM Lab
- **17 projects**, a **12-month roadmap**, **67 tips and tricks** and a **79-term glossary**

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

### Option 3: put it on the internet with GitHub Pages

1. Push this folder to a GitHub repository.
2. On GitHub, open the repository's **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now publishes the site to `https://<your-username>.github.io/<repo-name>/` (see `.github/workflows/pages.yml`).

## Your progress

Progress (completed lessons, solved exercises, quiz results, ticked tools, project status) is saved in your browser's local storage. It is per browser and per address, so `localhost:3000` and the GitHub Pages site keep separate progress. To move it, use **My progress > Copy backup code** on one, and **Restore** on the other.

## Project structure

```text
code-ladder/
  index.html              the page shell
  assets/
    styles.css            all styling (colour tokens at the top, light and dark themes)
    app.js                routing, lesson pages, quizzes, progress, search
    tools.js              the four interactive labs
    exercises.js          the code editor and the exercise checker (hints, 5 tries, ghost text)
    data.js               toolkit, tips, projects, roadmap, glossary, resources
    content.js            GENERATED from /content by `npm run build`; do not edit by hand
    vendor/               highlight.js (syntax colouring), bundled so it works offline
  content/
    setup/  web/  crypto/  tokenomics/    one Markdown file per lesson
  scripts/
    build.mjs             turns the Markdown lessons into assets/content.js
    serve.mjs             a tiny web server for localhost (read it: it is a lesson in itself)
  .github/workflows/pages.yml   publishes to GitHub Pages
```

## Add or edit a lesson

Lessons are Markdown files in `content/<track>/`. Files are ordered by name within each level. After editing, run `npm run build` and refresh the browser.

````markdown
---
id: web-my-lesson            # unique, used in the URL (#lesson-web-my-lesson)
title: My new lesson
level: beginner              # beginner | intermediate | advanced
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
- **Colours and fonts**: change the tokens at the top of `assets/styles.css`.

## Licence

MIT. Third-party: [highlight.js](https://highlightjs.org) 11.9.0, BSD-3-Clause (see `assets/vendor/highlight.LICENSE.txt`).

The lessons are educational material, not financial or legal advice. Smart contracts and tokens carry real financial and legal risk; use test networks while learning and take professional advice before launching anything.
