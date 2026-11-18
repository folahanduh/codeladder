---
id: web-security
title: Authentication and web security
level: advanced
minutes: 35
summary: The attacks that actually happen (XSS, injection, CSRF, broken access control) and the habits that stop them.
---

## Think like an attacker

Every input to your system is a potential attack: form fields, URL parameters, headers, cookies, uploaded files, webhooks, even data from your own database if users wrote it. The **OWASP Top 10** lists the most common web risks. These are the ones you will meet first.

## 1. Broken access control (the most common)

The server must check **on every request** that this user is allowed to do this thing to this data.

```ts
// BAD: anyone logged in can read any order by changing the id in the URL
const order = await db.order.findUnique({ where: { id: params.id } });

// GOOD: scope the query to the current user
const order = await db.order.findFirst({ where: { id: params.id, customerId: session.user.id } });
if (!order) return notFound();
```

Hiding a button in the UI is not security. Attackers call your API directly.

:::exercise Scope the query to the user
@@file orders.ts
@@prompt
Fix broken access control. Write the safe version that only finds the order if it belongs to the logged-in user, and returns `notFound()` otherwise:

1. `const order = await db.order.findFirst({`
2. `where: { id: params.id, customerId: session.user.id },`
3. `});`
4. `if (!order) return notFound();`
@@solution
const order = await db.order.findFirst({
  where: { id: params.id, customerId: session.user.id },
});
if (!order) return notFound();
@@hint const\s+order\s*=\s*await\s+db\.order\.findFirst\(\s*\{
Line 1: `const order = await db.order.findFirst({`
@@hint where\s*:\s*\{\s*id\s*:\s*params\.id\s*,\s*customerId\s*:\s*session\.user\.id\s*\}
Line 2 filters by both ids: `where: { id: params.id, customerId: session.user.id },`
@@hint ^\s*\}\s*\)\s*;?\s*$
Line 3 closes the object and the call: `});`
@@hint if\s*\(\s*!\s*order\s*\)\s*return\s+notFound\(\s*\)
Line 4: `if (!order) return notFound();`
@@explain
Someone changing the id in the URL now gets a 404 instead of a stranger's order. Returning "not found" rather than "forbidden" also avoids confirming the order exists.
:::

## 2. Injection

Untrusted input interpreted as code: SQL injection, command injection. Use parameterised queries or an ORM, never string-build commands, and validate input with a schema (Zod) at every entry point.

## 3. Cross-site scripting (XSS)

An attacker gets their script to run on your page, then steals sessions or acts as the user.

- Use `textContent`, not `innerHTML`, for user content. React escapes text by default; avoid `dangerouslySetInnerHTML` unless you sanitise with a library like DOMPurify.
- Set a **Content-Security-Policy** header to restrict which scripts may run.
- Never put user input into `href` without checking it is `https:` (a `javascript:` URL runs code).

## 4. Cross-site request forgery (CSRF)

Another site tricks a logged-in user's browser into sending a request to yours. Defences: `SameSite=Lax` or `Strict` cookies (the modern default), CSRF tokens on forms, and never changing data on `GET` requests. Frameworks like Next.js server actions include protections; know what yours does.

## Authentication done right

**Do not build password auth from scratch** for real projects. Use a well-maintained library or service: Auth.js, Better Auth, Clerk, Supabase Auth, Firebase Auth. They handle the many subtle details.

If you must store passwords, understand the rules:

- **Never** store plain passwords or encrypt them. **Hash** them with a slow, salted algorithm designed for passwords: **Argon2id** or **bcrypt**. (SHA-256 alone is far too fast; attackers can try billions per second.)
- Rate-limit login attempts.
- Offer multi-factor authentication and passkeys.

Sessions:

```text
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

- `HttpOnly`: JavaScript cannot read it, so XSS cannot steal it.
- `Secure`: only sent over HTTPS.
- `SameSite`: limits cross-site sending (CSRF defence).

:::exercise A secure session cookie
@@file Response header
@@lang text
@@run false
@@prompt
Write the response header that sets a `session` cookie with value `abc123`, plus these flags in this order: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Separate parts with a semicolon and a space.
@@solution
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
@@hint ^\s*Set-Cookie\s*:\s*session=abc123
Start: `Set-Cookie: session=abc123`
@@hint ;\s*HttpOnly\s*;\s*Secure
then `; HttpOnly; Secure`
@@hint ;\s*SameSite=Lax\s*;\s*Path=/\s*$
then `; SameSite=Lax; Path=/`
:::

## Secrets and dependencies

- Secrets live in environment variables, never in Git, never in front-end code.
- Rotate any key that might have leaked.
- Keep dependencies updated (`npm audit`, Dependabot or Renovate on GitHub).
- Give every service the least privilege it needs: a read-only database user for analytics, a restricted API key for each integration.

## Security headers worth setting

| Header | Protects against |
|---|---|
| `Content-Security-Policy` | XSS, unwanted third-party scripts |
| `Strict-Transport-Security` | Downgrade to insecure HTTP |
| `X-Content-Type-Options: nosniff` | Browsers guessing file types |
| `Referrer-Policy: strict-origin-when-cross-origin` | Leaking URLs to other sites |
| `frame-ancestors` (in CSP) | Clickjacking (your site in a hidden frame) |

:::pro A security review checklist for every feature
Who can call this? What if they are not logged in? What if they change the id? What if the input is huge, empty, negative, or contains HTML? What happens if it is called 1,000 times a minute? What do the logs reveal? Ask these six questions and you will catch most vulnerabilities before they ship.
:::

## Quiz

? A logged-in user changes /orders/1001 to /orders/1002 and sees someone else's order. What is this?
- [ ] XSS
- [x] Broken access control
- [ ] CSRF
> The server failed to check that the order belongs to the current user. Scope every query.

? How should user passwords be stored?
- [ ] Encrypted with AES
- [ ] Hashed with plain SHA-256
- [x] Hashed with a slow, salted password algorithm like Argon2id or bcrypt
> Password hashes must be deliberately slow so stolen databases cannot be brute-forced quickly.

? What does the HttpOnly cookie flag do?
- [x] Stops JavaScript reading the cookie, so XSS cannot steal the session
- [ ] Forces HTTPS
- [ ] Deletes the cookie after one hour
> HttpOnly protects session cookies from scripts. Secure is the HTTPS one.

? You hide the "Delete product" button from non-admins. Is the delete endpoint now secure?
- [ ] Yes, they cannot see the button
- [x] No: the server must check the user is an admin on every request
- [ ] Only if the button is also disabled
> Attackers call APIs directly. Authorisation lives on the server.
