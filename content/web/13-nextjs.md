---
id: web-nextjs
title: Full-stack React with Next.js
level: advanced
minutes: 35
summary: File-based routing, server and client components, data fetching, server actions and route handlers.
---

## What Next.js adds to React

React draws UI. Next.js turns it into a full application framework:

- **File-based routing**: a folder is a URL.
- **Server rendering**: pages arrive as HTML, which is fast and great for SEO.
- **Server components**: components that run only on the server, so they can read databases and secrets directly.
- **API endpoints and server actions** in the same project.
- Image, font and script optimisation built in.

```bash
npx create-next-app@latest shop
cd shop && npm run dev
```

## The App Router: folders are routes

```text
app/
  layout.tsx              -> wraps every page (header, footer, fonts)
  page.tsx                -> /
  products/
    page.tsx              -> /products
    [slug]/
      page.tsx            -> /products/linen-wrap-dress  (dynamic segment)
  api/
    newsletter/
      route.ts            -> POST /api/newsletter
```

Special files: `loading.tsx` (shown while a route loads), `error.tsx` (shown when it throws), `not-found.tsx` (404).

## Server components by default

In the App Router, components run **on the server** unless you opt out. That means you can fetch data with plain `await`:

```tsx
// app/products/page.tsx (a server component)
import { db } from '@/lib/db';

export default async function ProductsPage() {
  const products = await db.product.findMany({ where: { live: true } });   // runs on the server only
  return (
    <ul>
      {products.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

The database code and credentials never reach the browser.

:::exercise A server component that loads data
@@file app/products/page.tsx
@@lang ts
@@prompt
Write a default-exported **async** page component `ProductsPage` that awaits `getProducts()` and returns an `h1` showing how many products there are: `{products.length} products`.
@@solution
export default async function ProductsPage() {
  const products = await getProducts();
  return <h1>{products.length} products</h1>;
}
@@hint export\s+default\s+async\s+function\s+ProductsPage\s*\(\s*\)\s*\{
Line 1: `export default async function ProductsPage() {`
@@hint const\s+products\s*=\s*await\s+getProducts\(\s*\)
Line 2: `const products = await getProducts();`
@@hint return\s+<h1>\s*\{\s*products\.length\s*\}\s*products\s*</h1>
Line 3: `return <h1>{products.length} products</h1>;`
:::

## Client components for interactivity

Anything that uses state, effects or browser events needs `'use client'` at the top of its file:

```tsx
'use client';
import { useState } from 'react';

export function AddToBag({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? 'Added' : 'Add to bag'}</button>;
}
```

**Rule of thumb:** keep pages and data loading on the server; push `'use client'` down to the small interactive leaves (buttons, forms, carousels). Less JavaScript ships to the browser, so pages are faster.

:::exercise A client component
@@file AddToBag.tsx
@@lang ts
@@prompt
Write a client component (it needs state):

1. `'use client';`
2. `import { useState } from 'react';`
3. `export function AddToBag() {`
4. `const [added, setAdded] = useState(false);`
5. Return a button whose click sets `added` to `true` and whose text is `{added ? 'Added' : 'Add to bag'}`.
6. `}`
@@solution
'use client';
import { useState } from 'react';
export function AddToBag() {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? 'Added' : 'Add to bag'}</button>;
}
@@hint ^\s*['"]use client['"]
Line 1 is the directive, in quotes: `'use client';`
@@hint import\s*\{\s*useState\s*\}\s*from\s*['"]react['"]
Line 2: `import { useState } from 'react';`
@@hint export\s+function\s+AddToBag\s*\(\s*\)\s*\{
Line 3: `export function AddToBag() {`
@@hint const\s*\[\s*added\s*,\s*setAdded\s*\]\s*=\s*useState\(\s*false\s*\)
Line 4: `const [added, setAdded] = useState(false);`
@@hint onClick=\{\s*\(\s*\)\s*=>\s*setAdded\(\s*true\s*\)\s*\}
The button's handler: `onClick={() => setAdded(true)}`
@@hint \{\s*added\s*\?\s*['"]Added['"]\s*:\s*['"]Add to bag['"]\s*\}
The text uses a ternary: `{added ? 'Added' : 'Add to bag'}`
:::

## Dynamic routes

```tsx
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <h1>{product.name}</h1>;
}
```

## Server actions: forms without writing an API

```tsx
// app/newsletter/page.tsx
import { z } from 'zod';

async function subscribe(formData: FormData) {
  'use server';                                               // this function runs on the server
  const email = z.string().email().parse(formData.get('email'));
  await db.subscriber.create({ data: { email } });
}

export default function Newsletter() {
  return (
    <form action={subscribe}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <button>Subscribe</button>
    </form>
  );
}
```

:::warn Server actions are public endpoints
Anyone can call a server action directly, not just your form. Always validate the input and check the user is allowed to do the action, exactly as you would for an API route.
:::

## Route handlers: a classic API

```ts
// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await db.product.findMany();
  return NextResponse.json(products);
}
```

Use these when something other than your own pages needs the data: a mobile app, a webhook from Stripe, a partner.

## SEO metadata

```tsx
export const metadata = {
  title: 'Linen Wrap Dress | Amara Studio',
  description: 'Hand-finished linen wrap dress, made in London.',
  openGraph: { images: ['/og/wrap-dress.jpg'] },
};
```

## Caching, in one paragraph

Next.js caches aggressively for speed, which surprises people ("why is my page showing old data?"). Learn the current caching rules in the official docs for your version, and know how to opt a route into fresh data per request, or revalidate after a change with `revalidatePath('/products')` inside a server action.

## Quiz

? In the App Router, which file creates the page at /about?
- [ ] pages/about.html
- [x] app/about/page.tsx
- [ ] app/about.tsx
> Folders define the URL; page.tsx makes it a page.

? A component uses useState. What does it need?
- [x] 'use client' at the top of its file
- [ ] 'use server' at the top of its file
- [ ] Nothing, all components can use state
> Hooks like useState run in the browser, so the component must be a client component.

? Why is it safe to query the database inside a server component?
- [ ] Next.js encrypts the query
- [x] Server components only run on the server, so the code and credentials never reach the browser
- [ ] Databases are public anyway
> That is the main power of server components.

? What must every server action do?
- [ ] Return JSX
- [x] Validate its input and check permissions, because anyone can call it
- [ ] Use useEffect
> Server actions are HTTP endpoints under the hood. Treat them as untrusted entry points.
