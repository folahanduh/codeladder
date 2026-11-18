---
id: setup-welcome
title: How to learn to code (properly)
level: beginner
minutes: 8
summary: What experienced developers actually know, how this site works, and the learning loop that gets you there.
---

## What "15 years of experience" really means

Experienced developers have not memorised every function. They look things up constantly. What they have is a set of habits and instincts:

- They **break big problems into small ones** until each piece is obvious.
- They **read error messages** calmly and fully, because the error usually says what is wrong.
- They **know where to look**: official docs, the source code, the Network tab, the logs.
- They **build things**, ship them, and learn from what breaks.
- They use the **same core tools every day** (editor, terminal, Git, browser DevTools) so well that those tools disappear.

You cannot download years. You can copy the habits from day one, and that is what Code Ladder is built around.

## What you will be able to build

| Track | You will be able to |
|---|---|
| Foundations | Use the terminal, Git, packages and debugging tools like a professional |
| Web Development | Build fast, accessible, responsive websites and full-stack apps |
| Cryptography & Blockchain | Understand hashes, keys and signatures, then write, test and secure smart contracts |
| Tokenomics | Design and stress-test token supply, vesting, liquidity and incentives |

## The learning loop

Every lesson follows the same loop. Do not skip steps.

1. **Read** the lesson once without coding.
2. **Type** every example yourself (no copy-paste) in the [Playground](#playground) or VS Code.
3. **Break it on purpose.** Delete a bracket, misspell a name, and read the error you get.
4. **Pass the quiz.** Passing marks the lesson complete.
5. **Build** one of the level's [projects](#projects) without the lesson open.

:::tip The 20-minute rule
When you get stuck, try for 20 focused minutes: read the error, search it, simplify the problem. Then ask for help. Never suffer for hours, and never ask after 30 seconds.
:::

:::exercise Your very first line of code
@@file hello.js
@@prompt
Every lesson has exercises like this one. Type the code in the editor, then press **Check my code** (or [[Ctrl+Enter]]). Wrong answers get a tip; after **5 wrong tries in a row** the answer appears as faded ghost text for you to type over.

Type this exact line: `console.log('Hello, world!');`

It tells the computer to print the text *Hello, world!*. After it passes, look at the **Output** box.
@@solution
console.log('Hello, world!');
@@hint ^\s*console
Start with the word `console`, all lower case.
@@hint console\.log
After `console` comes a dot and then `log`: `console.log`
@@hint console\.log\(
Open a round bracket straight after `log`, with no space: `console.log(`
@@hint ['"]Hello, world!['"]
The text goes inside quotes, with the comma and exclamation mark: `'Hello, world!'`
@@hint \)\s*;?\s*$
Close the round bracket at the end and finish with a semicolon: `);`
@@explain
`console.log(...)` is a built-in instruction that prints whatever is inside the brackets. Text goes in quotes so the computer knows it is text, not more code. Almost every programmer started with this exact line.
:::

:::exercise Make the computer do maths
@@file maths.js
@@prompt
Print the answer to 7 times 6. In code, multiply is written with a star: `*`. Numbers do not need quotes.

Type: `console.log(7 * 6);`
@@solution
console.log(7 * 6);
@@hint console\.log\(
Start with `console.log(` exactly like the last exercise.
@@hint 7\s*\*\s*6
Inside the brackets: `7 * 6`. No quotes, because these are numbers.
@@hint \)\s*;?\s*$
Close the bracket and add a semicolon: `);`
@@explain
The computer works out `7 * 6` first, then prints the result: **42**. Without quotes, `7 * 6` is a calculation. With quotes, `'7 * 6'` would just be text and would print as it is.
:::

## How to ask a good question

Whether you ask a friend, a forum or an AI, include these four things. Writing them down often solves the problem before you send it.

1. **What I am trying to do** (the goal, not just the step).
2. **What I expected** to happen.
3. **What actually happened**, with the exact error text.
4. **What I already tried.**

## A realistic timeline

At one to two focused hours a day, most people can build and deploy solid websites within 4 to 6 months and write and test simple smart contracts within 8 to 10. The [12-month roadmap](#roadmap) lays it out. Consistency beats intensity: 45 minutes every day beats a 7-hour Sunday.

:::pro Using AI while you learn
AI assistants are excellent tutors. Ask them to explain an error, quiz you, or review code you wrote. Do not ask them to write projects you could not explain line by line. If you keep code you do not understand, you are borrowing skill you will have to repay later.
:::

## Quiz

? What is the main thing that separates experienced developers from beginners?
- [ ] They have memorised the documentation
- [x] Habits: breaking problems down, reading errors, knowing where to look, shipping
- [ ] They type faster
> Seniors look things up all the time. The difference is how they approach problems and how well they use their tools.

? You have been stuck on a bug for 20 focused minutes. What should you do?
- [ ] Keep going alone for the rest of the day
- [ ] Delete the project and start again
- [x] Ask for help, explaining the goal, what you expected, what happened and what you tried
> The 20-minute rule balances struggling (which teaches you) with not wasting hours.

? Why type the examples instead of pasting them?
- [ ] Pasting is against the rules
- [x] Typing forces you to notice every detail, so it sticks
- [ ] Pasted code does not run
> Your brain processes code far more deeply when your hands write it.
