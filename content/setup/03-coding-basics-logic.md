---
id: setup-coding-basics-2
title: "Coding basics 2: decisions, loops and functions"
level: beginner
minutes: 35
summary: The three ideas behind every program ever written. Make decisions with if, repeat work with loops, and package logic into functions.
---

## Three ideas run everything

Every program, from a to-do list to a blockchain, is built from three ideas on top of the data types you just learned:

1. **Decisions**: do this *if* something is true, otherwise do that.
2. **Loops**: repeat something many times without writing it out many times.
3. **Functions**: give a set of steps a name, so you can reuse it.

## Thinking before typing: pseudocode

Professionals often sketch logic in plain English first. This is called **pseudocode**:

```text
for each product in the basket:
    add (price x quantity) to the total
if the total is at least 5000 pence:
    shipping is free
otherwise:
    shipping costs 399 pence
```

Once the steps are clear, turning them into code is mostly spelling. When you feel stuck, write pseudocode first.

## Decisions: if, else if, else

```js
const stock = 3;

if (stock === 0) {
  console.log('Sold out');
} else if (stock < 5) {
  console.log('Only a few left');
} else {
  console.log('In stock');
}
```

- The condition goes in round brackets `( )`.
- The code to run goes in curly braces `{ }`.
- Only the **first** branch whose condition is true runs.
- Indent the code inside braces by two spaces. The computer does not care, but humans do.

Combine conditions with `&&` (and), `||` (or) and `!` (not): `if (age >= 18 && hasId)`.

:::exercise Free shipping or not?
@@file shipping.js
@@prompt
Write an `if` / `else` that decides shipping:

1. A constant `total` equal to `4200` (pence).
2. `if (total >= 5000)` print `'Free shipping'`.
3. Otherwise (`else`) print `'Shipping: 3.99'`.

Use the usual layout: braces on the same line as `if` and `else`, and each `console.log` indented on its own line.
@@solution
const total = 4200;
if (total >= 5000) {
  console.log('Free shipping');
} else {
  console.log('Shipping: 3.99');
}
@@hint const\s+total\s*=\s*4200
Line 1: `const total = 4200;`
@@hint if\s*\(\s*total\s*>=\s*5000\s*\)\s*\{
The `if` line: `if (total >= 5000) {` with the condition in round brackets and an opening curly brace.
@@hint console\.log\(\s*['"]Free shipping['"]\s*\)
Inside the `if`: `console.log('Free shipping');`
@@hint \}\s*else\s*\{
Close the `if` block and open the else on the same line: `} else {`
@@hint console\.log\(\s*['"]Shipping: 3\.99['"]\s*\)
Inside the `else`: `console.log('Shipping: 3.99');`
@@explain
4200 is not at least 5000, so the condition is `false`, the first block is skipped and the `else` block runs: **Shipping: 3.99**. Change `4200` to `5200` and run it again to see the other branch.
:::

## Loops: repeat without rewriting

A `for` loop has three parts in its brackets, separated by semicolons:

```js
for (let i = 1; i <= 3; i++) {
  console.log('Lap', i);
}
//  let i = 1   start: create a counter
//  i <= 3      keep going while this is true
//  i++         after each lap, add 1 to i
```

Output: `Lap 1`, `Lap 2`, `Lap 3`.

When you have a list, `for...of` gives you each item in turn, with no counter to manage:

```js
const sizes = ['S', 'M', 'L'];
for (const size of sizes) {
  console.log(size);
}
```

And a `while` loop repeats as long as a condition stays true. Make sure something inside it eventually makes the condition false, or it runs forever (an **infinite loop**, which freezes the page).

:::exercise Count to five
@@file count.js
@@prompt
Write a `for` loop that prints the numbers 1 to 5:

1. `for (let i = 1; i <= 5; i++) {`
2. Inside it, indented: `console.log(i);`
3. Close it with `}`
@@solution
for (let i = 1; i <= 5; i++) {
  console.log(i);
}
@@hint ^\s*for\s*\(
Start with the keyword `for` followed by round brackets.
@@hint let\s+i\s*=\s*1\s*;
First part: `let i = 1;` (start counting at 1). Note the semicolon.
@@hint i\s*<=\s*5\s*;
Second part: `i <= 5;` (keep going while i is 5 or less).
@@hint i\+\+\s*\)\s*\{
Third part: `i++` then close the round bracket and open a curly brace: `i++) {`
@@hint console\.log\(\s*i\s*\)
Inside the loop: `console.log(i);`
@@explain
The loop starts with `i` at 1, checks `i <= 5`, runs the body, then adds 1. When `i` reaches 6 the check fails and the loop stops. Output: 1, 2, 3, 4, 5.
:::

:::exercise Add up a basket
@@file basket.js
@@prompt
Use a `for...of` loop to total some prices:

1. `const prices = [2000, 1500, 4500];`
2. `let total = 0;` (use `let`, because it will change)
3. A loop: `for (const price of prices) {`
4. Inside it: `total = total + price;`
5. Close the loop with `}`
6. After the loop: `console.log(total);`
@@solution
const prices = [2000, 1500, 4500];
let total = 0;
for (const price of prices) {
  total = total + price;
}
console.log(total);
@@also
const prices = [2000, 1500, 4500];
let total = 0;
for (const price of prices) {
  total += price;
}
console.log(total);
@@hint const\s+prices\s*=\s*\[\s*2000\s*,\s*1500\s*,\s*4500\s*\]
Line 1 creates the list in square brackets: `const prices = [2000, 1500, 4500];`
@@hint let\s+total\s*=\s*0
Line 2: `let total = 0;` It must be `let` because the loop changes it.
@@hint for\s*\(\s*const\s+price\s+of\s+prices\s*\)\s*\{
The loop line: `for (const price of prices) {` (singular `price`, plural `prices`).
@@hint total\s*(\+=|=\s*total\s*\+)\s*price
Inside the loop, add each price to the total: `total = total + price;`
@@hint \}\s*\n\s*console\.log\(\s*total\s*\)
Close the loop with `}`, then print the total after it, on its own line.
@@explain
`total` starts at 0. The loop runs three times, adding 2000, then 1500, then 4500. Printing after the loop shows **8000** pence: £80.00. If you put the `console.log` inside the loop, it would print the running total three times.
:::

## Functions: name your steps

A function packages steps under a name. It takes **inputs** (parameters) and usually **returns** an output.

```js
function priceWithVat(pence) {
  return Math.round(pence * 1.2);
}

priceWithVat(1000);   // 1200
priceWithVat(4500);   // 5400
```

- `function` keyword, then the name, then parameters in brackets.
- `return` sends a value back to whoever called the function, and ends it.
- Defining a function does nothing on its own. **Calling** it, `priceWithVat(1000)`, runs it.

Good function names are verbs that say what they do: `calculateShipping`, `isEven`, `formatPrice`.

:::exercise Write your first function
@@file even.js
@@prompt
Write a function that tells you whether a number is even, then use it:

1. `function isEven(n) {`
2. Inside it: `return n % 2 === 0;`
3. Close it with `}`
4. Print `isEven(10)`.
5. Print `isEven(7)`.
@@solution
function isEven(n) {
  return n % 2 === 0;
}
console.log(isEven(10));
console.log(isEven(7));
@@hint function\s+isEven\s*\(\s*n\s*\)\s*\{
The first line: `function isEven(n) {` (capital E in `isEven`).
@@hint return\s+n\s*%\s*2\s*===\s*0
Inside: `return n % 2 === 0;` A number is even when its remainder after dividing by 2 is 0.
@@hint isEven\(\s*10\s*\)
After the function, call it: `console.log(isEven(10));`
@@hint isEven\(\s*7\s*\)
Then: `console.log(isEven(7));`
@@explain
`10 % 2` is 0, so `0 === 0` is `true`. `7 % 2` is 1, so the result is `false`. One function, reused with any number. That is the whole point of functions.
:::

## The same three ideas in Python

```python
total = 4200
if total >= 5000:
    print('Free shipping')
else:
    print('Shipping: 3.99')

for i in range(1, 6):     # 1 to 5
    print(i)

def is_even(n):
    return n % 2 == 0
```

Python uses a colon and **indentation** (4 spaces) instead of curly braces, so indentation is not just style there: it is the structure.

:::exercise A Python loop
@@file loop.py
@@prompt
Write a Python loop that prints 1 to 5. Two lines:

1. `for i in range(1, 6):`
2. Indented by **4 spaces**: `print(i)`
@@solution
for i in range(1, 6):
    print(i)
@@hint ^for\s+i\s+in\s+range\(\s*1\s*,\s*6\s*\)\s*:
Line 1: `for i in range(1, 6):` ending with a colon. `range(1, 6)` stops just before 6.
@@hint ^ {4}print\(\s*i\s*\)
Line 2 must start with exactly 4 spaces (press Tab once), then `print(i)`.
@@explain
`range(1, 6)` produces 1, 2, 3, 4, 5. It never includes the end number, which is a classic source of off-by-one bugs. The indented line is the loop's body.
:::

## Quiz

? In an if / else if / else chain, how many branches run?
- [ ] All of them whose condition is true
- [x] Only the first one whose condition is true
- [ ] Always the else
> Once a branch matches, the rest are skipped.

? What does this print? for (let i = 0; i < 3; i++) { console.log(i); }
- [ ] 1 2 3
- [x] 0 1 2
- [ ] 0 1 2 3
> It starts at 0 and stops when i < 3 becomes false, so 3 is never printed.

? What does return do inside a function?
- [x] Sends a value back to the caller and ends the function
- [ ] Prints the value
- [ ] Restarts the function
> return hands a result back. console.log is what prints.

? What causes an infinite loop?
- [ ] A loop with more than 1,000 items
- [x] A loop whose condition never becomes false
- [ ] Using let instead of const
> If nothing inside the loop eventually makes its condition false, it never stops.
