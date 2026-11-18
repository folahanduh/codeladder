---
id: web-modern-js
title: "Modern JavaScript: modules, async and fetch"
level: intermediate
minutes: 30
summary: Split code into modules, understand promises and async/await, and load real data from APIs.
---

## Modules: one job per file

Real projects split code into files. Each file is a **module** that `export`s what others may use and `import`s what it needs.

```js
// money.js
export function formatGBP(pence) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
}
export const VAT_RATE = 0.2;
```

```js
// main.js
import { formatGBP, VAT_RATE } from './money.js';
console.log(formatGBP(6800 * (1 + VAT_RATE)));   // £81.60
```

In the browser, load the entry file with `<script type="module" src="main.js"></script>`. Modules need to be served over http (Live Server, Vite, or `npx serve`), not opened as a file.

A file can also have one **default** export: `export default function App() {}`, imported without braces: `import App from './App.js'`.

:::exercise Export a function from a module
@@file money.js
@@run false
@@prompt
Write a module that exports a function `formatGBP(pence)` which returns a template literal: a pound sign followed by `${(pence / 100).toFixed(2)}`.
@@solution
export function formatGBP(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}
@@hint ^\s*export\s+function\s+formatGBP\s*\(\s*pence\s*\)\s*\{
Line 1: `export function formatGBP(pence) {`
@@hint return\s+`£\$\{
Line 2 returns a template literal: `return` then a backtick, a pound sign, a dollar sign and an opening curly brace.
@@hint \(\s*pence\s*\/\s*100\s*\)\.toFixed\(\s*2\s*\)\s*\}`
Inside the braces: `(pence / 100).toFixed(2)`, then a closing brace and backtick.
@@explain
Another file can now write `import { formatGBP } from './money.js';`. One job per file keeps big projects understandable.
:::

## Why asynchronous code exists

Some things take time: network requests, reading files, waiting for a user. JavaScript does not freeze while waiting. Instead, slow operations return a **Promise**: an object that will eventually hold a result (or an error).

```js
const promise = fetch('https://api.example.com/products');   // returns immediately
```

## async / await

`await` pauses **this function** (not the whole page) until the promise settles. It only works inside an `async` function (or at the top level of a module).

```js try
async function loadWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m';
  try {
    const response = await fetch(url);                 // wait for the response headers
    if (!response.ok) {                                // fetch does NOT throw on 404/500
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();                // wait for and parse the body
    console.log(`London is ${data.current.temperature_2m}°C`);
  } catch (error) {
    console.error('Could not load the weather:', error.message);
  } finally {
    console.log('Request finished (success or failure)');
  }
}

loadWeather();
```

Three things beginners miss:

1. `fetch` only rejects on network failure. A 404 or 500 still "succeeds", so check `response.ok`.
2. `response.json()` is also async, so it needs `await`.
3. Always handle errors. Networks fail all the time, especially on phones.

:::exercise Fetch real data, handling errors
@@file weather.js
@@prompt
Fetch London's current temperature from the free Open-Meteo API. Four lines:

1. `const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m');`
2. If the response is not OK, throw an error: `if (!res.ok) throw new Error(...);` where the message is a template literal: a backtick, the text `HTTP ` and `${res.status}`, then a closing backtick.
3. `const data = await res.json();`
4. `console.log(data.current.temperature_2m);`
@@solution
const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
console.log(data.current.temperature_2m);
@@hint const\s+res\s*=\s*await\s+fetch\(
Line 1 starts `const res = await fetch(` with the URL in quotes.
@@hint api\.open-meteo\.com/v1/forecast\?latitude=51\.51&longitude=-0\.13&current=temperature_2m
Check the URL carefully: `latitude=51.51&longitude=-0.13&current=temperature_2m`
@@hint if\s*\(\s*!\s*res\.ok\s*\)\s*throw\s+new\s+Error\(
Line 2: `if (!res.ok) throw new Error(...)`. The `!` means "not".
@@hint `HTTP \$\{res\.status\}`
The error message is a template literal: backtick, `HTTP `, then the status in `${ }`, then a backtick.
@@hint const\s+data\s*=\s*await\s+res\.json\(\s*\)
Line 3: `const data = await res.json();`
@@hint data\.current\.temperature_2m
Line 4: `console.log(data.current.temperature_2m);`
:::

## Running requests in parallel

```js
const [products, reviews] = await Promise.all([
  fetch('/api/products').then((r) => r.json()),
  fetch('/api/reviews').then((r) => r.json()),
]);
```

Both requests run at the same time, so this is roughly twice as fast as awaiting them one after another.

## Sending data

```js
await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ada@example.com' }),
});
```

## Loading, error and empty states

Every piece of UI that loads data has at least four states. Professionals design all of them:

| State | Show |
|---|---|
| Loading | A skeleton or spinner |
| Error | A clear message and a retry button |
| Empty | A helpful message ("No orders yet") |
| Success | The data |

## Other modern essentials

```js
const city = user?.address?.city;          // optional chaining: undefined instead of crashing
const qty = input.value || 1;              // fallback for any falsy value ('' or 0)
const discount = order.discount ?? 0;      // fallback only for null/undefined (keeps 0)
const label = isSale ? 'Sale' : 'New';     // ternary: a one-line if/else
```

:::tip CORS errors
"Blocked by CORS policy" means the server you called does not allow browsers on other websites to read its responses. It is a server setting, not a bug in your fetch code. Solutions: use an API that allows it, or call it from your own back end.
:::

:::exercise Optional chaining and a default
@@file city.js
@@prompt
This user has no address. Read the city safely, with `'Unknown'` as the fallback. Three lines:

1. `const user = { name: 'Ada' };`
2. `const city = user.address?.city ?? 'Unknown';`
3. `console.log(city);`
@@solution
const user = { name: 'Ada' };
const city = user.address?.city ?? 'Unknown';
console.log(city);
@@hint const\s+user\s*=\s*\{\s*name\s*:\s*['"]Ada['"]\s*\}
Line 1: `const user = { name: 'Ada' };`
@@hint user\.address\?\.city
Use `?.` so a missing address does not crash: `user.address?.city`
@@hint \?\?\s*['"]Unknown['"]
Then the fallback with two question marks: `?? 'Unknown'`
@@explain
Without `?.`, reading `.city` of `undefined` throws a TypeError and stops the page. With it, you get `undefined`, and `??` swaps in `'Unknown'`.
:::

## Quiz

? A fetch to a missing URL returns status 404. What does the fetch promise do?
- [ ] Rejects, so the catch block runs
- [x] Resolves normally; you must check response.ok yourself
- [ ] Never settles
> fetch only rejects for network failures. Always check response.ok or response.status.

? Why use Promise.all for two independent requests?
- [x] They run at the same time, so the total wait is shorter
- [ ] It retries failed requests
- [ ] It is required for POST requests
> Awaiting one after another doubles the waiting time.

? What is the difference between `||` and `??` for defaults?
- [ ] There is none
- [x] ?? only falls back for null or undefined, so it keeps valid values like 0 and ''
- [ ] ?? is slower
> discount ?? 0 keeps a real discount of 0; discount || 10 would replace 0 with 10.

? How do you import a named export called formatGBP from money.js?
- [ ] import formatGBP from './money.js'
- [x] import { formatGBP } from './money.js'
- [ ] require('formatGBP')
> Named exports use braces. Default exports do not.
