---
id: web-tailwind
title: Tailwind CSS and design systems
level: intermediate
minutes: 25
summary: Style quickly with utility classes, set up brand tokens, and build consistent, reusable components.
---

## Utility-first CSS

Instead of inventing class names and writing CSS in a separate file, Tailwind gives you small single-purpose classes you combine in your markup:

```html
<button class="rounded-full bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-stone-900 focus-visible:outline-2">
  Shop the drop
</button>
```

Each class does one thing: `px-5` is horizontal padding, `bg-orange-700` a background colour, `hover:` applies a style on hover. You rarely leave your HTML, and unused classes are removed from the final CSS automatically.

:::exercise A button made of utilities
@@file Button.html
@@lang html
@@run false
@@prompt
Write a `button` with these Tailwind classes, in this order: `rounded-full bg-orange-700 px-5 py-3 font-semibold text-white`. The text is `Shop the drop`.
@@solution
<button class="rounded-full bg-orange-700 px-5 py-3 font-semibold text-white">Shop the drop</button>
@@hint <button\s+class=["']
Start with `<button class="`
@@hint rounded-full\s+bg-orange-700\s+px-5\s+py-3\s+font-semibold\s+text-white
The classes, separated by spaces: `rounded-full bg-orange-700 px-5 py-3 font-semibold text-white`
@@hint >\s*Shop the drop\s*</button>
Close the quote and tag, then `Shop the drop</button>`
:::

## Set it up in a Vite project

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

## The classes you will use most

| Purpose | Examples |
|---|---|
| Spacing | `p-4`, `px-6`, `mt-8`, `gap-4` (scale: 1 = 0.25rem) |
| Layout | `flex`, `grid`, `grid-cols-2`, `items-center`, `justify-between` |
| Size | `w-full`, `max-w-screen-lg`, `h-12`, `aspect-[4/5]` |
| Type | `text-sm`, `text-4xl`, `font-bold`, `tracking-tight`, `leading-relaxed` |
| Colour | `text-stone-900`, `bg-white`, `border-stone-200` |
| Effects | `rounded-xl`, `shadow-md`, `ring-1`, `transition` |
| States | `hover:`, `focus-visible:`, `disabled:`, `dark:` |
| Breakpoints | `sm:`, `md:`, `lg:` (mobile first: `md:grid-cols-3` applies from medium up) |

## A responsive product grid in Tailwind

```html
<section class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
  <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
    <img src="dress.jpg" alt="Sage linen wrap dress" class="aspect-[4/5] w-full object-cover">
    <div class="space-y-1 p-4">
      <h2 class="font-semibold text-stone-900">Linen Wrap Dress</h2>
      <p class="text-stone-600">£68.00</p>
    </div>
  </article>
</section>
```

## Design tokens: your brand in one place

A **design system** is a set of decisions (colours, type sizes, spacing, radius) used consistently everywhere. In Tailwind v4 you define tokens in CSS with `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-brand: #b4532a;
  --color-ink: #1f1a17;
  --color-paper: #fbf7f3;
  --font-display: "Fraunces", serif;
  --radius-card: 1.25rem;
}
```

Now `bg-brand`, `text-ink` and `font-display` exist as classes. Rebranding a client's site becomes a five-line change.

:::exercise Brand tokens with @theme
@@file index.css
@@run false
@@prompt
After `@import "tailwindcss";`, a `@theme` block defines your brand tokens. Write the block with two colours: `--color-brand: #b4532a;` and `--color-ink: #1f1a17;`
@@solution
@theme {
  --color-brand: #b4532a;
  --color-ink: #1f1a17;
}
@@hint ^\s*@theme\s*\{
Line 1: `@theme {`
@@hint --color-brand\s*:\s*#b4532a
`--color-brand: #b4532a;`
@@hint --color-ink\s*:\s*#1f1a17
`--color-ink: #1f1a17;`
@@explain
Tailwind turns each `--color-*` token into classes: `bg-brand`, `text-ink`, `border-brand` and so on.
:::

## Components stop repetition

If you copy the same 15 classes onto every button, make a component instead:

```tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-ink',
    ghost: 'bg-transparent text-ink ring-1 ring-ink/20 hover:bg-ink/5',
  };
  return <button className={`rounded-full px-5 py-3 font-semibold transition ${styles[variant]} ${className}`} {...props} />;
}
```

**shadcn/ui** takes this idea further: it copies accessible, well-designed components (dialogs, menus, forms) into your project so you own and restyle them.

:::pro What makes a site look professional
Consistency beats creativity. Use one or two typefaces, a small colour palette, a spacing scale you stick to, generous white space, real high-quality photography, and aligned edges. Most "amateur" sites fail on inconsistency: five font sizes, six greys, random padding.
:::

## Quiz

? In Tailwind, what does md:grid-cols-3 mean?
- [ ] Always three columns
- [x] Three columns from the medium breakpoint upwards; smaller screens use the base class
- [ ] Three columns only on medium screens and below
> Breakpoint prefixes are mobile first: they apply at that width and above.

? What is a design token?
- [ ] A crypto token for designers
- [x] A named design decision, like a brand colour or radius, reused everywhere
- [ ] A Figma plug-in
> Tokens keep a design consistent and make changes cheap.

? You keep pasting the same long list of classes onto every button. What should you do?
- [ ] Keep pasting; it is the Tailwind way
- [x] Make a reusable Button component
- [ ] Switch to inline styles
> Components remove duplication while keeping utility classes.
