---
id: keys-oauth
title: Third-party APIs and OAuth done safely
level: intermediate
minutes: 45
summary: How OAuth 2.0 and "Sign in with..." really work, the attacks against them (consent phishing, stolen tokens, CSRF, open redirects), and the code that defends your app, including PKCE and state.
---

## Why OAuth exists

You want an app to post to your X account, read your GitHub repos, or access your Google Drive, **without giving it your password**. OAuth 2.0 lets you grant a limited, revocable permission instead. "Sign in with Google/GitHub/X" is built on the same flow, with OpenID Connect (OIDC) adding an identity token.

## The four roles

| Role | Example |
|---|---|
| **Resource owner** | You |
| **Client** | The third-party app asking for access |
| **Authorisation server** | GitHub's or Google's login and consent screens |
| **Resource server** | The API holding your data |

## The authorisation code flow with PKCE

```text
1. App creates a random code_verifier and its SHA-256 code_challenge, plus a random state.
2. App sends you to the provider:  /authorize?client_id=..&redirect_uri=..&scope=..&state=..&code_challenge=..
3. You log in to the PROVIDER (not the app) and approve the listed scopes.
4. Provider redirects back:        https://app.example/callback?code=..&state=..
5. App checks state matches, then exchanges code + code_verifier for tokens (server to server).
6. App calls the API with the access token; uses the refresh token to get new ones later.
```

- **state** ties the callback to the login *this* browser started, blocking CSRF login attacks.
- **PKCE** (Proof Key for Code Exchange) means a stolen authorisation `code` is useless without the `code_verifier`, which never left the app. It is required for mobile and single-page apps, and recommended for every client.

:::exercise Generate a PKCE verifier and challenge
@@file pkce.js
@@prompt
Create a PKCE pair with the Web Crypto API. Five lines:

1. `const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');`
2. `const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));`
3. `const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));`
4. `const challenge = b64url(new Uint8Array(digest));`
5. `console.log({ verifier, challenge });`
@@solution
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
const challenge = b64url(new Uint8Array(digest));
console.log({ verifier, challenge });
@@hint const\s+b64url\s*=\s*\(\s*bytes\s*\)\s*=>\s*btoa\(\s*String\.fromCharCode\(\s*\.\.\.bytes\s*\)\s*\)
Line 1 starts `const b64url = (bytes) => btoa(String.fromCharCode(...bytes))`
@@hint \.replace\(\s*/\\\+/g\s*,\s*['"]-['"]\s*\)\.replace\(\s*/\\//g\s*,\s*['"]_['"]\s*\)\.replace\(\s*/=\+\$/\s*,\s*['"]['"]\s*\)
then turn Base64 into Base64URL: `.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')`
@@hint const\s+verifier\s*=\s*b64url\(\s*crypto\.getRandomValues\(\s*new\s+Uint8Array\(\s*32\s*\)\s*\)\s*\)
Line 2: 32 random bytes: `b64url(crypto.getRandomValues(new Uint8Array(32)))`
@@hint crypto\.subtle\.digest\(\s*['"]SHA-256['"]\s*,\s*new\s+TextEncoder\(\s*\)\.encode\(\s*verifier\s*\)\s*\)
Line 3 hashes the verifier: `await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))`
@@hint const\s+challenge\s*=\s*b64url\(\s*new\s+Uint8Array\(\s*digest\s*\)\s*\)
Line 4: `const challenge = b64url(new Uint8Array(digest));`
@@hint console\.log\(\s*\{\s*verifier\s*,\s*challenge\s*\}\s*\)
Line 5: `console.log({ verifier, challenge });`
@@explain
Send `challenge` (with `code_challenge_method=S256`) in step 2; keep `verifier` private and send it only in the server-side token exchange of step 5. An attacker who intercepts the code cannot reverse the hash to get the verifier.
:::

## Checking the callback

:::exercise Reject a forged callback
@@file callback.js
@@run false
@@prompt
In your callback handler, refuse any request whose `state` does not match the one saved in the user's session. Three lines:

```js
if (url.searchParams.get('state') !== session.oauthState) {
  throw new Error('OAuth state mismatch: possible CSRF');
}
```
@@solution
if (url.searchParams.get('state') !== session.oauthState) {
  throw new Error('OAuth state mismatch: possible CSRF');
}
@@hint if\s*\(\s*url\.searchParams\.get\(\s*['"]state['"]\s*\)\s*!==\s*session\.oauthState\s*\)\s*\{
Line 1: `if (url.searchParams.get('state') !== session.oauthState) {`
@@hint throw\s+new\s+Error\(\s*['"]OAuth state mismatch: possible CSRF['"]\s*\)
Line 2: `throw new Error('OAuth state mismatch: possible CSRF');`
:::

## Attacks on OAuth, and the defences

| Attack | How it works | Defence |
|---|---|---|
| **Consent phishing** | A malicious app with a convincing name asks you to grant broad scopes ("CodeReview Pro wants repo, workflow, admin:org"). No password is stolen; you hand over a token. | Read the scopes; organisations restrict which third-party apps members can authorise; review authorised apps regularly |
| **Token theft** | Access or refresh tokens leak from logs, `localStorage`, a breached vendor or a compromised integration | Store tokens server-side and encrypted; short-lived access tokens; **refresh token rotation**; revoke on suspicion |
| **CSRF login / code injection** | An attacker makes your browser complete *their* OAuth flow | `state` (and PKCE) checked on callback |
| **Open redirect / redirect URI tricks** | Provider sends the code to an attacker-controlled URL | Register exact redirect URIs, never wildcards; validate exactly |
| **Over-scoped tokens** | A harmless feature holds god-mode access | Request the minimum scopes; incremental consent |
| **ID token misuse (OIDC)** | Accepting a token meant for another app, expired or unsigned | Verify signature, `iss`, `aud` (your client ID), `exp` and `nonce` |

:::warn Changing your password does not revoke OAuth apps
If you granted a malicious app access, changing your password leaves its token working on many platforms. You must **revoke the app's authorisation** (on GitHub: Settings, Applications, Authorised OAuth Apps), then rotate anything it could reach. The [Critical Moment](#critical-moment) simulator has a scenario built on exactly this.
:::

## Using third-party APIs from your own code

- **Keys belong on the server.** If the browser needs data, your server calls the API and returns only what is needed.
- **Prefer short-lived, scoped credentials**: GitHub Apps with fine-grained permissions over classic personal access tokens; OIDC federation from CI to cloud instead of long-lived cloud keys.
- **Verify webhooks** (HMAC signatures, see the applied cryptography lesson) before trusting them.
- **Assume vendors get breached**: one integration's leaked token should not unlock everything.

## Quiz

? What does PKCE protect against?
- [ ] Weak passwords
- [x] An attacker who steals the authorisation code exchanging it for tokens
- [ ] Phishing emails
> Without the code_verifier, the intercepted code is useless.

? What is the state parameter for?
- [x] Tying the callback to the login this browser started, blocking CSRF
- [ ] Storing the user's country
- [ ] Encrypting the access token
> Generate it randomly, save it in the session, and compare on return.

? You authorised a fake "CodeReview Pro" GitHub app. What actually stops it?
- [ ] Changing your GitHub password
- [x] Revoking the app's authorisation, then rotating secrets it could have reached
- [ ] Logging out of GitHub
> The app holds its own token; only revocation kills it.

? Where should your app store users' OAuth refresh tokens?
- [ ] In localStorage
- [ ] In a cookie readable by JavaScript
- [x] Server-side, encrypted at rest, with rotation and revocation
> Refresh tokens are long-lived keys to the user's account on another service.
