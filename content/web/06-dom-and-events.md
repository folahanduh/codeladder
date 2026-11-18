---
id: web-dom
title: The DOM and events
level: beginner
minutes: 30
summary: Find elements, change the page, respond to clicks and typing, and build an interactive to-do list.
---

## What the DOM is

When a browser loads HTML, it builds a live tree of objects called the **Document Object Model**. JavaScript can read and change that tree, and the page updates instantly.

## Finding elements

```js
const title = document.querySelector('h1');            // first match, CSS selector syntax
const button = document.querySelector('#add-to-bag');  // by id
const cards = document.querySelectorAll('.card');      // all matches (a NodeList)
```

## Changing the page

```js
title.textContent = 'Summer drop is live';   // change text (safe)
button.classList.add('is-loading');          // add a CSS class
button.classList.toggle('active');           // add if missing, remove if present
button.disabled = true;                      // set a property
title.style.color = '#b4532a';               // inline style (prefer classes)

const li = document.createElement('li');     // build a new element
li.textContent = 'New item';
document.querySelector('ul').append(li);     // put it on the page
```

:::warn textContent versus innerHTML
`textContent` treats everything as plain text. `innerHTML` parses HTML. **Never** put user input into `innerHTML`: someone could type a `<script>` or an `<img onerror=...>` and run code on your page. This attack is called XSS (cross-site scripting).
:::

## Events

An **event** is something that happens: a click, a key press, a form submit, the page finishing loading. You attach a **listener** that runs when it happens:

```js
button.addEventListener('click', () => {
  console.log('Added to bag');
});

const search = document.querySelector('#search');
search.addEventListener('input', (event) => {
  console.log('Typed:', event.target.value);
});

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();   // stop the browser reloading the page
  // handle the form with JavaScript instead
});
```

Common events: `click`, `input`, `change`, `submit`, `keydown`, `DOMContentLoaded`.

## The state, render, action pattern

The cleanest way to build interactive UI (and exactly how React thinks):

1. **State**: one place that holds your data (`let todos = [...]`).
2. **Render**: a function that rebuilds the UI from the state.
3. **Actions**: event handlers change the state, then call render.

Never store the "truth" in the HTML itself. The HTML is just a picture of your state.

```js try
let count = 0;                       // 1. state

const label = document.createElement('p');
const plus = document.createElement('button');
const reset = document.createElement('button');
plus.textContent = '+1';
reset.textContent = 'Reset';
document.body.append(label, plus, reset);

function render() {                  // 2. render
  label.textContent = `Count: ${count}`;
  reset.disabled = count === 0;
}

plus.addEventListener('click', () => { count++; render(); });   // 3. actions
reset.addEventListener('click', () => { count = 0; render(); });

render();
```

Now open the [Playground](#playground) and load the **To-do list (DOM)** template. It uses the same pattern with an array of objects. Read it line by line, then add a "Clear completed" button.

## Saving data in the browser

`localStorage` keeps small amounts of text after the page closes:

```js
localStorage.setItem('todos', JSON.stringify(todos));             // save
const saved = JSON.parse(localStorage.getItem('todos') || '[]');  // load
```

It only stores strings (hence `JSON.stringify`), it is per-browser, and users can clear it. Fine for preferences and drafts; not a database. (This very site saves your progress this way.)

## Quiz

? Which method finds the first element matching a CSS selector?
- [x] document.querySelector
- [ ] document.getAll
- [ ] document.find
> querySelector takes any CSS selector and returns the first match.

? A user types their name into a field and you show it in a greeting. Which is safe?
- [x] greeting.textContent = name
- [ ] greeting.innerHTML = name
- [ ] Both are equally safe
> innerHTML would run any HTML or script the user typed. That is XSS.

? Why call event.preventDefault() in a form's submit handler?
- [ ] To clear the form
- [x] To stop the browser's default full page reload so JavaScript can handle it
- [ ] To validate the inputs
> Without it, submitting navigates or reloads the page.

? In the state, render, action pattern, what does an event handler do?
- [ ] Edits the HTML directly
- [x] Updates the state, then calls render
- [ ] Reloads the page
> Handlers change the data; render keeps the page in sync with it.
