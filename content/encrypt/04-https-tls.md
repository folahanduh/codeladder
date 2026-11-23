---
id: enc-https
title: HTTPS and TLS done right
level: intermediate
minutes: 35
summary: What TLS actually guarantees, forcing HTTPS with redirects and HSTS, secure cookies, encrypting connections between your own services, and watching certificate logs for attacks on your domain.
---

## What TLS gives you

HTTPS is HTTP inside **TLS** (Transport Layer Security). Every HTTPS connection gets three guarantees:

1. **Confidentiality**: nobody on the network can read the traffic.
2. **Integrity**: nobody can change it in transit without the connection failing.
3. **Authentication**: the server proved it owns the domain, using a **certificate** signed by a certificate authority (CA) your browser trusts.

TLS uses both kinds of encryption: a public-key **handshake** (with forward secrecy, so recording traffic today does not help an attacker who steals the server's key later) agrees a fresh symmetric key, and then fast **AES-GCM** or **ChaCha20-Poly1305** encrypts the actual data. Use **TLS 1.3** where you can, TLS 1.2 at minimum, and nothing older.

## Getting certificates

- Hosting platforms (Vercel, Netlify, Cloudflare, GitHub Pages) issue and renew certificates automatically. Just make sure HTTPS is enforced.
- On your own server, **Let's Encrypt** gives free certificates, and tools like **Caddy** (automatic) or **certbot** renew them for you. Certificates are short-lived on purpose, so automate renewal and alert if it fails.

## Never allow plain HTTP

Serving HTTPS is not enough if the first request goes out over HTTP. On café Wi-Fi an attacker can intercept that first request and keep you on an HTTP copy of the site (an "SSL stripping" attack). Two defences:

1. **Redirect** every `http://` request to `https://` (status 301 or 308).
2. Send the **HSTS** header (HTTP Strict Transport Security). It tells the browser: for this domain, *never* use HTTP again, and never let the user click through a certificate warning.

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

`max-age` is in seconds (two years here). `includeSubDomains` covers every subdomain. `preload` lets you submit the domain to the browsers' built-in list at hstspreload.org, so even the very first visit is protected.

:::exercise Send the HSTS header from Express
@@file server.js
@@run false
@@prompt
Add a middleware that sends HSTS on every response. Four lines:

```js
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});
```
@@solution
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});
@@hint ^\s*app\.use\(\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>\s*\{\s*$
Line 1: `app.use((req, res, next) => {` (a middleware runs for every request).
@@hint res\.setHeader\(\s*['"]Strict-Transport-Security['"]\s*,\s*['"]max-age=63072000; includeSubDomains; preload['"]\s*\)
Line 2: `res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');`
@@hint ^\s*next\(\s*\)\s*;?\s*$
Line 3: `next();` passes the request on to your routes.
@@hint ^\s*\}\s*\)\s*;?\s*$
Line 4: close with `});`
@@explain
In practice the **helmet** package sets HSTS and several other security headers in one line (`app.use(helmet())`). Start with a short `max-age` (say a day) while testing, because once browsers have seen a long HSTS header, they will refuse HTTP for that long. Only add `preload` when every subdomain is ready for HTTPS for good.
:::

## Check any site from the terminal

:::exercise Look for HSTS on a live site
@@file Terminal
@@lang bash
@@prompt
Fetch only the response headers (`-I`), silently (`-s`), and filter for the HSTS header:

```bash
curl -sI https://launchpad.example | grep -i strict-transport-security
```

No output means the site does not send HSTS.
@@solution
curl -sI https://launchpad.example | grep -i strict-transport-security
@@hint ^\s*curl\s+-sI\s+https://launchpad\.example\s*\|
Start with `curl -sI https://launchpad.example |`
@@hint \|\s*grep\s+-i\s+strict-transport-security\s*$
Then `| grep -i strict-transport-security` (`-i` ignores upper and lower case).
@@explain
Try it against your own sites and a few big ones. For a full report on certificate, protocol versions and ciphers, run your domain through the free SSL Labs server test (ssllabs.com/ssltest).
:::

## Cookies must be HTTPS-only too

A session cookie sent once over HTTP can be stolen. Mark every session cookie:

```http
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Lax; Path=/
```

- `Secure`: only ever sent over HTTPS.
- `HttpOnly`: JavaScript cannot read it, so an XSS bug cannot steal it.
- `SameSite=Lax`: not sent on most cross-site requests, which blocks most CSRF.

Also fix **mixed content**: an HTTPS page that loads a script over HTTP undoes everything, because that script can be swapped on the network.

## Encrypt traffic between your own services

"It is inside our network" is not a security boundary. Encrypt internal connections too:

- **Databases**: require TLS and verify the certificate. For Postgres, connection strings take `sslmode=verify-full`, which checks both encryption and the server's identity.
- **RPC and APIs**: use `https://` and `wss://` endpoints, never plain HTTP, especially for anything that signs or submits transactions.
- **Service to service**: mutual TLS (both sides present certificates) is standard in larger systems and service meshes.

## Watch for attacks on your domain

Every publicly trusted certificate is recorded in public **Certificate Transparency** logs. Search yours at crt.sh. Two uses:

- **Detect mis-issuance**: a certificate for your domain you did not request means someone may control your DNS or is attacking a CA.
- **Spot phishing**: look for lookalike domains (`launchpad-claim.example`, `1aunchpad.example`) getting certificates, a common first step before a phishing campaign.

You can also publish a **CAA** DNS record that says which CAs may issue certificates for your domain:

```text
launchpad.example.  CAA  0 issue "letsencrypt.org"
```

## Quiz

? What does the HSTS header tell a browser?
- [ ] To cache the page for two years
- [x] To only ever connect to this domain over HTTPS, and to refuse to let the user bypass certificate errors
- [ ] To encrypt cookies with AES
> HSTS closes the first-request HTTP gap that SSL stripping attacks exploit.

? Why mark session cookies HttpOnly as well as Secure?
- [x] Secure keeps them off plain HTTP; HttpOnly stops JavaScript (and so XSS) from reading them
- [ ] HttpOnly makes cookies load faster
- [ ] They mean the same thing
> Each flag blocks a different way of stealing the cookie.

? Your app talks to its database inside a private cloud network. Should that connection use TLS?
- [ ] No, private networks are safe
- [x] Yes: assume the internal network can be breached, and verify the database's certificate
- [ ] Only for production
> Treating the inside of the network as trusted is how one foothold becomes a full breach.

? What can Certificate Transparency logs warn you about?
- [ ] Slow page loads
- [x] Certificates issued for your domain or lookalike domains, which can signal hijacking or phishing
- [ ] Expired passwords
> Every public certificate is logged, so attackers' certificates are visible too.
