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
