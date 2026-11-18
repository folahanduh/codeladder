---
id: web-deploy
title: Deploying your site to the internet
level: intermediate
minutes: 25
summary: Get a real URL with GitHub Pages, Vercel or Netlify, connect a custom domain, and ship with confidence.
---

## Static versus dynamic sites

- A **static** site is just files (HTML, CSS, JS, images). Any file host can serve it, usually free: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
- A **dynamic** site runs server code per request (a Next.js app with an API, a database). It needs a platform that runs code: Vercel, Netlify Functions, Railway, Render, Fly.io, or your own server.

## Option 1: GitHub Pages (plain HTML/CSS/JS)

1. Push your project to GitHub.
2. Open the repository's **Settings, Pages**.
3. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait a minute. Your site is at `https://<username>.github.io/<repo>/`.

## Option 2: Vercel or Netlify (anything with a build step)

Connect your GitHub repo in their dashboard. They detect the framework (Vite, Next.js, Astro), run the build, and give you a URL. Every push to `main` deploys automatically, and every pull request gets its own **preview URL** you can share with a client before going live.

From the terminal:

```bash
npm install -g vercel
vercel          # first deploy creates a preview
vercel --prod   # deploy to production
```

Build settings for a Vite project: build command `npm run build`, output folder `dist`.

## Custom domains

1. Buy a domain from a registrar (Cloudflare, Namecheap, Porkbun, Google-partner registrars).
2. In your host's dashboard, add the domain. It will tell you which **DNS records** to create.
3. In the registrar's DNS settings, add them. Typically:

| Record | Name | Value | Purpose |
|---|---|---|---|
| `A` | `@` | An IP address from your host | Points the root domain (brand.com) |
| `CNAME` | `www` | A hostname from your host | Points www.brand.com |

4. Wait for DNS to propagate (minutes, occasionally hours). HTTPS certificates are issued automatically.

## Environment variables in production

Secrets (API keys, database URLs) are set in the host's dashboard, never committed. In Vite, only variables starting with `VITE_` are exposed to the browser, and anything exposed to the browser is public. Keep real secrets server-side.

## Pre-launch checklist

- Title and meta description on every page; a share image (`og:image`) so links look good on social media.
- A favicon.
- Works at 375px wide, on a real phone.
- Lighthouse scores checked (performance, accessibility, best practices, SEO).
- Forms actually send somewhere, with success and error messages.
- A 404 page.
- Analytics installed (Plausible, Vercel Analytics or Google Analytics), with a cookie notice if required.
- Images compressed (WebP or AVIF) and sized correctly.

:::pro Preview deployments sell
For client work, send a preview URL rather than screenshots. Clients click around on their own phones, give better feedback, and see you as a professional. Always deploy a preview of every change before it goes to production.
:::

## Quiz

? Which hosting option can serve a plain HTML, CSS and JavaScript site for free with no build step?
- [x] GitHub Pages
- [ ] Only a paid virtual server
- [ ] A database host
> Static sites are just files. GitHub Pages, Netlify, Vercel and Cloudflare Pages all host them free.

? You want www.brandname.com to point at your Vercel site. What do you change?
- [ ] The HTML title
- [x] DNS records at your domain registrar
- [ ] Your package.json
> DNS maps names to servers. The host tells you which records to add.

? A Vite variable named VITE_STRIPE_SECRET is used in front-end code. What is the problem?
- [ ] Nothing, VITE_ variables are encrypted
- [x] Anything exposed to the browser is public, so the secret key is leaked
- [ ] Vite will refuse to build
> Only publishable keys belong in front-end code. Secret keys stay on the server.
