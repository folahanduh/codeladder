---
id: web-css
title: "CSS: styling and the box model"
level: beginner
minutes: 25
summary: Selectors, the cascade, colours, fonts, units and the box model that controls every element's size.
---

## How CSS works

CSS is a list of **rules**. Each rule picks elements with a **selector** and sets **properties**:

```css
h1 {
  color: #1f1a17;
  font-size: 2.5rem;
}
```

Link a stylesheet from your HTML `<head>`:

```html
<link rel="stylesheet" href="styles.css">
```

## Selectors you will use daily

| Selector | Matches |
|---|---|
| `p` | Every paragraph |
| `.card` | Elements with `class="card"` |
| `#hero` | The element with `id="hero"` (use sparingly) |
| `.card h2` | h2 elements inside a .card |
| `.card > h2` | h2 elements that are direct children of a .card |
| `button:hover` | Buttons while the mouse is over them |
| `a:focus-visible` | Links focused with the keyboard |
| `li:first-child` | The first li in its list |

Style mostly with **classes**. They are reusable and keep specificity low.

## The cascade and specificity

When two rules target the same element, the browser decides:

1. **Specificity**: `#id` beats `.class` beats `element`.
2. If equal, **the later rule wins**.
3. `!important` overrides almost everything. Avoid it; it starts specificity wars.

Some properties (like `color` and `font-family`) are **inherited**: set them on `body` and every child gets them.

## The box model

Every element is a rectangular box with four layers:

```text
+------------------- margin -------------------+
|  +---------------- border ----------------+  |
|  |  +------------- padding -------------+ |  |
|  |  |            content                | |  |
|  |  +-----------------------------------+ |  |
|  +----------------------------------------+  |
+----------------------------------------------+
```

- **content**: the text or image
- **padding**: space inside the border
- **border**: the edge
- **margin**: space outside, pushing other elements away

By default, `width` only sets the content size, so padding and border make the box bigger than you asked. Every professional stylesheet starts with this fix:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

Now `width: 300px` means 300px total, padding and border included.

## Colours, fonts and units

```css try
:root {
  --brand: #b4532a;     /* custom property: reuse it everywhere */
  --ink: #1f1a17;
  --paper: #fbf7f3;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 1rem;       /* rem = relative to the root font size (16px default) */
  line-height: 1.6;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  background: var(--brand);
  color: white;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.button:hover {
  background: var(--ink);
}
```

| Unit | Meaning | Use for |
|---|---|---|
| `px` | Pixels | Borders, small fixed details |
| `rem` | Multiples of the root font size | Font sizes, spacing |
| `%` | Percentage of the parent | Widths |
| `vw` / `vh` | 1% of the viewport width / height | Full-screen sections (carefully) |
| `ch` | Width of the "0" character | Readable line lengths, e.g. `max-width: 65ch` |

:::tip The red outline trick
When a layout misbehaves, add `* { outline: 1px solid red; }` temporarily. You will instantly see every box and what is overflowing.
:::

## Quiz

? Which selector matches every element with class="price"?
- [ ] #price
- [x] .price
- [ ] price
> A dot selects by class, a hash by id, a bare word by element name.

? With box-sizing: border-box, a box has width: 300px, padding: 20px and border: 2px. How wide is it on screen?
- [x] 300px
- [ ] 344px
- [ ] 320px
> border-box makes width include padding and border. Without it, the box would be 344px.

? Two rules set a paragraph's colour: `.intro { color: red }` and `p { color: blue }`. Which colour wins?
- [x] Red, because a class is more specific than an element selector
- [ ] Blue, because it comes later
- [ ] Whichever is first in the file
> Specificity is checked before source order.

? Why define brand colours as custom properties like --brand?
- [ ] They load faster
- [x] One change updates the colour everywhere it is used
- [ ] Browsers require it
> Variables make design systems and rebrands easy.
