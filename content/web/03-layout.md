---
id: web-layout
title: Layout with Flexbox, Grid and responsive design
level: beginner
minutes: 30
summary: Put things side by side, build grids that reflow on phones, and design mobile-first.
---

## Two layout tools, two jobs

- **Flexbox** arranges items in **one direction**: a row of nav links, a button with an icon, a card's contents.
- **Grid** arranges items in **two dimensions**: a product grid, a page with a sidebar.

## Flexbox

```css
.nav {
  display: flex;
  gap: 1rem;                       /* space between items */
  justify-content: space-between;  /* main axis (horizontal in a row) */
  align-items: center;             /* cross axis (vertical in a row) */
  flex-wrap: wrap;                 /* let items wrap on small screens */
}
```

| Property | Common values |
|---|---|
| `flex-direction` | `row` (default), `column` |
| `justify-content` | `flex-start`, `center`, `space-between`, `space-evenly` |
| `align-items` | `stretch` (default), `center`, `flex-start`, `flex-end` |
| `gap` | Any length, e.g. `1rem` |

On a child, `flex: 1` means "take up the remaining space". Load the **Flexbox lab** template in the [Playground](#playground) and try every value.

## Grid

The single most useful line of CSS for product grids:

```css
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}
```

This says: make as many columns as fit, each at least 220px wide, sharing leftover space equally. Four columns on a laptop, two on a tablet, one on a phone, with **no media queries**.

A classic page layout:

```css
.page {
  display: grid;
  grid-template-columns: 250px 1fr;   /* sidebar, then the rest */
  grid-template-areas: "side main";
  gap: 2rem;
}
```

## Responsive design, mobile first

Most visitors to brand and shop sites are on phones. Write the phone layout first, then add rules for larger screens with **media queries**:

```html try
<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; }
  .hero { padding: 2rem 1rem; background: #f6efe9; }
  .hero h1 { font-size: clamp(2rem, 6vw, 3.5rem); margin: 0 0 .5rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; padding: 1rem; }
  .card { background: #fff; border: 1px solid #eadfd6; border-radius: 12px; padding: 1rem; }
  .card .img { aspect-ratio: 4/5; background: #e9c9b4; border-radius: 8px; margin-bottom: .5rem; }

  /* Larger screens: more breathing room */
  @media (min-width: 768px) {
    .hero { padding: 4rem 3rem; }
    .grid { padding: 2rem 3rem; gap: 1.5rem; }
  }
</style>
</head>
<body>
  <section class="hero">
    <h1>Summer drop</h1>
    <p>Breathable linen, cut for heat.</p>
  </section>
  <section class="grid">
    <article class="card"><div class="img"></div>Wrap dress, £68</article>
    <article class="card"><div class="img"></div>Wide trousers, £54</article>
    <article class="card"><div class="img"></div>Camp shirt, £42</article>
    <article class="card"><div class="img"></div>Bucket hat, £22</article>
  </section>
</body>
</html>
```

Notice `clamp(2rem, 6vw, 3.5rem)`: the heading scales with the screen but never goes below 2rem or above 3.5rem.

Press **Run in Playground**, then make the browser window narrower to watch the grid reflow.

## The viewport meta tag

Without this in your `<head>`, phones pretend to be a desktop and shrink everything:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

:::tip Test like a pro
In Chrome DevTools press [[Ctrl+Shift+M]] (device toolbar) and check your page at 375px wide (a common phone), 768px (tablet) and 1280px (laptop). Then check on your real phone.
:::

## Quiz

? You need a row of five nav links spaced evenly across a header. Best tool?
- [x] Flexbox
- [ ] Grid
- [ ] Absolute positioning
> One direction of items: Flexbox.

? What does `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` do?
- [ ] Always makes exactly 220 columns
- [x] Fits as many columns as possible, each at least 220px, sharing leftover space
- [ ] Makes one column 220px wide
> It produces a responsive grid without any media queries.

? What does "mobile first" mean?
- [ ] Only build for phones
- [x] Write base styles for small screens, then add min-width media queries for bigger ones
- [ ] Build the desktop version first and hide things on mobile
> Base styles serve phones; media queries enhance for larger screens.

? Your site looks tiny and zoomed out on phones. What is most likely missing?
- [ ] A media query
- [x] The viewport meta tag in head
- [ ] box-sizing: border-box
> Without the viewport tag, mobile browsers render at desktop width and scale down.
