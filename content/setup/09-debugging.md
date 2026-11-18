---
id: setup-debugging
title: Debugging like a professional
level: intermediate
minutes: 20
summary: Read errors and stack traces, use breakpoints and the Network tab, and find any bug with a calm, repeatable method.
---

## Bugs are normal

Professional developers spend a large share of their time debugging. The difference is that they have a **method**, so bugs feel like puzzles rather than emergencies.

## Step 1: read the whole error

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'price')
    at getTotal (cart.js:14:22)
    at renderCart (cart.js:31:17)
    at HTMLButtonElement.<anonymous> (main.js:8:5)
```

Read it top to bottom:

- **Type**: `TypeError`, something was the wrong type.
- **Message**: you tried to read `.price` from something that is `undefined`.
- **Location**: `cart.js`, line 14, column 22, inside `getTotal`.
- **Stack trace**: how we got there. `main.js` line 8 called `renderCart`, which called `getTotal`.

So on line 14 of cart.js, the thing before `.price` is undefined. Maybe an item is missing, or an array index is out of range.

## The errors you will meet most

| Error | Usually means |
|---|---|
| `SyntaxError` | A typo in the code: missing bracket, quote or comma |
| `ReferenceError: x is not defined` | Misspelt name, or used before it was declared |
| `TypeError: x is not a function` | Calling something that is not a function (often a typo or wrong import) |
| `TypeError: Cannot read properties of undefined` | The object you expected is not there |
| `Failed to fetch` / CORS error | Network request blocked or server unreachable |
| `404` in the Network tab | Wrong file path or URL |

:::exercise Read the error, fix the typo
@@file greeting.js
@@prompt
Press **Run it** first. This code throws `ReferenceError: greting is not defined`. Read the error, find the misspelt name, and fix it so it prints the greeting.
@@starter
const greeting = 'Hello';
console.log(greting);
@@solution
const greeting = 'Hello';
console.log(greeting);
@@hint const\s+greeting\s*=\s*['"]Hello['"]
Keep line 1 as it is: `const greeting = 'Hello';`
@@hint console\.log\(\s*greeting\s*\)
The error names the problem: `greting` is missing an "e". It must match the variable: `greeting`.
@@explain
A `ReferenceError` means you used a name the program has never seen. Nine times out of ten it is a typo. The error message told you exactly which name, which is why you always read it first.
:::

## Step 2: look inside with console and breakpoints

Label your logs so you know what you are looking at:

```js
console.log({ cart, index });     // shows names and values
console.table(cart);              // arrays of objects as a table
console.trace('how did we get here?');
```

Better still, **pause the code**. Add `debugger;` on a line, open DevTools, and reload. Execution stops there and you can hover over any variable, step line by line ([[F10]] step over, [[F11]] step into) and watch values change. You can also click a line number in the DevTools **Sources** panel to set a breakpoint without editing code.

:::exercise Fix the off-by-one bug
@@file total.js
@@prompt
This code should print a total of **70** but prints `NaN` ("Not a Number"). Press **Run it**, then fix the bug. (Ask yourself: how many items are in `prices`, and what is `prices[3]`?)

When it works, change the last line to the labelled log `console.log({ total });`.
@@starter
const prices = [20, 35, 15];
let total = 0;
for (let i = 0; i <= prices.length; i++) {
  total = total + prices[i];
}
console.log(total);
@@solution
const prices = [20, 35, 15];
let total = 0;
for (let i = 0; i < prices.length; i++) {
  total = total + prices[i];
}
console.log({ total });
@@hint i\s*<\s*prices\.length
The loop runs once too often. With `<=`, `i` reaches 3, but the last item is `prices[2]`. Use `<` instead of `<=`.
@@hint console\.log\(\s*\{\s*total\s*\}\s*\)
Change the last line to `console.log({ total });` so the output shows the variable's name as well as its value.
@@explain
An array of 3 items has positions 0, 1 and 2. With `<=` the loop also read `prices[3]`, which is `undefined`, and `70 + undefined` is `NaN`. This "off by one" mistake is one of the most common bugs in all of programming.
:::

## Step 3: check the Network tab

If data is not appearing, open DevTools, **Network**, and reload. Click the request and check:

- **Status**: 200? 404? 500?
- **Response**: what did the server actually send?
- **Payload**: what did you actually send?

Half of "my code is broken" bugs are really "the request failed" bugs.

## Step 4: the scientific method

1. **Reproduce** the bug reliably. If you cannot make it happen on demand, you cannot know you fixed it.
2. **Form a hypothesis**: "I think `items` is empty when the page first loads."
3. **Test it** with a log or breakpoint.
4. **Narrow down**: comment out half the code. Still broken? The bug is in the other half. Repeat.
5. **Fix one thing at a time**, then retest.
6. **Prevent it**: add a check, a test, or a clearer error message.

:::tip Check the boring stuff first
Did you save the file? Is the server restarted? Is the script tag pointing at the right file? Are you editing the same folder you are running? Is it cached (try [[Ctrl+Shift+R]])? A surprising number of bugs are one of these.
:::

## Make a minimal reproduction

When asking for help, strip the problem down to the smallest code that still shows the bug. Often you will find the bug while doing this. If not, people can now actually help you.

:::try Practise
Open the [Playground](#playground), load the **To-do list** template, and break it: rename `render` to `rendr` in one place only. Read the error in the console, find the line, fix it. Then try a missing bracket.
:::

## Quiz

? "TypeError: Cannot read properties of undefined (reading 'price')". What is undefined?
- [ ] The price property
- [x] The object you wrote before .price
- [ ] The whole file
> You tried to read .price from something that does not exist. Find out why that object is undefined.

? Your product list is empty but there are no errors in the Console. Where should you look next?
- [ ] The Elements tab
- [x] The Network tab, to see if the data request failed or returned something unexpected
- [ ] Your CSS file
> Silent data bugs are usually failed or unexpected network responses.

? What is the first step of debugging methodically?
- [x] Reproduce the bug reliably
- [ ] Rewrite the function from scratch
- [ ] Add try/catch everywhere
> If you cannot trigger the bug on demand, you cannot confirm the fix.

? What does the `debugger;` statement do with DevTools open?
- [ ] Deletes the bug automatically
- [x] Pauses execution on that line so you can inspect variables and step through
- [ ] Prints every variable to the console
> It acts as a breakpoint written in code.
