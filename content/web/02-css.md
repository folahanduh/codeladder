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

:::exercise Your first CSS rule
@@file styles.css
@@html
<h1>Amara Studio</h1>
<p>Handmade brass jewellery from London.</p>
@@prompt
Write a rule that styles every `h1`: colour `#b4532a` and font size `2.5rem`. One property per line, each ending with a semicolon. Press **Run it** to see it applied to a sample page.
@@solution
h1 {
  color: #b4532a;
  font-size: 2.5rem;
}
@@hint ^\s*h1\s*\{
Start with the selector and an opening brace: `h1 {`
@@hint color\s*:\s*#b4532a
`color: #b4532a;` (American spelling: color).
@@hint font-size\s*:\s*2\.5rem
`font-size: 2.5rem;` with a hyphen in the property name.
@@hint ^\s*\}\s*$
Close the rule with `}`.
:::

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

:::exercise The border-box reset
@@file styles.css
@@run false
@@prompt
Write the rule every professional stylesheet starts with: make every element, and every `::before` and `::after` pseudo-element, use `box-sizing: border-box`.
@@solution
*, *::before, *::after {
  box-sizing: border-box;
}
@@hint ^\s*\*\s*,
The selector starts with `*` (every element), then a comma.
@@hint \*::before\s*,\s*\*::after
Then `*::before, *::after` (two colons each).
@@hint box-sizing\s*:\s*border-box
Inside: `box-sizing: border-box;`
:::

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

:::exercise Brand colours with a variable
@@file styles.css
@@html
<a class="button" href="#">Shop now</a>
@@prompt
Write two rules:

1. On `:root`, define a custom property `--brand` with the value `#b4532a`.
2. On `.button`, set `background` to `var(--brand)` and `color` to `white`.
@@solution
:root {
  --brand: #b4532a;
}
.button {
  background: var(--brand);
  color: white;
}
@@hint ^\s*:root\s*\{
Rule 1 starts `:root {`
@@hint --brand\s*:\s*#b4532a
Custom properties start with two hyphens: `--brand: #b4532a;`
@@hint ^\s*\.button\s*\{
Rule 2 starts `.button {` (a dot, because it is a class).
@@hint background\s*:\s*var\(\s*--brand\s*\)
Use the variable with `var(--brand)`: `background: var(--brand);`
@@hint color\s*:\s*white
Then `color: white;`
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
