---
id: setup-coding-basics
title: "Coding basics 1: integers, decimals, characters and strings"
level: beginner
minutes: 35
summary: Every value in a program has a type. Learn integers, decimals (floats), characters, strings and booleans by typing real code.
---

## Programs are instructions plus data

A program is a list of instructions that work on **data**: prices, names, quantities, true-or-false answers. Every piece of data has a **type**, and the type decides what you can do with it. You can multiply two numbers; you cannot multiply two names.

These five types exist, under slightly different names, in almost every language:

| Type | What it holds | JavaScript | Python | Java / C | Solidity |
|---|---|---|---|---|---|
| **Integer** | Whole numbers: `12`, `-3`, `0` | `number` (or `bigint`) | `int` | `int`, `long` | `uint256`, `int256` |
| **Decimal (float)** | Numbers with a fractional part: `19.99` | `number` | `float` | `double`, `float` | none (no decimals) |
| **Character** | One letter or symbol: `'A'` | a string of length 1 | a string of length 1 | `char` | `bytes1` |
| **String** | Text: `'Amara Studio'` | `string` | `str` | `String` / `char[]` | `string` |
| **Boolean** | `true` or `false` | `boolean` | `bool` (`True`) | `boolean` / `bool` | `bool` |

We will use **JavaScript** for the exercises, because it runs right here in your browser. Everything you learn transfers to other languages.

:::tip How exercises work
Each exercise has an editor that works like VS Code. Type the code, then press **Check my code** (or [[Ctrl+Enter]]). Wrong answers get a tip. After **5 wrong tries in a row**, the answer appears as faded **ghost text** and you type over it, character by character. **Run it** shows what your code prints.
:::

## Variables: naming your data

A **variable** is a labelled box that holds a value. In JavaScript you create one with `const` (it will not be reassigned) or `let` (it can change).

```js
const brand = 'Amara Studio';   // a string
let stock = 12;                 // an integer
const price = 34.5;             // a decimal
const inStock = true;           // a boolean
```

`console.log(...)` prints a value so you can see it. You will use it constantly.

:::exercise Store an integer
@@file stock.js
@@prompt
Create a **constant** called `stock` that holds the integer `12`. Then print it with `console.log`.

Two lines. No quotes around `12`: quotes would make it text, not a number.
@@starter
// Line 1: create the constant
// Line 2: print it
@@solution
const stock = 12;
console.log(stock);
@@hint ^\s*const\s
Start the first line with the keyword `const`.
@@hint const\s+stock\s*=
Name the constant `stock`, followed by `=`.
@@hint stock\s*=\s*12\s*;?\s*$
Give it the value `12` with no quotes.
@@hint console\.log\(\s*stock\s*\)
Print it on the second line with `console.log(stock);`.
@@explain
`const` creates a variable that cannot be reassigned. `stock` is its name. `=` stores the value `12` in it. `console.log(stock)` looks up the value in the box and prints it: **12**.
:::

## Integers: whole numbers

Integers are counts: items in stock, people, days, votes. The maths operators:

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | add | `7 + 2` | `9` |
| `-` | subtract | `7 - 2` | `5` |
| `*` | multiply | `7 * 2` | `14` |
| `/` | divide | `7 / 2` | `3.5` |
| `%` | remainder (modulo) | `7 % 2` | `1` |
| `**` | power | `7 ** 2` | `49` |

In JavaScript, `7 / 2` gives `3.5`. To get a whole-number answer, round **down** with `Math.floor(7 / 2)`, which gives `3`. (Python has a special operator for this: `7 // 2`.)

The **remainder** operator `%` is more useful than it looks: `n % 2 === 0` tells you if a number is even, and it answers "how many are left over?"

:::exercise Boxes and leftovers
@@file cupcakes.js
@@prompt
A bakery has **40** cupcakes and each box holds **6**. Write three lines:

1. A constant `boxes` equal to `Math.floor(40 / 6)` (the number of full boxes).
2. A constant `leftover` equal to `40 % 6` (the cupcakes that do not fit).
3. Print both: `console.log(boxes, leftover);`
@@solution
const boxes = Math.floor(40 / 6);
const leftover = 40 % 6;
console.log(boxes, leftover);
@@hint const\s+boxes\s*=
Line 1 starts with `const boxes =`.
@@hint Math\.floor\(\s*40\s*\/\s*6\s*\)
Use `Math.floor(40 / 6)`. Capital M, and a dot before `floor`.
@@hint const\s+leftover\s*=\s*40\s*%\s*6
Line 2: `const leftover = 40 % 6;` The `%` sign gives the remainder.
@@hint console\.log\(\s*boxes\s*,\s*leftover\s*\)
Print both values, separated by a comma, inside one `console.log(...)`.
@@explain
40 divided by 6 is 6.67. `Math.floor` rounds down to **6** full boxes. 6 boxes hold 36, so `40 % 6` is the **4** left over. The output is `6 4`.
:::

## Decimals (floats) and their famous trap

Numbers with a decimal point are called **floating-point** numbers, or **floats**. Computers store them in binary, which cannot represent some decimals exactly, just as 1/3 cannot be written exactly in decimal (0.3333...).

```js
console.log(0.1 + 0.2);   // 0.30000000000000004
```

That tiny error is why professionals **never store money as a float**. Store pence (or cents) as integers, and convert only for display. To show a decimal neatly, use `.toFixed(2)`, which rounds to 2 decimal places and returns a **string**.

:::exercise See the float trap yourself
@@file floats.js
@@prompt
Write three lines:

1. A constant `total` equal to `0.1 + 0.2`.
2. Print `total`.
3. Print `total.toFixed(2)`.

Then press **Run it** and compare the two outputs.
@@solution
const total = 0.1 + 0.2;
console.log(total);
console.log(total.toFixed(2));
@@hint const\s+total\s*=\s*0\.1\s*\+\s*0\.2
Line 1: `const total = 0.1 + 0.2;`
@@hint ^\s*console\.log\(\s*total\s*\)\s*;?\s*$
Line 2 prints the raw value: `console.log(total);`
@@hint total\.toFixed\(\s*2\s*\)
Line 3 uses the method `toFixed(2)` on `total`: `total.toFixed(2)`.
@@explain
The first line of output is `0.30000000000000004`: a real floating-point rounding error. `toFixed(2)` rounds it for display to `"0.30"`. For money, store `30` pence instead and you never meet this problem.
:::

## Characters: letters are secretly numbers

A **character** (often called a **char**) is a single letter, digit, symbol or space: `'A'`, `'7'`, `'?'`, `' '`.

Computers only store numbers, so every character has a number code. The standard is **Unicode** (its first 128 codes are the older **ASCII** table):

| Character | Code |
|---|---|
| `'0'` to `'9'` | 48 to 57 |
| `'A'` to `'Z'` | 65 to 90 |
| `'a'` to `'z'` | 97 to 122 |
| space | 32 |

So `'A'` is stored as 65 and `'a'` as 97. That is why sorting can put "Zebra" before "apple": 90 comes before 97.

Languages like Java and C have a real `char` type (`char grade = 'A';`). JavaScript and Python simply use a string of length 1. To go between characters and codes:

| | JavaScript | Python |
|---|---|---|
| Character to code | `'A'.charCodeAt(0)` gives `65` | `ord('A')` gives `65` |
| Code to character | `String.fromCharCode(66)` gives `'B'` | `chr(66)` gives `'B'` |

:::exercise Characters as numbers
@@file chars.js
@@prompt
Write three lines:

1. A constant `letter` holding the character `'A'`.
2. Print its code with `letter.charCodeAt(0)`.
3. Print the character for code `66` with `String.fromCharCode(66)`.
@@solution
const letter = 'A';
console.log(letter.charCodeAt(0));
console.log(String.fromCharCode(66));
@@hint const\s+letter\s*=\s*['"]A['"]
Line 1: `const letter = 'A';` with the A inside quotes (it is text).
@@hint letter\.charCodeAt\(\s*0\s*\)
Line 2: `console.log(letter.charCodeAt(0));` The `0` means "the first character".
@@hint String\.fromCharCode\(\s*66\s*\)
Line 3: `console.log(String.fromCharCode(66));` Capital S on `String`, capital C on `Char` and `Code`.
@@explain
`charCodeAt(0)` reads the number stored for the character at position 0: **65**. `String.fromCharCode(66)` goes the other way and gives **B**. Every string you type is stored as numbers like these, which matters later for hashing and encryption.
:::

## Strings: text

A **string** is a sequence of characters. You can write it with single quotes `'...'`, double quotes `"..."` or backticks (called template literals, which let you insert values with `${}`).

```js
const brand = 'amara studio';
brand.length;             // 12 (characters, including the space)
brand[0];                 // 'a' (position 0 is the first character)
brand.toUpperCase();      // 'AMARA STUDIO'
brand.includes('studio'); // true
brand.slice(0, 5);        // 'amara'
`Welcome to ${brand}!`    // 'Welcome to amara studio!'
```

Positions start at **0**, not 1. That trips up every beginner once.

:::exercise Work with a string
@@file brand.js
@@prompt
Write four lines:

1. A constant `brand` holding `'amara studio'` (all lower case).
2. Print it in capitals with `brand.toUpperCase()`.
3. Print how many characters it has with `brand.length`.
4. Print its first character with `brand[0]`.
@@solution
const brand = 'amara studio';
console.log(brand.toUpperCase());
console.log(brand.length);
console.log(brand[0]);
@@hint const\s+brand\s*=\s*['"]amara studio['"]
Line 1: `const brand = 'amara studio';`
@@hint brand\.toUpperCase\(\s*\)
Line 2 needs `brand.toUpperCase()` inside `console.log(...)`. It is a method, so it ends with `()`.
@@hint console\.log\(\s*brand\.length\s*\)
Line 3: `console.log(brand.length);` No brackets after `length`: it is a property, not a method.
@@hint brand\[\s*0\s*\]
Line 4: square brackets with the position: `brand[0]`.
@@explain
Output: `AMARA STUDIO`, then `12`, then `a`. Methods like `toUpperCase()` do something and need `()`. Properties like `length` just hold a value. Square brackets pick a character by position, starting at 0.
:::

## Booleans: true or false

A **boolean** is either `true` or `false`. Comparisons produce booleans, and booleans drive every decision a program makes.

```js
12 > 5            // true
12 === 12         // true  (=== means "is exactly equal to")
'12' === 12       // false (a string is not a number)
12 !== 5          // true  (!== means "is not equal to")
```

## Converting between types

Data from forms, files and URLs always arrives as **text**, even when it looks like a number. `'42' + 1` gives `'421'` (joining text), not `43`. Convert first:

| Conversion | JavaScript | Result |
|---|---|---|
| Text to number | `Number('42')` | `42` |
| Text to whole number, ignoring letters after it | `parseInt('42px')` | `42` |
| Number to text | `String(42)` | `'42'` |
| What type is this? | `typeof 42` | `'number'` |
| A failed conversion | `Number('abc')` | `NaN` ("Not a Number") |

:::exercise Turn text into a number
@@file convert.js
@@prompt
A form gives you the text `'42'`. Write four lines:

1. A constant `input` holding the **string** `'42'`.
2. A constant `qty` equal to `Number(input)`.
3. Print `qty + 1`.
4. Print `typeof qty`.
@@solution
const input = '42';
const qty = Number(input);
console.log(qty + 1);
console.log(typeof qty);
@@hint const\s+input\s*=\s*['"]42['"]
Line 1: the value is text, so it needs quotes: `const input = '42';`
@@hint const\s+qty\s*=\s*Number\(\s*input\s*\)
Line 2: `const qty = Number(input);` Capital N on `Number`.
@@hint console\.log\(\s*qty\s*\+\s*1\s*\)
Line 3: `console.log(qty + 1);`
@@hint console\.log\(\s*typeof\s+qty\s*\)
Line 4: `typeof` is a keyword, followed by a space and the variable: `console.log(typeof qty);`
@@explain
Output: `43` and `number`. Without `Number(...)`, `input + 1` would have given `"421"`, because `+` joins text. Converting input before doing maths is a habit that prevents a whole family of bugs.
:::

## The same ideas in Python

You will meet Python for scripts, data and tokenomics models. The concepts are identical; only the spelling changes:

```python
stock = 12                 # int (no const or let in Python)
price = 34.5               # float
letter = 'A'               # a string of length 1
in_stock = True            # bool: capital T
print(ord(letter))         # 65
print(stock // 5)          # 2  (whole-number division)
print(int('42') + 1)       # 43
```

:::exercise Write the same thing in Python
@@file basics.py
@@prompt
Python does not need `const`, `let` or semicolons. Write three lines:

1. `stock = 12`
2. `letter = 'A'`
3. Print the character code of `letter` with `print(ord(letter))`
@@solution
stock = 12
letter = 'A'
print(ord(letter))
@@hint ^stock\s*=\s*12\s*$
Line 1: just `stock = 12`. No `const`, no semicolon.
@@hint ^letter\s*=\s*['"]A['"]\s*$
Line 2: `letter = 'A'`
@@hint print\(\s*ord\(\s*letter\s*\)\s*\)
Line 3: Python prints with `print(...)`, and `ord(...)` gives a character's code: `print(ord(letter))`.
@@explain
This would print **65**, just like `charCodeAt(0)` in JavaScript. Python runs on your computer rather than in the browser, so there is no Run button here. Install Python with uv from the [Install everything](#toolkit) page and try it with `uv run python`.
:::

## Quiz

? Which value is an integer?
- [ ] 19.99
- [x] 12
- [ ] '12'
> 19.99 is a decimal (float) and '12' is a string because of the quotes.

? What does 17 % 5 give?
- [ ] 3.4
- [x] 2
- [ ] 3
> % gives the remainder: 5 goes into 17 three times (15), with 2 left over.

? Why should you store £34.50 as 3450 pence instead of 34.5?
- [x] Floats cannot store some decimals exactly, which causes rounding errors with money
- [ ] Integers use more memory
- [ ] JavaScript cannot show decimals
> 0.1 + 0.2 is 0.30000000000000004 in floating point. Whole pence are always exact.

? What is 'B'.charCodeAt(0)?
- [ ] 65
- [x] 66
- [ ] 98
> Capital A is 65, so B is 66. Lower-case b is 98.

? A form field gives '5'. What does '5' + 1 produce in JavaScript?
- [ ] 6
- [x] '51'
- [ ] An error
> With a string involved, + joins text. Convert with Number('5') first.
