---
id: web-html
title: "HTML: the structure of every page"
level: beginner
minutes: 20
summary: Elements, attributes, semantic tags, links, images and forms. Write a real page from scratch.
---

## Elements and tags

HTML describes **what things are**: this is a heading, this is a paragraph, this is a button. You wrap content in **tags**:

```html
<p>This is a paragraph.</p>
```

`<p>` opens, `</p>` closes, and the whole thing is an **element**. Some elements have no content and no closing tag, like `<img>` and `<br>`.

**Attributes** add information to an element:

```html
<a href="https://github.com" target="_blank">My GitHub</a>
<img src="dress.jpg" alt="Green linen wrap dress on a model">
```

## The page skeleton

Every page starts the same way. In VS Code, type `!` and press [[Tab]] to generate it.

```html try
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Amara Studio | Handmade jewellery</title>
  <meta name="description" content="Handmade brass jewellery from London.">
</head>
<body>
  <header>
    <h1>Amara Studio</h1>
    <nav>
      <a href="#shop">Shop</a>
      <a href="#about">About</a>
    </nav>
  </header>

  <main>
    <section id="shop">
      <h2>New collection</h2>
      <p>Hand-finished brass earrings, made in small batches.</p>
      <ul>
        <li>Sun hoops, £34</li>
        <li>Tide drops, £28</li>
      </ul>
    </section>

    <section id="about">
      <h2>About</h2>
      <p>Started at a kitchen table in <strong>2021</strong>.</p>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Amara Studio</p>
  </footer>
</body>
</html>
```

- `<head>` holds information **about** the page: title (shown in the tab and Google results), character set, the viewport setting that makes it work on phones.
- `<body>` holds everything you see.

## Semantic HTML: use the right element

Professionals pick elements by **meaning**, not appearance. Screen readers, search engines and your future self all depend on it.

| Element | Use it for |
|---|---|
| `<header>`, `<footer>` | The top and bottom of a page or section |
| `<nav>` | A group of navigation links |
| `<main>` | The main content (one per page) |
| `<section>` | A themed group of content with a heading |
| `<article>` | Self-contained content: a product card, a blog post |
| `<h1>` to `<h6>` | Headings in order. One `<h1>` per page; do not skip levels |
| `<button>` | Anything clicked to do something |
| `<a>` | Anything clicked to go somewhere |

:::warn Avoid "div soup"
A page made of nothing but `<div>` elements works visually but is meaningless to assistive tech and search engines. Use `<div>` only when no meaningful element fits, usually for layout wrappers.
:::

## Images done right

```html
<img src="images/sun-hoops.jpg" alt="Brass sun hoop earrings on a linen cloth" width="800" height="1000" loading="lazy">
```

- `alt` describes the image for blind users and when the image fails to load. Describe what matters; use `alt=""` for purely decorative images.
- `width` and `height` stop the page jumping as images load.
- `loading="lazy"` delays off-screen images, making pages faster.

## Forms

```html try
<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required placeholder="you@example.com">

  <label for="size">Size</label>
  <select id="size" name="size">
    <option>S</option>
    <option>M</option>
    <option>L</option>
  </select>

  <button type="submit">Join the waitlist</button>
</form>
```

Every input needs a `<label>` linked with `for` and `id`. Clicking the label focuses the input, and screen readers announce it. Input `type`s like `email`, `tel`, `number` and `date` give mobile users the right keyboard and free validation.

## Quiz

? Which element should wrap a site's main navigation links?
- [ ] div
- [x] nav
- [ ] section
> nav tells browsers, screen readers and search engines that these links are navigation.

? What is the alt attribute on an image for?
- [ ] The image's file name
- [x] A text description for screen-reader users and when the image fails to load
- [ ] A tooltip on hover
> alt text is essential for accessibility and helps SEO too.

? "Add to bag" adds an item without leaving the page. Which element should it be?
- [x] button
- [ ] a
- [ ] div with a click handler
> Buttons do things; links go places. A div is not keyboard-accessible by default.

? Where does the page title shown in the browser tab go?
- [ ] In an h1 in the body
- [x] In a title element inside head
- [ ] In the footer
> The title element lives in head and is also what Google shows in results.
