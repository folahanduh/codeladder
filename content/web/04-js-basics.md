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
