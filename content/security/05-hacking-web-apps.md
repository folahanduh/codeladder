---
id: sec-web-attacks
title: "Hacking web apps: the OWASP Top 10 in practice"
level: intermediate
minutes: 40
summary: Attack and fix injection, XSS, broken access control, path traversal and SSRF, using the same tools professional penetration testers use.
---

## From knowing to doing

The Web Development track's [security lesson](#lesson-web-security) explained the main attacks. This one is hands-on: you will learn how testers actually find them, and practise fixing them in code. Every dApp has a web front end and usually an API, so this is blockchain security too.

## The tester's toolkit

- **Browser DevTools**: see and replay every request.
- **An intercepting proxy** (Burp Suite Community or OWASP ZAP): sits between your browser and the site so you can pause, edit and replay requests. This is the core tool of web testing.
- **A safe target**: run **OWASP Juice Shop**, a deliberately vulnerable online shop, on your own machine with Docker:

```bash
docker run --rm -p 3001:3000 bkimminich/juice-shop
# then open http://localhost:3001 (and find its hidden score board)
```

- **PortSwigger Web Security Academy**: free, excellent labs for every vulnerability class.

## The big five, attacker's view

| Attack | What the tester tries | The fix |
|---|---|---|
| **Broken access control / IDOR** | Change `/api/orders/1001` to `1002`; call admin endpoints as a normal user | Check ownership and role on the server for every request |
| **Injection (SQL, command)** | Type `' OR '1'='1` or `; ls` into inputs | Parameterised queries; never build commands from strings |
| **Cross-site scripting (XSS)** | Submit `<img src=x onerror=alert(1)>` in a name or comment | Escape output; `textContent` not `innerHTML`; Content-Security-Policy |
| **Path traversal** | Request `/files/../../etc/passwd` | Resolve the full path and check it stays inside the allowed folder |
| **SSRF** | Make the server fetch `http://169.254.169.254/` (cloud metadata) or internal URLs | Allow-list destinations; block internal IP ranges |

## Fix it: escaping HTML

If user input must go into HTML, escape the characters that have special meaning.

:::exercise Write an HTML escaping function
@@file escape.js
@@prompt
Write `escapeHtml(text)` that replaces `&`, `<`, `>` and `"` with their HTML entities, then test it on a classic XSS payload. Replace `&` first (otherwise you would double-escape the others). Write it exactly in this shape:

```js
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
console.log(escapeHtml('<img src=x onerror=alert(1)>'));
```
@@solution
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
console.log(escapeHtml('<img src=x onerror=alert(1)>'));
@@hint function\s+escapeHtml\s*\(\s*text\s*\)\s*\{
Line 1: `function escapeHtml(text) {`
@@hint return\s+text\s*$
Line 2 is just `return text` with the chained calls on the following lines.
@@hint \.replace\(\s*/&/g\s*,\s*['"]&amp;['"]\s*\)
First replacement: `.replace(/&/g, '&amp;')`
@@hint \.replace\(\s*/</g\s*,\s*['"]&lt;['"]\s*\)
Then `.replace(/</g, '&lt;')`
@@hint \.replace\(\s*/>/g\s*,\s*['"]&gt;['"]\s*\)
Then `.replace(/>/g, '&gt;')`
@@hint \.replace\(\s*/"/g\s*,\s*['"]&quot;['"]\s*\)
Then `.replace(/"/g, '&quot;');` with the semicolon ending the return.
@@explain
Output: `&lt;img src=x onerror=alert(1)&gt;`. The browser now displays the text instead of creating an image tag that runs JavaScript. In real projects, prefer your framework's built-in escaping (React does it automatically) or a library like DOMPurify when you must allow some HTML.
:::

## Fix it: path traversal

This site's own `scripts/serve.mjs` has to stop `../` tricks. The safe pattern: resolve the requested path to an absolute one, then confirm it is still inside the folder you meant to serve.

:::exercise Block path traversal in Node
@@file server.js
@@run false
@@prompt
Write the three-part check used by a safe static file server (`path`, `root`, `urlPath` and `res` already exist):

```js
const filePath = path.resolve(root, '.' + urlPath);
if (!filePath.startsWith(root + path.sep)) {
  return res.writeHead(403).end('Forbidden');
}
```
@@solution
const filePath = path.resolve(root, '.' + urlPath);
if (!filePath.startsWith(root + path.sep)) {
  return res.writeHead(403).end('Forbidden');
}
@@hint const\s+filePath\s*=\s*path\.resolve\(\s*root\s*,\s*['"]\.['"]\s*\+\s*urlPath\s*\)
Line 1: `const filePath = path.resolve(root, '.' + urlPath);`
@@hint if\s*\(\s*!\s*filePath\.startsWith\(\s*root\s*\+\s*path\.sep\s*\)\s*\)\s*\{
Line 2: `if (!filePath.startsWith(root + path.sep)) {` The separator stops `/var/www-evil` matching `/var/www`.
@@hint return\s+res\.writeHead\(\s*403\s*\)\.end\(\s*['"]Forbidden['"]\s*\)
Line 3: `return res.writeHead(403).end('Forbidden');`
@@explain
`path.resolve` collapses every `..`, so `/files/../../etc/passwd` becomes `/etc/passwd`, which does not start with your root folder, so it is refused. Checking the raw string for `..` instead is a classic mistake: attackers encode it (`%2e%2e`) to slip past.
:::

## How professionals report what they find

A finding is only useful if someone can act on it:

1. **Title**: "IDOR in /api/orders lets any user read any order".
2. **Severity**: impact times likelihood (critical, high, medium, low).
3. **Steps to reproduce**: exact requests, so the developer can see it themselves.
4. **Impact**: what an attacker gains, in business terms.
5. **Fix**: specific, with code where possible.

You will practise this format in the [Secure the Shop hackathon](#hackathons).

## Quiz

? What is the core tool of manual web testing?
- [ ] A port scanner
- [x] An intercepting proxy like Burp Suite or OWASP ZAP
- [ ] A password manager
> Proxies let you pause, modify and replay every request between browser and server.

? Why must & be escaped first in an HTML escaping function?
- [x] Otherwise the & in already-created entities like &lt; would be escaped again
- [ ] Because & is the most dangerous character
- [ ] Order does not matter
> Escaping & last would turn &lt; into &amp;lt;.

? A server checks `if (url.includes('..')) refuse`. Why is that weak?
- [ ] It blocks too much
- [x] Attackers can encode the dots (for example %2e%2e) or use other tricks; resolve the real path and check it instead
- [ ] It is fine
> Check the outcome (the resolved path), not the input's spelling.

? Where should you practise these attacks?
- [ ] On any website with a login form
- [x] On your own apps, deliberately vulnerable apps like Juice Shop, and legal labs like PortSwigger Academy
- [ ] On a competitor's site, if you report the results
> Authorisation is what separates testing from crime.
