---
id: keys-sessions
title: "Sessions, cookies and tokens: what attackers really steal"
level: beginner
minutes: 30
summary: Why stolen session cookies bypass MFA, how infostealers and adversary-in-the-middle phishing work, and how to set cookies and tokens up safely.
---

## Logging in creates a new secret

When you log in, the server checks your password and MFA **once**, then gives your browser a **session**: usually a cookie holding a long random ID, or a token like a JWT. Every later request carries it. To the server, whoever presents that session **is you**.

That is why attackers increasingly skip passwords entirely and steal sessions:

- **Infostealer malware** copies cookies straight out of the browser profile.
- **Adversary-in-the-middle (AitM) phishing** kits sit between you and the real site: you log in through their proxy, complete your real MFA, and they keep the session cookie the real site issues.
- **XSS** on a site can read any cookie that is not `HttpOnly`.
- **Network interception** captures sessions sent over plain HTTP.

## Cookie flags that matter

| Flag | Protects against |
|---|---|
| `HttpOnly` | JavaScript (and therefore XSS) reading the cookie |
| `Secure` | Sending the cookie over unencrypted HTTP |
| `SameSite=Lax` or `Strict` | Other sites making your browser send it (CSRF) |
| A short `Max-Age` plus an idle timeout | Long-lived stolen sessions |
| The `__Host-` name prefix | Subdomains setting or overriding it |

:::exercise Issue a secure session cookie
@@file session.js
@@run false
@@prompt
In an Express app, set the session cookie with every protective flag. Write it in this shape (one option per line):

```js
res.cookie('__Host-session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 8,
});
```
@@solution
res.cookie('__Host-session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 8,
});
@@hint res\.cookie\(\s*['"]__Host-session['"]\s*,\s*sessionId\s*,\s*\{
Line 1: `res.cookie('__Host-session', sessionId, {` (two underscores before Host).
@@hint httpOnly\s*:\s*true\s*,
`httpOnly: true,` (capital O).
@@hint secure\s*:\s*true\s*,
`secure: true,`
@@hint sameSite\s*:\s*['"]lax['"]\s*,
`sameSite: 'lax',` (capital S in the middle).
@@hint path\s*:\s*['"]/['"]\s*,
`path: '/',` (the `__Host-` prefix requires path `/` and secure).
@@hint maxAge\s*:\s*1000\s*\*\s*60\s*\*\s*60\s*\*\s*8\s*,
`maxAge: 1000 * 60 * 60 * 8,` (8 hours, in milliseconds).
@@hint ^\s*\}\s*\)\s*;?\s*$
Close the options object and the call: `});`
:::

## Server-side defences

- **Rotate the session ID** at login and whenever privileges change, so a session planted before login is useless.
- **Revoke every session** when the password changes, MFA changes, or the user clicks "sign out everywhere".
- **Re-authenticate** (step-up) before sensitive actions: changing email, adding a withdrawal address, creating API keys, exporting keys.
- **Watch for anomalies**: the same session suddenly used from a new country, device or network is a strong signal of theft.
- Keep tokens **out of `localStorage`** for high-value apps: any XSS can read it. An `HttpOnly` cookie cannot be read by scripts.

## JWTs are signed, not secret

A JWT's payload is only Base64URL-encoded: anyone holding the token can read it (try the JWT challenge in the [Ladder CTF](#hackathons)). Never put secrets in a JWT, always verify the signature and expiry on the server, and reject `alg: none`.

:::exercise Read a JWT's payload
@@file jwt.js
@@prompt
Decode the middle part of a JWT. Three lines:

1. `const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZGEiLCJyb2xlIjoiYWRtaW4ifQ.sig';`
2. `const payload = JSON.parse(atob(token.split('.')[1]));`
3. `console.log(payload.role);`
@@solution
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZGEiLCJyb2xlIjoiYWRtaW4ifQ.sig';
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.role);
@@hint const\s+token\s*=\s*['"]eyJhbGciOiJIUzI1NiJ9\.eyJzdWIiOiJhZGEiLCJyb2xlIjoiYWRtaW4ifQ\.sig['"]
Line 1: copy the token exactly, three parts separated by dots.
@@hint token\.split\(\s*['"]\.['"]\s*\)\[\s*1\s*\]
Take the middle part: `token.split('.')[1]`
@@hint JSON\.parse\(\s*atob\(
Decode it with `atob(...)` and parse the JSON: `JSON.parse(atob(...))`
@@hint console\.log\(\s*payload\.role\s*\)
Line 3: `console.log(payload.role);`
@@explain
It prints `admin`. Anyone can read a JWT. The security comes from the signature, which the server must check, so an attacker who edits `role` to `admin` cannot produce a valid token.
:::

## Quiz

? Why can a stolen session cookie bypass MFA?
- [ ] MFA only protects passwords on Tuesdays
- [x] MFA is checked at login; the session cookie proves login already happened
- [ ] Cookies contain the MFA code
> Protect sessions as carefully as passwords.

? Which flag stops JavaScript on the page from reading a cookie?
- [x] HttpOnly
- [ ] Secure
- [ ] SameSite
> HttpOnly blocks document.cookie access, so XSS cannot steal it.

? A user changes their password after a suspected phish. What must the server also do?
- [ ] Nothing more
- [x] Revoke all existing sessions and tokens, so a stolen session stops working
- [ ] Email them the new password
> A password change alone leaves stolen sessions valid on many systems.
