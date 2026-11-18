---
id: setup-how-web-works
title: How the web works
level: beginner
minutes: 12
summary: Browsers, servers, URLs, DNS and HTTP, explained with a single click on a link.
---

## What happens when you visit a website

You type `https://shop.example.com/products?colour=red` and press Enter. In under a second:

1. Your **browser** (the client) asks **DNS** which IP address `shop.example.com` lives at. DNS is the internet's phone book.
2. The browser opens a secure connection (the **S** in HTTPS means encrypted with TLS) to the **server** at that address.
3. It sends an **HTTP request**: "GET /products?colour=red please".
4. The server runs some code, maybe reads a database, and sends back an **HTTP response**: a status code plus some HTML.
5. The browser reads the HTML, then requests every CSS file, JavaScript file and image it mentions.
6. It builds the page and runs the JavaScript, which might fetch even more data.

:::exercise Ask a DNS server for an address
@@file dns.js
@@prompt
Step 1 above is a **DNS lookup**: turning a name into an IP address. You can do one yourself. Google runs a public DNS service you can ask over HTTPS, and it answers in JSON. Write three lines:

1. `const res = await fetch('https://dns.google/resolve?name=example.com&type=A');`
2. `const data = await res.json();`
3. `console.log(data.Answer[0].data);`

`fetch` sends an HTTP request, and `await` means "wait for the reply". Live requests work when you run Code Ladder on your own computer; the hosted preview may block them.
@@solution
const res = await fetch('https://dns.google/resolve?name=example.com&type=A');
const data = await res.json();
console.log(data.Answer[0].data);
@@hint const\s+res\s*=\s*await\s+fetch\(
Line 1 starts `const res = await fetch(`
@@hint dns\.google/resolve\?name=example\.com&type=A
The address, in quotes, is `'https://dns.google/resolve?name=example.com&type=A'`. Check the `?` and the `&`.
@@hint const\s+data\s*=\s*await\s+res\.json\(\s*\)
Line 2: `const data = await res.json();` turns the reply into data you can read.
@@hint data\.Answer\[\s*0\s*\]\.data
Line 3: the IP address is at `data.Answer[0].data`. Capital A on `Answer`.
@@explain
`fetch` sends an HTTP GET request asking: what is the **A record** (IPv4 address) for example.com? The JSON reply has an `Answer` list, and the first answer's `data` is the IP address. Your browser does this lookup automatically, in milliseconds, for every new domain you visit.
:::

## Anatomy of a URL

| Part | Example | Meaning |
|---|---|---|
| Protocol | `https://` | How to talk (encrypted HTTP) |
| Domain | `shop.example.com` | Which server (via DNS) |
| Path | `/products` | Which resource on that server |
| Query string | `?colour=red` | Extra options, as key=value pairs |
| Fragment | `#reviews` | A spot within the page (never sent to the server) |

:::exercise Take a URL apart
@@file url.js
@@prompt
JavaScript can split any URL into the parts in the table above. Write four lines:

1. `const url = new URL('https://shop.example.com/products?colour=red');`
2. Print `url.hostname`
3. Print `url.pathname`
4. Print `url.searchParams.get('colour')`
@@solution
const url = new URL('https://shop.example.com/products?colour=red');
console.log(url.hostname);
console.log(url.pathname);
console.log(url.searchParams.get('colour'));
@@hint const\s+url\s*=\s*new\s+URL\(
Line 1 starts `const url = new URL(` (URL in capitals).
@@hint shop\.example\.com/products\?colour=red
The URL in quotes: `'https://shop.example.com/products?colour=red'`
@@hint console\.log\(\s*url\.hostname\s*\)
Line 2: `console.log(url.hostname);`
@@hint console\.log\(\s*url\.pathname\s*\)
Line 3: `console.log(url.pathname);`
@@hint url\.searchParams\.get\(\s*['"]colour['"]\s*\)
Line 4: `console.log(url.searchParams.get('colour'));` Capital P in `searchParams`.
@@explain
Output: `shop.example.com` (the domain DNS looks up), `/products` (the path), and `red` (from the query string). Every web framework does this splitting for you behind the scenes.
:::

## HTTP methods and status codes

Requests use a **method** to say what they want:

- `GET`: read something (load a page, fetch products)
- `POST`: create something (submit an order)
- `PUT` / `PATCH`: update something
- `DELETE`: remove something

Responses carry a **status code**. Learn these by heart:

| Code | Meaning | You will see it when |
|---|---|---|
| 200 | OK | Everything worked |
| 301 / 302 | Redirect | A page moved |
| 400 | Bad request | You sent invalid data |
| 401 / 403 | Not logged in / not allowed | Auth problems |
| 404 | Not found | Wrong URL |
| 500 | Server error | The server's code crashed |

## The three languages of the browser

- **HTML** is the structure and content: headings, paragraphs, images, buttons.
- **CSS** is the presentation: colours, fonts, layout, animation.
- **JavaScript** is the behaviour: respond to clicks, fetch data, update the page.

Think of a house: HTML is the walls and rooms, CSS is the paint and furniture, JavaScript is the electricity and plumbing.

## Front end, back end, and where blockchain fits

- The **front end** runs in the user's browser. Anyone can view its code (right-click, View Source).
- The **back end** runs on servers you control: databases, payments, secrets. Users cannot see it.
- A **blockchain** is like a shared back end that nobody owns. Smart contracts are programs stored on it, and your front end talks to them through the user's wallet.

:::try See it for yourself
Open any website, press [[F12]] (or right-click and choose Inspect), go to the **Network** tab and refresh. Every line is one HTTP request. Click one to see its method, status code, headers and response.
:::

## Quiz

? What does DNS do?
- [ ] Encrypts your connection
- [x] Turns a domain name into the IP address of a server
- [ ] Stores the website's HTML
> DNS is the internet's phone book: names in, addresses out.

? A page loads but shows "404". What happened?
- [ ] The server crashed
- [ ] You are not logged in
- [x] The server could not find anything at that URL
> 404 means Not Found. 500 would mean the server crashed, 401 or 403 would be an auth problem.

? Which part of the browser stack controls behaviour, like what happens when you click "Add to bag"?
- [ ] HTML
- [ ] CSS
- [x] JavaScript
> HTML is structure, CSS is presentation, JavaScript is behaviour.

? Why must API keys and database passwords live on the back end, never in front-end code?
- [x] Anyone can read front-end code in their browser
- [ ] Front-end code runs too slowly
- [ ] Browsers delete secrets automatically
> Everything sent to the browser can be inspected. Secrets belong on servers.
