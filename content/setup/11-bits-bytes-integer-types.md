---
id: setup-bits-bytes
title: "Bits, bytes and integer types: what uint256 really means"
level: advanced
minutes: 40
summary: Binary and hex, bytes and encodings, fixed-size integers, overflow, BigInt and bitwise operators. The ground floor under hashing, smart contracts and token maths.
---

## Why this matters

Web developers can go years without thinking about bits. Blockchain developers cannot. Hashes are 256 bits, addresses are 20 bytes, token balances are `uint256`, and one wrong assumption about integer size or precision has drained real money from real contracts. This lesson is the foundation for all of it.

## Binary: counting with two digits

Computers store everything as **bits**: 0 or 1. In binary, each position is worth double the one to its right:

| Position value | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|---|
| `13` in binary | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 |

8 + 4 + 1 = 13, so 13 is `00001101`. Eight bits are a **byte**, which holds 2^8 = **256** values: 0 to 255.

## Hexadecimal: the developer's shorthand

Binary is long, so developers write bytes in **hexadecimal** (base 16), using digits 0 to 9 and letters a to f (for 10 to 15). One hex digit is exactly 4 bits, so one byte is always exactly **two** hex digits: `00` to `ff`.

| Decimal | Binary | Hex |
|---|---|---|
| 0 | `00000000` | `00` |
| 10 | `00001010` | `0a` |
| 255 | `11111111` | `ff` |

Hex is usually written with a `0x` prefix: `0xff`. Ethereum addresses (`0x71C7...`) and hashes are hex for this reason. A 256-bit hash is 64 hex characters; a 20-byte address is 40.

:::exercise Convert between bases
@@file bases.js
@@prompt
Write three lines that convert the number 255:

1. Print it in binary: `console.log((255).toString(2));`
2. Print it in hex: `console.log((255).toString(16));`
3. Print the hex string `'ff'` back as a number: `console.log(parseInt('ff', 16));`

(The extra brackets around `255` stop JavaScript reading the dot as a decimal point.)
@@solution
console.log((255).toString(2));
console.log((255).toString(16));
console.log(parseInt('ff', 16));
@@hint \(\s*255\s*\)\.toString\(\s*2\s*\)
Line 1: `(255).toString(2)` converts to base 2. Wrap it in `console.log(...)`.
@@hint \(\s*255\s*\)\.toString\(\s*16\s*\)
Line 2: the same, with base `16`.
@@hint parseInt\(\s*['"]ff['"]\s*,\s*16\s*\)
Line 3: `parseInt('ff', 16)`. The second argument tells it the text is base 16.
@@explain
Output: `11111111`, `ff`, `255`. The same number, three spellings. `toString(base)` and `parseInt(text, base)` are your tools for moving between them.
:::

## Text is bytes too

Strings are stored as bytes using an **encoding**. The web's standard is **UTF-8**: ASCII characters take one byte each; accented letters, other scripts and emoji take two to four.

```js
new TextEncoder().encode('Hi');   // Uint8Array [72, 105]
new TextEncoder().encode('£');    // Uint8Array [194, 163]  (two bytes)
```

Hash functions and signatures work on **bytes**, not text, which is why crypto code always encodes strings first.

:::exercise See the bytes inside a string
@@file bytes.js
@@prompt
Write two lines:

1. A constant `bytes` equal to `new TextEncoder().encode('Hi')`.
2. Print it as a plain array: `console.log(Array.from(bytes));`
@@solution
const bytes = new TextEncoder().encode('Hi');
console.log(Array.from(bytes));
@@hint const\s+bytes\s*=\s*new\s+TextEncoder\(\s*\)
Line 1 starts `const bytes = new TextEncoder()`. `new` creates an encoder object.
@@hint \.encode\(\s*['"]Hi['"]\s*\)
Then call `.encode('Hi')` on it, all on the same line.
@@hint Array\.from\(\s*bytes\s*\)
Line 2: `console.log(Array.from(bytes));`
@@explain
Output: `[72, 105]`. 'H' is 72 and 'i' is 105, the same character codes you met in Coding basics 1, now as raw bytes.
:::

## Fixed-size integers

Most languages store integers in a **fixed number of bits**. That sets a minimum and maximum:

| Type | Bits | Range |
|---|---|---|
| `uint8` (unsigned) | 8 | 0 to 255 |
| `int8` (signed) | 8 | -128 to 127 |
| `int32` | 32 | about -2.1 billion to 2.1 billion |
| `uint64` | 64 | 0 to about 1.8 x 10^19 |
| `uint256` | 256 | 0 to about 1.16 x 10^77 |

- **Unsigned** (`uint`) types hold only zero and positives.
- **Signed** (`int`) types use one bit's worth of range for negatives (stored using a scheme called **two's complement**).
- Solidity's default `uint` is `uint256`: big enough for any realistic token balance with 18 decimals.

## Overflow: when numbers wrap around

What is 255 + 1 in a `uint8`? There is no room for 256, so in many languages it silently **wraps** to 0, like a car odometer rolling over. Subtracting 1 from 0 in a `uint` wraps to the maximum value.

In older Solidity (before 0.8), this was a real attack: in 2018 an overflow bug in a token's batch-transfer function (the "BatchOverflow" bug) let attackers create astronomically large balances from nothing. Since Solidity 0.8, arithmetic **reverts on overflow** by default. Code inside an `unchecked { }` block skips that check to save gas, so it must be proven safe.

## JavaScript numbers and BigInt

JavaScript's `number` is a 64-bit float. It stores whole numbers exactly only up to `Number.MAX_SAFE_INTEGER`, which is 2^53 - 1 = 9,007,199,254,740,991. Beyond that, it silently loses precision.

One ether is 10^18 wei, far beyond that limit for real balances. So blockchain JavaScript uses **BigInt**: integers of any size, written with an `n` suffix: `10n ** 18n`. You cannot mix BigInt and normal numbers in one calculation without converting.

:::exercise Find the edge of safe integers
@@file safe.js
@@prompt
Write three lines:

1. Print `Number.MAX_SAFE_INTEGER`.
2. Print `2 ** 53 + 1` (watch for the wrong answer).
3. Print `2n ** 53n + 1n` (the BigInt version).
@@solution
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2n ** 53n + 1n);
@@hint Number\.MAX_SAFE_INTEGER
Line 1: `console.log(Number.MAX_SAFE_INTEGER);` all capitals after the dot, with underscores.
@@hint console\.log\(\s*2\s*\*\*\s*53\s*\+\s*1\s*\)
Line 2: `console.log(2 ** 53 + 1);` (`**` means "to the power of").
@@hint 2n\s*\*\*\s*53n\s*\+\s*1n
Line 3: every number gets an `n`: `2n ** 53n + 1n`
@@explain
Line 2 prints `9007199254740992`, which is wrong: the true answer ends in 3. The float cannot represent it, so it rounds silently. The BigInt line prints the correct `9007199254740993`. This is exactly why viem returns balances as `bigint`.
:::

:::exercise Work in wei, like a wallet does
@@file wei.js
@@prompt
Represent 2.5 ether in wei using only integers:

1. `const oneEther = 10n ** 18n;`
2. `const amount = 25n * oneEther / 10n;` (2.5 = 25 / 10, multiplying **before** dividing)
3. `console.log(amount.toString());`
@@solution
const oneEther = 10n ** 18n;
const amount = 25n * oneEther / 10n;
console.log(amount.toString());
@@hint const\s+oneEther\s*=\s*10n\s*\*\*\s*18n
Line 1: `const oneEther = 10n ** 18n;` (10 to the power 18, as BigInts).
@@hint const\s+amount\s*=\s*25n\s*\*\s*oneEther\s*\/\s*10n
Line 2: `const amount = 25n * oneEther / 10n;` Multiply first, then divide.
@@hint amount\.toString\(\s*\)
Line 3: print `amount.toString()`.
@@explain
Output: `2500000000000000000`. There is no decimal point anywhere: 2.5 ether is simply 2.5 x 10^18 wei. Multiplying before dividing matters with integers: `25n / 10n` alone would round down to `2n` and lose the half.
:::

## Bitwise operators

Bitwise operators work on the individual bits of integers:

| Operator | Name | Example | Result |
|---|---|---|---|
| `&` | AND (both bits 1) | `0b1100 & 0b1010` | `0b1000` (8) |
| `\|` | OR (either bit 1) | `0b1100 \| 0b1010` | `0b1110` (14) |
| `^` | XOR (bits differ) | `0b1100 ^ 0b1010` | `0b0110` (6) |
| `~` | NOT (flip bits) | `~0` | `-1` |
| `<<` | shift left | `1 << 3` | `8` |
| `>>>` | unsigned shift right | `16 >>> 2` | `4` |

Uses you will actually meet: packing several true/false **flags** into one number (permissions, settings), hash function internals (SHA-256 is mostly rotations, XORs and ANDs; read `sha256` in this site's `assets/tools.js`), and gas-saving tricks in Solidity.

:::exercise Permission flags
@@file flags.js
@@prompt
Store two permissions as bits in one number, then test one:

1. `const CAN_READ = 1;`
2. `const CAN_WRITE = 2;`
3. `const perms = CAN_READ | CAN_WRITE;` (combine the flags with OR)
4. `console.log(perms & CAN_WRITE ? 'can write' : 'read only');`
@@solution
const CAN_READ = 1;
const CAN_WRITE = 2;
const perms = CAN_READ | CAN_WRITE;
console.log(perms & CAN_WRITE ? 'can write' : 'read only');
@@hint const\s+CAN_READ\s*=\s*1
Line 1: `const CAN_READ = 1;` (binary 01).
@@hint const\s+CAN_WRITE\s*=\s*2
Line 2: `const CAN_WRITE = 2;` (binary 10).
@@hint const\s+perms\s*=\s*CAN_READ\s*\|\s*CAN_WRITE
Line 3 combines them with a single bar: `CAN_READ | CAN_WRITE` (binary 11 = 3).
@@hint perms\s*&\s*CAN_WRITE\s*\?
Line 4 tests the bit with a single `&`, then a `?` for the two possible answers.
@@explain
`1 | 2` is binary `11`, which is 3. `3 & 2` keeps only the write bit, giving 2, which counts as true, so it prints **can write**. Single `&` and `|` are bitwise; double `&&` and `||` are logical. Mixing them up is a classic bug.
:::

## The same types in Solidity

```solidity
uint8 small = 255;            // 0 to 255
uint256 big = 1e18;           // one token with 18 decimals
int256 temperature = -5;      // signed: negatives allowed
address owner;                // 20 bytes
bytes32 id = keccak256(abi.encodePacked("ladder"));   // 32 bytes, e.g. a hash
bool isLive = true;
```

:::exercise Declare Solidity types
@@file Types.sol
@@prompt
Write these three state-variable declarations, one per line (Solidity needs the semicolons):

1. A `uint8` called `small` set to `255`.
2. A `uint256` called `big` set to `1e18`.
3. An `int256` called `temperature` set to `-5`.
@@solution
uint8 small = 255;
uint256 big = 1e18;
int256 temperature = -5;
@@hint ^\s*uint8\s+small\s*=\s*255\s*;
Line 1: type first, then name: `uint8 small = 255;`
@@hint ^\s*uint256\s+big\s*=\s*1e18\s*;
Line 2: `uint256 big = 1e18;` (1e18 means 1 followed by 18 zeros).
@@hint ^\s*int256\s+temperature\s*=\s*-5\s*;
Line 3: signed type `int256` (no u), because the value is negative: `int256 temperature = -5;`
@@explain
Solidity puts the type before the name and requires a semicolon after every statement. Trying `uint8 small = 256;` would fail to compile, because 256 does not fit in 8 bits.
:::

## Fixed-point maths: decimals without floats

Tokens use integers plus a **decimals** setting (usually 18), exactly like pence with 2 decimals. Rules that prevent real bugs:

- Multiply before you divide: `amount * feeBps / 10_000`, not `amount / 10_000 * feeBps`.
- Decide which way rounding should go, and make it favour the protocol.
- Tokens have different decimals (USDC uses 6). Always scale before combining amounts.

## Quiz

? How many values can one byte hold?
- [ ] 8
- [ ] 255
- [x] 256
> 2^8 = 256 values, from 0 to 255.

? How many hex characters represent a 32-byte hash?
- [ ] 32
- [x] 64
- [ ] 256
> Each byte is two hex digits: 32 x 2 = 64.

? In Solidity 0.8+, what happens if a uint256 subtraction would go below zero?
- [ ] It wraps to the maximum value
- [x] The transaction reverts, unless the code is inside an unchecked block
- [ ] It becomes negative
> Checked arithmetic has been the default since 0.8.

? Why do Ethereum JavaScript libraries return balances as bigint?
- [x] Wei amounts exceed the largest integer a normal JavaScript number stores exactly
- [ ] bigint is faster
- [ ] JSON requires it
> Number is exact only up to 2^53 - 1; 18-decimal balances go far beyond that.

? What is 6 & 3 (bitwise AND)?
- [ ] 9
- [ ] 7
- [x] 2
> 6 is 110 and 3 is 011. Only the middle bit is 1 in both: 010 = 2.
