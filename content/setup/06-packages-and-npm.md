---
id: setup-packages
title: Packages, npm and package.json
level: intermediate
minutes: 18
summary: Use other people's code safely, understand package.json, versions and lockfiles, and run project scripts.
---

## Why packages exist

Nobody writes everything from scratch. A **package** is reusable code someone published: a date library, React, a testing tool, the OpenZeppelin contracts. **npm** (Node Package Manager) installs them from the npm registry, which holds millions of packages.

## Start a project

```bash
mkdir price-tools && cd price-tools
npm init -y
npm install date-fns
npm install -D prettier
```

That creates three things:

- `package.json`: the project's identity card and list of dependencies.
- `package-lock.json`: the exact version of every package installed, including dependencies of dependencies.
- `node_modules/`: the installed code. Never edit it, never commit it.

## Reading package.json

```json
{
  "name": "price-tools",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js",
    "format": "prettier --write ."
  },
  "dependencies": {
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "prettier": "^3.3.3"
  }
}
```

- **dependencies** are needed when the app runs.
- **devDependencies** (`-D`) are only needed while developing: formatters, test runners, build tools.
- **scripts** are shortcuts. `npm run dev` runs `node --watch index.js`. Every project's README should tell you which scripts to run.
- `"type": "module"` lets you use modern `import` syntax in Node.

## Version numbers (semver)

Versions look like `MAJOR.MINOR.PATCH`, e.g. `4.1.0`:

| Part | Bumped when | Safe to upgrade? |
|---|---|---|
| PATCH (4.1.**1**) | Bug fixes | Yes |
| MINOR (4.**2**.0) | New features, nothing broken | Usually |
| MAJOR (**5**.0.0) | Breaking changes | Read the changelog first |

`^4.1.0` means "any 4.x.x at least 4.1.0". `~4.1.0` means "any 4.1.x". The lockfile pins the exact version so everyone on the team gets identical installs. **Commit the lockfile.**

## Useful commands

```bash
npm install            # install everything in package.json (after cloning a project)
npm ci                 # clean install exactly from the lockfile (used in CI)
npm run <script>       # run a script from package.json
npx <tool>             # run a package's command without installing it globally
npm outdated           # see what has newer versions
npm audit              # check for known vulnerabilities
npm uninstall date-fns # remove a package
```

## Local versus global installs

Install almost everything **locally** (inside the project). That way each project has its own versions and a teammate gets the same setup with one `npm install`. Global installs (`npm install -g`) are only for standalone CLI tools like `pnpm` or `vercel`.

## Choosing a package like a senior

Before adding a dependency, check on npmjs.com and GitHub:

- **Weekly downloads** and **last publish date**: is it used and maintained?
- **Open issues**: are serious bugs ignored?
- **Size and dependencies**: does a tiny feature pull in 200 other packages?
- **Licence**: MIT, Apache-2.0 and BSD are business-friendly.
- **Do I need it at all?** Five lines of your own code beat a dependency you have to trust forever.

:::warn Supply-chain attacks are real
Attackers publish look-alike packages (`reactt`, `ether-js`) and sometimes hijack real ones. Check the exact name before installing, prefer well-known packages, keep the lockfile committed, and run `npm audit`. In crypto projects this matters even more: malicious packages hunt for wallet keys.
:::

## Quiz

? Which file pins the exact version of every installed package so all machines match?
- [ ] package.json
- [x] package-lock.json
- [ ] node_modules/.version
> package.json lists ranges like ^4.1.0; the lockfile records exactly what was installed.

? A testing tool you only use during development should go in:
- [ ] dependencies
- [x] devDependencies (npm install -D)
- [ ] A global install
> devDependencies are not needed when the app runs in production.

? A package goes from 2.8.3 to 3.0.0. What should you expect?
- [ ] Only bug fixes
- [ ] New features with nothing broken
- [x] Breaking changes: read the changelog before upgrading
> A MAJOR bump signals breaking changes.

? Should node_modules be committed to Git?
- [ ] Yes, so the project works offline
- [x] No: it is rebuilt from package.json and the lockfile with npm install
- [ ] Only for small projects
> node_modules goes in .gitignore. The lockfile makes the rebuild exact.
