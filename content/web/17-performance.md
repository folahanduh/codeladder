---
id: web-performance
title: Performance and Core Web Vitals
level: advanced
minutes: 30
summary: Measure what users feel, then fix images, fonts, JavaScript and loading order to make sites fast.
---

## Why speed sells

Slow sites lose visitors and sales. Shoppers abandon pages that take more than a few seconds to load, and Google uses page experience signals in rankings. For brand and e-commerce clients, performance work has a direct, measurable return, which makes it an excellent service to sell.

## Measure first: Core Web Vitals

Google's three user-centred metrics, measured on real visitors:

| Metric | Measures | Good |
|---|---|---|
| **LCP** (Largest Contentful Paint) | When the main content (often the hero image) appears | Under 2.5 s |
| **INP** (Interaction to Next Paint) | How quickly the page responds to taps and clicks | Under 200 ms |
| **CLS** (Cumulative Layout Shift) | How much things jump around while loading | Under 0.1 |

Tools: Chrome DevTools **Lighthouse** and **Performance** panels (lab data), and **PageSpeed Insights** (pagespeed.web.dev), which also shows real-user data for popular sites. Always test with mobile throttling: your users are not on your laptop's Wi-Fi.

## Fix 1: images (usually the biggest win)

```html
<!-- the hero: load it early, at high priority -->
<img src="/hero-1600.avif"
     srcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
     sizes="100vw"
     width="1600" height="900"
     alt="Model in the sage wrap dress on a London street"
     fetchpriority="high">

<!-- everything below the fold: lazy -->
<img src="/look-2.webp" width="800" height="1000" alt="..." loading="lazy" decoding="async">
```

- Use modern formats: **AVIF** or **WebP** are typically far smaller than JPEG or PNG.
- Serve the right size with `srcset` and `sizes`. A phone does not need a 4000px image.
- Always set `width` and `height` (or `aspect-ratio`) to prevent layout shift.
- Never lazy-load the LCP image; give it `fetchpriority="high"`.
- Next.js `<Image>` and services like Cloudinary or Shopify's CDN do most of this automatically.

## Fix 2: fonts

- Use one or two families, and only the weights you need.
- Self-host or use `next/font`, and set `font-display: swap` so text shows immediately.
- Preload the main font file.

## Fix 3: JavaScript

JavaScript is the most expensive byte: it must be downloaded, parsed and executed, which blocks interactions (hurting INP).

- Ship less: question every dependency (`npx vite-bundle-visualizer` shows what is big).
- Split code: load heavy components only when needed with `import()` or `React.lazy`.
- Keep work off the main thread: break long tasks up, debounce input handlers.
- Audit third-party scripts (chat widgets, trackers, review widgets). They are often the slowest thing on a shop site; load them late or remove them.

## Fix 4: loading order and caching

- Put scripts at the end or use `defer` / `type="module"`.
- Inline small critical CSS; avoid huge render-blocking stylesheets.
- Use a CDN (Vercel, Netlify and Cloudflare do this by default).
- Cache static assets for a long time with hashed file names (`app.3f9a1c.js`), which build tools generate.

## Fix 5: layout stability

- Reserve space for images, embeds and ads.
- Do not insert banners above existing content after load.
- Use `transform` for animations, not properties like `top` or `height`.

:::pro The performance audit as a service
Run PageSpeed Insights on a prospect's site, screenshot the mobile score, then list three specific fixes with estimated impact ("Hero image is 2.4 MB; converting to AVIF at the right size should cut LCP by about 2 seconds"). Concrete numbers win clients far more often than vague promises.
:::

## Quiz

? Which metric measures when the main content, often the hero image, becomes visible?
- [x] LCP
- [ ] CLS
- [ ] INP
> Largest Contentful Paint. Good is under 2.5 seconds.

? Products jump down the page when a banner loads in. Which metric suffers?
- [ ] LCP
- [x] CLS
- [ ] INP
> Cumulative Layout Shift measures unexpected movement. Reserve space for late content.

? Should the hero image use loading="lazy"?
- [ ] Yes, lazy loading is always faster
- [x] No: the LCP image should load immediately with fetchpriority="high"
- [ ] Only on mobile
> Lazy-loading the main image delays LCP. Lazy-load only below-the-fold images.

? What usually gives the biggest performance win on image-heavy shop sites?
- [ ] Minifying HTML
- [x] Serving correctly sized, modern-format images
- [ ] Removing CSS comments
> Images are typically most of the page weight.
