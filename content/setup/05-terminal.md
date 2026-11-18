---
id: setup-terminal
title: The terminal is your superpower
level: beginner
minutes: 15
summary: Move around, create and inspect files, and run programs by typing, the way every developer works.
---

## Why bother with a black box of text?

Almost every developer tool (Git, Node, npm, Foundry, deployment tools) is used from the terminal. It is also faster than clicking once you know a dozen commands, and it lets you automate anything.

Open it: on Mac press [[Cmd+Space]] and type *Terminal*. On Windows open *Terminal* (PowerShell), or Ubuntu if you installed WSL. Inside VS Code press [[Ctrl+`]].

## The dozen commands you need

| Task | macOS / Linux / WSL | Windows PowerShell |
|---|---|---|
| Where am I? | `pwd` | `pwd` |
| List files | `ls -la` | `ls` |
| Go into a folder | `cd projects` | `cd projects` |
| Go up one level | `cd ..` | `cd ..` |
| Go home | `cd ~` | `cd ~` |
| Make a folder | `mkdir my-site` | `mkdir my-site` |
| Make an empty file | `touch index.html` | `ni index.html` |
| Show a file | `cat notes.txt` | `cat notes.txt` |
| Copy | `cp a.txt b.txt` | `cp a.txt b.txt` |
| Move or rename | `mv old.txt new.txt` | `mv old.txt new.txt` |
| Delete a file | `rm file.txt` | `rm file.txt` |
| Clear the screen | `clear` or [[Ctrl+L]] | `cls` |

## Paths: absolute and relative

A **path** is an address for a file.

- **Absolute** paths start from the root: `/Users/ada/projects/my-site` (Mac) or `C:\Users\ada\projects` (Windows).
- **Relative** paths start from where you are: `projects/my-site`.
- `.` means "this folder", `..` means "the parent folder", `~` means "my home folder".

## Your first session

Type these one at a time, reading the output after each:

```bash
cd ~
mkdir -p code/hello-terminal
cd code/hello-terminal
pwd
echo "Hello from the terminal" > hello.txt
ls -la
cat hello.txt
code .
```

`echo "..." > file` writes text into a file. `code .` opens the current folder in VS Code (see the Install guide if that command is missing).

:::exercise Make a project folder
@@file Terminal
@@lang bash
@@prompt
Type the two commands that create a folder called `my-site` and then move into it. This editor checks your commands; run them for real in your own terminal afterwards.
@@solution
mkdir my-site
cd my-site
@@hint ^\s*mkdir\s
Line 1 uses `mkdir` ("make directory").
@@hint mkdir\s+my-site
Name the folder `my-site`, with a hyphen and no spaces.
@@hint ^\s*cd\s+my-site\s*$
Line 2 moves into it with `cd` ("change directory"): `cd my-site`
@@explain
`mkdir my-site` creates the folder. `cd my-site` moves you inside it, so every command after that runs in `my-site`. Use `pwd` to check where you are.
:::

## Commands, flags and arguments

```bash
ls -la ~/code
```

- `ls` is the **command**.
- `-la` are **flags** that change its behaviour (`-l` long format, `-a` include hidden files).
- `~/code` is the **argument**: what to act on.

Forgot how a command works? Try `ls --help`, `man ls` (press `q` to quit), or `tldr ls` if you installed tldr.

:::warn rm does not use the Recycle Bin
Files deleted with `rm` are gone. `rm -rf folder` deletes a folder and everything inside without asking. Never run it with a path you are not 100% sure about, and never paste commands from strangers.
:::

:::tip Speed habits from day one
Press [[Tab]] to autocomplete names. Press [[Up]] to reuse the last command. Press [[Ctrl+R]] to search your history. Press [[Ctrl+C]] to stop a running program.
:::

:::exercise Write and read a file
@@file Terminal
@@lang bash
@@prompt
Three commands:

1. Create a file called `notes.txt` containing the word `Hello` (use `echo "Hello"` and the `>` symbol).
2. List all files, including hidden ones, in long format.
3. Print the contents of `notes.txt`.
@@solution
echo "Hello" > notes.txt
ls -la
cat notes.txt
@@hint ^\s*echo\s+["']Hello["']
Line 1 starts with `echo "Hello"`.
@@hint >\s*notes\.txt
Send the output into the file with `>`: `echo "Hello" > notes.txt`
@@hint ^\s*ls\s+-la\s*$
Line 2: `ls -la` (list, long format, all files).
@@hint ^\s*cat\s+notes\.txt\s*$
Line 3: `cat notes.txt` prints a file's contents.
@@explain
`echo` prints text, and `>` redirects that text into a file instead of the screen (replacing anything already in it; `>>` would add to the end). `ls -la` shows the new file, and `cat` reads it back.
:::

## Quiz

? You are in /Users/ada/code/site. Where does `cd ..` take you?
- [ ] /Users/ada
- [x] /Users/ada/code
- [ ] Your home folder
> `..` is the parent folder, one level up.

? What does the `-a` in `ls -la` do?
- [ ] Sorts alphabetically
- [x] Includes hidden files (names starting with a dot, like .gitignore)
- [ ] Shows all folders on the computer
> Flags modify a command. Hidden files matter a lot in development: .git, .env, .gitignore.

? Which command is dangerous to run without double-checking the path?
- [ ] pwd
- [ ] ls -la
- [x] rm -rf
> rm -rf deletes everything in the path permanently, with no confirmation.

? A dev server is running in your terminal and you want to stop it. What do you press?
- [x] Ctrl+C
- [ ] Ctrl+Z then Enter
- [ ] Escape
> Ctrl+C sends an interrupt that stops the running program.
