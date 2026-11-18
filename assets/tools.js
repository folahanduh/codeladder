/* Code Ladder interactive labs: Playground, Hash Lab, Tokenomics Simulator, AMM Lab.
   Each lab is a function that receives an empty element and builds itself inside it. */
window.CL_TOOLS = (function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const nf = (n, d = 0) => Number(n).toLocaleString('en-GB', { maximumFractionDigits: d, minimumFractionDigits: d });
  const money = (n) => {
    const a = Math.abs(n);
    if (a >= 1e9) return '$' + nf(n / 1e9, 2) + 'B';
    if (a >= 1e6) return '$' + nf(n / 1e6, 2) + 'M';
    if (a >= 1e3) return '$' + nf(n / 1e3, 1) + 'K';
    return '$' + nf(n, 2);
  };
  const compact = (n) => {
    const a = Math.abs(n);
    if (a >= 1e9) return nf(n / 1e9, 2) + 'B';
    if (a >= 1e6) return nf(n / 1e6, 2) + 'M';
    if (a >= 1e3) return nf(n / 1e3, 1) + 'K';
    return nf(n, 2);
  };
  let cleanup = [];
  function beforeLeave() { cleanup.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); cleanup = []; }

  // =====================================================================
  // PLAYGROUND
  // =====================================================================
  const PG_KEY = 'code-ladder-playground';
  const TEMPLATES = [
    {
      name: 'Starter page',
      html: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>My first page</title>\n</head>\n<body>\n  <h1>Hello, I\'m learning to code</h1>\n  <p>Change this text and watch the preview update.</p>\n  <button id="btn">Click me</button>\n</body>\n</html>',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  max-width: 600px;\n  margin: 40px auto;\n  padding: 0 16px;\n  line-height: 1.6;\n}\n\nbutton {\n  background: #2747e0;\n  color: white;\n  border: 0;\n  padding: 10px 18px;\n  border-radius: 8px;\n  font-size: 16px;\n  cursor: pointer;\n}',
      js: "const btn = document.querySelector('#btn');\nlet clicks = 0;\n\nbtn.addEventListener('click', () => {\n  clicks++;\n  btn.textContent = `Clicked ${clicks} time${clicks === 1 ? '' : 's'}`;\n  console.log('Button clicked', { clicks });\n});",
    },
    {
      name: 'Product card (CSS)',
      html: '<article class="card">\n  <div class="photo" role="img" aria-label="Product photo"></div>\n  <div class="body">\n    <p class="tag">New in</p>\n    <h2>Linen Wrap Dress</h2>\n    <p class="price">£68.00</p>\n    <button type="button">Add to bag</button>\n  </div>\n</article>',
      css: ':root {\n  --brand: #b4532a;\n  --ink: #1f1a17;\n}\n\nbody {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: #f6efe9;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  width: 280px;\n  background: white;\n  border-radius: 16px;\n  overflow: hidden;\n  box-shadow: 0 10px 30px rgb(0 0 0 / 10%);\n}\n\n.photo {\n  aspect-ratio: 4 / 5;\n  background: linear-gradient(160deg, #e9c9b4, var(--brand));\n}\n\n.body { padding: 16px 18px 20px; display: grid; gap: 6px; }\n.tag { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--brand); }\nh2 { margin: 0; font-size: 20px; color: var(--ink); }\n.price { margin: 0; font-weight: 600; }\n\nbutton {\n  margin-top: 8px;\n  padding: 12px;\n  border: 0;\n  border-radius: 10px;\n  background: var(--ink);\n  color: white;\n  font-size: 15px;\n  cursor: pointer;\n}\nbutton:hover { background: var(--brand); }',
      js: "document.querySelector('button').addEventListener('click', (event) => {\n  event.target.textContent = 'Added';\n  console.log('Added to bag');\n});",
    },
    {
      name: 'Flexbox lab',
      html: '<!-- Change justify-content and align-items in the CSS tab -->\n<div class="row">\n  <div class="box">1</div>\n  <div class="box tall">2</div>\n  <div class="box">3</div>\n</div>',
      css: '.row {\n  display: flex;\n  gap: 12px;\n  /* try: flex-start | center | flex-end | space-between | space-around | space-evenly */\n  justify-content: space-between;\n  /* try: stretch | flex-start | center | flex-end */\n  align-items: center;\n  padding: 16px;\n  height: 220px;\n  background: #eef1ff;\n  border-radius: 12px;\n}\n\n.box {\n  width: 70px;\n  padding: 20px 0;\n  text-align: center;\n  background: #2747e0;\n  color: white;\n  font: 700 20px system-ui, sans-serif;\n  border-radius: 8px;\n}\n.tall { padding: 50px 0; }',
      js: '',
    },
    {
      name: 'To-do list (DOM)',
      html: '<main>\n  <h1>To-do</h1>\n  <form id="form">\n    <input id="input" placeholder="What needs doing?" autocomplete="off">\n    <button>Add</button>\n  </form>\n  <ul id="list"></ul>\n  <p id="count"></p>\n</main>',
      css: 'body { font-family: system-ui, sans-serif; max-width: 480px; margin: 32px auto; padding: 0 16px; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 8px; }\nbutton { padding: 10px 14px; border: 0; border-radius: 8px; background: #2747e0; color: white; cursor: pointer; }\nul { list-style: none; padding: 0; }\nli { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee; }\nli.done span { text-decoration: line-through; color: #888; }\nli button { margin-left: auto; background: #eee; color: #333; }',
      js: "// 1. State: the single source of truth\nlet todos = [\n  { id: 1, text: 'Install VS Code', done: true },\n  { id: 2, text: 'Finish the DOM lesson', done: false },\n];\n\nconst list = document.querySelector('#list');\n\n// 2. Render: turn state into HTML\nfunction render() {\n  list.innerHTML = '';\n  for (const todo of todos) {\n    const li = document.createElement('li');\n    li.className = todo.done ? 'done' : '';\n    const box = document.createElement('input');\n    box.type = 'checkbox';\n    box.checked = todo.done;\n    box.addEventListener('change', () => toggle(todo.id));\n    const text = document.createElement('span');\n    text.textContent = todo.text; // textContent, never innerHTML, for user input\n    const del = document.createElement('button');\n    del.textContent = 'Delete';\n    del.addEventListener('click', () => remove(todo.id));\n    li.append(box, text, del);\n    list.append(li);\n  }\n  const left = todos.filter(t => !t.done).length;\n  document.querySelector('#count').textContent = `${left} left to do`;\n}\n\n// 3. Actions: change state, then render again\nfunction add(text) {\n  todos.push({ id: Date.now(), text, done: false });\n  render();\n}\nfunction toggle(id) {\n  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);\n  render();\n}\nfunction remove(id) {\n  todos = todos.filter(t => t.id !== id);\n  render();\n}\n\ndocument.querySelector('#form').addEventListener('submit', (e) => {\n  e.preventDefault();\n  const input = document.querySelector('#input');\n  if (input.value.trim()) add(input.value.trim());\n  input.value = '';\n});\n\nrender();",
    },
    {
      name: 'Fetch live data (API)',
      html: '<h1>London right now</h1>\n<p id="out">Loading...</p>\n<p><small>Data: open-meteo.com (free, no key). If this says "failed", your network or the hosted preview may be blocking requests; run Code Ladder on localhost.</small></p>',
      css: 'body { font-family: system-ui, sans-serif; padding: 24px; line-height: 1.5; }\n#out { font-size: 28px; font-weight: 700; }',
      js: "const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m,wind_speed_10m';\n\nasync function load() {\n  const out = document.querySelector('#out');\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const data = await res.json();\n    console.log('Full response:', data);\n    const { temperature_2m, wind_speed_10m } = data.current;\n    out.textContent = `${temperature_2m}°C, wind ${wind_speed_10m} km/h`;\n  } catch (err) {\n    out.textContent = 'Request failed';\n    console.error(err.message);\n  }\n}\n\nload();",
    },
    {
      name: 'JavaScript console basics',
      html: '<p style="font-family: system-ui">Everything happens in the console below. Edit the JS tab and press Run.</p>',
      css: '',
      js: "// Values and variables\nconst brand = 'FolaWear';\nlet stock = 12;\nstock = stock - 1;\nconsole.log(brand, 'has', stock, 'left');\n\n// Arrays and objects\nconst products = [\n  { name: 'Tee', price: 2000 },   // prices in pence: never use decimals for money\n  { name: 'Cap', price: 1500 },\n  { name: 'Hoodie', price: 4500 },\n];\n\n// map, filter, reduce\nconst names = products.map(p => p.name);\nconst under30 = products.filter(p => p.price < 3000);\nconst total = products.reduce((sum, p) => sum + p.price, 0);\n\nconsole.log('Names:', names);\nconsole.log('Under £30:', under30);\nconsole.log('Total: £' + (total / 100).toFixed(2));\n\n// Functions\nfunction withVat(pence) {\n  return Math.round(pence * 1.2);\n}\nconsole.log('Hoodie with VAT:', withVat(4500));",
    },
    {
      name: 'SHA-256 with Web Crypto',
      html: '<h1>Live SHA-256</h1>\n<input id="text" value="hello" style="width:100%;font-size:18px;padding:8px">\n<pre id="hash"></pre>',
      css: 'body { font-family: system-ui, sans-serif; padding: 20px; }\npre { white-space: pre-wrap; word-break: break-all; font-size: 15px; background: #f2f3f7; padding: 12px; border-radius: 8px; }',
      js: "async function sha256(text) {\n  const bytes = new TextEncoder().encode(text);           // text -> bytes\n  const digest = await crypto.subtle.digest('SHA-256', bytes); // bytes -> 32-byte hash\n  return [...new Uint8Array(digest)]\n    .map(b => b.toString(16).padStart(2, '0'))             // each byte -> 2 hex chars\n    .join('');\n}\n\nconst input = document.querySelector('#text');\nasync function update() {\n  const hash = await sha256(input.value);\n  document.querySelector('#hash').textContent = hash;\n  console.log(JSON.stringify(input.value), '->', hash);\n}\ninput.addEventListener('input', update);\nupdate();",
    },
  ];

  let pg = store.get(PG_KEY) || { html: TEMPLATES[0].html, css: TEMPLATES[0].css, js: TEMPLATES[0].js, tab: 'html' };

  function loadIntoPlayground(lang, code) {
    if (lang === 'html') pg = { html: code, css: '', js: '', tab: 'html' };
    else if (lang === 'css') pg = { html: '<h1>A styled page</h1>\n<p>Some paragraph text so you can see the font and colours.</p>\n<p><a class="button" href="#">A button-style link</a></p>\n<div class="card box">A box with class "card" and "box"</div>', css: code, js: '', tab: 'css' };
    else pg = { html: '<p style="font-family:system-ui">Your JavaScript runs here. Output appears in the console below.</p>', css: '', js: code, tab: 'js' };
    store.set(PG_KEY, pg);
  }

  const BRIDGE = '<script>(function(){function fmt(x){if(x instanceof Error)return x.name+": "+x.message;if(typeof x==="object"&&x!==null){try{return JSON.stringify(x,null,2)}catch(e){return String(x)}}return String(x)}' +
    'function send(t,a){try{parent.postMessage({__pg:1,type:t,text:Array.prototype.map.call(a,fmt).join(" ")},"*")}catch(e){}}' +
    '["log","info","warn","error","table"].forEach(function(k){var o=console[k];console[k]=function(){send(k==="table"?"log":k,arguments);if(o)o.apply(console,arguments)}});' +
    'window.addEventListener("error",function(e){send("error",[e.message+(e.lineno?" (line "+e.lineno+")":"")])});' +
    'window.addEventListener("unhandledrejection",function(e){var r=e.reason;send("error",["Unhandled promise rejection: "+(r&&r.message?r.message:r)])});})();<\/script>';

  function buildDoc(s) {
    let html = s.html || '';
    const style = s.css ? `<style>\n${s.css}\n</style>` : '';
    // type="module" allows top-level await, like modern JavaScript files
    const script = s.js ? `<script type="module">\n${s.js.replace(/<\/script/gi, '<\\/script')}\n<\/script>` : '';
    if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => m + BRIDGE + style);
    else html = BRIDGE + style + html;
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, script + '</body>');
    else html += script;
    if (!/^\s*<!doctype/i.test(html)) html = '<!doctype html><meta charset="utf-8">' + html;
    return html;
  }

  function playground(root, api) {
    const NAMES = { html: 'index.html', css: 'styles.css', js: 'script.js' };
    root.innerHTML = `
      <div class="tool-bar">
        <label class="field" style="grid-auto-flow:column;align-items:center;gap:8px"><span class="field-label">Start from</span>
          <select id="pgTemplate"><option value="">Choose a template</option>${TEMPLATES.map((t, i) => `<option value="${i}">${esc(t.name)}</option>`).join('')}</select>
        </label>
        <button class="btn btn-primary" type="button" id="pgRun">Run</button>
        <label class="row" style="gap:6px"><input type="checkbox" id="pgAuto" checked> Auto-run as you type</label>
        <span class="muted small"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs. <kbd>Tab</kbd> indents.</span>
      </div>
      <div class="pg">
        <div class="pg-editors vsc-frame">
          <div class="vsc-tabs" role="tablist" aria-label="Files">
            ${['html', 'css', 'js'].map((t) => `<button type="button" class="vsc-tab" role="tab" data-tab="${t}" aria-selected="${pg.tab === t}"><span class="vsc-dot vsc-dot-${t}" aria-hidden="true"></span>${NAMES[t]}</button>`).join('')}
          </div>
          <div id="pgEditors"></div>
        </div>
        <div class="pg-output">
          <div class="pg-out-head"><span>Preview</span></div>
          <div>
            <iframe class="pg-frame" id="pgFrame" title="Preview of your code" sandbox="allow-scripts allow-modals allow-forms"></iframe>
            <div class="pg-out-head" style="border-top:1px solid var(--line)"><span>Console</span><button class="btn btn-sm" type="button" id="pgClear">Clear</button></div>
            <div class="pg-console" id="pgLog" aria-live="polite"><div class="empty">console.log output appears here</div></div>
          </div>
        </div>
      </div>
      <aside class="callout callout-tip"><p class="callout-title">Take it further</p><p>When a playground experiment works, recreate it as real files on your computer: make a folder with <code>index.html</code>, <code>styles.css</code> and <code>script.js</code>, open it in VS Code and use Live Server. That is how real projects start.</p></aside>`;

    const frame = $('#pgFrame', root);
    const log = $('#pgLog', root);
    let timer;
    const schedule = () => {
      if (!$('#pgAuto', root).checked) return;
      clearTimeout(timer);
      timer = setTimeout(run, 700);
    };
    const eds = {};
    ['html', 'css', 'js'].forEach((t) => {
      eds[t] = window.CL_EDITOR.create({ value: pg[t] || '', lang: t, file: NAMES[t], id: `pg-${t}`, bare: true, minLines: 18, label: `${t.toUpperCase()} code`, onSubmit: () => run(), onChange: schedule });
      eds[t].el.hidden = pg.tab !== t;
      $('#pgEditors', root).append(eds[t].el);
    });

    const write = (type, text) => {
      const empty = $('.empty', log);
      if (empty) empty.outerHTML = '';
      const line = document.createElement('div');
      line.className = type;
      line.textContent = (type === 'error' ? 'Error: ' : type === 'warn' ? 'Warning: ' : '') + text;
      log.append(line);
      log.scrollTop = log.scrollHeight;
    };
    function run() {
      pg = { html: eds.html.getValue(), css: eds.css.getValue(), js: eds.js.getValue(), tab: pg.tab };
      store.set(PG_KEY, pg);
      log.innerHTML = '';
      frame.srcdoc = buildDoc(pg);
    }
    const onMsg = (e) => {
      if (e.source !== frame.contentWindow || !e.data || !e.data.__pg) return;
      write(e.data.type, e.data.text);
    };
    window.addEventListener('message', onMsg);
    cleanup.push(() => window.removeEventListener('message', onMsg));

    $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => {
      pg.tab = b.dataset.tab;
      $$('[data-tab]', root).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      Object.entries(eds).forEach(([k, ed]) => { ed.el.hidden = k !== pg.tab; });
      eds[pg.tab].refresh();
      eds[pg.tab].focus();
      store.set(PG_KEY, pg);
    }));
    $('#pgRun', root).addEventListener('click', run);
    $('#pgClear', root).addEventListener('click', () => { log.innerHTML = ''; });
    $('#pgTemplate', root).addEventListener('change', (e) => {
      const t = TEMPLATES[Number(e.target.value)];
      if (!t) return;
      eds.html.setValue(t.html); eds.css.setValue(t.css); eds.js.setValue(t.js);
      run();
      api.toast(`Loaded: ${t.name}`);
      e.target.value = '';
    });
    cleanup.push(() => clearTimeout(timer));
    run();
  }

  // =====================================================================
  // SHA-256 (pure JavaScript, so you can read how it works)
  // =====================================================================
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const encoder = new TextEncoder();
  const W = new Uint32Array(64);
  function sha256(text) {
    const bytes = encoder.encode(text);
    const len = bytes.length;
    const padded = ((len + 9 + 63) >> 6) << 6; // message + 0x80 + 8-byte length, rounded up to 64
    const buf = new Uint8Array(padded);
    buf.set(bytes);
    buf[len] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(padded - 8, Math.floor((len * 8) / 0x100000000));
    view.setUint32(padded - 4, (len * 8) >>> 0);
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    for (let off = 0; off < padded; off += 64) {
      for (let t = 0; t < 16; t++) W[t] = view.getUint32(off + t * 4);
      for (let t = 16; t < 64; t++) {
        const a = W[t - 15], b = W[t - 2];
        const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
        const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let t = 0; t < 64; t++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + W[t]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }

  function hexToBits(hex) {
    let out = '';
    for (const ch of hex) out += parseInt(ch, 16).toString(2).padStart(4, '0');
    return out;
  }

  // =====================================================================
  // HASH LAB
  // =====================================================================
  function hashLab(root) {
    root.innerHTML = `
      <div class="grid-2">
        <div class="card field"><label class="field-label" for="hA">Input A</label><textarea id="hA" rows="3">Code Ladder</textarea><span class="field-label">SHA-256 of A (64 hex characters = 256 bits)</span><div class="hash-out" id="hAout"></div></div>
        <div class="card field"><label class="field-label" for="hB">Input B (change one letter)</label><textarea id="hB" rows="3">Code ladder</textarea><span class="field-label">SHA-256 of B</span><div class="hash-out" id="hBout"></div></div>
      </div>
      <section class="card section">
        <h2 class="section-title">The avalanche effect</h2>
        <p id="diffText" class="muted"></p>
        <div class="bitgrid" id="bits" role="img" aria-label="Grid of 256 bits; highlighted squares are bits that differ between the two hashes"></div>
        <div class="legend"><span><i class="swatch" style="background:var(--accent)"></i>Bit differs</span><span><i class="swatch" style="background:var(--surface-2);border:1px solid var(--line)"></i>Bit the same</span></div>
        <p class="muted small">A good hash changes about half of its 256 bits when the input changes even slightly, and you cannot predict which. That is why a hash works as a fingerprint: you cannot tweak the input to land on a hash you want.</p>
      </section>
      <section class="card section">
        <h2 class="section-title">Mine a block (proof of work)</h2>
        <p class="muted">Bitcoin miners search for a <strong>nonce</strong> (a number) so that the hash of the block starts with enough zeros. The only way to find one is to keep guessing. Each extra zero makes it about 16 times harder.</p>
        <div class="grid-2">
          <div class="field"><label class="field-label" for="mData">Block data</label><input type="text" id="mData" value="Alice pays Bob 5 coins | prev: 00000a3f..."></div>
          <div class="field"><label class="field-label" for="mDiff">Difficulty (leading zeros)</label>
            <select id="mDiff">${[1, 2, 3, 4, 5].map((d) => `<option value="${d}"${d === 4 ? ' selected' : ''}>${d} zero${d > 1 ? 's' : ''} (~${nf(16 ** d)} tries)</option>`).join('')}</select></div>
        </div>
        <div class="row"><button class="btn btn-primary" type="button" id="mine">Start mining</button><span class="muted small" id="mStatus" role="status"></span></div>
        <div class="kv"><div><span>Nonce tried</span><b id="mNonce">0</b></div><div><span>Hashes per second</span><b id="mRate">0</b></div><div><span>Time</span><b id="mTime">0.0s</b></div></div>
        <div class="field"><span class="field-label">Hash of data + nonce</span><div class="hash-out" id="mHash">&nbsp;</div></div>
      </section>
      <section class="card section">
        <h2 class="section-title">Try it in your terminal</h2>
        <p class="muted small">These should print the same hash as Input A above when it says <code>hello</code>: <code>2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</code></p>
        <div class="code" data-lang="bash"><pre><code class="language-bash"># macOS / Linux
echo -n "hello" | shasum -a 256
# any OS with OpenSSL (Git Bash on Windows)
echo -n "hello" | openssl dgst -sha256
# Node.js
node -e "console.log(require('crypto').createHash('sha256').update('hello').digest('hex'))"</code></pre></div>
      </section>`;

    const bitsEl = $('#bits', root);
    bitsEl.innerHTML = '<i></i>'.repeat(256);
    const cells = $$('i', bitsEl);
    const update = () => {
      const a = sha256($('#hA', root).value);
      const b = sha256($('#hB', root).value);
      $('#hAout', root).textContent = a;
      $('#hBout', root).textContent = b;
      const ba = hexToBits(a), bb = hexToBits(b);
      let diff = 0;
      for (let i = 0; i < 256; i++) {
        const d = ba[i] !== bb[i];
        if (d) diff++;
        cells[i].classList.toggle('diff', d);
      }
      $('#diffText', root).innerHTML = a === b
        ? 'The inputs are identical, so the hashes are identical. Change one character in Input B.'
        : `<strong style="color:var(--ink)">${diff} of 256 bits</strong> differ (${nf((diff / 256) * 100, 1)}%).`;
    };
    $('#hA', root).addEventListener('input', update);
    $('#hB', root).addEventListener('input', update);
    update();

    let mining = false, raf = 0;
    const stop = () => { mining = false; cancelAnimationFrame(raf); $('#mine', root).textContent = 'Start mining'; };
    cleanup.push(stop);
    $('#mine', root).addEventListener('click', () => {
      if (mining) { stop(); $('#mStatus', root).textContent = 'Stopped.'; return; }
      mining = true;
      $('#mine', root).textContent = 'Stop';
      const data = $('#mData', root).value;
      const target = '0'.repeat(Number($('#mDiff', root).value));
      let nonce = 0;
      const start = performance.now();
      $('#mStatus', root).textContent = 'Mining...';
      const step = () => {
        if (!mining) return;
        const end = nonce + 4000;
        let hash = '';
        for (; nonce < end; nonce++) {
          hash = sha256(data + nonce);
          if (hash.startsWith(target)) break;
        }
        const secs = (performance.now() - start) / 1000;
        $('#mNonce', root).textContent = nf(nonce);
        $('#mRate', root).textContent = nf(nonce / Math.max(secs, 0.001));
        $('#mTime', root).textContent = nf(secs, 1) + 's';
        $('#mHash', root).textContent = hash;
        if (hash.startsWith(target)) {
          stop();
          $('#mStatus', root).innerHTML = `Block found. Nonce <strong>${nf(nonce)}</strong> works. Anyone can verify it with a single hash, but finding it took ${nf(nonce + 1)} tries.`;
          return;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
  }

  // =====================================================================
  // CHART HELPERS (SVG)
  // =====================================================================
  const SERIES = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)', 'var(--s7)', 'var(--s8)'];
  const NS = 'http://www.w3.org/2000/svg';
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }

  // =====================================================================
  // TOKENOMICS SIMULATOR
  // =====================================================================
  const SIM_KEY = 'code-ladder-token-sim';
  const PRESETS = {
    balanced: {
      label: 'Balanced (example)',
      rows: [
        { name: 'Team', pct: 18, tge: 0, cliff: 12, vest: 36, insider: true },
        { name: 'Investors', pct: 17, tge: 0, cliff: 12, vest: 24, insider: true },
        { name: 'Ecosystem & grants', pct: 25, tge: 5, cliff: 0, vest: 48, insider: false },
        { name: 'Community rewards', pct: 15, tge: 0, cliff: 0, vest: 48, insider: false },
        { name: 'Treasury', pct: 12, tge: 10, cliff: 6, vest: 36, insider: false },
        { name: 'Liquidity', pct: 7, tge: 100, cliff: 0, vest: 0, insider: false },
        { name: 'Airdrop', pct: 6, tge: 50, cliff: 0, vest: 6, insider: false },
      ],
    },
    lowfloat: {
      label: 'Low float, high FDV (warning example)',
      rows: [
        { name: 'Team', pct: 20, tge: 0, cliff: 12, vest: 24, insider: true },
        { name: 'Investors', pct: 25, tge: 0, cliff: 12, vest: 18, insider: true },
        { name: 'Ecosystem', pct: 30, tge: 2, cliff: 0, vest: 60, insider: false },
        { name: 'Treasury', pct: 15, tge: 0, cliff: 12, vest: 36, insider: false },
        { name: 'Marketing', pct: 5, tge: 10, cliff: 0, vest: 24, insider: false },
        { name: 'Liquidity', pct: 3, tge: 100, cliff: 0, vest: 0, insider: false },
        { name: 'Airdrop', pct: 2, tge: 100, cliff: 0, vest: 0, insider: false },
      ],
    },
    community: {
      label: 'Community first',
      rows: [
        { name: 'Community rewards', pct: 35, tge: 0, cliff: 0, vest: 60, insider: false },
        { name: 'Airdrop', pct: 15, tge: 60, cliff: 0, vest: 6, insider: false },
        { name: 'Team', pct: 15, tge: 0, cliff: 12, vest: 36, insider: true },
        { name: 'Investors', pct: 10, tge: 0, cliff: 12, vest: 24, insider: true },
        { name: 'Treasury', pct: 15, tge: 10, cliff: 0, vest: 48, insider: false },
        { name: 'Liquidity', pct: 10, tge: 100, cliff: 0, vest: 0, insider: false },
      ],
    },
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // fraction of an allocation unlocked at month m
  function unlockedFrac(r, m, lump) {
    const tge = Math.min(Math.max(r.tge, 0), 100) / 100;
    const cliff = Math.max(0, r.cliff);
    const vest = Math.max(0, r.vest);
    let v;
    if (m < cliff) v = 0;
    else if (vest === 0) v = 1;
    else if (lump) v = Math.min(1, m / (cliff + vest)); // accrued since TGE, released in a lump at the cliff
    else v = Math.min(1, (m - cliff) / vest); // linear starting from the cliff
    return tge + (1 - tge) * v;
  }

  function simulate(s) {
    const horizon = Math.min(120, Math.max(48, ...s.rows.map((r) => (Number(r.cliff) || 0) + (Number(r.vest) || 0))));
    const months = [];
    for (let m = 0; m <= horizon; m++) {
      const parts = s.rows.map((r) => (r.pct / 100) * unlockedFrac(r, m, s.lump));
      const total = parts.reduce((a, b) => a + b, 0);
      const insider = s.rows.reduce((a, r, i) => a + (r.insider ? parts[i] : 0), 0);
      months.push({ m, parts, total, insider });
    }
    months.forEach((row, i) => { row.added = i === 0 ? row.total : row.total - months[i - 1].total; });
    return { horizon, months };
  }

  function tokenSim(root) {
    let s = store.get(SIM_KEY) || { name: 'LADDER', supply: 1000000000, price: 0.1, lump: false, rows: clone(PRESETS.balanced.rows) };

    root.innerHTML = `
      <aside class="callout callout-pro"><p class="callout-title">How to read this</p><p>Each row is a group that receives tokens. <strong>TGE %</strong> unlocks on launch day. Nothing more unlocks until the <strong>cliff</strong> ends; then the rest unlocks month by month over the <strong>vesting</strong> period. The example numbers are made up for learning.</p></aside>
      <section class="card section">
        <div class="row" style="justify-content:space-between">
          <h2 class="section-title">1. Token basics</h2>
          <label class="field" style="grid-auto-flow:column;align-items:center;gap:8px"><span class="field-label">Load preset</span>
            <select id="tsPreset"><option value="">Choose</option>${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join('')}</select></label>
        </div>
        <div class="grid-3">
          <label class="field"><span class="field-label">Ticker</span><input type="text" id="tsName" maxlength="10" value="${esc(s.name)}"></label>
          <label class="field"><span class="field-label">Max supply (tokens)</span><input type="number" id="tsSupply" min="1" step="1000000" value="${s.supply}"></label>
          <label class="field"><span class="field-label">Price at launch (USD)</span><input type="number" id="tsPrice" min="0" step="0.01" value="${s.price}"></label>
        </div>
        <label class="row" style="gap:8px"><input type="checkbox" id="tsLump" ${s.lump ? 'checked' : ''}> Release everything accrued during the cliff in one lump when the cliff ends (common for team and investor deals)</label>
      </section>
      <section class="card section">
        <h2 class="section-title">2. Allocation and vesting</h2>
        <div class="table-wrap"><table class="alloc-table">
          <thead><tr><th></th><th>Group</th><th>% of supply</th><th>TGE unlock %</th><th>Cliff (months)</th><th>Vesting after cliff (months)</th><th>Insider</th><th></th></tr></thead>
          <tbody id="tsRows"></tbody>
        </table></div>
        <div class="row"><button class="btn btn-sm" type="button" id="tsAdd">Add group</button><span class="small" id="tsSum" role="status"></span></div>
      </section>
      <section class="card section">
        <h2 class="section-title">3. Circulating supply over time</h2>
        <div class="kv" id="tsKV"></div>
        <div class="legend" id="tsLegend"></div>
        <div class="chart-wrap" id="tsChart"></div>
        <p class="muted small">Top: share of max supply unlocked, stacked by group. Bottom: new tokens unlocked each month. Hover or tap for exact values.</p>
      </section>
      <section class="card section">
        <h2 class="section-title">4. What an analyst would say</h2>
        <div id="tsInsights"></div>
      </section>
      <section class="section">
        <h2 class="section-title">Snapshot table</h2>
        <div class="table-wrap"><table id="tsTable"></table></div>
        <p class="muted small">Market cap here assumes the launch price never changes, which never happens. Real prices react to every unlock.</p>
      </section>`;

    const rowsEl = $('#tsRows', root);
    const drawRows = () => {
      rowsEl.innerHTML = s.rows.map((r, i) => `
        <tr data-i="${i}">
          <td><span class="swatch" style="background:${SERIES[i]}"></span></td>
          <td><input type="text" data-k="name" value="${esc(r.name)}" aria-label="Group name" style="min-width:130px"></td>
          <td><input type="number" data-k="pct" min="0" max="100" step="0.5" value="${r.pct}" aria-label="${esc(r.name)} percent of supply"></td>
          <td><input type="number" data-k="tge" min="0" max="100" step="1" value="${r.tge}" aria-label="${esc(r.name)} TGE unlock percent"></td>
          <td><input type="number" data-k="cliff" min="0" max="60" step="1" value="${r.cliff}" aria-label="${esc(r.name)} cliff months"></td>
          <td><input type="number" data-k="vest" min="0" max="96" step="1" value="${r.vest}" aria-label="${esc(r.name)} vesting months"></td>
          <td style="text-align:center"><input type="checkbox" data-k="insider" ${r.insider ? 'checked' : ''} aria-label="${esc(r.name)} is an insider group"></td>
          <td><button class="btn btn-sm" type="button" data-remove="${i}" aria-label="Remove ${esc(r.name)}">Remove</button></td>
        </tr>`).join('');
      $('#tsAdd', root).disabled = s.rows.length >= 8;
    };

    const recompute = () => {
      store.set(SIM_KEY, s);
      const sum = s.rows.reduce((a, r) => a + (Number(r.pct) || 0), 0);
      const sumEl = $('#tsSum', root);
      sumEl.innerHTML = Math.abs(sum - 100) < 0.001
        ? `<span style="color:var(--good)">Allocations add up to 100%.</span>`
        : `<span style="color:var(--bad)">Allocations add up to ${nf(sum, 1)}%. They must total exactly 100%.</span>`;
      if (s.rows.length >= 8) sumEl.innerHTML += ' <span class="muted">Maximum of 8 groups; merge small ones into "Other".</span>';
      const sim = simulate(s);
      drawKV(sim);
      drawChart(sim);
      drawInsights(sim, sum);
      drawTable(sim);
    };

    const drawKV = (sim) => {
      const tge = sim.months[0].total;
      const fdv = s.supply * s.price;
      const mc = s.supply * tge * s.price;
      const biggest = sim.months.slice(1).reduce((a, b) => (b.added > a.added ? b : a), sim.months[1] || sim.months[0]);
      const half = sim.months.find((x) => x.total >= 0.5);
      $('#tsKV', root).innerHTML = `
        <div><span>Circulating at launch</span><b>${nf(tge * 100, 1)}%</b></div>
        <div><span>Market cap at launch</span><b>${money(mc)}</b></div>
        <div><span>Fully diluted value</span><b>${money(fdv)}</b></div>
        <div><span>FDV / market cap</span><b>${mc > 0 ? nf(fdv / mc, 1) + 'x' : 'n/a'}</b></div>
        <div><span>Biggest monthly unlock</span><b>Month ${biggest.m}: ${nf(biggest.added * 100, 1)}%</b></div>
        <div><span>50% circulating by</span><b>${half ? 'Month ' + half.m : 'Never'}</b></div>`;
      $('#tsLegend', root).innerHTML = s.rows.map((r, i) => `<span><i class="swatch" style="background:${SERIES[i]}"></i>${esc(r.name)} (${nf(r.pct, 1)}%)</span>`).join('');
    };

    const drawChart = (sim) => {
      const wrap = $('#tsChart', root);
      const Wd = 760, Ht = 400, L = 46, R = 14, T = 10, Hb = 90, gap = 34, B = 26;
      const Ha = Ht - T - Hb - gap - B; // area panel height
      const x = (m) => L + (m / sim.horizon) * (Wd - L - R);
      const yA = (v) => T + Ha - v * Ha;
      const maxAdd = niceMax(Math.max(...sim.months.map((d) => d.added)) * 100);
      const yBtop = T + Ha + gap;
      const yB = (v) => yBtop + Hb - (v * 100 / maxAdd) * Hb;
      let svg = `<svg viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Stacked area chart of circulating supply by group over ${sim.horizon} months, with monthly unlock bars below">`;
      [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
        svg += `<line class="grid-line" x1="${L}" x2="${Wd - R}" y1="${yA(v)}" y2="${yA(v)}"/><text class="axis-text" x="${L - 8}" y="${yA(v) + 4}" text-anchor="end">${v * 100}%</text>`;
      });
      [0, 0.5, 1].forEach((v) => {
        svg += `<line class="grid-line" x1="${L}" x2="${Wd - R}" y1="${yBtop + Hb - v * Hb}" y2="${yBtop + Hb - v * Hb}"/><text class="axis-text" x="${L - 8}" y="${yBtop + Hb - v * Hb + 4}" text-anchor="end">${nf(maxAdd * v, maxAdd < 4 ? 1 : 0)}%</text>`;
      });
      for (let m = 0; m <= sim.horizon; m += 12) {
        svg += `<text class="axis-text" x="${x(m)}" y="${Ht - 6}" text-anchor="middle">${m === 0 ? 'Launch' : 'M' + m}</text>`;
      }
      // stacked areas, bottom group first
      const cum = sim.months.map(() => 0);
      s.rows.forEach((r, i) => {
        const lower = cum.slice();
        sim.months.forEach((d, k) => { cum[k] += d.parts[i]; });
        let path = `M${x(0)},${yA(cum[0])}`;
        sim.months.forEach((d, k) => { path += `L${x(d.m)},${yA(cum[k])}`; });
        for (let k = sim.months.length - 1; k >= 0; k--) path += `L${x(sim.months[k].m)},${yA(lower[k])}`;
        svg += `<path d="${path}Z" fill="${SERIES[i]}" stroke="var(--surface)" stroke-width="1.5" stroke-linejoin="round"/>`;
      });
      // monthly unlock bars
      const bw = Math.max(1.5, ((Wd - L - R) / (sim.horizon + 1)) - 2);
      sim.months.forEach((d) => {
        if (d.added <= 0) return;
        const yTop = yB(d.added);
        svg += `<rect x="${x(d.m) - bw / 2}" y="${yTop}" width="${bw}" height="${Math.max(0, yBtop + Hb - yTop)}" rx="${Math.min(2, bw / 2)}" fill="var(--accent)"/>`;
      });
      svg += `<text class="axis-text" x="${L}" y="${yBtop - 10}">New tokens unlocked each month (% of max supply)</text>`;
      svg += `<line id="tsCross" x1="0" x2="0" y1="${T}" y2="${yBtop + Hb}" stroke="var(--ink)" stroke-width="1" opacity="0" />`;
      svg += `<rect id="tsHit" x="${L}" y="${T}" width="${Wd - L - R}" height="${yBtop + Hb - T}" fill="transparent" style="cursor:crosshair"/>`;
      svg += '</svg><div class="chart-tip" id="tsTip" hidden></div>';
      wrap.innerHTML = svg;

      const svgEl = $('svg', wrap), tip = $('#tsTip', wrap), cross = $('#tsCross', wrap);
      const move = (clientX) => {
        const rect = svgEl.getBoundingClientRect();
        const px = ((clientX - rect.left) / rect.width) * Wd;
        const m = Math.max(0, Math.min(sim.horizon, Math.round(((px - L) / (Wd - L - R)) * sim.horizon)));
        const d = sim.months[m];
        cross.setAttribute('x1', x(m)); cross.setAttribute('x2', x(m)); cross.setAttribute('opacity', '0.5');
        tip.innerHTML = `<strong>${m === 0 ? 'Launch day' : 'Month ' + m}</strong>` +
          s.rows.map((r, i) => `<div class="tip-row"><i class="swatch" style="background:${SERIES[i]}"></i>${esc(r.name)}<b>${nf(d.parts[i] * 100, 1)}%</b></div>`).join('') +
          `<div class="tip-row" style="border-top:1px solid var(--line);margin-top:4px;padding-top:4px">Circulating<b>${nf(d.total * 100, 1)}%</b></div>` +
          `<div class="tip-row">Unlocked this month<b>${nf(d.added * 100, 2)}%</b></div>` +
          `<div class="tip-row">Tokens circulating<b>${compact(d.total * s.supply)}</b></div>`;
        tip.hidden = false;
        const left = ((x(m) / Wd) * rect.width);
        const tw = tip.offsetWidth;
        tip.style.left = Math.max(0, Math.min(rect.width - tw, left + (left > rect.width / 2 ? -tw - 14 : 14))) + 'px';
        tip.style.top = '8px';
      };
      const hit = $('#tsHit', wrap);
      hit.addEventListener('mousemove', (e) => move(e.clientX));
      hit.addEventListener('touchstart', (e) => move(e.touches[0].clientX), { passive: true });
      hit.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
      hit.addEventListener('mouseleave', () => { tip.hidden = true; cross.setAttribute('opacity', '0'); });
    };

    const drawInsights = (sim, sum) => {
      const out = [];
      const add = (kind, html) => out.push(`<div class="insight"><span class="insight-icon ${kind}" aria-hidden="true">${kind === 'good' ? '&#10003;' : '!'}</span><div><span class="sr-only">${kind === 'bad' ? 'Problem: ' : kind === 'warn' ? 'Caution: ' : 'Good: '}</span>${html}</div></div>`);
      if (Math.abs(sum - 100) >= 0.001) add('bad', `Allocations total ${nf(sum, 1)}%, not 100%. Every token must be accounted for.`);
      const tge = sim.months[0].total;
      const ratio = tge > 0 ? 1 / tge : Infinity;
      if (tge < 0.1) add('bad', `<strong>Low float.</strong> Only ${nf(tge * 100, 1)}% circulates at launch, so FDV is ${ratio === Infinity ? 'infinitely' : nf(ratio, 1) + 'x'} the market cap. Thin supply can pump the early price, then years of unlocks push it down. Buyers increasingly avoid this pattern.`);
      else if (tge > 0.4) add('warn', `${nf(tge * 100, 1)}% circulates at launch. That is a lot of immediate sell pressure if holders have no reason to keep their tokens.`);
      else add('good', `${nf(tge * 100, 1)}% circulates at launch: enough for real price discovery without dumping most of the supply on day one.`);
      const insiders = s.rows.filter((r) => r.insider).reduce((a, r) => a + Number(r.pct), 0);
      if (insiders > 40) add('bad', `Insiders (team, investors, advisors) hold <strong>${nf(insiders, 1)}%</strong>. Above 40% looks like a project built for insiders, and gives them voting control.`);
      else if (insiders > 30) add('warn', `Insiders hold ${nf(insiders, 1)}%. Common, but justify it publicly and vest it long.`);
      else add('good', `Insiders hold ${nf(insiders, 1)}%, leaving most of the supply for the community and treasury.`);
      s.rows.filter((r) => r.insider && (Number(r.cliff) < 6 || Number(r.cliff) + Number(r.vest) < 24)).forEach((r) => {
        add('warn', `<strong>${esc(r.name)}</strong> is fully free within ${Number(r.cliff) + Number(r.vest)} months or has a short cliff. Insider vesting of 3 to 4 years with a 12-month cliff is the norm.`);
      });
      let worst = null;
      for (let i = 1; i < sim.months.length; i++) {
        const before = sim.months[i - 1].total;
        const rel = before > 0 ? sim.months[i].added / before : 0;
        if (!worst || rel > worst.rel) worst = { m: i, rel, abs: sim.months[i].added };
      }
      if (worst && worst.rel > 0.15) add('bad', `<strong>Unlock cliff in month ${worst.m}:</strong> ${nf(worst.abs * 100, 1)}% of max supply unlocks at once, growing circulating supply by ${nf(worst.rel * 100, 0)}% in a single month. Markets usually price this in early, and badly.`);
      else if (worst && worst.rel > 0.07) add('warn', `Largest single jump is month ${worst.m}: circulating supply grows ${nf(worst.rel * 100, 0)}%. Watch for selling around that date.`);
      else if (worst) add('good', 'No month grows circulating supply by more than 7%. Unlocks are smooth.');
      const yr1 = sim.months[Math.min(12, sim.horizon)].total;
      add(yr1 / Math.max(tge, 0.0001) > 3 ? 'warn' : 'good', `Supply grows from ${nf(tge * 100, 1)}% to ${nf(yr1 * 100, 1)}% in the first year (${nf(yr1 / Math.max(tge, 0.0001), 1)}x). Demand has to grow at least that fast just to hold the price.`);
      $('#tsInsights', root).innerHTML = out.join('');
    };

    const drawTable = (sim) => {
      const points = [0, 6, 12, 18, 24, 36, 48, 60, 72, 96, 120].filter((m) => m <= sim.horizon);
      $('#tsTable', root).innerHTML = `
        <thead><tr><th>Month</th><th>Circulating</th><th>Tokens</th><th>Market cap at launch price</th><th>Insider share of circulating</th></tr></thead>
        <tbody>${points.map((m) => {
          const d = sim.months[m];
          return `<tr><td>${m === 0 ? 'Launch' : m}</td><td>${nf(d.total * 100, 1)}%</td><td>${compact(d.total * s.supply)} ${esc(s.name)}</td><td>${money(d.total * s.supply * s.price)}</td><td>${d.total > 0 ? nf((d.insider / d.total) * 100, 1) + '%' : '0%'}</td></tr>`;
        }).join('')}</tbody>`;
    };

    rowsEl.addEventListener('input', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const r = s.rows[Number(tr.dataset.i)];
      const k = e.target.dataset.k;
      if (k === 'name') r.name = e.target.value.slice(0, 30);
      else if (k === 'insider') r.insider = e.target.checked;
      else r[k] = Math.max(0, Number(e.target.value) || 0);
      if (k === 'name') { drawKV(simulate(s)); store.set(SIM_KEY, s); return; }
      recompute();
    });
    rowsEl.addEventListener('change', (e) => { if (e.target.dataset.k === 'name') recompute(); });
    rowsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      s.rows.splice(Number(b.dataset.remove), 1);
      drawRows();
      recompute();
    });
    $('#tsAdd', root).addEventListener('click', () => {
      if (s.rows.length >= 8) return;
      s.rows.push({ name: 'New group', pct: 0, tge: 0, cliff: 0, vest: 12, insider: false });
      drawRows();
      recompute();
    });
    $('#tsName', root).addEventListener('input', (e) => { s.name = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'TOKEN'; recompute(); });
    $('#tsSupply', root).addEventListener('input', (e) => { s.supply = Math.max(1, Number(e.target.value) || 1); recompute(); });
    $('#tsPrice', root).addEventListener('input', (e) => { s.price = Math.max(0, Number(e.target.value) || 0); recompute(); });
    $('#tsLump', root).addEventListener('change', (e) => { s.lump = e.target.checked; recompute(); });
    $('#tsPreset', root).addEventListener('change', (e) => {
      const p = PRESETS[e.target.value];
      if (!p) return;
      s.rows = clone(p.rows);
      drawRows();
      recompute();
      e.target.value = '';
    });
    drawRows();
    recompute();
  }

  // =====================================================================
  // AMM LAB
  // =====================================================================
  function amm(root) {
    const st = { x: 1000000, y: 250000, fee: 0.3, dir: 'buy', amt: 10000, move: 0.5 };
    root.innerHTML = `
      <aside class="callout callout-pro"><p class="callout-title">The idea in one line</p><p>A pool holds two tokens and keeps <code>x * y = k</code> constant. Buying one token removes it from the pool, so its price rises along the curve. No order book, no counterparty, just maths.</p></aside>
      <section class="card section">
        <h2 class="section-title">1. The pool</h2>
        <div class="grid-3">
          <label class="field"><span class="field-label">TOKEN in the pool (x)</span><input type="number" id="aX" min="1" step="1000" value="${st.x}"></label>
          <label class="field"><span class="field-label">USDC in the pool (y)</span><input type="number" id="aY" min="1" step="1000" value="${st.y}"></label>
          <label class="field"><span class="field-label">Swap fee %</span><input type="number" id="aFee" min="0" max="10" step="0.05" value="${st.fee}"></label>
        </div>
      </section>
      <section class="card section">
        <h2 class="section-title">2. Make a trade</h2>
        <div class="grid-3">
          <label class="field"><span class="field-label">Direction</span><select id="aDir"><option value="buy">Buy TOKEN with USDC</option><option value="sell">Sell TOKEN for USDC</option></select></label>
          <label class="field"><span class="field-label" id="aAmtLabel">You pay (USDC)</span><input type="number" id="aAmt" min="0" step="100" value="${st.amt}"></label>
        </div>
        <div class="kv" id="aKV"></div>
        <div class="chart-wrap" id="aChart"></div>
        <p class="muted small" id="aNote"></p>
      </section>
      <section class="card section">
        <h2 class="section-title">3. Impermanent loss</h2>
        <p class="muted">You add $1,000 to the pool: $500 of TOKEN and $500 of USDC. Then TOKEN's price changes. How does your pool position compare with just holding the two?</p>
        <label class="field"><span class="field-label">TOKEN price change: <strong id="aMoveLabel" style="color:var(--ink)"></strong></span><input type="range" id="aMove" min="-1" max="1" step="0.01" value="0.3" aria-describedby="aMoveLabel"></label>
        <div class="kv" id="aIL"></div>
        <div class="chart-wrap" id="aILChart"></div>
        <p class="muted small">Fees earned can offset this loss. The loss is "impermanent" only if the price returns to where it started; if you withdraw at a different price, it is very permanent.</p>
      </section>`;

    const quote = () => {
      const fee = st.fee / 100;
      const inAfterFee = st.amt * (1 - fee);
      if (st.dir === 'buy') {
        const out = (st.x * inAfterFee) / (st.y + inAfterFee);
        return { out, newX: st.x - out, newY: st.y + st.amt, paid: st.amt, feePaid: st.amt * fee };
      }
      const out = (st.y * inAfterFee) / (st.x + inAfterFee);
      return { out, newX: st.x + st.amt, newY: st.y - out, paid: st.amt, feePaid: st.amt * fee };
    };

    const draw = () => {
      $('#aAmtLabel', root).textContent = st.dir === 'buy' ? 'You pay (USDC)' : 'You sell (TOKEN)';
      const q = quote();
      const spot = st.y / st.x;
      const newSpot = q.newY / q.newX;
      const avg = st.dir === 'buy' ? q.paid / q.out : q.out / q.paid;
      const impact = st.dir === 'buy' ? avg / spot - 1 : 1 - avg / spot;
      $('#aKV', root).innerHTML = `
        <div><span>Price before</span><b>$${nf(spot, 4)}</b></div>
        <div><span>You receive</span><b>${compact(q.out)} ${st.dir === 'buy' ? 'TOKEN' : 'USDC'}</b></div>
        <div><span>Your average price</span><b>$${nf(avg, 4)}</b></div>
        <div><span>Price impact (incl. fee)</span><b style="color:${impact > 0.05 ? 'var(--bad)' : impact > 0.01 ? 'var(--warn)' : 'var(--good)'}">${nf(impact * 100, 2)}%</b></div>
        <div><span>Price after</span><b>$${nf(newSpot, 4)}</b></div>
        <div><span>Fee to liquidity providers</span><b>${st.dir === 'buy' ? '$' + nf(q.feePaid, 2) : compact(q.feePaid) + ' TOKEN'}</b></div>`;
      $('#aNote', root).textContent = `k before: ${compact(st.x * st.y)}. k after: ${compact(q.newX * q.newY)}. The fee stays in the pool, so k grows slightly with every trade. That growth is how liquidity providers earn.`;
      drawCurve(q);
    };

    const drawCurve = (q) => {
      const Wd = 760, Ht = 300, L = 70, R = 20, T = 14, B = 40;
      const k = st.x * st.y;
      const x0 = st.x * 0.35, x1 = st.x * 2.2;
      const yMax = niceMax(k / x0);
      const xMax = niceMax(x1);
      const px = (v) => L + (v / xMax) * (Wd - L - R);
      const py = (v) => T + (Ht - T - B) - (v / yMax) * (Ht - T - B);
      let svg = `<svg viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Constant product curve with the pool position before and after your trade">`;
      for (let i = 0; i <= 4; i++) {
        const v = (yMax / 4) * i;
        svg += `<line class="grid-line" x1="${L}" x2="${Wd - R}" y1="${py(v)}" y2="${py(v)}"/><text class="axis-text" x="${L - 8}" y="${py(v) + 4}" text-anchor="end">${compact(v)}</text>`;
        const xv = (xMax / 4) * i;
        svg += `<text class="axis-text" x="${px(xv)}" y="${Ht - B + 18}" text-anchor="middle">${compact(xv)}</text>`;
      }
      svg += `<text class="axis-text" x="${(L + Wd - R) / 2}" y="${Ht - 4}" text-anchor="middle">TOKEN in pool (x)</text>`;
      svg += `<text class="axis-text" x="14" y="${(T + Ht - B) / 2}" text-anchor="middle" transform="rotate(-90 14 ${(T + Ht - B) / 2})">USDC in pool (y)</text>`;
      let path = '';
      for (let i = 0; i <= 80; i++) {
        const xv = x0 + ((x1 - x0) * i) / 80;
        const yv = k / xv;
        if (yv > yMax) continue;
        path += (path ? 'L' : 'M') + px(xv).toFixed(1) + ',' + py(yv).toFixed(1);
      }
      svg += `<path d="${path}" fill="none" stroke="var(--s1)" stroke-width="2"/>`;
      const pt = (xv, yv, color, label, anchor) => `<circle cx="${px(xv)}" cy="${py(yv)}" r="6" fill="${color}" stroke="var(--surface)" stroke-width="2"/><text class="axis-text" x="${px(xv) + (anchor === 'end' ? -12 : 12)}" y="${py(yv) - 10}" text-anchor="${anchor}" style="fill:var(--ink);font-weight:600">${label}</text>`;
      const afterLeft = q.newX < st.x;
      svg += pt(st.x, st.y, 'var(--s1)', 'Before', afterLeft ? 'start' : 'end');
      if (q.newY <= yMax) svg += pt(q.newX, q.newY, 'var(--s2)', 'After your trade', afterLeft ? 'end' : 'start');
      svg += '</svg>';
      $('#aChart', root).innerHTML = svg;
    };

    const il = (r) => (2 * Math.sqrt(r)) / (1 + r) - 1;
    const drawIL = () => {
      const r = Math.pow(10, st.move);
      $('#aMoveLabel', root).textContent = `${r >= 1 ? '+' : ''}${nf((r - 1) * 100, 0)}% (price x${nf(r, 2)})`;
      const hold = 500 + 500 * r;
      const lp = hold * (1 + il(r));
      $('#aIL', root).innerHTML = `
        <div><span>If you just held</span><b>$${nf(hold, 2)}</b></div>
        <div><span>Your pool position</span><b>$${nf(lp, 2)}</b></div>
        <div><span>Impermanent loss</span><b style="color:${il(r) < -0.05 ? 'var(--bad)' : 'var(--ink)'}">${nf(il(r) * 100, 2)}%</b></div>`;
      const Wd = 760, Ht = 220, L = 56, R = 20, T = 14, B = 36;
      const px = (v) => L + ((v + 1) / 2) * (Wd - L - R);
      const yMin = -0.45;
      const py = (v) => T + (v / yMin) * (Ht - T - B);
      let svg = `<svg viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Impermanent loss as a function of price change">`;
      [0, -0.1, -0.2, -0.3, -0.4].forEach((v) => {
        svg += `<line class="grid-line" x1="${L}" x2="${Wd - R}" y1="${py(v)}" y2="${py(v)}"/><text class="axis-text" x="${L - 8}" y="${py(v) + 4}" text-anchor="end">${nf(v * 100, 0)}%</text>`;
      });
      [-1, -0.5, 0, 0.5, 1].forEach((v) => {
        svg += `<text class="axis-text" x="${px(v)}" y="${Ht - B + 18}" text-anchor="middle">x${nf(Math.pow(10, v), Math.pow(10, v) < 1 ? 2 : 1)}</text>`;
      });
      svg += `<text class="axis-text" x="${(L + Wd - R) / 2}" y="${Ht - 2}" text-anchor="middle">TOKEN price change (log scale)</text>`;
      let path = '';
      for (let i = 0; i <= 100; i++) {
        const v = -1 + (2 * i) / 100;
        path += (i ? 'L' : 'M') + px(v).toFixed(1) + ',' + py(il(Math.pow(10, v))).toFixed(1);
      }
      svg += `<path d="${path}" fill="none" stroke="var(--s2)" stroke-width="2"/>`;
      svg += `<circle cx="${px(st.move)}" cy="${py(il(r))}" r="6" fill="var(--s2)" stroke="var(--surface)" stroke-width="2"/>`;
      svg += '</svg>';
      $('#aILChart', root).innerHTML = svg;
    };

    const num = (id, key, min) => $(id, root).addEventListener('input', (e) => { st[key] = Math.max(min, Number(e.target.value) || 0); draw(); });
    num('#aX', 'x', 1); num('#aY', 'y', 1); num('#aFee', 'fee', 0); num('#aAmt', 'amt', 0);
    $('#aDir', root).addEventListener('change', (e) => { st.dir = e.target.value; draw(); });
    $('#aMove', root).addEventListener('input', (e) => { st.move = Number(e.target.value); drawIL(); });
    st.move = 0.3;
    draw();
    drawIL();
  }

  return { playground, hashLab, tokenSim, amm, loadIntoPlayground, beforeLeave, sha256, buildDoc };
})();
