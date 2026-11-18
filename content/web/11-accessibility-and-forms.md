---
id: web-a11y
title: Accessibility and forms
level: intermediate
minutes: 25
summary: Build sites everyone can use (including with a keyboard or screen reader) and forms that convert.
---

## Why accessibility matters

Around one in five people has a disability. Many more have a temporary or situational one: a broken arm, bright sunlight, a slow connection, holding a baby. Accessible sites are easier for everyone, rank better in search, and are a legal requirement for many businesses (the UK Equality Act, the European Accessibility Act). It is also what separates professional work from amateur work.

The standard is **WCAG** (Web Content Accessibility Guidelines). Aim for level AA.

## The essentials checklist

1. **Use semantic HTML.** `<button>`, `<a>`, `<nav>`, `<main>`, headings in order. This solves most problems for free.
2. **Every image has alt text** (or `alt=""` if decorative).
3. **Every input has a label.**
4. **Everything works with a keyboard.** Press [[Tab]] through your site: can you reach and use every control? Can you see where focus is?
5. **Colour contrast**: body text needs at least 4.5:1 against its background. Light grey on white usually fails.
6. **Do not rely on colour alone.** "Fields in red are required" fails colour-blind users; add text or an icon.
7. **Respect user settings**: zoom to 200% without breaking, and honour `prefers-reduced-motion`.

## Visible focus

Never remove focus outlines without replacing them:

```css
/* bad: keyboard users get lost */
button:focus { outline: none; }

/* good: a clear ring for keyboard users only */
:focus-visible {
  outline: 3px solid #2747e0;
  outline-offset: 2px;
}
```

:::exercise A visible focus ring
@@file styles.css
@@html
<p style="font-family:system-ui">Click in the preview, then press Tab to move focus:</p>
<a href="#">A link</a> <button>A button</button>
@@prompt
Write a `:focus-visible` rule with `outline: 3px solid #2747e0;` and `outline-offset: 2px;`. Run it, click inside the preview and press Tab to see your focus ring.
@@solution
:focus-visible {
  outline: 3px solid #2747e0;
  outline-offset: 2px;
}
@@hint ^\s*:focus-visible\s*\{
Line 1: `:focus-visible {` (starts with a colon).
@@hint outline\s*:\s*3px\s+solid\s+#2747e0
`outline: 3px solid #2747e0;`
@@hint outline-offset\s*:\s*2px
`outline-offset: 2px;`
:::

## A form done properly

```html try
<form novalidate>
  <div class="field">
    <label for="email">Email address</label>
    <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-hint email-error">
    <p id="email-hint" class="hint">We will send your order confirmation here.</p>
    <p id="email-error" class="error" hidden>Enter an email address like name@example.com</p>
  </div>
  <button type="submit">Continue to payment</button>
</form>
<style>
  body { font-family: system-ui, sans-serif; padding: 1rem; max-width: 420px; }
  .field { display: grid; gap: .35rem; margin-bottom: 1rem; }
  input { padding: .7rem; font-size: 1rem; border: 1px solid #8a8a8a; border-radius: 8px; }
  input[aria-invalid="true"] { border-color: #b42318; }
  .hint { margin: 0; color: #555; font-size: .9rem; }
  .error { margin: 0; color: #b42318; font-size: .9rem; }
  button { padding: .8rem 1.2rem; font-size: 1rem; border: 0; border-radius: 8px; background: #1f1a17; color: #fff; }
</style>
<script>
  const form = document.querySelector('form');
  const email = document.querySelector('#email');
  const error = document.querySelector('#email-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = email.validity.valid;
    email.setAttribute('aria-invalid', String(!ok));
    error.hidden = ok;
    if (!ok) email.focus();
    else console.log('Valid! Send to the server here.');
  });
</script>
```

What makes it good:

- The **label** is always visible (placeholders disappear when you type, so they are not labels).
- `type="email"` and `autocomplete="email"` give the right mobile keyboard and let the browser autofill.
- The error says **how to fix it**, sits next to the field, is linked with `aria-describedby`, and focus moves to the problem.
- Validation runs on submit, not on every keystroke while the user is still typing.

## ARIA: the last resort

ARIA attributes (`aria-label`, `aria-expanded`, `role`) add meaning for assistive technology when HTML alone cannot. The first rule of ARIA: **if a native element does the job, use it**. A `<button>` is always better than `<div role="button" tabindex="0">` with hand-written key handling.

Useful ones:

```html
<button aria-label="Close menu">x</button>                     <!-- icon-only buttons need a name -->
<button aria-expanded="false" aria-controls="menu">Menu</button>  <!-- toggles announce their state -->
<p role="status">Added to bag</p>                              <!-- announces updates politely -->
```

:::tip Test it yourself in five minutes
Unplug your mouse and use your site with [[Tab]], [[Shift+Tab]], [[Enter]] and [[Space]]. Then run Lighthouse's Accessibility audit in Chrome DevTools. Then try your phone's screen reader (VoiceOver on iPhone, TalkBack on Android) on one page.
:::

:::exercise Name icon buttons for screen readers
@@file menu.html
@@prompt
Two buttons:

1. A close button whose visible text is just `x`, with `aria-label="Close menu"`.
2. A menu toggle with `aria-expanded="false"` and `aria-controls="menu"`, and the text `Menu`.
@@solution
<button aria-label="Close menu">x</button>
<button aria-expanded="false" aria-controls="menu">Menu</button>
@@hint <button\s+aria-label=["']Close menu["']\s*>\s*x\s*</button>
Line 1: `<button aria-label="Close menu">x</button>`
@@hint aria-expanded=["']false["']
Line 2 needs `aria-expanded="false"`
@@hint aria-controls=["']menu["']\s*>\s*Menu\s*</button>
then `aria-controls="menu">Menu</button>`
:::

## Quiz

? Why is a placeholder not a replacement for a label?
- [ ] Placeholders are not supported on phones
- [x] It disappears as soon as the user types, and is often low contrast
- [ ] Labels load faster
> Users forget what a field was for once they start typing. Keep a visible label.

? Minimum contrast ratio for normal body text at WCAG AA?
- [ ] 2:1
- [x] 4.5:1
- [ ] 10:1
> 4.5:1 for normal text, 3:1 for large text.

? You need a clickable control that opens a menu. Best choice?
- [x] A button element with aria-expanded
- [ ] A div with an onclick handler
- [ ] A link with href="#"
> Native buttons are focusable and keyboard-operable for free. aria-expanded announces open or closed.

? What is the first rule of ARIA?
- [ ] Add ARIA to every element
- [x] Use a native HTML element instead whenever one exists
- [ ] Only use aria-label
> Native elements come with keyboard support and semantics built in.
