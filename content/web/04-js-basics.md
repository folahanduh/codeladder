---
id: web-js-basics
title: "JavaScript basics: values, variables and functions"
level: beginner
minutes: 25
summary: The building blocks of every program, written and run in your browser.
---

## Where JavaScript runs

JavaScript runs in every browser and, with Node.js, on servers and your computer. Open any page, press [[F12]], click **Console**, and type `2 + 2`. You are programming.

For this lesson, use the [Playground](#playground) (choose the *JavaScript console basics* template) or the browser console.

## Values and types

```js
'Linen dress'      // string: text, in quotes
68                 // number: integers and decimals are both "number"
true               // boolean: true or false
null               // "deliberately nothing"
undefined          // "not set yet"
```

Check a type with `typeof`: `typeof 68` gives `"number"`.

## Variables

A variable is a named box for a value.

```js
const brand = 'Amara Studio';   // const: cannot be reassigned
let stock = 12;                 // let: can be reassigned
stock = stock - 1;              // now 11
```

**Use `const` by default.** Switch to `let` only when the value must change. Avoid `var`; it is the old way and has confusing rules.

Names are written in **camelCase**: `cartTotal`, `isLoggedIn`, `maxSupply`. Make them descriptive.

:::exercise const and let
@@file stock.js
@@prompt
Write four lines:

1. A constant `brand` holding `'Amara Studio'`.
2. A variable (`let`) `stock` holding `12`.
3. Reduce stock by one: `stock = stock - 1;`
4. Print both: `console.log(brand, stock);`
@@solution
const brand = 'Amara Studio';
let stock = 12;
stock = stock - 1;
console.log(brand, stock);
@@also
const brand = 'Amara Studio';
let stock = 12;
stock -= 1;
console.log(brand, stock);
@@hint const\s+brand\s*=\s*['"]Amara Studio['"]
Line 1: `const brand = 'Amara Studio';`
@@hint let\s+stock\s*=\s*12
Line 2 uses `let`, because the value will change: `let stock = 12;`
@@hint stock\s*(=\s*stock\s*-|-=)\s*1
Line 3: `stock = stock - 1;`
@@hint console\.log\(\s*brand\s*,\s*stock\s*\)
Line 4: `console.log(brand, stock);`
@@explain
Output: `Amara Studio 11`. Try changing `let` to `const` and run it: you get `TypeError: Assignment to constant variable`. That error is `const` protecting you.
:::

## Operators

```js
10 + 5      // 15
10 - 5      // 5
10 * 5      // 50
10 / 4      // 2.5
10 % 3      // 1 (remainder)
2 ** 3      // 8 (power)

'Hello, ' + 'world'          // joining strings
`Total: £${(6800 / 100).toFixed(2)}`   // template literal with backticks: "Total: £68.00"
```

Comparisons give booleans:

```js
5 === 5        // true   (equal value AND type)
5 === '5'      // false
5 !== 3        // true
7 > 3          // true
age >= 18 && hasId     // AND: both must be true
isMember || hasCode    // OR: at least one true
!isSoldOut             // NOT: flips true/false
```

:::warn Always use === not ==
`==` converts types before comparing, giving surprises like `'0' == false` being `true`. Use `===` and `!==` every time.
:::

:::exercise Format a price with a template literal
@@file price.js
@@prompt
Write two lines:

1. A constant `pence` equal to `6800`.
2. Print the text `Total: £68.00` using a **template literal** (text between backticks) with `${(pence / 100).toFixed(2)}` inside it.
@@solution
const pence = 6800;
console.log(`Total: £${(pence / 100).toFixed(2)}`);
@@hint const\s+pence\s*=\s*6800
Line 1: `const pence = 6800;`
@@hint console\.log\(\s*`
Line 2 starts `console.log(` and then a backtick (the key above Tab on most keyboards), not a quote.
@@hint `Total: £\$\{
Inside the backticks: `Total: £` then a dollar sign and an opening curly brace.
@@hint \(\s*pence\s*\/\s*100\s*\)\.toFixed\(\s*2\s*\)
Inside the braces: `(pence / 100).toFixed(2)` then close the brace and the backtick.
@@explain
Inside backticks, anything in `${ }` is calculated and dropped into the text. Output: `Total: £68.00`. Money stays in pence until the moment you display it.
:::

## Making decisions

```js
const stock = 3;

if (stock === 0) {
  console.log('Sold out');
} else if (stock < 5) {
  console.log(`Only ${stock} left`);
} else {
  console.log('In stock');
}
```

## Functions

A function is a reusable recipe. It takes **parameters** and **returns** a result.

```js try
// function declaration
function priceWithVat(pence) {
  return Math.round(pence * 1.2);
}

// arrow function: the same idea, shorter syntax
const formatGBP = (pence) => `£${(pence / 100).toFixed(2)}`;

const dress = 5667;
console.log(formatGBP(priceWithVat(dress)));   // £68.00

// a function with a default parameter
function greet(name = 'there') {
  return `Hi ${name}, welcome back!`;
}
console.log(greet('Tolu'));
console.log(greet());
```

Good functions do **one thing** and are named with a verb: `calculateTotal`, `formatDate`, `isValidEmail`.

:::tip Money is stored in pence
`0.1 + 0.2` in JavaScript is `0.30000000000000004`, because computers store decimals in binary. Store money as whole pence (or cents) and only divide by 100 when displaying it. Blockchains do the same thing with 18 decimal places, as you will see later.
:::

:::exercise A function and an arrow function
@@file vat.js
@@prompt
Write:

1. A function `priceWithVat(pence)` that returns `Math.round(pence * 1.2)`.
2. An arrow function constant `formatGBP` that takes `pence` and returns `(pence / 100).toFixed(2)`.
3. `console.log(formatGBP(priceWithVat(5667)));`
@@solution
function priceWithVat(pence) {
  return Math.round(pence * 1.2);
}
const formatGBP = (pence) => (pence / 100).toFixed(2);
console.log(formatGBP(priceWithVat(5667)));
@@also
function priceWithVat(pence) {
  return Math.round(pence * 1.2);
}
const formatGBP = pence => (pence / 100).toFixed(2);
console.log(formatGBP(priceWithVat(5667)));
@@hint function\s+priceWithVat\s*\(\s*pence\s*\)\s*\{
Line 1: `function priceWithVat(pence) {`
@@hint return\s+Math\.round\(\s*pence\s*\*\s*1\.2\s*\)
Line 2: `return Math.round(pence * 1.2);`
@@hint const\s+formatGBP\s*=\s*\(?\s*pence\s*\)?\s*=>
Line 4: `const formatGBP = (pence) =>` then the expression to return.
@@hint =>\s*\(\s*pence\s*\/\s*100\s*\)\.toFixed\(\s*2\s*\)
After the arrow: `(pence / 100).toFixed(2);`
@@hint formatGBP\(\s*priceWithVat\(\s*5667\s*\)\s*\)
Last line calls one function inside the other: `formatGBP(priceWithVat(5667))`
@@explain
5667 x 1.2 = 6800.4, rounded to 6800 pence, formatted as `68.00`. Functions inside functions run from the inside out.
:::

## Quiz

? Which keyword should you use by default to declare a variable?
- [x] const
- [ ] let
- [ ] var
> const prevents accidental reassignment. Use let only when the value has to change.

? What does `5 === '5'` return?
- [ ] true
- [x] false
- [ ] An error
> === compares type as well as value. A number is not a string.

? Why store £68.00 as 6800?
- [ ] It uses less memory
- [x] Decimal maths in binary is imprecise; whole numbers of pence are exact
- [ ] JavaScript cannot display decimals
> Floating-point rounding errors cause real money bugs. Integers avoid them.

? What does this return: `const double = (n) => n * 2; double(21)`
- [x] 42
- [ ] 21
- [ ] undefined
> An arrow function with one expression returns that expression automatically.
