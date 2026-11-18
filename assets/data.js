/* Reference data for Code Ladder: toolkit, tips, projects, roadmap, glossary and resources.
   Edit freely. This is plain JavaScript, no build step needed for this file. */
window.CL_DATA = (function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // TOOLKIT: everything worth installing, grouped by when you need it.
  // cmd: { mac, win, linux } or { all } (same on every OS). Use \n for multiple lines.
  // ---------------------------------------------------------------------------
  const toolkit = [
    {
      id: 'foundations',
      name: 'Day one: the foundations',
      blurb: 'Install these first, in this order. Every professional developer has all of them.',
      items: [
        {
          id: 'pkgmgr', name: 'A package manager for your computer', when: 'Day 1',
          what: 'Lets you install developer tools with one command instead of clicking through websites. Mac uses Homebrew, Windows has winget built in, Linux has apt.',
          cmd: {
            mac: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\n# then follow the "Next steps" it prints, and check it worked:\nbrew --version',
            win: '# winget ships with Windows 10/11. Open "Terminal" or "PowerShell" and check:\nwinget --version',
            linux: 'sudo apt update && sudo apt install -y build-essential curl wget unzip',
          },
          link: 'https://brew.sh',
        },
        {
          id: 'wsl', name: 'WSL2 (Windows only)', when: 'Day 1 on Windows',
          what: 'Runs a real Linux inside Windows. Most tutorials, and tools like Foundry, assume Linux or macOS, so this saves you endless headaches.',
          cmd: {
            mac: '# Not needed on macOS: it is already Unix underneath.',
            win: '# Run PowerShell as Administrator, then restart your PC:\nwsl --install\n# After restart, open "Ubuntu" from the Start menu and create a username.',
            linux: '# Not needed: you are already on Linux.',
          },
          link: 'https://learn.microsoft.com/windows/wsl/install',
        },
        {
          id: 'vscode', name: 'Visual Studio Code', when: 'Day 1',
          what: 'The code editor most of the industry uses. Free, fast, and has an extension for everything.',
          cmd: {
            mac: 'brew install --cask visual-studio-code',
            win: 'winget install -e --id Microsoft.VisualStudioCode',
            linux: 'sudo snap install code --classic',
          },
          note: 'After installing on Mac, open VS Code, press Cmd+Shift+P, type "shell command" and choose "Install \'code\' command in PATH". Then `code .` opens any folder.',
          link: 'https://code.visualstudio.com',
        },
        {
          id: 'git', name: 'Git', when: 'Day 1',
          what: 'Version control: a save-game system for your code. Lets you undo anything and collaborate.',
          cmd: {
            mac: 'brew install git\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\ngit config --global init.defaultBranch main',
            win: 'winget install -e --id Git.Git\n# close and reopen the terminal, then:\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\ngit config --global init.defaultBranch main',
            linux: 'sudo apt install -y git\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\ngit config --global init.defaultBranch main',
          },
          link: 'https://git-scm.com',
        },
        {
          id: 'gh', name: 'GitHub account + GitHub CLI', when: 'Day 1',
          what: 'GitHub hosts your code online (your public portfolio). The `gh` CLI lets you create repos and log in from the terminal.',
          cmd: {
            mac: 'brew install gh\ngh auth login',
            win: 'winget install -e --id GitHub.cli\ngh auth login',
            linux: 'sudo apt install -y gh\ngh auth login',
          },
          note: 'Create the free account first at github.com. Choose "HTTPS" and "Login with a web browser" when `gh auth login` asks.',
          link: 'https://cli.github.com',
        },
        {
          id: 'node', name: 'Node.js (LTS) via fnm', when: 'Day 1',
          what: 'Runs JavaScript outside the browser and gives you npm, the world\'s biggest package library. fnm lets you switch Node versions per project, which pros always need eventually.',
          cmd: {
            mac: 'brew install fnm\necho \'eval "$(fnm env --use-on-cd --shell zsh)"\' >> ~/.zshrc\n# close and reopen the terminal, then:\nfnm install --lts\nnode -v && npm -v',
            win: '# Simplest route on Windows (no version switching):\nwinget install -e --id OpenJS.NodeJS.LTS\n# close and reopen the terminal, then:\nnode -v\nnpm -v',
            linux: 'curl -fsSL https://fnm.vercel.app/install | bash\n# close and reopen the terminal, then:\nfnm install --lts\nnode -v && npm -v',
          },
          note: 'LTS means "Long Term Support": the stable version companies use. Avoid the newest "Current" release while learning.',
          link: 'https://nodejs.org',
        },
        {
          id: 'pnpm', name: 'pnpm', when: 'Week 2',
          what: 'A faster, disk-friendly alternative to npm. Many modern teams use it. Everything you learn about npm applies.',
          cmd: { all: 'npm install -g pnpm\npnpm -v' },
          link: 'https://pnpm.io',
        },
        {
          id: 'python', name: 'Python + uv', when: 'Month 2',
          what: 'Python is the go-to for scripts, data and tokenomics modelling. uv installs Python and packages extremely fast.',
          cmd: {
            mac: 'brew install uv\nuv python install\nuv run python --version',
            win: 'winget install -e --id astral-sh.uv\n# reopen the terminal, then:\nuv python install\nuv run python --version',
            linux: 'curl -LsSf https://astral.sh/uv/install.sh | sh\nuv python install\nuv run python --version',
          },
          link: 'https://docs.astral.sh/uv/',
        },
        {
          id: 'browser', name: 'Chrome or Firefox with DevTools', when: 'Day 1',
          what: 'Your browser is also a debugger. Right-click anything and choose Inspect. You will live in the Elements, Console and Network tabs.',
          cmd: {
            mac: 'brew install --cask google-chrome   # or: brew install --cask firefox',
            win: 'winget install -e --id Google.Chrome   # or: winget install -e --id Mozilla.Firefox',
            linux: '# Firefox ships with Ubuntu. For Chrome, download the .deb from google.com/chrome',
          },
          link: 'https://developer.chrome.com/docs/devtools',
        },
        {
          id: 'ssh', name: 'An SSH key for GitHub', when: 'Week 2',
          what: 'Lets your computer prove who it is to GitHub without typing passwords. Required by many workflows.',
          cmd: {
            all: 'ssh-keygen -t ed25519 -C "you@example.com"\n# press Enter to accept defaults, then add it to GitHub:\ngh ssh-key add ~/.ssh/id_ed25519.pub --title "My laptop"',
          },
          link: 'https://docs.github.com/authentication/connecting-to-github-with-ssh',
        },
      ],
    },
    {
      id: 'extensions',
      name: 'VS Code extensions',
      blurb: 'Install from the Extensions panel ([[Ctrl+Shift+X]]) or paste the command into a terminal. The command is the same on every OS.',
      items: [
        { id: 'ext-prettier', name: 'Prettier', when: 'Day 1', what: 'Formats your code automatically on save. Ends all arguments about spacing.', cmd: { all: 'code --install-extension esbenp.prettier-vscode' } },
        { id: 'ext-eslint', name: 'ESLint', when: 'Month 1', what: 'Underlines JavaScript and TypeScript mistakes before you run anything.', cmd: { all: 'code --install-extension dbaeumer.vscode-eslint' } },
        { id: 'ext-errorlens', name: 'Error Lens', when: 'Day 1', what: 'Shows errors right on the line, in plain sight. Huge for beginners.', cmd: { all: 'code --install-extension usernamehw.errorlens' } },
        { id: 'ext-liveserver', name: 'Live Server', when: 'Day 1', what: 'Opens your HTML in the browser and reloads every time you save.', cmd: { all: 'code --install-extension ritwickdey.LiveServer' } },
        { id: 'ext-gitlens', name: 'GitLens', when: 'Month 1', what: 'Shows who changed each line and why. Makes Git visual.', cmd: { all: 'code --install-extension eamodio.gitlens' } },
        { id: 'ext-tailwind', name: 'Tailwind CSS IntelliSense', when: 'Month 4', what: 'Autocomplete and previews for Tailwind classes.', cmd: { all: 'code --install-extension bradlc.vscode-tailwindcss' } },
        { id: 'ext-prettyts', name: 'Pretty TypeScript Errors', when: 'Month 4', what: 'Turns scary TypeScript errors into readable ones.', cmd: { all: 'code --install-extension yoavbls.pretty-ts-errors' } },
        { id: 'ext-solidity', name: 'Solidity (Nomic Foundation)', when: 'Month 8', what: 'Syntax highlighting, errors and go-to-definition for smart contracts.', cmd: { all: 'code --install-extension NomicFoundation.hardhat-solidity' } },
        { id: 'ext-toml', name: 'Even Better TOML', when: 'Month 8', what: 'Highlighting for config files like foundry.toml.', cmd: { all: 'code --install-extension tamasfe.even-better-toml' } },
        { id: 'ext-spell', name: 'Code Spell Checker', when: 'Day 1', what: 'Catches typos in names and comments. Typos cause real bugs.', cmd: { all: 'code --install-extension streetsidesoftware.code-spell-checker' } },
        { id: 'ext-rest', name: 'Thunder Client', when: 'Month 3', what: 'Send API requests from inside VS Code, like a mini Postman.', cmd: { all: 'code --install-extension rangav.vscode-thunder-client' } },
        { id: 'ext-docker', name: 'Container Tools (Docker)', when: 'Month 6', what: 'Manage Docker containers and write Dockerfiles with help.', cmd: { all: 'code --install-extension ms-azuretools.vscode-docker' } },
        { id: 'ext-editorconfig', name: 'EditorConfig', when: 'Month 2', what: 'Keeps indentation consistent across a team\'s editors.', cmd: { all: 'code --install-extension EditorConfig.EditorConfig' } },
      ],
    },
    {
      id: 'terminal',
      name: 'Terminal power-ups',
      blurb: 'Small tools that make seasoned developers fast. Add them once you are comfortable in the terminal.',
      items: [
        {
          id: 'term-app', name: 'A better terminal app', when: 'Week 2',
          what: 'Tabs, split panes and nicer fonts. Windows Terminal on Windows, iTerm2 or Ghostty on Mac.',
          cmd: { mac: 'brew install --cask iterm2', win: 'winget install -e --id Microsoft.WindowsTerminal', linux: '# GNOME Terminal is fine. Optional: sudo apt install -y tilix' },
        },
        {
          id: 'starship', name: 'Starship prompt', when: 'Week 2',
          what: 'Shows your Git branch, Node version and errors right in the prompt.',
          cmd: {
            mac: 'brew install starship\necho \'eval "$(starship init zsh)"\' >> ~/.zshrc',
            win: 'winget install -e --id Starship.Starship\n# then add this line to your PowerShell profile (notepad $PROFILE):\n# Invoke-Expression (&starship init powershell)',
            linux: 'curl -sS https://starship.rs/install.sh | sh\necho \'eval "$(starship init bash)"\' >> ~/.bashrc',
          },
          link: 'https://starship.rs',
        },
        {
          id: 'ripgrep', name: 'ripgrep (rg)', when: 'Month 1',
          what: 'Searches every file in a project in milliseconds. `rg "useState"` finds every use.',
          cmd: { mac: 'brew install ripgrep', win: 'winget install -e --id BurntSushi.ripgrep.MSVC', linux: 'sudo apt install -y ripgrep' },
        },
        {
          id: 'fzf', name: 'fzf', when: 'Month 2',
          what: 'Fuzzy finder. Press Ctrl+R with it installed and search your command history instantly.',
          cmd: { mac: 'brew install fzf', win: 'winget install -e --id junegunn.fzf', linux: 'sudo apt install -y fzf' },
        },
        {
          id: 'jq', name: 'jq', when: 'Month 3',
          what: 'Slices and pretty-prints JSON from APIs: `curl ... | jq .`',
          cmd: { mac: 'brew install jq', win: 'winget install -e --id jqlang.jq', linux: 'sudo apt install -y jq' },
        },
        {
          id: 'bat', name: 'bat', when: 'Month 2',
          what: '`cat` with syntax highlighting and line numbers.',
          cmd: { mac: 'brew install bat', win: 'winget install -e --id sharkdp.bat', linux: 'sudo apt install -y bat   # the command is called batcat on Ubuntu' },
        },
        {
          id: 'tldr', name: 'tldr', when: 'Week 2',
          what: 'Short, practical examples for any command: `tldr tar` instead of a 900-line manual.',
          cmd: { all: 'npm install -g tldr\ntldr git-commit' },
        },
      ],
    },
    {
      id: 'web',
      name: 'Web development stack',
      blurb: 'Most of these are installed per project (inside a project folder), not globally. That is how professionals keep projects independent.',
      items: [
        { id: 'vite', name: 'Vite', when: 'Month 3', what: 'Starts a modern front-end project in seconds with instant reload.', cmd: { all: 'npm create vite@latest my-app\ncd my-app\nnpm install\nnpm run dev' }, link: 'https://vite.dev' },
        { id: 'react', name: 'React + TypeScript (via Vite)', when: 'Month 4', what: 'The most used UI library. Build interfaces from reusable components.', cmd: { all: 'npm create vite@latest my-react-app -- --template react-ts' }, link: 'https://react.dev' },
        { id: 'typescript', name: 'TypeScript', when: 'Month 4', what: 'JavaScript with types. Catches bugs while you type. Standard in professional teams.', cmd: { all: 'npm install -D typescript\nnpx tsc --init' }, link: 'https://www.typescriptlang.org' },
        { id: 'next', name: 'Next.js', when: 'Month 6', what: 'Full-stack React framework: pages, APIs, server rendering, image optimisation.', cmd: { all: 'npx create-next-app@latest my-site' }, link: 'https://nextjs.org' },
        { id: 'tailwind', name: 'Tailwind CSS', when: 'Month 5', what: 'Style with small utility classes right in your HTML. Fast for building brand sites.', cmd: { all: '# in a Vite project:\nnpm install tailwindcss @tailwindcss/vite\n# then add tailwindcss() to vite.config and @import "tailwindcss"; to your CSS' }, link: 'https://tailwindcss.com' },
        { id: 'shadcn', name: 'shadcn/ui', when: 'Month 5', what: 'Beautiful, accessible components you copy into your project and own.', cmd: { all: 'npx shadcn@latest init' }, link: 'https://ui.shadcn.com' },
        { id: 'eslint', name: 'ESLint + Prettier (project setup)', when: 'Month 3', what: 'Linting and formatting rules checked into the project so every machine agrees.', cmd: { all: 'npm init @eslint/config@latest\nnpm install -D prettier' } },
        { id: 'zod', name: 'Zod', when: 'Month 5', what: 'Validates data from forms and APIs. Never trust input.', cmd: { all: 'npm install zod' }, link: 'https://zod.dev' },
        { id: 'tanstack', name: 'TanStack Query', when: 'Month 5', what: 'Fetching, caching and refreshing server data in React without bugs.', cmd: { all: 'npm install @tanstack/react-query' } },
        { id: 'vitest', name: 'Vitest + Testing Library', when: 'Month 6', what: 'Fast unit tests that run on every save.', cmd: { all: 'npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom' }, link: 'https://vitest.dev' },
        { id: 'playwright', name: 'Playwright', when: 'Month 6', what: 'End-to-end tests: a robot clicks through your real site in real browsers.', cmd: { all: 'npm init playwright@latest' }, link: 'https://playwright.dev' },
        { id: 'docker', name: 'Docker Desktop', when: 'Month 6', what: 'Runs databases and services in containers so "works on my machine" stops being a problem.', cmd: { mac: 'brew install --cask docker', win: 'winget install -e --id Docker.DockerDesktop', linux: '# Follow: https://docs.docker.com/engine/install/ubuntu/' }, link: 'https://www.docker.com' },
        { id: 'postgres', name: 'PostgreSQL (in Docker)', when: 'Month 6', what: 'The database most startups pick. Running it in Docker keeps your laptop clean.', cmd: { all: 'docker run --name dev-postgres -e POSTGRES_PASSWORD=devpass -p 5432:5432 -d postgres:17' } },
        { id: 'prisma', name: 'Prisma or Drizzle ORM', when: 'Month 6', what: 'Talk to your database with typed JavaScript instead of raw SQL strings.', cmd: { all: '# Prisma\nnpm install -D prisma && npx prisma init\n# or Drizzle\nnpm install drizzle-orm && npm install -D drizzle-kit' } },
        { id: 'vercel', name: 'Vercel CLI', when: 'Month 3', what: 'Deploy a site to a real URL with one command. Netlify and Cloudflare Pages are good alternatives.', cmd: { all: 'npm install -g vercel\nvercel' } },
      ],
    },
    {
      id: 'web3',
      name: 'Blockchain and smart contracts',
      blurb: 'The professional Ethereum toolchain. Use test networks only until you really know what you are doing.',
      items: [
        {
          id: 'wallet', name: 'A browser wallet (MetaMask or Rabby)', when: 'Month 7',
          what: 'Holds keys and signs transactions. Make a separate "dev" wallet that never holds real money.',
          cmd: { all: '# Install from the official site only (scam copies exist in app stores):\n# https://metamask.io   or   https://rabby.io' },
        },
        {
          id: 'foundry', name: 'Foundry (forge, cast, anvil, chisel)', when: 'Month 8',
          what: 'The fastest smart-contract toolkit. Write tests in Solidity, run a local chain with anvil, poke contracts with cast.',
          cmd: {
            mac: 'curl -L https://foundry.paradigm.xyz | bash\n# reopen the terminal, then:\nfoundryup\nforge --version',
            win: '# Foundry runs best inside WSL2 (Ubuntu). In the Ubuntu terminal:\ncurl -L https://foundry.paradigm.xyz | bash\nfoundryup',
            linux: 'curl -L https://foundry.paradigm.xyz | bash\n# reopen the terminal, then:\nfoundryup\nforge --version',
          },
          link: 'https://getfoundry.sh',
        },
        { id: 'oz', name: 'OpenZeppelin Contracts', when: 'Month 8', what: 'Audited, battle-tested building blocks (ERC-20, ERC-721, access control). Never write your own token from scratch for production.', cmd: { all: '# inside a Foundry project:\nforge install OpenZeppelin/openzeppelin-contracts\n# or in an npm project:\nnpm install @openzeppelin/contracts' }, link: 'https://docs.openzeppelin.com/contracts' },
        { id: 'hardhat', name: 'Hardhat', when: 'Month 8', what: 'The other major toolkit, JavaScript/TypeScript based. Worth knowing because many existing projects use it.', cmd: { all: 'mkdir my-hardhat && cd my-hardhat\nnpx hardhat --init' }, link: 'https://hardhat.org' },
        { id: 'viem', name: 'viem', when: 'Month 9', what: 'Modern TypeScript library for reading and writing to Ethereum from JavaScript.', cmd: { all: 'npm install viem' }, link: 'https://viem.sh' },
        { id: 'wagmi', name: 'wagmi + RainbowKit', when: 'Month 9', what: 'React hooks and a polished "Connect wallet" button for dApp front ends.', cmd: { all: 'npm create wagmi@latest\n# or add to an existing app:\nnpm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query' }, link: 'https://wagmi.sh' },
        { id: 'ethers', name: 'ethers.js', when: 'Month 9', what: 'The older, still very common alternative to viem. You will meet it in tutorials and codebases.', cmd: { all: 'npm install ethers' } },
        { id: 'slither', name: 'Slither + solc-select', when: 'Month 10', what: 'Static analyser that finds common smart-contract vulnerabilities in seconds.', cmd: { all: 'uv tool install slither-analyzer\nuv tool install solc-select\nslither .' }, link: 'https://github.com/crytic/slither' },
        { id: 'rpc', name: 'RPC provider + block explorer API key', when: 'Month 8', what: 'Free accounts at Alchemy or Infura give you a URL to talk to testnets. Etherscan gives you contract verification.', cmd: { all: '# Sign up, then store keys in a .env file (never commit it):\n# SEPOLIA_RPC_URL=https://...\n# ETHERSCAN_API_KEY=...' } },
        { id: 'rust', name: 'Rust (optional, for Solana and ZK)', when: 'Month 11+', what: 'Needed for Solana programs and many zero-knowledge tools. Learn after Solidity.', cmd: { mac: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh", win: 'winget install -e --id Rustlang.Rustup', linux: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" }, link: 'https://www.rust-lang.org/tools/install' },
      ],
    },
    {
      id: 'crypto-libs',
      name: 'Cryptography libraries',
      blurb: 'Golden rule: never invent your own cryptography. Use these well-reviewed libraries.',
      items: [
        { id: 'webcrypto', name: 'Web Crypto API (built in)', when: 'Month 7', what: 'Hashing, encryption and signatures built into every browser and Node. Nothing to install.', cmd: { all: '// In the browser console or Node 20+:\nconst data = new TextEncoder().encode("hello");\nconst hash = await crypto.subtle.digest("SHA-256", data);' } },
        { id: 'noble', name: '@noble/hashes and @noble/curves', when: 'Month 7', what: 'Small, audited, pure-JavaScript crypto. What modern wallet libraries use under the hood.', cmd: { all: 'npm install @noble/hashes @noble/curves' }, link: 'https://paulmillr.com/noble/' },
        { id: 'sodium', name: 'libsodium', when: 'Month 10', what: 'Easy, hard-to-misuse encryption for apps (used by Signal-style systems).', cmd: { all: 'npm install libsodium-wrappers' } },
        { id: 'openssl', name: 'OpenSSL CLI', when: 'Month 7', what: 'Swiss-army knife for hashes, keys and certificates from the terminal.', cmd: { mac: 'brew install openssl\necho -n "hello" | openssl dgst -sha256', win: '# Comes with Git for Windows. In Git Bash:\necho -n "hello" | openssl dgst -sha256', linux: 'sudo apt install -y openssl\necho -n "hello" | openssl dgst -sha256' } },
        { id: 'pycrypto', name: 'Python cryptography', when: 'Month 10', what: 'The standard Python crypto library, great for experiments and scripts.', cmd: { all: 'uv pip install cryptography   # or: pip install cryptography' } },
      ],
    },
    {
      id: 'modelling',
      name: 'Tokenomics and data modelling',
      blurb: 'Tokenomics is economics plus code. These are the tools analysts and token engineers actually use.',
      items: [
        { id: 'jupyter', name: 'JupyterLab + pandas + matplotlib', when: 'Month 11', what: 'Notebooks for modelling supply schedules, simulations and charts.', cmd: { all: 'uv tool install jupyterlab\n# in a project folder:\nuv init token-model && cd token-model\nuv add pandas numpy matplotlib\nuv run --with jupyter jupyter lab' } },
        { id: 'cadcad', name: 'cadCAD / radCAD', when: 'Month 11', what: 'Simulation frameworks for token economies and agent behaviour.', cmd: { all: 'uv add radcad   # lighter, easier start\n# or: uv add cadCAD' } },
        { id: 'dune', name: 'Dune', when: 'Month 9', what: 'Query real on-chain data with SQL in your browser. Study how real tokens actually behave.', cmd: { all: '# Browser tool, no install: https://dune.com' }, link: 'https://dune.com' },
        { id: 'sheets', name: 'A spreadsheet', when: 'Month 7', what: 'Every tokenomics model starts as a spreadsheet. Google Sheets or Excel is fine.', cmd: { all: '# Use Google Sheets or Excel. Try the Tokenomics Simulator in this site first.' } },
      ],
    },
    {
      id: 'ai',
      name: 'AI and productivity',
      blurb: 'Use AI as a tutor and pair-programmer, not a crutch. Always understand code before you keep it.',
      items: [
        { id: 'claude-code', name: 'Claude Code', when: 'Month 2', what: 'An AI coding assistant in your terminal and editor that can read your project, explain it and make changes you review.', cmd: { all: '# See the current install steps:\n# https://code.claude.com' }, link: 'https://code.claude.com' },
        { id: 'notes', name: 'A notes app for a "TIL" journal', when: 'Day 1', what: 'Write down one thing you learned every day (Obsidian, Notion or a Markdown folder in Git). Seniors keep notes.', cmd: { mac: 'brew install --cask obsidian', win: 'winget install -e --id Obsidian.Obsidian', linux: 'sudo snap install obsidian --classic' } },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // TIPS & TRICKS
  // ---------------------------------------------------------------------------
  const tips = [
    // Learning
    { cat: 'Learning', title: 'Build, don\'t binge', body: 'Tutorials feel productive but stick less. After every lesson, build something small without the tutorial open. Getting stuck is the learning.' },
    { cat: 'Learning', title: 'The 20-minute rule', body: 'Stuck? Try for 20 focused minutes: read the error, search it, simplify the problem. Then ask for help with what you tried. Not before, not much after.' },
    { cat: 'Learning', title: 'Type it, don\'t paste it', body: 'Typing code by hand forces your brain to notice every bracket and name. Paste only once you could have written it yourself.' },
    { cat: 'Learning', title: 'Keep a TIL journal', body: 'One line a day: "Today I learned...". In six months it is your personal documentation, and great content for your portfolio.' },
    { cat: 'Learning', title: 'Explain it out loud', body: 'If you cannot explain a concept to a 12-year-old, you do not understand it yet. Teaching (even an imaginary person) exposes gaps.' },
    { cat: 'Learning', title: 'Read real code', body: 'Open a popular open-source repo on GitHub and read one file a week. Ask: why did they structure it like this?' },
    { cat: 'Learning', title: 'Docs before videos', body: 'MDN, react.dev, docs.soliditylang.org. Official docs are more accurate and up to date than most videos. Learn to read them early.' },
    { cat: 'Learning', title: 'Use AI as a tutor', body: 'Ask AI to explain errors, review your code, or quiz you. Do not ask it to write projects you have not understood. Ask "why" until it clicks.' },

    // VS Code
    { cat: 'VS Code', title: 'Open any file instantly', body: '[[Ctrl+P]] ([[Cmd+P]] on Mac) and type part of a filename. Faster than clicking through folders.' },
    { cat: 'VS Code', title: 'The command palette', body: '[[Ctrl+Shift+P]] ([[Cmd+Shift+P]]) runs any VS Code command by name. If you forget a shortcut, search for it here.' },
    { cat: 'VS Code', title: 'Select the next match', body: '[[Ctrl+D]] ([[Cmd+D]]) selects the next occurrence of the current word. Press it repeatedly to edit many at once.' },
    { cat: 'VS Code', title: 'Multiple cursors', body: '[[Alt+Click]] ([[Option+Click]]) adds cursors. Type once, edit everywhere.' },
    { cat: 'VS Code', title: 'Move and copy lines', body: '[[Alt+Up]] / [[Alt+Down]] moves a line. Add [[Shift]] to copy it instead.' },
    { cat: 'VS Code', title: 'Rename a symbol everywhere', body: 'Put the cursor on a variable or function and press [[F2]]. It renames every usage safely, across files.' },
    { cat: 'VS Code', title: 'Go to definition', body: '[[F12]] or [[Ctrl+Click]] jumps to where something is defined. [[Alt+F12]] peeks without leaving.' },
    { cat: 'VS Code', title: 'Built-in terminal', body: '[[Ctrl+`]] toggles a terminal inside VS Code, already in your project folder.' },
    { cat: 'VS Code', title: 'Format on save', body: 'Settings, search "format on save", tick it, and set Prettier as default formatter. Your code always looks professional.' },
    { cat: 'VS Code', title: 'Emmet shortcuts', body: 'In an HTML file type `!` then [[Tab]] for a full page skeleton. `ul>li*5` then [[Tab]] makes a list of five items.' },

    // Terminal
    { cat: 'Terminal', title: 'Tab completes everything', body: 'Type the first letters of a file or folder and press [[Tab]]. Never type a full path again.' },
    { cat: 'Terminal', title: 'Search your history', body: '[[Ctrl+R]] then type part of an old command. Press [[Ctrl+R]] again to cycle matches.' },
    { cat: 'Terminal', title: 'Stop a running program', body: '[[Ctrl+C]] stops whatever is running (like a dev server). It does not copy in most terminals.' },
    { cat: 'Terminal', title: 'Jump back', body: '`cd -` returns to the previous folder. `cd ~` goes home. `cd ..` goes up one.' },
    { cat: 'Terminal', title: 'Open the current folder in VS Code', body: '`code .` opens wherever you are. The dot means "this folder".', lang: 'bash', code: 'cd ~/projects/my-site\ncode .' },
    { cat: 'Terminal', title: 'Make aliases for things you type daily', body: 'Short names for long commands, saved in ~/.zshrc or ~/.bashrc.', lang: 'bash', code: "alias gs='git status'\nalias gl='git log --oneline --graph --decorate -20'\nalias dev='npm run dev'" },

    // Git
    { cat: 'Git', title: 'Commit small, commit often', body: 'One idea per commit. Small commits are easy to review, revert and understand later.' },
    { cat: 'Git', title: 'Write messages for future you', body: 'Use the imperative: "Add product grid", "Fix cart total rounding". Many teams use prefixes like feat:, fix:, docs:.' },
    { cat: 'Git', title: 'Check before you commit', body: '`git status` and `git diff --staged` show exactly what will be saved. Seniors look every time.' },
    { cat: 'Git', title: 'Branch for every change', body: 'Keep main always working. Do new work on a branch, then merge.', lang: 'bash', code: 'git switch -c feature/hero-section\n# ...work, commit...\ngit switch main\ngit merge feature/hero-section' },
    { cat: 'Git', title: 'Stash unfinished work', body: '`git stash` shelves your changes so you can switch branches. `git stash pop` brings them back.' },
    { cat: 'Git', title: 'Fix the last commit', body: 'Forgot a file or made a typo in the message? Stage the fix and amend (only before pushing).', lang: 'bash', code: 'git add forgotten-file.js\ngit commit --amend --no-edit' },
    { cat: 'Git', title: 'git reflog saves lives', body: 'Deleted a branch or reset by accident? `git reflog` lists every position HEAD has been. You can almost always get work back.' },
    { cat: 'Git', title: 'Never commit secrets', body: 'Put API keys in a `.env` file and add `.env` to `.gitignore` before your first commit. Bots scan GitHub for leaked keys within minutes.' },

    // Debugging
    { cat: 'Debugging', title: 'Read the whole error', body: 'The error message, file name and line number tell you where to look. The first line of a stack trace that points to your file is usually the culprit.' },
    { cat: 'Debugging', title: 'Log with labels', body: 'Wrap variables in braces so the console shows their names.', code: 'const price = 20, qty = 3;\nconsole.log({ price, qty }); // { price: 20, qty: 3 }\nconsole.table([{ name: "Tee", price: 20 }, { name: "Cap", price: 15 }]);' },
    { cat: 'Debugging', title: 'Pause time with debugger', body: 'Put `debugger;` in your code with DevTools open. The browser stops on that line and you can inspect every variable.' },
    { cat: 'Debugging', title: 'Rubber duck debugging', body: 'Explain your code line by line to a rubber duck (or a friend). You will often hear the bug as you say it.' },
    { cat: 'Debugging', title: 'Shrink the problem', body: 'Comment out half the code. Still broken? The bug is in the other half. Repeat. This binary search finds bugs fast.' },
    { cat: 'Debugging', title: 'Check the boring stuff first', body: 'Did you save the file? Is the server restarted? Are you in the right folder? Is the script tag pointing at the right file? Most bugs are boring.' },
    { cat: 'Debugging', title: 'Check the Network tab', body: 'If data is not showing, open DevTools, Network tab, refresh. You will see if the request failed, what status code it returned and the actual response.' },

    // DevTools
    { cat: 'DevTools', title: 'Edit CSS live', body: 'Inspect an element and change its styles in the Styles panel. Experiment there, then copy what works into your file.' },
    { cat: 'DevTools', title: 'Test on "phones"', body: 'Click the device icon ([[Ctrl+Shift+M]]) to preview any screen size. Check every page at 375px wide.' },
    { cat: 'DevTools', title: '$0 is the selected element', body: 'Select an element in the Elements panel, then type `$0` in the Console to use it in JavaScript.' },
    { cat: 'DevTools', title: 'Run Lighthouse', body: 'The Lighthouse tab scores performance, accessibility and SEO with a list of fixes. Great for client audits.' },
    { cat: 'DevTools', title: 'Throttle the network', body: 'In the Network tab choose "Slow 4G" to feel what your site is like for real mobile users.' },

    // JavaScript
    { cat: 'JavaScript', title: 'const by default', body: 'Use `const` unless you need to reassign, then `let`. Never `var` in new code.' },
    { cat: 'JavaScript', title: 'Always ===', body: '`==` converts types in surprising ways (`"0" == false` is true). `===` compares value and type.' },
    { cat: 'JavaScript', title: 'Optional chaining and ??', body: 'Read deep values safely and give defaults.', code: 'const city = user?.address?.city ?? "Unknown";' },
    { cat: 'JavaScript', title: 'map, filter, reduce', body: 'The three array methods you will use daily.', code: 'const prices = [20, 35, 15];\nconst withVat = prices.map(p => p * 1.2);\nconst cheap = prices.filter(p => p < 30);\nconst total = prices.reduce((sum, p) => sum + p, 0);' },
    { cat: 'JavaScript', title: 'Never use floats for money', body: '`0.1 + 0.2` is `0.30000000000000004`. Store money in pence/cents as integers. Tokens on-chain do the same with 18 decimals.' },
    { cat: 'JavaScript', title: 'async/await with try/catch', body: 'Network calls fail. Always handle it.', code: 'try {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  const data = await res.json();\n} catch (err) {\n  console.error("Could not load:", err);\n}' },

    // CSS
    { cat: 'CSS', title: 'border-box everywhere', body: 'Makes width include padding and border, which is what you expect.', lang: 'css', code: '*, *::before, *::after { box-sizing: border-box; }' },
    { cat: 'CSS', title: 'The red outline trick', body: 'Layout broken? Outline everything to see the boxes.', lang: 'css', code: '* { outline: 1px solid red; }' },
    { cat: 'CSS', title: 'Use gap, not margins', body: 'In flex and grid layouts, `gap` spaces items evenly without margin collapse surprises.' },
    { cat: 'CSS', title: 'Fluid type with clamp()', body: 'Text that scales with the screen, within limits.', lang: 'css', code: 'h1 { font-size: clamp(2rem, 5vw, 3.5rem); }' },
    { cat: 'CSS', title: 'Design with variables', body: 'Put brand colours and spacing in CSS custom properties. Rebranding becomes a five-line change.', lang: 'css', code: ':root { --brand: #d9480f; --radius: 12px; }\n.button { background: var(--brand); border-radius: var(--radius); }' },
    { cat: 'CSS', title: 'Mobile first', body: 'Write styles for phones first, then add `@media (min-width: 768px)` for bigger screens. Most shoppers browse on phones.' },

    // Security & Web3
    { cat: 'Security', title: 'Your seed phrase is the money', body: 'Anyone with your 12 or 24 words owns your wallet. Never type it into a website, a chat, or code. No real support person will ever ask for it.' },
    { cat: 'Security', title: 'Separate dev and real wallets', body: 'Use a fresh wallet with testnet funds only for development. Keep real funds on a hardware wallet.' },
    { cat: 'Security', title: 'Read before you sign', body: 'Wallet pop-ups show what you are approving. Unlimited token approvals to unknown contracts are how most people get drained. Revoke old approvals regularly.' },
    { cat: 'Security', title: 'Use audited building blocks', body: 'Use OpenZeppelin contracts and well-known libraries. Custom crypto and custom token logic is where the hacks live.' },
    { cat: 'Security', title: 'Validate everything from users', body: 'Every form field, URL parameter and API body is untrusted. Validate on the server (Zod helps), escape output, use parameterised queries.' },

    // Pro habits
    { cat: 'Pro habits', title: 'Make it work, make it right, make it fast', body: 'In that order. Most beginners try to make it perfect first and never ship.' },
    { cat: 'Pro habits', title: 'Names are documentation', body: '`cartTotalPence` beats `x`. Good names remove the need for most comments.' },
    { cat: 'Pro habits', title: 'Write the README first', body: 'Describe what the project does and how to run it before you build it. It clarifies your thinking and impresses clients.' },
    { cat: 'Pro habits', title: 'Estimate, then double it', body: 'Everything takes longer than you think, even when you account for that. Quote clients with buffer.' },
    { cat: 'Pro habits', title: 'Delete code', body: 'Less code means fewer bugs. Experienced developers are proud of the lines they removed.' },
    { cat: 'Pro habits', title: 'Automate the second time', body: 'Do a task manually once. The second time, write it down. The third time, script it.' },
  ];

  // ---------------------------------------------------------------------------
  // PROJECTS (status tracked in the browser)
  // ---------------------------------------------------------------------------
  const projects = [
    { id: 'p-about', level: 'beginner', track: 'web', title: 'Your "About me" page', brief: 'A single HTML page about you with a photo, a short bio, a list of skills you are learning and links to your socials.', skills: ['Semantic HTML', 'Basic CSS', 'Publishing to GitHub Pages'], stretch: 'Add a dark mode using CSS variables and prefers-color-scheme.' },
    { id: 'p-landing', level: 'beginner', track: 'web', title: 'Clothing brand landing page', brief: 'A responsive landing page for a fashion brand: hero image, product grid of six items, testimonials and a newsletter form. Make it look great on a phone first.', skills: ['Flexbox and Grid', 'Responsive design', 'Typography and colour'], stretch: 'Rebuild an existing small brand\'s homepage and compare Lighthouse scores before and after.' },
    { id: 'p-tip', level: 'beginner', track: 'web', title: 'Tip and bill splitter', brief: 'Enter a bill, tip percentage and number of people. Show each person\'s share, updating live as you type.', skills: ['Variables and functions', 'DOM events', 'Number formatting'], stretch: 'Remember the last values with localStorage.' },
    { id: 'p-todo', level: 'beginner', track: 'web', title: 'To-do list that remembers', brief: 'Add, complete and delete tasks. Tasks survive a page refresh.', skills: ['Arrays and objects', 'DOM rendering', 'localStorage'], stretch: 'Add filters (all, active, done) and drag-to-reorder.' },
    { id: 'p-hash', level: 'beginner', track: 'crypto', title: 'Hash explorer', brief: 'A page where you type text and see its SHA-256 hash update live, using the Web Crypto API. Show how one changed letter changes everything.', skills: ['Web Crypto API', 'async/await', 'Hex encoding'], stretch: 'Add a file input that hashes an uploaded file, like download checksums.' },
    { id: 'p-weather', level: 'intermediate', track: 'web', title: 'Weather app', brief: 'Search a city and show the forecast using the free Open-Meteo API (no key needed). Handle loading and error states properly.', skills: ['fetch and async/await', 'APIs and JSON', 'Error handling'], stretch: 'Rebuild it in React with TypeScript.' },
    { id: 'p-shop', level: 'intermediate', track: 'web', title: 'Product grid with a cart', brief: 'A React store front: product list from a JSON file, filters by category and price, a cart with quantities and a total in pence.', skills: ['React state and props', 'Derived data', 'Integer money maths'], stretch: 'Persist the cart and add a checkout form validated with Zod.' },
    { id: 'p-portfolio', level: 'intermediate', track: 'web', title: 'Portfolio on a custom domain', brief: 'A professional portfolio showcasing three projects with case studies, deployed on Vercel or Netlify with your own domain and HTTPS.', skills: ['Deployment', 'DNS', 'SEO meta tags', 'Performance'], stretch: 'Score 95+ on all four Lighthouse categories.' },
    { id: 'p-tracker', level: 'intermediate', track: 'crypto', title: 'Crypto price tracker', brief: 'Show live prices for five coins in GBP from a public API, with 24h change coloured up or down and a refresh button.', skills: ['APIs', 'Formatting numbers and currency', 'Polling'], stretch: 'Add a small sparkline chart drawn with SVG.' },
    { id: 'p-erc20', level: 'intermediate', track: 'crypto', title: 'Your first token on a testnet', brief: 'Create an ERC-20 with OpenZeppelin and Foundry, write tests for transfer and mint permissions, deploy to Sepolia and verify it on Etherscan.', skills: ['Solidity', 'Foundry tests', 'Deploying and verifying'], stretch: 'Add a capped supply and a pausable transfer switch, both tested.' },
    { id: 'p-vesting-sheet', level: 'intermediate', track: 'tokenomics', title: 'Token unlock model', brief: 'Model a token\'s allocation and vesting for 48 months (spreadsheet or JavaScript). Chart circulating supply and flag the biggest unlock months.', skills: ['Supply maths', 'Vesting schedules', 'Charts'], stretch: 'Recreate a real project\'s public schedule and compare it to on-chain data.' },
    { id: 'p-fullstack', level: 'advanced', track: 'web', title: 'Full-stack store', brief: 'Next.js + Postgres store with product pages, accounts, a cart and checkout using Stripe test mode. Includes an admin page to add products.', skills: ['Next.js App Router', 'Database and ORM', 'Auth', 'Payments'], stretch: 'Add Playwright tests for the checkout and deploy with CI.' },
    { id: 'p-dashboard', level: 'advanced', track: 'web', title: 'Client analytics dashboard', brief: 'A logged-in dashboard that shows a brand\'s sales or social metrics with charts, filters by date range and CSV export.', skills: ['Auth and roles', 'Data fetching and caching', 'Charts', 'Testing'], stretch: 'Make it multi-tenant: each client only ever sees their own data.' },
    { id: 'p-vesting', level: 'advanced', track: 'crypto', title: 'Vesting contract + claim page', brief: 'A smart contract that releases tokens to beneficiaries over time (cliff + linear), with fuzz tests and a React page where users connect a wallet and claim.', skills: ['Solidity time logic', 'Fuzz and invariant tests', 'wagmi/viem'], stretch: 'Run Slither and write up every finding and your fix.' },
    { id: 'p-amm', level: 'advanced', track: 'crypto', title: 'Mini AMM (constant product)', brief: 'A two-token liquidity pool contract using x*y=k with swap, add and remove liquidity, plus invariant tests proving k never decreases.', skills: ['DeFi maths', 'Invariant testing', 'Rounding and precision'], stretch: 'Add a 0.3% fee and a front end that shows price impact before swapping.' },
    { id: 'p-merkle', level: 'advanced', track: 'crypto', title: 'Merkle airdrop', brief: 'Generate a Merkle tree of eligible addresses off-chain, store only the root on-chain and let users claim with a proof.', skills: ['Merkle trees', 'Hashing', 'Gas efficiency'], stretch: 'Add an expiry so unclaimed tokens return to the treasury.' },
    { id: 'p-sim', level: 'advanced', track: 'tokenomics', title: 'Agent-based token simulation', brief: 'In Python, simulate holders (stakers, traders, insiders) reacting to emissions and unlocks over 3 years. Compare two designs and write a one-page recommendation.', skills: ['Python and pandas', 'Simulation', 'Mechanism design', 'Clear writing'], stretch: 'Use radCAD and run Monte Carlo variations.' },
  ];

  // ---------------------------------------------------------------------------
  // ROADMAP: a realistic 12-month plan at about 1 to 2 hours a day
  // ---------------------------------------------------------------------------
  const roadmap = [
    { month: 1, title: 'Set up and speak the language', points: ['Coding basics: integers, decimals, characters, strings, decisions, loops and functions', 'Install the Day 1 toolkit; how the web works, terminal and Git basics', 'HTML and CSS fundamentals'], lessons: ['setup-welcome', 'setup-coding-basics', 'setup-coding-basics-2', 'setup-how-web-works', 'setup-terminal', 'setup-install', 'setup-git', 'web-html', 'web-css'], project: 'p-about' },
    { month: 2, title: 'Layouts and your first JavaScript', points: ['Flexbox, Grid and responsive design', 'Variables, functions, arrays, objects, loops', 'The DOM and events'], lessons: ['web-layout', 'web-js-basics', 'web-js-data', 'web-dom'], project: 'p-landing' },
    { month: 3, title: 'Modern JavaScript and shipping', points: ['ES modules, async/await, fetch', 'npm and package.json', 'Debugging properly', 'Deploying to the internet'], lessons: ['setup-packages', 'setup-debugging', 'web-modern-js', 'web-deploy'], project: 'p-weather' },
    { month: 4, title: 'TypeScript and React', points: ['Types and interfaces', 'Components, props, state, effects', 'Thinking in components'], lessons: ['web-typescript', 'web-react'], project: 'p-shop' },
    { month: 5, title: 'Professional front end', points: ['Tailwind and design systems', 'Accessibility and forms', 'Build a real brand site for a client or friend'], lessons: ['web-tailwind', 'web-a11y'], project: 'p-portfolio' },
    { month: 6, title: 'Full stack', points: ['Next.js App Router and server components', 'SQL, Postgres and an ORM', 'Auth, security and testing'], lessons: ['web-nextjs', 'web-databases', 'web-security', 'web-testing', 'web-performance', 'setup-pro-workflow'], project: 'p-fullstack' },
    { month: 7, title: 'Cryptography and tokenomics foundations', points: ['Hashing, encryption, keys and signatures', 'How blockchains reach agreement', 'Supply, market cap, FDV and allocation'], lessons: ['crypto-intro', 'crypto-hashing', 'crypto-keys', 'crypto-blockchain', 'tok-basics', 'tok-allocation'], project: 'p-hash' },
    { month: 8, title: 'Solidity and your first token', points: ['Bits, bytes, hex and integer types (what uint256 really means)', 'Solidity syntax and the EVM', 'Foundry: build, test, deploy', 'ERC-20 with OpenZeppelin on Sepolia'], lessons: ['setup-bits-bytes', 'crypto-solidity', 'crypto-erc20', 'crypto-standards'], project: 'p-erc20' },
    { month: 9, title: 'dApps and DeFi mechanics', points: ['viem and wagmi front ends', 'AMMs and liquidity', 'Vesting and unlock schedules'], lessons: ['crypto-dapp', 'tok-vesting', 'tok-amm'], project: 'p-vesting-sheet' },
    { month: 10, title: 'Security mindset', points: ['Classic smart-contract vulnerabilities', 'Fuzzing, invariants and Slither', 'Play Ethernaut and Damn Vulnerable DeFi'], lessons: ['crypto-security', 'crypto-testing'], project: 'p-vesting' },
    { month: 11, title: 'Advanced protocol design', points: ['Upgradeability, gas and L2s', 'Advanced cryptography: curves, Merkle proofs, ZK', 'Staking, emissions and mechanism design'], lessons: ['crypto-advanced-eng', 'crypto-advanced-crypto', 'tok-incentives', 'tok-mechanisms'], project: 'p-amm' },
    { month: 12, title: 'Capstone and career', points: ['Model a token economy end to end', 'Launch playbook and red flags', 'Ship a capstone, write case studies, contribute to open source'], lessons: ['tok-launch', 'tok-modelling'], project: 'p-sim' },
  ];

  const habits = [
    'Reads error messages fully before searching',
    'Commits small, focused changes with clear messages',
    'Writes a test when fixing a bug, so it never comes back',
    'Reads the official docs and source code, not only tutorials',
    'Knows their editor and terminal shortcuts by heart',
    'Keeps secrets out of code and validates every input',
    'Breaks big problems into small, shippable steps',
    'Asks good questions: what I expected, what happened, what I tried',
    'Reviews their own diff before asking anyone else to',
    'Measures before optimising (Lighthouse, profiler, gas reports)',
    'Leaves code clearer than they found it',
    'Writes things down: READMEs, decisions, TIL notes',
  ];

  // ---------------------------------------------------------------------------
  // RESOURCES per track (all free unless noted)
  // ---------------------------------------------------------------------------
  const resources = {
    setup: [
      { name: 'The Missing Semester (MIT)', url: 'https://missing.csail.mit.edu', note: 'Terminal, Git, editors and debugging: the skills courses skip.' },
      { name: 'Oh My Git!', url: 'https://ohmygit.org', note: 'A game that teaches Git visually.' },
      { name: 'Learn Git Branching', url: 'https://learngitbranching.js.org', note: 'Interactive branching and rebasing practice.' },
      { name: 'Pro Git book', url: 'https://git-scm.com/book', note: 'The full, free Git reference.' },
    ],
    web: [
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', note: 'The reference for HTML, CSS and JavaScript. Bookmark it.' },
      { name: 'javascript.info', url: 'https://javascript.info', note: 'The best free JavaScript textbook, beginner to advanced.' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com', note: 'A full, project-based curriculum.' },
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', note: 'Hands-on exercises and certifications.' },
      { name: 'web.dev', url: 'https://web.dev/learn', note: 'Google\'s courses on CSS, accessibility and performance.' },
      { name: 'react.dev', url: 'https://react.dev/learn', note: 'The official React tutorial. Excellent.' },
      { name: 'Josh W. Comeau\'s blog', url: 'https://www.joshwcomeau.com', note: 'Deep, friendly CSS and React explanations.' },
    ],
    crypto: [
      { name: 'Solidity by Example', url: 'https://solidity-by-example.org', note: 'Short, runnable examples of every concept.' },
      { name: 'Cyfrin Updraft', url: 'https://updraft.cyfrin.io', note: 'Free, thorough smart-contract development and security courses.' },
      { name: 'Ethernaut', url: 'https://ethernaut.openzeppelin.com', note: 'Hack deliberately vulnerable contracts. The best way to learn security.' },
      { name: 'Damn Vulnerable DeFi', url: 'https://www.damnvulnerabledefi.xyz', note: 'Advanced DeFi security challenges.' },
      { name: 'ethereum.org developers', url: 'https://ethereum.org/developers', note: 'Official docs and learning paths.' },
      { name: 'Cryptopals', url: 'https://cryptopals.com', note: 'Break real cryptography by coding attacks. Intermediate to advanced.' },
      { name: 'Serious Cryptography (book)', url: 'https://nostarch.com/serious-cryptography-2nd-edition', note: 'Paid. A practical, modern introduction to how cryptography works.' },
    ],
    tokenomics: [
      { name: 'Uniswap v2 whitepaper', url: 'https://docs.uniswap.org/whitepaper.pdf', note: 'Short and readable: how constant-product AMMs work.' },
      { name: 'Token Engineering Academy', url: 'https://tokenengineering.net', note: 'Courses on designing and simulating token systems.' },
      { name: 'Token Unlocks', url: 'https://tokenomist.ai', note: 'Real unlock schedules for live tokens. Study them.' },
      { name: 'Dune', url: 'https://dune.com', note: 'Query on-chain data with SQL. See what holders actually do.' },
      { name: 'FCA: cryptoasset promotions', url: 'https://www.fca.org.uk/firms/financial-promotions-and-adverts/cryptoasset-financial-promotions', note: 'UK rules you must know before marketing any token.' },
    ],
  };

  // ---------------------------------------------------------------------------
  // GLOSSARY
  // ---------------------------------------------------------------------------
  const glossary = [
    ['API', 'web', 'Application Programming Interface: a defined way for programs to talk to each other, usually by sending HTTP requests and getting JSON back.'],
    ['Async / await', 'web', 'JavaScript syntax for waiting on slow things (network, files) without freezing the page.'],
    ['Backend', 'web', 'Code that runs on a server: databases, authentication, payments. Users never see it directly.'],
    ['Branch', 'setup', 'A parallel line of work in Git. You change things on a branch, then merge it back into main.'],
    ['Bundler', 'web', 'A tool (like Vite) that combines your many source files into a few optimised files for the browser.'],
    ['CLI', 'setup', 'Command-line interface: a program you use by typing commands in a terminal.'],
    ['Commit', 'setup', 'A saved snapshot of your project in Git, with a message describing the change.'],
    ['Component', 'web', 'A reusable piece of UI (like a ProductCard) that takes inputs (props) and returns markup.'],
    ['CSS', 'web', 'Cascading Style Sheets: the language that controls how HTML looks.'],
    ['DNS', 'web', 'Domain Name System: the internet\'s phone book that turns names like example.com into IP addresses.'],
    ['DOM', 'web', 'Document Object Model: the browser\'s live tree of your page that JavaScript can read and change.'],
    ['Dependency', 'setup', 'A package your project uses, listed in package.json.'],
    ['Deploy', 'web', 'Put your site or app on a server so others can use it via a URL.'],
    ['Environment variable', 'setup', 'A value (often a secret like an API key) given to your program from outside the code, e.g. a .env file.'],
    ['Framework', 'web', 'A larger structure (Next.js, Django) that decides how your app is organised and gives you many features.'],
    ['Frontend', 'web', 'Everything that runs in the user\'s browser: HTML, CSS and JavaScript.'],
    ['HTTP / HTTPS', 'web', 'The protocol browsers and servers use to talk. HTTPS is the encrypted version.'],
    ['JSON', 'web', 'JavaScript Object Notation: a text format for data, like {"name": "Tee", "price": 20}.'],
    ['Library', 'web', 'Code you call to do a job (e.g. viem, React). You stay in control of the structure.'],
    ['Linter', 'setup', 'A tool (ESLint) that flags likely mistakes and style problems in code.'],
    ['localhost', 'setup', 'Your own computer, as a web address. http://localhost:3000 is a server running on your machine.'],
    ['npm', 'setup', 'Node Package Manager: installs JavaScript packages and runs project scripts.'],
    ['ORM', 'web', 'Object-Relational Mapper (Prisma, Drizzle): lets you query a database with code instead of raw SQL strings.'],
    ['Props', 'web', 'Inputs passed to a React component, like function arguments.'],
    ['Pull request (PR)', 'setup', 'A request to merge your branch into another, where teammates review the changes.'],
    ['Repository (repo)', 'setup', 'A project folder tracked by Git, often hosted on GitHub.'],
    ['Responsive design', 'web', 'Layouts that adapt to any screen size, from phone to desktop.'],
    ['REST', 'web', 'A common style of API using URLs for resources and HTTP verbs (GET, POST, PUT, DELETE) for actions.'],
    ['SQL', 'web', 'Structured Query Language: how you read and write data in relational databases like Postgres.'],
    ['State', 'web', 'Data that can change over time and affects what the UI shows (cart items, logged-in user).'],
    ['Terminal', 'setup', 'A text window where you type commands to your computer.'],
    ['TypeScript', 'web', 'JavaScript plus types. Catches many bugs before your code runs.'],
    ['XSS', 'web', 'Cross-site scripting: an attack where malicious script is injected into your page through untrusted input.'],
    ['Address', 'crypto', 'A public identifier (like 0xAbC...) derived from a public key, used to send and receive tokens.'],
    ['AES', 'crypto', 'Advanced Encryption Standard: the most widely used symmetric encryption algorithm.'],
    ['Block', 'crypto', 'A batch of transactions plus the hash of the previous block, chaining history together.'],
    ['Consensus', 'crypto', 'The rules that let thousands of computers agree on one history (proof of work, proof of stake).'],
    ['dApp', 'crypto', 'Decentralised application: a front end that talks to smart contracts on a blockchain.'],
    ['Digital signature', 'crypto', 'Proof, made with a private key, that a message came from the key holder and was not altered.'],
    ['ECDSA', 'crypto', 'Elliptic Curve Digital Signature Algorithm. Ethereum and Bitcoin use it with the secp256k1 curve.'],
    ['ERC-20', 'crypto', 'The standard interface for fungible tokens on Ethereum (balanceOf, transfer, approve...).'],
    ['ERC-721', 'crypto', 'The standard for NFTs: tokens where each one is unique.'],
    ['EVM', 'crypto', 'Ethereum Virtual Machine: the computer that runs smart contract bytecode on every node.'],
    ['Gas', 'crypto', 'The fee unit for computation on Ethereum. Complex operations cost more gas.'],
    ['Hash function', 'crypto', 'A one-way function that turns any input into a fixed-size fingerprint (SHA-256, Keccak-256).'],
    ['Keccak-256', 'crypto', 'The hash function Ethereum uses for addresses, function selectors and more.'],
    ['L2 (Layer 2)', 'crypto', 'A network (Arbitrum, Optimism, Base) that processes transactions cheaply and settles them on Ethereum.'],
    ['Merkle tree', 'crypto', 'A tree of hashes that lets you prove one item is in a large set with only a few hashes.'],
    ['Mainnet / Testnet', 'crypto', 'Mainnet uses real money. Testnets (like Sepolia) use free test tokens for development.'],
    ['Nonce', 'crypto', 'A number used once. In Ethereum, the count of transactions an account has sent; in mining, the value miners change.'],
    ['Oracle', 'crypto', 'A service that brings off-chain data (prices, weather) onto the blockchain.'],
    ['Private key', 'crypto', 'The secret number that controls a wallet. Whoever has it controls the funds.'],
    ['Public key', 'crypto', 'Derived from the private key and safe to share. Others use it to verify your signatures.'],
    ['Reentrancy', 'crypto', 'A bug where an external call re-enters your contract before state is updated, often used to drain funds.'],
    ['Seed phrase', 'crypto', 'The 12 or 24 words that can regenerate all keys in a wallet. Equal to the money itself.'],
    ['Smart contract', 'crypto', 'A program stored on a blockchain that runs exactly as written when called.'],
    ['Solidity', 'crypto', 'The main language for writing Ethereum smart contracts.'],
    ['Zero-knowledge proof', 'crypto', 'A proof that a statement is true without revealing why (e.g. "I am over 18" without your birthday).'],
    ['Airdrop', 'tokenomics', 'Distributing free tokens to users, often to reward early activity or decentralise ownership.'],
    ['AMM', 'tokenomics', 'Automated Market Maker: a smart contract pool that sets prices with a formula like x*y=k instead of an order book.'],
    ['Bonding curve', 'tokenomics', 'A formula that sets token price based on supply: buying mints and raises the price, selling burns and lowers it.'],
    ['Burn', 'tokenomics', 'Permanently removing tokens from supply by sending them to an unusable address or destroying them in the contract.'],
    ['Circulating supply', 'tokenomics', 'Tokens that are unlocked and able to trade right now.'],
    ['Cliff', 'tokenomics', 'A period at the start of vesting where nothing unlocks.'],
    ['Emissions', 'tokenomics', 'New tokens created over time, usually as rewards for staking or providing liquidity.'],
    ['FDV', 'tokenomics', 'Fully diluted valuation: price multiplied by the maximum supply that will ever exist.'],
    ['Governance token', 'tokenomics', 'A token that gives holders voting rights over a protocol\'s decisions.'],
    ['Impermanent loss', 'tokenomics', 'The value a liquidity provider gives up versus simply holding, when the pool\'s prices move.'],
    ['Inflation', 'tokenomics', 'Growth in token supply over time, which dilutes existing holders unless demand grows faster.'],
    ['Liquidity', 'tokenomics', 'How easily a token can be bought or sold without moving its price much.'],
    ['Market cap', 'tokenomics', 'Price multiplied by circulating supply.'],
    ['Max supply', 'tokenomics', 'The hard limit on how many tokens can ever exist (if there is one).'],
    ['Price impact', 'tokenomics', 'How much your own trade moves the price in a pool. Larger trades in smaller pools move it more.'],
    ['Real yield', 'tokenomics', 'Rewards paid from actual protocol revenue (fees), rather than from printing new tokens.'],
    ['Staking', 'tokenomics', 'Locking tokens to secure a network or earn rewards.'],
    ['TGE', 'tokenomics', 'Token Generation Event: the moment a token launches and starts trading.'],
    ['Utility', 'tokenomics', 'What a token is actually for: paying fees, voting, staking, access. No utility usually means only speculation.'],
    ['veToken', 'tokenomics', 'Vote-escrowed token: you lock tokens for time to get voting power and boosted rewards (popularised by Curve).'],
    ['Vesting', 'tokenomics', 'A schedule that releases tokens gradually, so insiders cannot sell everything on day one.'],
  ].map(([term, track, def]) => ({ term, track, def }));

  return { toolkit, tips, projects, roadmap, habits, resources, glossary };
})();
