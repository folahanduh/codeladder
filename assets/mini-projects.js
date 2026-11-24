/* Code Ladder: mini projects. Three to choose from in every track, built in the browser and examined.
   Each requirement has a check:
   - static(files, h): reads your files (h has helpers for Markdown sections); return true, or a message.
   - page(): runs INSIDE your page, after your code. It can use these helpers:
       $(sel), $$(sel), text(el), wait(ms), until(fn, ms), setInput(el, value), click(el), css(el, prop), submit(form)
     and must return true, or a short message saying what it found. */
window.CL_MINI = (function () {
  'use strict';

  const IMG_NOTE = `Images you can use (or link your own):
       assets/project-img/coffee.svg    assets/project-img/laptop.svg
       assets/project-img/city.svg      assets/project-img/plant.svg
       assets/project-img/sunrise.svg   assets/project-img/dress.svg`;
  const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body>
${body}
</body>
</html>
`;
  const CSS_NOTE = '/* Code Ladder adds this file to your page for you. */\n\n';
  const JS_NOTE = '// Code Ladder runs this file after your page loads.\n\n';
  const hasTitle = { text: 'The page has a title (it shows in the browser tab)', hint: 'Put a <title> inside <head>, for example <title>About Ada</title>.', static: (f) => /<title>\s*\S[^<]*<\/title>/i.test(f['index.html'] || '') };

  const projects = [
    // ======================================================================== Foundations
    {
      id: 'mini-about-me', track: 'setup', level: 'beginner', minutes: 45,
      title: 'Your first web page: all about you',
      pitch: 'A one-page site about you (or a brand you love) with a heading, words, pictures and links.',
      skills: ['HTML structure', 'Images and alt text', 'Lists and links', 'Your first CSS'],
      brief: 'Build a page that introduces you, or a brand or shop you love. It needs a big heading, a couple of paragraphs, at least two pictures, a list, a link and a little styling. This is the same page every web developer\'s career starts with.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('About me', `  <!-- 1. A big heading (h1) with your name or your brand's name -->

  <!-- 2. Two or more paragraphs about you -->

  <!-- 3. Two or more pictures, each with alt text that describes it.
       Example: <img src="assets/project-img/coffee.svg" alt="A cup of coffee on my desk">
       ${IMG_NOTE} -->

  <!-- 4. A list (ul or ol) of three or more things: skills, goals, favourite places -->

  <!-- 5. A link, for example to your GitHub or Instagram: <a href="https://github.com/you">My GitHub</a> -->`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}body {\n  /* pick a font and some colours */\n}\n\nimg {\n  /* stop big pictures overflowing small screens */\n}\n` },
      ],
      checks: [
        hasTitle,
        { text: 'One main heading (h1)', hint: 'Add exactly one <h1> with your name or your brand\'s name.', page: () => { const h = $$('h1'); return h.length === 1 && text(h[0]).length >= 2 ? true : `Found ${h.length} h1 heading(s).`; } },
        { text: 'At least two paragraphs of real text', hint: 'Write two or more <p> paragraphs, each at least a full sentence.', page: () => { const n = $$('p').filter((p) => text(p).length >= 20).length; return n >= 2 ? true : `Found ${n} paragraph(s) with a full sentence.`; } },
        { text: 'At least two images', hint: 'Add two or more <img> tags. Use the gallery images listed in index.html, or your own links.', page: () => { const n = $$('img').length; return n >= 2 ? true : `Found ${n} image(s).`; } },
        { text: 'Every image has alt text that describes it', hint: 'Give every <img> an alt, such as alt="A cup of coffee on my desk". Screen readers read it aloud, and it shows if the image fails.', page: () => { const bad = $$('img').filter((i) => (i.getAttribute('alt') || '').trim().length < 3); return $$('img').length && !bad.length ? true : `${bad.length} image(s) have missing or very short alt text.`; } },
        { text: 'A list with at least three items', hint: 'Use <ul> (bullets) or <ol> (numbers) with three or more <li> items.', page: () => $$('ul, ol').some((l) => l.querySelectorAll(':scope > li').length >= 3) || 'No list with three or more items yet.' },
        { text: 'At least one link', hint: 'Add <a href="https://...">text</a>. The href is where it goes; the text is what people click.', page: () => $$('a[href]').some((a) => /^(https?:|mailto:|#)/.test(a.getAttribute('href'))) || 'No working link (an <a> with an href starting https:// or mailto:) yet.' },
        { text: 'Your CSS sets a font and a colour', hint: 'In style.css, give body a font-family and a color or background.', static: (f) => { const c = f['style.css'] || ''; return /font-family\s*:/.test(c) && /(^|[\s;{])(color|background(-color)?)\s*:/.test(c) ? true : 'style.css needs a font-family and a color or background.'; } },
        { text: 'Images shrink to fit small screens', hint: 'In style.css: img { max-width: 100%; height: auto; } so pictures never overflow a phone screen.', static: (f) => /img[^{]*\{[^}]*max-width\s*:\s*100%/.test(f['style.css'] || '') || 'Add max-width: 100% to your img rule.' },
      ],
      stretch: ['Add a dark mode with @media (prefers-color-scheme: dark).', 'Publish it free on GitHub Pages and send the link to a friend.'],
    },
    {
      id: 'mini-letter', track: 'setup', level: 'beginner', minutes: 40,
      title: 'A letter page',
      pitch: 'A beautifully set letter: to future you, a thank-you note, or a welcome letter from a brand to its customers.',
      skills: ['Semantic HTML', 'Readable typography', 'CSS width and spacing'],
      brief: 'Write a letter as a web page: a title, the date, a few paragraphs and a signature, with a picture. Then make it pleasant to read: a nice font, a background colour, and lines that are not too long.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('A letter', `  <main class="letter">
    <!-- 1. A heading (h1 or h2): "Dear future me", or "Welcome to Amara Studio" -->

    <!-- 2. The date, marked up with <time>: <time datetime="2026-11-24">24 November 2026</time> -->

    <!-- 3. Three or more paragraphs -->

    <!-- 4. One picture with alt text. ${IMG_NOTE} -->

    <!-- 5. A sign-off: <p class="signature">With love, Ada</p> -->
  </main>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}body {\n  /* a font and a background colour */\n}\n\n.letter {\n  /* keep lines short enough to read comfortably: try max-width */\n}\n` },
      ],
      checks: [
        hasTitle,
        { text: 'The letter has a heading', hint: 'Start the letter with an <h1> or <h2>.', page: () => Boolean($('h1, h2') && text($('h1, h2')).length >= 2) || 'No h1 or h2 heading yet.' },
        { text: 'The date uses a <time> element', hint: '<time datetime="2026-11-24">24 November 2026</time> tells browsers and search engines it is a date.', page: () => Boolean($('time') && text($('time'))) || 'No <time> element yet.' },
        { text: 'At least three paragraphs', hint: 'Write three or more <p> paragraphs, each at least a sentence long.', page: () => { const n = $$('p').filter((p) => text(p).length >= 20).length; return n >= 3 ? true : `Found ${n}.`; } },
        { text: 'A signature with class="signature"', hint: 'End with <p class="signature">With love, Ada</p>.', page: () => Boolean($('.signature') && text($('.signature'))) || 'No element with class="signature" yet.' },
        { text: 'A picture with alt text', hint: 'Add one <img> with a descriptive alt.', page: () => $$('img').some((i) => (i.getAttribute('alt') || '').trim().length >= 3) || 'No image with alt text yet.' },
        { text: 'Lines are a comfortable length (a max-width is set)', hint: 'Give .letter (or main, or body) a max-width such as 40rem, and margin: 0 auto to centre it.', page: () => ['.letter', 'main', 'article', 'body'].some((s) => $(s) && css($(s), 'maxWidth') !== 'none') || 'Nothing has a max-width yet.' },
        { text: 'A font and a background colour', hint: 'In style.css, set font-family and background (or background-color).', static: (f) => { const c = f['style.css'] || ''; return /font-family\s*:/.test(c) && /background(-color)?\s*:/.test(c) ? true : 'style.css needs font-family and background.'; } },
      ],
      stretch: ['Use a Google Font that suits the mood of the letter.', 'Add a print stylesheet with @media print so it prints like a real letter.'],
    },
    {
      id: 'mini-gallery', track: 'setup', level: 'beginner', minutes: 50,
      title: 'A photo gallery or mood board',
      pitch: 'A grid of captioned pictures: your favourite places, a product lookbook, or a mood board for a brand.',
      skills: ['figure and figcaption', 'CSS Grid', 'Responsive images'],
      brief: 'Make a gallery page: a heading, at least four captioned pictures laid out in a grid with space between them, and a footer. Every picture must fit its box on any screen size.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Gallery', `  <h1><!-- Your gallery's title --></h1>

  <section class="gallery">
    <!-- Four or more of these. ${IMG_NOTE} -->
    <figure>
      <img src="assets/project-img/sunrise.svg" alt="Sun rising over red hills">
      <figcaption>Morning walk</figcaption>
    </figure>
  </section>

  <!-- A footer: <footer>Photos by ...</footer> -->`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}.gallery {\n  /* lay the pictures out in a grid with a gap between them */\n}\n\nimg {\n  /* make each picture fit its box */\n}\n` },
      ],
      checks: [
        hasTitle,
        { text: 'A main heading (h1)', hint: 'Give the gallery a title in an <h1>.', page: () => Boolean($('h1') && text($('h1')).length >= 2) || 'The h1 is missing or empty.' },
        { text: 'At least four pictures, each in a <figure> with a <figcaption>', hint: 'Copy the example <figure> block until you have four or more, with a different picture and caption in each.', page: () => { const n = $$('figure').filter((f) => f.querySelector('img') && f.querySelector('figcaption') && text(f.querySelector('figcaption'))).length; return n >= 4 ? true : `Found ${n} complete figure(s).`; } },
        { text: 'Every image has alt text', hint: 'Captions are for everyone; alt text is for people who cannot see the picture. Give every <img> both.', page: () => { const bad = $$('img').filter((i) => (i.getAttribute('alt') || '').trim().length < 3); return !bad.length || `${bad.length} image(s) are missing alt text.`; } },
        { text: 'The figures are laid out in a grid (or flexbox)', hint: 'In style.css: .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }', page: () => { const f = $('figure'); return f && /grid|flex/.test(css(f.parentElement, 'display')) ? true : 'The element around your figures is not a grid or flex container.'; } },
        { text: 'There is a gap between the pictures', hint: 'Add gap: 16px (or similar) to the grid.', page: () => { const f = $('figure'); const g = f ? parseFloat(css(f.parentElement, 'columnGap')) || parseFloat(css(f.parentElement, 'rowGap')) : 0; return g > 0 || 'No gap set on the grid.'; } },
        { text: 'Every picture fits inside its figure', hint: 'img { width: 100%; height: auto; } makes each picture fill its box without spilling out.', page: async () => { await until(() => $$('img').every((i) => i.complete), 3000); const bad = $$('figure img').filter((i) => i.getBoundingClientRect().width > i.closest('figure').getBoundingClientRect().width + 1); return !bad.length || `${bad.length} picture(s) are wider than their figure.`; } },
        { text: 'A footer', hint: 'Finish with <footer>Photos by Ada</footer>.', page: () => Boolean($('footer') && text($('footer'))) || 'No footer with text yet.' },
      ],
      stretch: ['Make the first picture span two columns with grid-column: span 2.', 'Add a hover effect that gently zooms each picture (transform: scale).'],
    },

    // ======================================================================== Web Development
    {
      id: 'mini-shop', track: 'web', level: 'intermediate', minutes: 75,
      title: 'Product grid with a working bag',
      pitch: 'A small shop front: product cards in a responsive grid, and "Add to bag" buttons that update a bag counter.',
      skills: ['Cards and grids', 'DOM events', 'Responsive layout'],
      brief: 'Build the front page of a small clothing or accessories shop. Show at least three products as cards (picture, name, price in pounds, "Add to bag" button). A bag counter in the header starts at 0 and goes up every time someone adds a product. It must look good on a phone and a laptop.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Shop', `  <header>
    <strong>Amara Studio</strong>
    <span>Bag: <span id="bag-count">0</span></span>
  </header>

  <main class="products">
    <!-- Three or more product cards like this one -->
    <article class="product">
      <img src="assets/project-img/dress.svg" alt="Sage linen wrap dress">
      <h2>Linen wrap dress</h2>
      <p class="price">£85.00</p>
      <button type="button">Add to bag</button>
    </article>
  </main>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}.products {\n  /* a grid that fits as many cards as the screen allows */\n}\n\n.product img {\n  width: 100%;\n  height: auto;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// 1. Find the bag counter: document.querySelector('#bag-count')\n// 2. Find every "Add to bag" button: document.querySelectorAll('.product button')\n// 3. When any button is clicked, add 1 to a count and show it in the counter.\n` },
      ],
      checks: [
        { text: 'At least three product cards (class="product")', hint: 'Copy the example <article class="product"> until you have three or more, each with its own product.', page: () => { const n = $$('.product').length; return n >= 3 ? true : `Found ${n}.`; } },
        { text: 'Every card has a picture with alt text, a name (h2 or h3) and a £ price', hint: 'Each .product needs an <img alt="...">, an <h2> or <h3>, and a price like £85.00.', page: () => { const bad = $$('.product').filter((p) => !(p.querySelector('img[alt]') && p.querySelector('h2, h3') && /£\s?\d/.test(text(p)))); return !bad.length || `${bad.length} card(s) are missing a picture, name or £ price.`; } },
        { text: 'Every card has a real <button>', hint: 'Use <button type="button">Add to bag</button>: real buttons work with keyboards and screen readers.', page: () => $$('.product').length > 0 && $$('.product').every((p) => p.querySelector('button')) || 'Some cards have no <button>.' },
        { text: 'The bag counter (#bag-count) starts at 0', hint: 'Keep <span id="bag-count">0</span> in the header.', page: () => text($('#bag-count')) === '0' || `#bag-count shows "${text($('#bag-count'))}".` },
        { text: 'Clicking "Add to bag" increases the counter', hint: 'In script.js, listen for click on each .product button and set bag-count\'s textContent to the new total.', page: async () => { const b = $$('.product button'); if (b.length < 2) return 'Need at least two buttons to test.'; click(b[0]); click(b[1]); const ok = await until(() => text($('#bag-count')) === '2', 1500); return ok || `After two clicks the counter shows "${text($('#bag-count'))}" (expected 2).`; } },
        { text: 'The cards sit in a grid (or flexbox)', hint: '.products { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }', page: () => { const p = $('.product'); return p && /grid|flex/.test(css(p.parentElement, 'display')) || 'The element around your cards is not a grid or flex container.'; } },
        { text: 'The layout adapts to screen size', hint: 'Use auto-fill/auto-fit with minmax in your grid, or a @media query.', static: (f) => /@media|auto-fill|auto-fit/.test(f['style.css'] || '') || 'No @media query or auto-fill/auto-fit yet.' },
      ],
      stretch: ['Show a short "Added!" message on the button for a second after a click.', 'Keep a list of what is in the bag and show the total price.'],
    },
    {
      id: 'mini-tip', track: 'web', level: 'intermediate', minutes: 60,
      title: 'Tip and bill splitter',
      pitch: 'Type a bill, a tip percentage and how many people; see what each person pays, live.',
      skills: ['Forms and labels', 'Input events', 'Number formatting'],
      brief: 'Build a tip calculator. Three number inputs: the bill (id="bill"), the tip percentage (id="tip") and the number of people (id="people"). As soon as anything changes, show what each person pays in an element with id="per-person", in pounds with two decimals, like £22.00. It must never show NaN or Infinity, even with 0 people.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Tip calculator', `  <h1>Split the bill</h1>
  <!-- Three labelled number inputs: bill, tip and people. Each <label for="..."> must match its input's id.
       Example: <label for="bill">Bill (£)</label> <input id="bill" type="number" min="0" step="0.01"> -->

  <!-- The result: <p>Each person pays <strong id="per-person">£0.00</strong></p> -->`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}input {\n  /* 16px or more stops phones zooming in when you tap */\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// 1. Read the three inputs with Number(input.value).\n// 2. Work out: bill * (1 + tip / 100) / people\n// 3. Show it with toFixed(2), after a £ sign, in #per-person.\n// 4. Run your function on every 'input' event, and handle people = 0.\n` },
      ],
      checks: [
        { text: 'Three number inputs: #bill, #tip and #people', hint: 'Use <input id="bill" type="number">, and the same for tip and people.', page: () => { const bad = ['bill', 'tip', 'people'].filter((id) => !($('#' + id) && $('#' + id).type === 'number')); return !bad.length || `Missing or not type="number": ${bad.join(', ')}.`; } },
        { text: 'Every input has a label', hint: '<label for="bill">Bill (£)</label>: the for must match the input\'s id, so tapping the label focuses the input.', page: () => { const bad = ['bill', 'tip', 'people'].filter((id) => !$(`label[for="${id}"]`) && !($('#' + id) && $('#' + id).closest('label'))); return !bad.length || `No label for: ${bad.join(', ')}.`; } },
        { text: 'A result element #per-person', hint: 'Add <strong id="per-person">£0.00</strong> where the answer shows.', page: () => Boolean($('#per-person')) || 'No element with id="per-person".' },
        { text: 'It works out each person\'s share as you type', hint: 'Listen for the input event on all three fields and recalculate: 60 with a 10% tip between 3 people is £22.00.', page: async () => { setInput($('#bill'), '60'); setInput($('#tip'), '10'); setInput($('#people'), '3'); const ok = await until(() => /22\.00/.test(text($('#per-person'))), 1500); return ok || `For £60, 10% tip, 3 people it shows "${text($('#per-person'))}" (expected £22.00).`; } },
        { text: 'Money shows with a £ sign and two decimals', hint: 'Build the text as \'£\' + amount.toFixed(2).', page: () => /£\s?22\.00/.test(text($('#per-person'))) || `Shows "${text($('#per-person'))}".` },
        { text: 'Never shows NaN or Infinity (try 0 people)', hint: 'If people is 0 or empty, show £0.00 or a friendly message instead of dividing by zero.', page: async () => { setInput($('#people'), '0'); await wait(200); const t = text($('#per-person')); setInput($('#people'), ''); await wait(150); const t2 = text($('#per-person')); return !/NaN|Infinity/.test(t + t2) || `With 0 or no people it shows "${t}" / "${t2}".`; } },
        { text: 'Inputs are big enough to use on a phone (16px text or more)', hint: 'input { font-size: 16px; } (smaller text makes iPhones zoom in when you tap).', page: () => ['bill', 'tip', 'people'].every((id) => $('#' + id) && parseFloat(css($('#' + id), 'fontSize')) >= 16) || 'Input text is smaller than 16px.' },
      ],
      stretch: ['Add tip buttons (10%, 12.5%, 15%) that fill in the tip field.', 'Round each share up to the nearest penny so the bill is always covered.'],
    },
    {
      id: 'mini-todo', track: 'web', level: 'intermediate', minutes: 60,
      title: 'A to-do list',
      pitch: 'Add tasks, tick them off, and see how many are left. Safe against anything people type.',
      skills: ['Form submit events', 'Creating elements', 'Safe text handling'],
      brief: 'Build a to-do list. A form (id="todo-form") with a text input (id="todo-input") adds a task to a list (id="todo-list") when submitted, without reloading the page. Clicking a task toggles a "done" class. A counter (id="todo-count") shows how many tasks are not done. Empty tasks are ignored. Add text with textContent, never innerHTML.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('To-do', `  <h1>Today</h1>
  <form id="todo-form">
    <label for="todo-input">New task</label>
    <input id="todo-input" autocomplete="off">
    <button>Add</button>
  </form>
  <ul id="todo-list"></ul>
  <p><span id="todo-count">0</span> left to do</p>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}.done {\n  text-decoration: line-through;\n  opacity: 0.6;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// 1. Listen for the form's 'submit' event and call event.preventDefault() (or the page reloads).\n// 2. Trim the input's value; if it is empty, stop.\n// 3. Create an <li> with document.createElement, set its textContent, append it to #todo-list.\n// 4. Clicking an <li> toggles the 'done' class (classList.toggle).\n// 5. Update #todo-count to the number of items without the 'done' class.\n` },
      ],
      checks: [
        { text: 'The form, input, list and counter exist', hint: 'Keep the ids from the starter: todo-form, todo-input, todo-list and todo-count.', page: () => { const miss = ['#todo-form', '#todo-input', '#todo-list', '#todo-count'].filter((s) => !$(s)); return !miss.length || `Missing: ${miss.join(', ')}.`; } },
        { text: 'Submitting the form adds a task (without reloading the page)', hint: 'Listen for submit on the form, call event.preventDefault(), then append a new <li>.', page: async () => { setInput($('#todo-input'), 'Buy milk'); submit($('#todo-form')); const ok = await until(() => $$('#todo-list li').some((li) => /Buy milk/.test(text(li))), 1500); return ok || 'No <li> with the task appeared in #todo-list.'; } },
        { text: 'Empty tasks are ignored', hint: 'Trim the value and stop if it is empty: if (!value.trim()) return;', page: async () => { const n = $$('#todo-list li').length; setInput($('#todo-input'), '   '); submit($('#todo-form')); await wait(250); return $$('#todo-list li').length === n || 'A blank task was added.'; } },
        { text: 'Clicking a task toggles the "done" class', hint: 'li.addEventListener(\'click\', () => li.classList.toggle(\'done\'));', page: async () => { const li = $('#todo-list li'); if (!li) return 'No task to click.'; click(li); await wait(150); return li.classList.contains('done') || 'Clicking a task did not add the done class.'; } },
        { text: 'The counter shows tasks left to do', hint: 'After every change, count the <li> items without the done class and put the number in #todo-count.', page: async () => { setInput($('#todo-input'), 'Call the bank'); submit($('#todo-form')); await until(() => $$('#todo-list li').length >= 2, 1500); await wait(150); const left = $$('#todo-list li').filter((li) => !li.classList.contains('done')).length; return text($('#todo-count')) === String(left) || `#todo-count shows "${text($('#todo-count'))}" but ${left} task(s) are not done.`; } },
        { text: 'Tasks are added safely (textContent, not innerHTML)', hint: 'innerHTML would run any HTML someone types (an XSS bug). Use li.textContent = value.', static: (f) => { const j = f['script.js'] || ''; return /textContent/.test(j) && !/innerHTML\s*[+]?=|insertAdjacentHTML/.test(j) ? true : 'Use textContent to add the task text, and no innerHTML.'; } },
      ],
      stretch: ['Add a "Clear done" button.', 'Save the list when you run Code Ladder on your own computer, using localStorage.'],
    },

    // ======================================================================== Cryptography & Blockchain
    {
      id: 'mini-hash', track: 'crypto', level: 'beginner', minutes: 45,
      title: 'Live SHA-256 fingerprint page',
      pitch: 'Type anything and watch its SHA-256 hash change completely with every single letter.',
      skills: ['Web Crypto API', 'async/await', 'Bytes to hex'],
      brief: 'Build a page with a text box (id="text") and an output (id="hash"). Every time the text changes, show its SHA-256 hash as 64 lower-case hex characters, using the browser\'s built-in crypto.subtle.digest. Add a paragraph explaining, in your own words, what a hash is and why one changed letter changes everything.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Hash explorer', `  <h1>Hash explorer</h1>
  <label for="text">Type anything</label>
  <textarea id="text" rows="3"></textarea>
  <p>SHA-256: <code id="hash"></code></p>
  <!-- A paragraph explaining what a hash is, in your own words -->`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}#hash {\n  word-break: break-all;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// 1. Turn text into bytes: new TextEncoder().encode(text)\n// 2. Hash them: await crypto.subtle.digest('SHA-256', bytes)\n// 3. Turn the result into hex: [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')\n// 4. Show it in #hash, and do it again on every 'input' event.\n` },
      ],
      checks: [
        { text: 'A text box #text and an output #hash', hint: 'Keep the textarea with id="text" and the code element with id="hash".', page: () => (Boolean($('#text')) && Boolean($('#hash'))) || 'Missing #text or #hash.' },
        { text: 'Typing "hello" shows the correct SHA-256', hint: 'The hash of hello is 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824. Check your bytes-to-hex step.', page: async () => { setInput($('#text'), 'hello'); const ok = await until(() => text($('#hash')) === '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', 2000); return ok || `Shows "${text($('#hash')).slice(0, 20)}..."`; } },
        { text: 'The hash updates live and is always 64 hex characters', hint: 'Recalculate on every input event; show lower-case hex with padStart(2, \'0\') on each byte.', page: async () => { const before = text($('#hash')); setInput($('#text'), 'hello!'); const ok = await until(() => { const h = text($('#hash')); return h !== before && /^[0-9a-f]{64}$/.test(h); }, 2000); return ok || 'The hash did not change to a new 64-character hex value.'; } },
        { text: 'Uses the Web Crypto API', hint: 'Use crypto.subtle.digest(\'SHA-256\', bytes). Never write your own hash function.', static: (f) => /crypto\.subtle\.digest\(\s*['"]SHA-256['"]/.test(f['script.js'] || '') || 'No crypto.subtle.digest(\'SHA-256\', ...) call.' },
        { text: 'A paragraph explaining hashes in your own words', hint: 'Write at least two sentences: what a hash is, and why changing one letter changes the whole hash.', page: () => $$('p').some((p) => text(p).length >= 80) || 'No explanation paragraph (80+ characters) yet.' },
      ],
      stretch: ['Show the hash of the text with one letter flipped beside it, and highlight how many characters differ.', 'Add a file picker that hashes an uploaded file, like download checksums.'],
    },
    {
      id: 'mini-tipjar', track: 'crypto', level: 'intermediate', minutes: 60,
      title: 'Tip jar smart contract',
      pitch: 'A Solidity contract anyone can send tips to, that records who tipped, and only the owner can withdraw.',
      skills: ['Solidity basics', 'payable and msg.value', 'Access control', 'Events'],
      brief: 'Write a TipJar contract in Solidity. The deployer becomes the owner. Anyone can call tip() and send ETH (zero tips are rejected); the contract remembers how much each address tipped and emits an event. Only the owner can withdraw, and the withdrawal must check that the transfer succeeded. We check its structure here; compile and test it for real with Foundry when you are set up.',
      preview: 'text',
      files: [
        { name: 'TipJar.sol', lang: 'solidity', starter: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ncontract TipJar {\n    // 1. An owner address, set to msg.sender in the constructor\n\n    // 2. A mapping from address to the total they have tipped\n\n    // 3. An event, for example: event Tipped(address indexed from, uint256 amount);\n\n    // 4. function tip() external payable: reject zero, record it, emit the event\n\n    // 5. function withdraw() external: owner only; send the balance with .call and check it worked\n}\n` },
      ],
      checks: [
        { text: 'A pragma line and a contract called TipJar', hint: 'Start with pragma solidity ^0.8.24; and contract TipJar { ... }.', static: (f) => { const s = f['TipJar.sol'] || ''; return /pragma\s+solidity\s+[\^~>=]*0\.8/.test(s) && /contract\s+TipJar\b/.test(s) ? true : 'Need pragma solidity ^0.8.x and contract TipJar.'; } },
        { text: 'An owner, set to the deployer in the constructor', hint: 'address public immutable owner; and in constructor() { owner = msg.sender; }', static: (f) => { const s = f['TipJar.sol'] || ''; return /address\s+(public\s+|immutable\s+|private\s+)*owner\b/.test(s) && /constructor\s*\([^)]*\)[^{]*\{[^}]*owner\s*=\s*msg\.sender/.test(s) ? true : 'Need an owner variable set to msg.sender in the constructor.'; } },
        { text: 'A payable tip() function that rejects zero', hint: 'function tip() external payable { require(msg.value > 0, "No tip"); ... } (or a custom error).', static: (f) => { const s = f['TipJar.sol'] || ''; return /function\s+tip\s*\([^)]*\)\s*(external|public)\s+payable/.test(s) && /(require\s*\(\s*msg\.value\s*>\s*0|if\s*\(\s*msg\.value\s*==\s*0\s*\)\s*revert)/.test(s) ? true : 'tip() must be payable and reject msg.value of 0.'; } },
        { text: 'Records how much each address tipped', hint: 'mapping(address => uint256) public tipsFrom; then tipsFrom[msg.sender] += msg.value;', static: (f) => { const s = f['TipJar.sol'] || ''; return /mapping\s*\(\s*address\s*=>\s*uint256\s*\)/.test(s) && /\[\s*msg\.sender\s*\]\s*\+=\s*msg\.value/.test(s) ? true : 'Need a mapping(address => uint256) updated with += msg.value.'; } },
        { text: 'Emits an event for each tip', hint: 'Declare event Tipped(address indexed from, uint256 amount); and emit Tipped(msg.sender, msg.value); inside tip().', static: (f) => { const s = f['TipJar.sol'] || ''; return /event\s+\w+\s*\(/.test(s) && /emit\s+\w+\s*\(/.test(s) ? true : 'Declare an event and emit it.'; } },
        { text: 'Only the owner can withdraw', hint: 'In withdraw(): require(msg.sender == owner, "Not owner"); (or an onlyOwner modifier).', static: (f) => { const s = f['TipJar.sol'] || ''; return /function\s+withdraw\s*\(/.test(s) && /(msg\.sender\s*==\s*owner|owner\s*==\s*msg\.sender|msg\.sender\s*!=\s*owner|onlyOwner)/.test(s) ? true : 'withdraw() needs an owner check.'; } },
        { text: 'The withdrawal checks the transfer worked', hint: '(bool ok, ) = owner.call{value: address(this).balance}(""); require(ok, "Transfer failed");', static: (f) => { const s = f['TipJar.sol'] || ''; return /\.call\s*\{\s*value\s*:/.test(s) && /\(\s*bool\s+(\w+)\s*,?\s*\)/.test(s) && /(require\s*\(\s*\w+|if\s*\(\s*!\s*\w+\s*\)\s*revert)/.test(s) ? true : 'Use .call{value: ...}("") and require(ok).'; } },
        { text: 'Never uses tx.origin for access control', hint: 'tx.origin can be abused by a malicious contract in the middle. Always use msg.sender.', static: (f) => !/tx\.origin/.test(f['TipJar.sol'] || '') || 'Remove tx.origin.' },
      ],
      stretch: ['Write Foundry tests: tipping zero reverts, a stranger cannot withdraw, the owner can.', 'Add a top-tipper leaderboard that is cheap on gas.'],
    },
    {
      id: 'mini-units', track: 'crypto', level: 'intermediate', minutes: 60,
      title: 'ETH unit converter (no rounding errors)',
      pitch: 'Convert between ether and wei exactly, using BigInt, with a little converter page.',
      skills: ['BigInt', 'String parsing', 'Why floats and money do not mix'],
      brief: 'Ethereum amounts are whole numbers of wei (1 ether = 10^18 wei). JavaScript\'s normal numbers cannot hold that exactly, so write two exact functions with BigInt: toWei("1.5") returns 1500000000000000000n, and fromWei(1500000000000000000n) returns "1.5". Reject more than 18 decimal places. Then build a converter: an input (id="eth") and an output (id="wei").',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Unit converter', `  <h1>ETH to wei</h1>
  <label for="eth">Ether</label>
  <input id="eth" inputmode="decimal" value="1">
  <p>Wei: <code id="wei"></code></p>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}#wei {\n  word-break: break-all;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// toWei('1.5') -> 1500000000000000000n\n// Split on '.', pad the decimals to 18 digits with padEnd, then BigInt(whole + decimals).\nfunction toWei(eth) {\n\n}\n\n// fromWei(1500000000000000000n) -> '1.5'\n// whole = wei / 10n ** 18n; the remainder gives the decimals (padStart to 18, then trim trailing zeros).\nfunction fromWei(wei) {\n\n}\n\n// The examiner calls these, so keep them on window:\nwindow.toWei = toWei;\nwindow.fromWei = fromWei;\n\n// Finally: when #eth changes, show toWei(value) in #wei (and a friendly message if it throws).\n` },
      ],
      checks: [
        { text: 'toWei and fromWei are available', hint: 'Keep window.toWei = toWei; and window.fromWei = fromWei; at the end of script.js.', page: () => (typeof window.toWei === 'function' && typeof window.fromWei === 'function') || 'window.toWei or window.fromWei is missing.' },
        { text: 'toWei("1") is exactly 10^18 wei', hint: 'Return a BigInt: 1000000000000000000n.', page: () => { const v = window.toWei('1'); return v === 10n ** 18n || `Got ${String(v)} (${typeof v}).`; } },
        { text: 'Decimals convert exactly: 0.1 and 1.5', hint: 'Never multiply a float by 1e18 (0.1 is not exact in binary). Work with the digits as text, then BigInt().', page: () => { const a = window.toWei('0.1'); const b = window.toWei('1.5'); return (a === 100000000000000000n && b === 1500000000000000000n) || `Got ${String(a)} and ${String(b)}.`; } },
        { text: 'The smallest amount works: 1 wei', hint: 'toWei("0.000000000000000001") should be 1n.', page: () => { const v = window.toWei('0.000000000000000001'); return v === 1n || `Got ${String(v)}.`; } },
        { text: 'More than 18 decimals is rejected', hint: 'If the decimal part is longer than 18 digits, throw new Error(\'Too many decimals\').', page: () => { try { window.toWei('0.0000000000000000001'); return 'It accepted 19 decimal places.'; } catch (e) { return true; } } },
        { text: 'fromWei turns wei back into tidy ether text', hint: 'fromWei(1500000000000000000n) is "1.5" and fromWei(10n ** 18n) is "1" (no trailing zeros or dot).', page: () => { const a = window.fromWei(1500000000000000000n); const b = window.fromWei(10n ** 18n); return (a === '1.5' && b === '1') || `Got "${a}" and "${b}".`; } },
        { text: 'The converter updates as you type', hint: 'Listen for input on #eth and show toWei(value).toString() in #wei.', page: async () => { setInput($('#eth'), '2'); const ok = await until(() => text($('#wei')).replace(/[^0-9]/g, '') === '2000000000000000000', 1500); return ok || `#wei shows "${text($('#wei'))}".`; } },
        { text: 'Uses BigInt, not floating-point maths', hint: 'Use BigInt(...) and n-suffixed numbers; avoid parseFloat and multiplying by 1e18.', static: (f) => { const j = f['script.js'] || ''; return /BigInt\(|\d+n\b/.test(j) && !/parseFloat|\*\s*1e18/.test(j) ? true : 'Use BigInt and avoid parseFloat or * 1e18.'; } },
      ],
      stretch: ['Add gwei (10^9 wei) as a third unit.', 'Format big numbers with thin spaces every three digits.'],
    },

    // ======================================================================== Cybersecurity
    {
      id: 'mini-headers', track: 'security', level: 'intermediate', minutes: 40,
      title: 'Security headers for a real website',
      pitch: 'Write the _headers file that hardens a site on Netlify or Cloudflare Pages against XSS, clickjacking and more.',
      skills: ['HTTP security headers', 'Content Security Policy', 'HSTS'],
      brief: 'Netlify and Cloudflare Pages read a file called _headers and add those HTTP headers to every response. Write one for a static shop website that blocks the most common browser attacks: a strict Content Security Policy, no framing (clickjacking), no MIME sniffing, a sensible referrer policy, HSTS for a year or more, and a Permissions-Policy that switches off the camera, microphone and location.',
      preview: 'text',
      files: [
        { name: '_headers', lang: 'text', starter: `# Netlify and Cloudflare Pages add these headers to every response.\n# Format: a path on its own line, then indented "Header-Name: value" lines.\n# Lines starting with # are comments.\n\n/*\n  X-Example: replace me\n` },
      ],
      checks: [
        { text: 'Applies to every page (/*)', hint: 'Start the block with a line containing just /* so it covers the whole site.', static: (f) => /^\/\*\s*$/m.test(f._headers || '') || 'No /* line.' },
        { text: 'A Content-Security-Policy with default-src \'self\'', hint: 'Content-Security-Policy: default-src \'self\'; img-src \'self\' data:; frame-ancestors \'none\'', static: (f) => /Content-Security-Policy:[^\n]*default-src\s+'self'/i.test(f._headers || '') || 'No CSP with default-src \'self\'.' },
        { text: 'The site cannot be put in a frame (clickjacking)', hint: 'Add frame-ancestors \'none\' to the CSP (and X-Frame-Options: DENY for old browsers).', static: (f) => /frame-ancestors\s+'none'|X-Frame-Options:\s*DENY/i.test(f._headers || '') || 'No frame-ancestors \'none\' or X-Frame-Options: DENY.' },
        { text: 'No MIME sniffing', hint: 'X-Content-Type-Options: nosniff', static: (f) => /X-Content-Type-Options:\s*nosniff/i.test(f._headers || '') || 'Missing X-Content-Type-Options: nosniff.' },
        { text: 'A referrer policy that does not leak full URLs', hint: 'Referrer-Policy: strict-origin-when-cross-origin', static: (f) => /Referrer-Policy:\s*(strict-origin-when-cross-origin|no-referrer|same-origin|strict-origin)\b/i.test(f._headers || '') || 'Missing a strict Referrer-Policy.' },
        { text: 'HSTS for at least a year', hint: 'Strict-Transport-Security: max-age=31536000; includeSubDomains', static: (f) => { const m = (f._headers || '').match(/Strict-Transport-Security:\s*max-age=(\d+)/i); return (m && +m[1] >= 31536000) || 'No Strict-Transport-Security with max-age of 31536000 or more.'; } },
        { text: 'Camera, microphone and location switched off', hint: 'Permissions-Policy: camera=(), microphone=(), geolocation=()', static: (f) => { const m = (f._headers || '').match(/Permissions-Policy:([^\n]*)/i); return (m && ['camera=()', 'microphone=()', 'geolocation=()'].every((x) => m[1].replace(/\s/g, '').includes(x))) || 'Permissions-Policy must include camera=(), microphone=() and geolocation=().'; } },
        { text: 'No \'unsafe-inline\' or \'unsafe-eval\'', hint: 'Those keywords switch off most of the protection a CSP gives you against XSS.', static: (f) => !/unsafe-(inline|eval)/i.test(f._headers || '') || 'Remove \'unsafe-inline\' and \'unsafe-eval\'.' },
      ],
      stretch: ['Deploy a test site with these headers and check it at securityheaders.com.', 'Add a CSP report-to endpoint so violations are reported to you.'],
    },
    {
      id: 'mini-comments', track: 'security', level: 'intermediate', minutes: 60,
      title: 'A comment wall that cannot be hacked',
      pitch: 'A guestbook where people post comments, safe against cross-site scripting (XSS) whatever they type.',
      skills: ['XSS prevention', 'Safe DOM APIs', 'Input limits'],
      brief: 'Build a comment wall: a form (id="comment-form") with a text box (id="comment") adds comments to a list (id="comments"). Attackers will type HTML like <img src=x onerror=alert(1)>. Your page must show their text exactly as typed and never run it. Ignore empty comments and cap comments at 280 characters.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Comment wall', `  <h1>Guestbook</h1>
  <form id="comment-form">
    <label for="comment">Your comment</label>
    <textarea id="comment" rows="3"></textarea>
    <button>Post</button>
  </form>
  <ul id="comments"></ul>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}#comments li {\n  overflow-wrap: anywhere;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// 1. On submit: event.preventDefault(), read and trim the comment.\n// 2. Ignore it if empty; cut it to 280 characters with .slice(0, 280).\n// 3. Create an <li> and set its textContent (NEVER innerHTML), then add it to #comments.\n` },
      ],
      checks: [
        { text: 'The form, text box and list exist', hint: 'Keep the ids comment-form, comment and comments.', page: () => { const miss = ['#comment-form', '#comment', '#comments'].filter((s) => !$(s)); return !miss.length || `Missing: ${miss.join(', ')}.`; } },
        { text: 'Posting a comment adds it to the wall', hint: 'On submit, call preventDefault(), then append an <li> with the text.', page: async () => { setInput($('#comment'), 'Hello from Ada'); submit($('#comment-form')); return (await until(() => /Hello from Ada/.test(text($('#comments'))), 1500)) || 'The comment did not appear.'; } },
        { text: 'An XSS attack shows as plain text and never runs', hint: 'Set textContent, not innerHTML. Then <img src=x onerror=...> is shown as text instead of becoming an image that runs code.', page: async () => { setInput($('#comment'), '<img src=x onerror="window.__pwned=1">'); submit($('#comment-form')); await wait(400); if (window.__pwned) return 'The attack ran!'; if ($('#comments img')) return 'An <img> element was created from the comment.'; return /<img/.test(text($('#comments'))) || 'The comment text was not shown.'; } },
        { text: 'HTML tags are shown, not obeyed', hint: 'A comment of <b>bold</b> must show the angle brackets, not bold text.', page: async () => { setInput($('#comment'), '<b>bold</b>'); submit($('#comment-form')); await wait(300); return !$('#comments b') || 'A <b> element was created.'; } },
        { text: 'Empty comments are ignored', hint: 'if (!text.trim()) return;', page: async () => { const n = $$('#comments li').length; setInput($('#comment'), '    '); submit($('#comment-form')); await wait(250); return $$('#comments li').length === n || 'A blank comment was added.'; } },
        { text: 'Comments are limited to 280 characters', hint: 'Cut long comments with .slice(0, 280) (or refuse them, and say why).', page: async () => { const n = $$('#comments li').length; setInput($('#comment'), 'a'.repeat(300)); submit($('#comment-form')); await wait(300); const items = $$('#comments li'); if (items.length === n) return true; return text(items[items.length - 1]).length <= 280 || 'A 300-character comment was posted in full.'; } },
        { text: 'No dangerous HTML-writing APIs in the code', hint: 'innerHTML, outerHTML, insertAdjacentHTML and document.write all turn text into code. Use textContent and createElement.', static: (f) => !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(f['script.js'] || '') || 'script.js uses an HTML-writing API.' },
      ],
      stretch: ['Show each comment\'s time with a <time> element.', 'Add a Content-Security-Policy meta tag and check the page still works.'],
    },
    {
      id: 'mini-phish-report', track: 'security', level: 'beginner', minutes: 45,
      title: 'Phishing email investigation report',
      pitch: 'Take apart a real-looking phishing email and write the report a security team would want.',
      skills: ['Spotting phishing', 'Clear security writing', 'Incident response basics'],
      brief: 'A user forwarded the email at the top of report.md. Investigate it and write a short report with five sections: Summary, Red flags (at least five), Impact, What to do (steps for the user, starting now) and Prevention. The real company domain is launchpad.example.',
      preview: 'text',
      files: [
        { name: 'report.md', lang: 'text', starter: `# Phishing investigation\n\n> From: "Launchpad Security" <security@launchpad-verify.example>\n> Subject: URGENT: your wallet will be suspended in 24 hours\n>\n> We detected unusual activity on your account. To avoid permanent suspension,\n> verify your wallet within 24 hours at https://launchpad-verify.example/restore\n> You will need your 12-word recovery phrase to confirm ownership.\n>\n> Launchpad Security Team\n\n## Summary\n\n\n## Red flags\n\n- \n\n## Impact\n\n\n## What to do\n\n1. \n\n## Prevention\n\n- \n` },
      ],
      checks: [
        { text: 'A Summary of two or more sentences', hint: 'Under ## Summary, say in two sentences what the email is, what it wants, and how dangerous it is.', static: (f, h) => { const s = h.section(f['report.md'], 'Summary'); return (s.length >= 80 && (s.match(/[.!?](\s|$)/g) || []).length >= 2) || 'The Summary needs at least two full sentences.'; } },
        { text: 'At least five red flags', hint: 'Under ## Red flags, list five or more clues as bullet points (urgency, the domain, the request for a recovery phrase...).', static: (f, h) => { const n = h.bullets(h.section(f['report.md'], 'Red flags')); return n >= 5 || `Found ${n}.`; } },
        { text: 'Spots the lookalike domain', hint: 'Name the fake domain from the email in your red flags, and compare it with the real one, launchpad.example.', static: (f, h) => /launchpad-verify\.example/i.test(h.section(f['report.md'], 'Red flags')) || 'Your red flags do not mention launchpad-verify.example.' },
        { text: 'Spots the request for the recovery phrase', hint: 'No real company ever asks for a recovery (seed) phrase. Say so in your red flags.', static: (f, h) => /recovery phrase|seed phrase|12.word/i.test(h.section(f['report.md'], 'Red flags')) || 'Your red flags do not mention the recovery phrase.' },
        { text: 'An Impact section', hint: 'Under ## Impact, explain what happens if someone falls for it.', static: (f, h) => h.section(f['report.md'], 'Impact').length >= 40 || 'The Impact section is empty or very short.' },
        { text: 'At least four steps under What to do, including reporting it', hint: 'Numbered steps: do not click, report it, and what to do if you already entered your phrase (move funds to a new wallet).', static: (f, h) => { const s = h.section(f['report.md'], 'What to do'); const n = h.bullets(s); return (n >= 4 && /report/i.test(s)) || `Found ${n} step(s)${/report/i.test(s) ? '' : ', and none mention reporting'}.`; } },
        { text: 'At least three prevention ideas', hint: 'Under ## Prevention, list three or more things that would stop this next time (bookmarks, a hardware wallet, training...).', static: (f, h) => { const n = h.bullets(h.section(f['report.md'], 'Prevention')); return n >= 3 || `Found ${n}.`; } },
      ],
      stretch: ['Ask the AI examiner to play the attacker and write a harder version, then report that one too.', 'Turn your Prevention list into a one-page poster for a small team.'],
    },

    // ======================================================================== Keys & Accounts
    {
      id: 'mini-strength', track: 'keys', level: 'beginner', minutes: 50,
      title: 'Password strength checker',
      pitch: 'A sign-up helper that rejects short and common passwords, and loves long passphrases.',
      skills: ['Password rules that actually help', 'Functions and return values', 'Privacy'],
      brief: 'Write checkPassword(password) that returns { label, reasons }. label is "weak", "ok" or "strong". Passwords under 12 characters, or containing a common password or word (password, qwerty, 123456, letmein, welcome, admin, iloveyou...), are weak, and reasons says why. Long passphrases such as "correct horse battery staple" are strong. Show the result live under a password box (id="password", output id="strength"). It must never send the password anywhere.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Password check', `  <h1>Choose a password</h1>
  <label for="password">Password</label>
  <input id="password" type="password" autocomplete="new-password">
  <p id="strength" aria-live="polite"></p>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}const COMMON = ['password', 'qwerty', '123456', 'letmein', 'welcome', 'admin', 'iloveyou'];\n\n// Return { label: 'weak' | 'ok' | 'strong', reasons: [ ...why ] }\nfunction checkPassword(password) {\n\n}\n\nwindow.checkPassword = checkPassword; // the examiner calls this\n\n// Show checkPassword(...).label (and the reasons) in #strength on every input event.\n` },
      ],
      checks: [
        { text: 'checkPassword is available', hint: 'Keep window.checkPassword = checkPassword;', page: () => typeof window.checkPassword === 'function' || 'window.checkPassword is missing.' },
        { text: 'A common password is weak: "password123"', hint: 'Lower-case the password and check whether it contains any word from COMMON.', page: () => { const r = window.checkPassword('password123'); return String(r && r.label).toLowerCase() === 'weak' || `Got "${r && r.label}".`; } },
        { text: 'Anything under 12 characters is weak', hint: 'if (password.length < 12) mark it weak and add a reason.', page: () => { const r = window.checkPassword('Ab1!xyz9'); return String(r && r.label).toLowerCase() === 'weak' || `"Ab1!xyz9" got "${r && r.label}".`; } },
        { text: 'A common word hidden in a long password is still weak', hint: '"Welcome2026!!" is 13 characters but starts with a common word attackers try first.', page: () => { const r = window.checkPassword('Welcome2026!!'); return String(r && r.label).toLowerCase() === 'weak' || `Got "${r && r.label}".`; } },
        { text: 'A long passphrase is strong', hint: 'Length beats complexity: "correct horse battery staple" (28 characters) should be strong.', page: () => { const r = window.checkPassword('correct horse battery staple'); return String(r && r.label).toLowerCase() === 'strong' || `Got "${r && r.label}".`; } },
        { text: 'Weak passwords come with reasons', hint: 'Return reasons: [\'Use at least 12 characters\'] and so on, so people know how to fix it.', page: () => { const r = window.checkPassword('password123'); return (r && Array.isArray(r.reasons) && r.reasons.length > 0 && r.reasons.every((x) => typeof x === 'string')) || 'No reasons array for a weak password.'; } },
        { text: 'The page shows the result as you type', hint: 'On input, put the label (and reasons) in #strength.', page: async () => { setInput($('#password'), 'password123'); return (await until(() => /weak/i.test(text($('#strength'))), 1500)) || `#strength shows "${text($('#strength'))}".`; } },
        { text: 'The password never leaves the page', hint: 'No fetch, XMLHttpRequest, sendBeacon or WebSocket: a strength checker has no reason to send anything.', static: (f) => !/fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(f['script.js'] || '') || 'script.js sends data over the network.' },
      ],
      stretch: ['Check against the Have I Been Pwned range API with k-anonymity (only the first 5 hash characters leave the browser).', 'Add a "show password" toggle button.'],
    },
    {
      id: 'mini-leak-scanner', track: 'keys', level: 'intermediate', minutes: 60,
      title: 'Secret leak scanner',
      pitch: 'Paste any code or config and find private keys, cloud keys and tokens before they reach GitHub.',
      skills: ['Regular expressions', 'Secret formats', 'Avoiding false alarms'],
      brief: 'Write scanForSecrets(text) that returns a list of findings, each { type, line } with line numbers starting at 1. Find Ethereum private keys (0x followed by 64 hex characters), AWS access key IDs (AKIA followed by 16 capital letters or digits), GitHub tokens (ghp_ followed by 36 letters or digits) and PEM private key headers (-----BEGIN ... PRIVATE KEY-----). Do not flag Ethereum addresses (0x plus 40 hex). Then build a page: a text box (id="input"), a Scan button (id="scan") and a results list (id="results").',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Leak scanner', `  <h1>Secret leak scanner</h1>
  <label for="input">Paste code or config</label>
  <textarea id="input" rows="8"></textarea>
  <button id="scan" type="button">Scan</button>
  <ul id="results"></ul>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}textarea {\n  width: 100%;\n  font-family: monospace;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// Each rule: a type and a regular expression.\nconst RULES = [\n  { type: 'Ethereum private key', re: /0x[0-9a-fA-F]{64}\\b/ },\n  // add AWS access key ID, GitHub token and PEM private key rules\n];\n\n// Return [{ type, line }], line numbers starting at 1.\nfunction scanForSecrets(text) {\n\n}\n\nwindow.scanForSecrets = scanForSecrets; // the examiner calls this\n\n// When #scan is clicked, show one <li> per finding in #results (use textContent).\n` },
      ],
      checks: [
        { text: 'scanForSecrets is available and returns a list', hint: 'Keep window.scanForSecrets = scanForSecrets; and always return an array.', page: () => (typeof window.scanForSecrets === 'function' && Array.isArray(window.scanForSecrets('nothing here'))) || 'window.scanForSecrets is missing or does not return an array.' },
        { text: 'Finds an Ethereum private key (with its line number)', hint: 'Split the text on \\n and test each line; line numbers start at 1.', page: () => { const r = window.scanForSecrets('const rpc = "https://rpc.example";\nconst PRIVATE_KEY = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318";'); return r.some((x) => x.line === 2) || `Findings: ${JSON.stringify(r)}`; } },
        { text: 'Finds an AWS access key ID', hint: 'AWS access key IDs look like AKIA followed by 16 capital letters or digits: /AKIA[0-9A-Z]{16}/', page: () => { const r = window.scanForSecrets('region = eu-west-2\naws_access_key_id = AKIAIOSFODNN7EXAMPLE'); return r.some((x) => x.line === 2) || `Findings: ${JSON.stringify(r)}`; } },
        { text: 'Finds a GitHub token', hint: 'Classic GitHub personal tokens are ghp_ followed by 36 letters or digits.', page: () => { const r = window.scanForSecrets('token: ghp_1234567890abcdefghijklmnopqrstuvwx12'); return r.some((x) => x.line === 1) || `Findings: ${JSON.stringify(r)}`; } },
        { text: 'Finds a PEM private key header', hint: 'Match -----BEGIN (anything) PRIVATE KEY-----, which covers RSA, EC and OpenSSH keys.', page: () => { const r = window.scanForSecrets('# deploy key\n-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXk='); return r.some((x) => x.line === 2) || `Findings: ${JSON.stringify(r)}`; } },
        { text: 'Does not flag Ethereum addresses or normal code', hint: 'An address is only 40 hex characters; require exactly 64 for a private key, with a word boundary (\\b) after it.', page: () => { const r = window.scanForSecrets('const owner = "0x52908400098527886E0F7030069857D2E4169EE7";\nconst rpc = "https://rpc.example";\nconsole.log("hello");'); return r.length === 0 || `False alarms: ${JSON.stringify(r)}`; } },
        { text: 'The page shows findings when you press Scan', hint: 'On #scan click, run scanForSecrets on #input and add one <li> per finding to #results.', page: async () => { setInput($('#input'), 'x\nAKIAIOSFODNN7EXAMPLE\nghp_1234567890abcdefghijklmnopqrstuvwx12'); click($('#scan')); return (await until(() => $$('#results li').length >= 2, 1500)) || `#results has ${$$('#results li').length} item(s).`; } },
      ],
      stretch: ['Mask each secret in the results (show only its first and last 4 characters).', 'Turn the rules into a Git pre-commit hook, like the one in the Keys & Accounts track.'],
    },
    {
      id: 'mini-limiter', track: 'keys', level: 'advanced', minutes: 60,
      title: 'Login rate limiter',
      pitch: 'The code that stops credential stuffing: five tries per account per window, then wait.',
      skills: ['Closures and Maps', 'Time windows', 'Account takeover defence'],
      brief: 'Write createLimiter({ max, windowMs, now }) returning an object with attempt(key) (true if allowed, false if blocked) and reset(key). Each key (an email or IP) gets max attempts per windowMs; after that, attempts are blocked until the window has passed. now() returns the current time in milliseconds (the examiner passes a fake clock). Then wire up a demo login form: a #username box and a #login button that shows a message in #message, including a "too many attempts" message.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Login', `  <h1>Log in</h1>
  <label for="username">Email</label>
  <input id="username" type="email" value="ada@example.com">
  <button id="login" type="button">Log in</button>
  <p id="message" aria-live="polite"></p>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// createLimiter({ max: 5, windowMs: 15 * 60 * 1000, now: () => Date.now() })\n// Keep a Map from key to the times of recent attempts (or a count and a window start).\nfunction createLimiter({ max, windowMs, now = () => Date.now() }) {\n  return {\n    attempt(key) {\n\n    },\n    reset(key) {\n\n    },\n  };\n}\n\nwindow.createLimiter = createLimiter; // the examiner calls this\n\n// Demo: every #login click counts as a failed attempt for #username.\n// Show "Wrong password" while allowed, and "Too many attempts, try again later" once blocked.\n` },
      ],
      checks: [
        { text: 'createLimiter returns attempt() and reset()', hint: 'Keep window.createLimiter = createLimiter; and return an object with both functions.', page: () => { if (typeof window.createLimiter !== 'function') return 'window.createLimiter is missing.'; const l = window.createLimiter({ max: 5, windowMs: 1000, now: () => 0 }); return (l && typeof l.attempt === 'function' && typeof l.reset === 'function') || 'The limiter needs attempt and reset.'; } },
        { text: 'Allows 5 attempts, then blocks the 6th', hint: 'Count attempts per key; once the count reaches max, return false.', page: () => { const l = window.createLimiter({ max: 5, windowMs: 60000, now: () => 1000 }); const r = [1, 2, 3, 4, 5, 6].map(() => l.attempt('ada@example.com')); return JSON.stringify(r) === '[true,true,true,true,true,false]' || `Got ${JSON.stringify(r)}.`; } },
        { text: 'Each account is counted separately', hint: 'Use a Map keyed by the key, so one attacked account does not lock out everyone.', page: () => { const l = window.createLimiter({ max: 2, windowMs: 60000, now: () => 1000 }); l.attempt('a'); l.attempt('a'); l.attempt('a'); return l.attempt('b') === true || 'Key "b" was blocked by attempts on key "a".'; } },
        { text: 'Attempts are allowed again once the window has passed', hint: 'Compare times with now(): drop attempts older than windowMs (or start a new window).', page: () => { let t = 0; const l = window.createLimiter({ max: 2, windowMs: 1000, now: () => t }); l.attempt('a'); l.attempt('a'); const blocked = l.attempt('a') === false; t = 1500; return (blocked && l.attempt('a') === true) || 'After the window passed, attempts were still blocked (or were never blocked).'; } },
        { text: 'reset() clears an account (after a successful login)', hint: 'reset(key) deletes the key from your Map.', page: () => { const l = window.createLimiter({ max: 1, windowMs: 60000, now: () => 1000 }); l.attempt('a'); const blocked = l.attempt('a') === false; l.reset('a'); return (blocked && l.attempt('a') === true) || 'reset() did not clear the account.'; } },
        { text: 'The demo form shows "too many attempts" after repeated failures', hint: 'Create one limiter for the page, and on each #login click call attempt(username); show a clear message in #message.', page: async () => { for (let i = 0; i < 8; i++) { click($('#login')); await wait(30); } return (await until(() => /too many|try again|locked|wait/i.test(text($('#message'))), 1500)) || `#message shows "${text($('#message'))}".`; } },
      ],
      stretch: ['Add a second limiter per IP address, so an attacker cannot try one password across thousands of accounts.', 'Make the wait grow after each lockout (exponential backoff).'],
    },

    // ======================================================================== Encryption
    {
      id: 'mini-vault', track: 'encrypt', level: 'advanced', minutes: 75,
      title: 'Encrypted notes with a passphrase',
      pitch: 'Encrypt a note in the browser with AES-GCM and a key derived from a passphrase. Only the passphrase opens it.',
      skills: ['PBKDF2 key derivation', 'AES-GCM', 'Salts, IVs and tamper detection'],
      brief: 'Write encryptNote(passphrase, text) and decryptNote(passphrase, payload), both async. Derive a key from the passphrase with PBKDF2 (a random 16-byte salt, at least 100,000 iterations, SHA-256), encrypt with AES-GCM and a fresh random 12-byte IV, and return one Base64 string holding salt, IV and ciphertext. decryptNote must fail with a wrong passphrase or if anyone changes the payload. Add a little page: #passphrase, #note, an #encrypt button and an #output box.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Encrypted notes', `  <h1>Encrypted notes</h1>
  <label for="passphrase">Passphrase</label>
  <input id="passphrase" type="password">
  <label for="note">Note</label>
  <textarea id="note" rows="4"></textarea>
  <button id="encrypt" type="button">Encrypt</button>
  <label for="output">Encrypted</label>
  <textarea id="output" rows="4" readonly></textarea>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}label, textarea, input, button {\n  display: block;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}const enc = new TextEncoder();\nconst dec = new TextDecoder();\nconst toB64 = (bytes) => btoa(String.fromCharCode(...bytes));\nconst fromB64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));\n\n// Derive an AES-GCM key from the passphrase and salt with PBKDF2 (see the Encryption track lesson).\nasync function deriveKey(passphrase, salt) {\n\n}\n\n// salt (16 bytes) + iv (12 bytes) + ciphertext, as one Base64 string\nasync function encryptNote(passphrase, text) {\n\n}\n\nasync function decryptNote(passphrase, payload) {\n\n}\n\nwindow.encryptNote = encryptNote; // the examiner calls these\nwindow.decryptNote = decryptNote;\n` },
      ],
      checks: [
        { text: 'encryptNote and decryptNote are available', hint: 'Keep the window.encryptNote and window.decryptNote lines.', page: () => (typeof window.encryptNote === 'function' && typeof window.decryptNote === 'function') || 'One of the functions is missing.' },
        { text: 'A note survives the round trip', hint: 'decryptNote(pass, await encryptNote(pass, text)) must give back the text exactly.', page: async () => { const p = await window.encryptNote('correct horse', 'Meet at 9pm'); const back = await window.decryptNote('correct horse', p); return back === 'Meet at 9pm' || `Got back "${back}".`; } },
        { text: 'The output is not readable and is a single string', hint: 'Return Base64 of salt + IV + ciphertext; the note must not appear in it.', page: async () => { const p = await window.encryptNote('correct horse', 'Meet at 9pm'); return (typeof p === 'string' && !p.includes('Meet')) || 'The payload is not a string, or contains the note.'; } },
        { text: 'Encrypting the same note twice gives different results', hint: 'Make a new random salt and IV for every encryption with crypto.getRandomValues.', page: async () => { const a = await window.encryptNote('pw', 'same note'); const b = await window.encryptNote('pw', 'same note'); return a !== b || 'Both encryptions were identical: are the salt and IV random each time?'; } },
        { text: 'A wrong passphrase cannot decrypt it', hint: 'AES-GCM decryption throws when the key is wrong. Let the error propagate (do not catch and return empty text).', page: async () => { const p = await window.encryptNote('right passphrase', 'secret'); try { const r = await window.decryptNote('wrong passphrase', p); return `It decrypted with the wrong passphrase (got "${r}").`; } catch (e) { return true; } } },
        { text: 'Tampering is detected', hint: 'Changing any byte must make decryption fail; AES-GCM\'s authentication tag does this for you.', page: async () => { const p = await window.encryptNote('pw', 'pay 10 to Ada'); const bytes = Uint8Array.from(atob(p), (c) => c.charCodeAt(0)); bytes[bytes.length - 5] ^= 1; const bad = btoa(String.fromCharCode(...bytes)); try { await window.decryptNote('pw', bad); return 'A tampered payload decrypted without an error.'; } catch (e) { return true; } } },
        { text: 'The right building blocks: PBKDF2 (100,000+ iterations), AES-GCM and secure randomness', hint: 'Use PBKDF2 with iterations of 100000 or more (600000 is today\'s advice), AES-GCM, and crypto.getRandomValues. Never Math.random.', static: (f) => { const j = f['script.js'] || ''; const it = (j.match(/iterations\s*:\s*([\d_]+)/) || [])[1]; return /PBKDF2/.test(j) && /AES-GCM/.test(j) && /getRandomValues/.test(j) && !/Math\.random/.test(j) && it && +it.replace(/_/g, '') >= 100000 ? true : 'Need PBKDF2 with 100000+ iterations, AES-GCM, getRandomValues, and no Math.random.'; } },
        { text: 'The Encrypt button fills the output box', hint: 'On #encrypt click, await encryptNote and put the result in #output.value.', page: async () => { setInput($('#passphrase'), 'pw'); setInput($('#note'), 'hello'); click($('#encrypt')); return (await until(() => ($('#output') && $('#output').value.length > 20), 6000)) || '#output stayed empty.'; } },
      ],
      stretch: ['Add a Decrypt button that turns #output back into the note.', 'Store a version number at the start of the payload, so you can change the format later.'],
    },
    {
      id: 'mini-passgen', track: 'encrypt', level: 'beginner', minutes: 45,
      title: 'Secure password generator',
      pitch: 'Generate truly random passwords with the browser\'s cryptographic random number generator.',
      skills: ['crypto.getRandomValues', 'Character sets', 'Why Math.random is not secure'],
      brief: 'Write generatePassword({ length, symbols }) that returns a random password of exactly that length, using crypto.getRandomValues (never Math.random). With symbols: false use only letters and digits; with symbols: true include symbols too. Build a page with a length box (id="length"), a Generate button (id="generate") and an output (id="output").',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Password generator', `  <h1>Password generator</h1>
  <label for="length">Length</label>
  <input id="length" type="number" min="8" max="64" value="20">
  <label><input id="symbols" type="checkbox" checked> Include symbols</label>
  <button id="generate" type="button">Generate</button>
  <p><code id="output"></code></p>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}#output {\n  font-size: 1.3rem;\n  word-break: break-all;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\nconst SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';\n\n// Pick each character with crypto.getRandomValues (never Math.random).\nfunction generatePassword({ length = 20, symbols = true } = {}) {\n\n}\n\nwindow.generatePassword = generatePassword; // the examiner calls this\n\n// When #generate is clicked, read #length and #symbols and show a new password in #output.\n` },
      ],
      checks: [
        { text: 'generatePassword is available', hint: 'Keep window.generatePassword = generatePassword;', page: () => typeof window.generatePassword === 'function' || 'window.generatePassword is missing.' },
        { text: 'Passwords have exactly the length asked for', hint: 'Loop length times and add one random character each time.', page: () => { const a = window.generatePassword({ length: 20, symbols: true }); const b = window.generatePassword({ length: 32, symbols: false }); return (typeof a === 'string' && a.length === 20 && b.length === 32) || `Lengths were ${a && a.length} and ${b && b.length} (expected 20 and 32).`; } },
        { text: 'Every password is different', hint: 'Use fresh random values each time.', page: () => { const s = new Set(Array.from({ length: 10 }, () => window.generatePassword({ length: 16, symbols: true }))); return s.size === 10 || 'Some passwords repeated.'; } },
        { text: 'Without symbols: only letters and digits', hint: 'With symbols: false, choose only from LETTERS.', page: () => { const p = Array.from({ length: 20 }, () => window.generatePassword({ length: 20, symbols: false })).join(''); return /^[A-Za-z0-9]+$/.test(p) || 'Found symbols when symbols was false.'; } },
        { text: 'With symbols: symbols really appear', hint: 'With symbols: true, choose from LETTERS + SYMBOLS.', page: () => { const p = Array.from({ length: 30 }, () => window.generatePassword({ length: 20, symbols: true })).join(''); return /[^A-Za-z0-9]/.test(p) || 'No symbols appeared in 30 passwords.'; } },
        { text: 'Uses secure randomness only', hint: 'crypto.getRandomValues gives unpredictable numbers; Math.random can be predicted by an attacker.', static: (f) => { const j = f['script.js'] || ''; return /getRandomValues/.test(j) && !/Math\.random/.test(j) ? true : 'Use crypto.getRandomValues and remove Math.random.'; } },
        { text: 'The Generate button shows a password of the chosen length', hint: 'Read Number(#length.value) on click and show the result in #output.', page: async () => { setInput($('#length'), '24'); click($('#generate')); return (await until(() => text($('#output')).length === 24, 1500)) || `#output shows ${text($('#output')).length} characters (expected 24).`; } },
      ],
      stretch: ['Avoid "modulo bias": reject random values above the largest multiple of the alphabet size.', 'Add a passphrase mode that picks random words from a word list.'],
    },
    {
      id: 'mini-enc-policy', track: 'encrypt', level: 'intermediate', minutes: 45,
      title: 'Encryption plan for a small online shop',
      pitch: 'Write the one-page encryption policy a small clothing brand could actually follow.',
      skills: ['Data in transit and at rest', 'Key management', 'US breach rules'],
      brief: 'A small online clothing shop stores customer names, emails, addresses, phone numbers and order history, takes payments through Stripe, and backs its database up nightly. Write their encryption plan in plan.md with six sections: Data we hold, In transit, At rest, Keys, Backups, and If something leaks.',
      preview: 'text',
      files: [
        { name: 'plan.md', lang: 'text', starter: `# Encryption plan: Amara Studio\n\n## Data we hold\n\n- \n\n## In transit\n\n\n## At rest\n\n\n## Keys\n\n\n## Backups\n\n\n## If something leaks\n\n` },
      ],
      checks: [
        { text: 'Lists at least four kinds of data held', hint: 'Under ## Data we hold, list each kind of data as a bullet, and how sensitive it is.', static: (f, h) => { const n = h.bullets(h.section(f['plan.md'], 'Data we hold')); return n >= 4 || `Found ${n}.`; } },
        { text: 'In transit: HTTPS everywhere, with HSTS', hint: 'Say every page and API uses HTTPS (TLS), with the HSTS header so browsers never use plain HTTP.', static: (f, h) => { const s = h.section(f['plan.md'], 'In transit'); return (/https|tls/i.test(s) && /hsts|strict-transport/i.test(s)) || 'Mention HTTPS/TLS and HSTS.'; } },
        { text: 'At rest: disk or database encryption plus field-level encryption for the most sensitive data', hint: 'Mention encryption of the database or disks, and AES-GCM (or similar) for fields like phone numbers and addresses.', static: (f, h) => { const s = h.section(f['plan.md'], 'At rest'); return (/database|disk/i.test(s) && /aes|field|column/i.test(s)) || 'Mention the database or disk, and field-level (AES) encryption.'; } },
        { text: 'Keys: where they live and how they rotate', hint: 'Say keys live in a KMS or secrets manager (never in the code or the database), who can use them, and how often they rotate.', static: (f, h) => { const s = h.section(f['plan.md'], 'Keys'); return (/kms|secret(s)? manager|vault|key management/i.test(s) && /rotat/i.test(s)) || 'Mention a KMS or secrets manager, and rotation.'; } },
        { text: 'Backups: encrypted, and restores are tested', hint: 'Backups are encrypted before upload, stored privately, and restored as a test on a schedule.', static: (f, h) => { const s = h.section(f['plan.md'], 'Backups'); return (/encrypt/i.test(s) && /restor|test/i.test(s)) || 'Mention encrypted backups and restore tests.'; } },
        { text: 'If something leaks: rotation and US breach notification', hint: 'Rotate exposed keys, work out what leaked, and follow state breach-notification laws (encrypted data with a safe key is often exempt).', static: (f, h) => { const s = h.section(f['plan.md'], 'If something leaks'); return (/rotat|revok/i.test(s) && /notif|breach|law|attorney/i.test(s)) || 'Mention rotating keys and breach notification.'; } },
        { text: 'Card details are left to the payment provider', hint: 'Say the shop never stores card numbers: Stripe holds them. That keeps the shop out of most card-security rules.', static: (f) => /stripe|payment provider|card/i.test(f['plan.md'] || '') || 'Mention how card details are handled (by Stripe, never stored by the shop).' },
      ],
      stretch: ['Add a table: each kind of data, where it lives, how it is encrypted, who can read it.', 'Ask the AI examiner to play an auditor and find the weakest part of your plan.'],
    },

    // ======================================================================== Tokenomics
    {
      id: 'mini-allocation', track: 'tokenomics', level: 'beginner', minutes: 50,
      title: 'Token allocation table',
      pitch: 'Design a fair token allocation and show it as a table with a bar for each group.',
      skills: ['Allocation design', 'Arrays of objects', 'Rendering tables'],
      brief: 'Design the allocation for a new token as an array in script.js (window.allocation): each group has a name, a percent, cliffMonths and vestingMonths. It must add up to exactly 100%, have at least four groups, keep team and advisors at 25% or less in total, and give the team at least a 6-month cliff. Then render it as a table (id="allocation-table") with one row per group, the percentage, and a bar showing its size.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Allocation', `  <h1>LADDER token allocation</h1>
  <table id="allocation-table">
    <thead><tr><th>Group</th><th>Share</th><th></th><th>Cliff</th><th>Vesting</th></tr></thead>
    <tbody></tbody>
  </table>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}.bar {\n  height: 10px;\n  background: #2747e0;\n  border-radius: 5px;\n}\n` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}window.allocation = [\n  { name: 'Community', percent: 40, cliffMonths: 0, vestingMonths: 36 },\n  // add more groups: team, investors, treasury, liquidity...\n];\n\n// For each group, add a <tr> to the table body with: name, percent + '%', a bar\n// (a <div class="bar"> whose style.width is the percent), cliff and vesting months.\n` },
      ],
      checks: [
        { text: 'At least four groups, each with a name and a percent', hint: 'Fill window.allocation with four or more { name, percent, cliffMonths, vestingMonths } objects.', page: () => { const a = window.allocation; return (Array.isArray(a) && a.length >= 4 && a.every((g) => g && typeof g.name === 'string' && typeof g.percent === 'number')) || 'window.allocation needs four or more groups with name and percent.'; } },
        { text: 'The shares add up to exactly 100%', hint: 'Add the percents up and adjust until they total 100.', page: () => { const t = window.allocation.reduce((s, g) => s + g.percent, 0); return Math.abs(t - 100) < 1e-9 || `They add up to ${t}%.`; } },
        { text: 'Team, founders and advisors get 25% or less in total', hint: 'Insiders with a big share can sell on the community. Keep team + advisors at 25% or below.', page: () => { const t = window.allocation.filter((g) => /team|founder|advisor/i.test(g.name)).reduce((s, g) => s + g.percent, 0); return t <= 25 || `Team, founders and advisors hold ${t}%.`; } },
        { text: 'The team has at least a 6-month cliff', hint: 'Add a team group with cliffMonths of 6 or more (12 is common), so they cannot sell at launch.', page: () => { const team = window.allocation.find((g) => /team|founder/i.test(g.name)); return (team && team.cliffMonths >= 6) || (team ? `The team cliff is ${team.cliffMonths} months.` : 'No team (or founders) group yet.'); } },
        { text: 'The table has one row per group', hint: 'Add one <tr> to #allocation-table tbody for each group.', page: () => { const n = $$('#allocation-table tbody tr').length; return n === window.allocation.length || `The table has ${n} rows for ${window.allocation.length} groups.`; } },
        { text: 'Each row shows its percentage', hint: 'Put percent + \'%\' in a cell of each row.', page: () => { const rows = $$('#allocation-table tbody tr'); return (rows.length > 0 && rows.every((tr) => /\d\s?%/.test(text(tr)))) || (rows.length ? 'Some rows have no percentage.' : 'The table has no rows yet.'); } },
        { text: 'Each row has a bar showing its share', hint: 'Add a <div class="bar"> in each row and set bar.style.width = percent + \'%\'.', page: () => { const rows = $$('#allocation-table tbody tr'); return (rows.length > 0 && rows.every((tr) => tr.querySelector('.bar, progress, meter, [style*="width"]'))) || (rows.length ? 'Some rows have no bar.' : 'The table has no rows yet.'); } },
      ],
      stretch: ['Highlight any group whose tokens all unlock in the first month.', 'Add a total row at the bottom of the table.'],
    },
    {
      id: 'mini-vesting', track: 'tokenomics', level: 'intermediate', minutes: 50,
      title: 'Vesting calculator',
      pitch: 'How many tokens has someone unlocked by month N? Cliffs, linear vesting and a schedule table.',
      skills: ['Cliff and linear vesting', 'Edge cases', 'Tables from data'],
      brief: 'Write vestedAt(month, { total, cliffMonths, vestingMonths }) returning how many tokens are unlocked at that month. Vesting is linear over vestingMonths from month 0, but nothing is unlocked before the cliff; at the cliff, everything accrued so far unlocks at once. Round down to whole tokens, never go below 0 or above total. Then show a schedule table (id="schedule") with a row for each month.',
      files: [
        { name: 'index.html', lang: 'html', starter: page('Vesting', `  <h1>Team vesting: 1,200 tokens, 12-month cliff, 48 months</h1>
  <table id="schedule">
    <thead><tr><th>Month</th><th>Unlocked</th></tr></thead>
    <tbody></tbody>
  </table>`) },
        { name: 'style.css', lang: 'css', starter: `${CSS_NOTE}` },
        { name: 'script.js', lang: 'js', starter: `${JS_NOTE}// vestedAt(24, { total: 1200, cliffMonths: 12, vestingMonths: 48 }) -> 600\nfunction vestedAt(month, { total, cliffMonths, vestingMonths }) {\n\n}\n\nwindow.vestedAt = vestedAt; // the examiner calls this\n\n// Fill #schedule with one row per month from 0 to 48.\n` },
      ],
      checks: [
        { text: 'vestedAt is available', hint: 'Keep window.vestedAt = vestedAt;', page: () => typeof window.vestedAt === 'function' || 'window.vestedAt is missing.' },
        { text: 'Nothing unlocks before the cliff', hint: 'If month < cliffMonths, return 0.', page: () => { const p = { total: 1200, cliffMonths: 12, vestingMonths: 48 }; const r = [0, 6, 11].map((m) => window.vestedAt(m, p)); return r.every((x) => x === 0) || `Months 0, 6, 11 gave ${r.join(', ')}.`; } },
        { text: 'At the cliff, everything accrued so far unlocks', hint: 'At month 12 of 48, a quarter has accrued: 300 of 1200.', page: () => { const r = window.vestedAt(12, { total: 1200, cliffMonths: 12, vestingMonths: 48 }); return r === 300 || `Month 12 gave ${r} (expected 300).`; } },
        { text: 'Linear after the cliff', hint: 'total * month / vestingMonths: month 24 gives 600, month 30 gives 750.', page: () => { const p = { total: 1200, cliffMonths: 12, vestingMonths: 48 }; const a = window.vestedAt(24, p); const b = window.vestedAt(30, p); return (a === 600 && b === 750) || `Months 24 and 30 gave ${a} and ${b}.`; } },
        { text: 'Rounds down to whole tokens', hint: 'Use Math.floor: month 13 of 1000 tokens over 48 months is 270 (not 270.83...).', page: () => { const r = window.vestedAt(13, { total: 1000, cliffMonths: 12, vestingMonths: 48 }); return r === 270 || `Got ${r}.`; } },
        { text: 'Never more than the total', hint: 'After vestingMonths, return total: Math.min(total, ...).', page: () => { const p = { total: 1200, cliffMonths: 12, vestingMonths: 48 }; const r = [48, 60, 120].map((m) => window.vestedAt(m, p)); return r.every((x) => x === 1200) || `Months 48, 60, 120 gave ${r.join(', ')}.`; } },
        { text: 'A schedule table with a row per month', hint: 'Fill #schedule tbody with rows for months 0 to 48 (at least 12 rows).', page: () => { const n = $$('#schedule tbody tr').length; return n >= 12 || `The table has ${n} rows.`; } },
      ],
      stretch: ['Support monthly unlocks that start only after the cliff (a different, common schedule) with an option.', 'Draw the schedule as an SVG line chart.'],
    },
    {
      id: 'mini-onepager', track: 'tokenomics', level: 'intermediate', minutes: 50,
      title: 'An honest token one-pager',
      pitch: 'The one page every token should publish: purpose, supply, allocation, vesting and real risks.',
      skills: ['Token design', 'Clear writing', 'Staying on the right side of the rules'],
      brief: 'Write token.md for a token of your own (for a game, a creator community, a loyalty scheme...). Sections: What the token is for, Supply, Allocation (a Markdown table whose percentages add up to 100), Vesting, and Risks. No hype: US regulators treat promises of profit as a sign of a security, so the examiner rejects words like "guaranteed" or "10x".',
      preview: 'text',
      files: [
        { name: 'token.md', lang: 'text', starter: `# TOKEN NAME\n\n## What the token is for\n\n\n## Supply\n\n\n## Allocation\n\n| Group | Share | Cliff | Vesting |\n|---|---|---|---|\n| Community | 40% | none | 36 months |\n\n## Vesting\n\n\n## Risks\n\n- \n` },
      ],
      checks: [
        { text: 'Explains what the token is for (two or more sentences)', hint: 'Under ## What the token is for, describe the real use: what can holders do with it?', static: (f, h) => { const s = h.section(f['token.md'], 'What the token is for'); return (s.length >= 80 && (s.match(/[.!?](\s|$)/g) || []).length >= 2) || 'Write at least two full sentences.'; } },
        { text: 'States the total (or maximum) supply', hint: 'Under ## Supply, give the number, for example "Maximum supply: 100,000,000, fixed."', static: (f, h) => /\d[\d,._ ]{2,}/.test(h.section(f['token.md'], 'Supply')) || 'No supply number found.' },
        { text: 'An allocation table with at least four groups', hint: 'Add rows to the Markdown table: | Team | 15% | 12 months | 36 months |', static: (f, h) => { const rows = h.tableRows(h.section(f['token.md'], 'Allocation')); return rows.length >= 4 || `Found ${rows.length} row(s).`; } },
        { text: 'The allocation adds up to 100%', hint: 'Each row needs a percentage, and together they must total 100%.', static: (f, h) => { const rows = h.tableRows(h.section(f['token.md'], 'Allocation')); const total = rows.reduce((s, r) => s + (parseFloat((r.match(/(\d+(?:\.\d+)?)\s*%/) || [])[1]) || 0), 0); return Math.abs(total - 100) < 0.01 || `The percentages add up to ${total}%.`; } },
        { text: 'Explains vesting, including a cliff', hint: 'Under ## Vesting, say who is locked, for how long, and when the cliff ends.', static: (f, h) => /cliff/i.test(h.section(f['token.md'], 'Vesting')) || 'The Vesting section does not mention a cliff.' },
        { text: 'At least four honest risks', hint: 'Under ## Risks, list four or more: smart contract bugs, low liquidity, regulation, team risk...', static: (f, h) => { const n = h.bullets(h.section(f['token.md'], 'Risks')); return n >= 4 || `Found ${n}.`; } },
        { text: 'No promises of profit', hint: 'Remove words like guaranteed, 10x, to the moon, can\'t lose or risk-free. They mislead people and look like a securities offering to US regulators.', static: (f) => { const m = (f['token.md'] || '').match(/guarantee|\b\d+x\b|moon|can'?t lose|risk.free|passive income/i); return !m || `Found "${m[0]}".`; } },
      ],
      stretch: ['Add a chart of circulating supply for the first 24 months.', 'Ask the AI examiner to review it as a sceptical investor would.'],
    },
  ];

  return projects;
})();
