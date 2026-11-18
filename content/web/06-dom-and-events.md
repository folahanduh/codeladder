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

:::exercise Change text on the page
@@file script.js
@@html
<h1 id="title">Spring collection</h1>
<button id="buy">Add to bag</button>
@@prompt
The page below has `<h1 id="title">Spring collection</h1>`. Write two lines:

1. A constant `title` that finds it with `document.querySelector('#title')`.
2. Change its text to `'Summer drop is live'` using `textContent`.

Press **Run it** to see the heading change.
@@solution
const title = document.querySelector('#title');
title.textContent = 'Summer drop is live';
@@hint const\s+title\s*=\s*document\.querySelector\(
Line 1: `const title = document.querySelector(`
@@hint querySelector\(\s*['"]#title['"]\s*\)
The selector is `'#title'`: a hash because it is an id.
@@hint title\.textContent\s*=\s*['"]Summer drop is live['"]
Line 2: `title.textContent = 'Summer drop is live';`
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

:::exercise React to a click
@@file script.js
@@html
<h1 id="title">Linen Wrap Dress</h1>
<button id="buy">Add to bag</button>
@@prompt
Make the button say `Added` when clicked:

1. `const button = document.querySelector('#buy');`
2. `button.addEventListener('click', () => {`
3. Inside, indented: `button.textContent = 'Added';`
4. Close it: `});`

Run it, then click the button in the preview.
@@solution
const button = document.querySelector('#buy');
button.addEventListener('click', () => {
  button.textContent = 'Added';
});
@@hint const\s+button\s*=\s*document\.querySelector\(\s*['"]#buy['"]\s*\)
Line 1: `const button = document.querySelector('#buy');`
@@hint button\.addEventListener\(\s*['"]click['"]\s*,
Line 2 starts `button.addEventListener('click',` (capital L in `Listener`).
@@hint ,\s*\(\s*\)\s*=>\s*\{
Then an arrow function with no parameters: `() => {`
@@hint button\.textContent\s*=\s*['"]Added['"]
Inside: `button.textContent = 'Added';`
@@hint ^\s*\}\s*\)\s*;?\s*$
Close the function and the call: `});`
:::

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

:::exercise Turn data into text and back
@@file storage.js
@@prompt
`localStorage` only stores text, so you convert with JSON. Write four lines:

1. `const todos = ['Buy fabric', 'Post photos'];`
2. `const text = JSON.stringify(todos);`
3. `const back = JSON.parse(text);`
4. `console.log(text, back.length);`
@@solution
const todos = ['Buy fabric', 'Post photos'];
const text = JSON.stringify(todos);
const back = JSON.parse(text);
console.log(text, back.length);
@@hint const\s+todos\s*=\s*\[
Line 1 is an array of two strings.
@@hint JSON\.stringify\(\s*todos\s*\)
Line 2: `const text = JSON.stringify(todos);` (JSON in capitals).
@@hint JSON\.parse\(\s*text\s*\)
Line 3: `const back = JSON.parse(text);`
@@hint console\.log\(\s*text\s*,\s*back\.length\s*\)
Line 4: `console.log(text, back.length);`
@@explain
`stringify` turns the array into the text `["Buy fabric","Post photos"]`, ready to save. `parse` turns it back into a real array with a `length` of 2.
:::

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
