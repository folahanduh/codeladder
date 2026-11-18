/* Code Ladder app: routing, rendering, progress, quizzes and search.
   Plain JavaScript with no framework, so you can read every line. */
(function () {
  'use strict';

  const LESSONS = window.CL_LESSONS || [];
  const D = window.CL_DATA || {};
  const TOOLS = window.CL_TOOLS || {};

  const TRACKS = [
    { id: 'setup', name: 'Foundations', blurb: 'Your computer, the terminal, Git, packages and debugging: the things every professional uses every day.' },
    { id: 'web', name: 'Web Development', blurb: 'HTML, CSS and JavaScript, then TypeScript, React, Next.js, databases, testing, security and performance.' },
    { id: 'crypto', name: 'Cryptography & Blockchain', blurb: 'Hashes, keys and signatures, then Solidity, tokens, dApps and smart-contract security.' },
    { id: 'tokenomics', name: 'Tokenomics', blurb: 'Supply, allocation, vesting, liquidity and incentives, and how to model a token economy honestly.' },
  ];
  const LEVELS = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];
  const TOOL_PAGES = [
    { id: 'playground', name: 'Code Playground', blurb: 'Write HTML, CSS and JavaScript and see it run instantly, with a console.' },
    { id: 'hash-lab', name: 'Hash Lab', blurb: 'Watch SHA-256 scramble your text, and mine a block with proof of work.' },
    { id: 'token-sim', name: 'Tokenomics Simulator', blurb: 'Design an allocation and vesting schedule and see circulating supply month by month.' },
    { id: 'amm-lab', name: 'AMM Lab', blurb: 'Swap against an x*y=k pool, see price impact and impermanent loss.' },
  ];
  const RANKS = [
    [0, 'Hello, World'], [150, 'Tinkerer'], [500, 'Builder'], [1000, 'Shipper'],
    [1800, 'Engineer'], [2800, 'Senior Engineer'], [4000, 'Staff Engineer'],
  ];

  // ---------------------------------------------------------------- helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // tiny inline formatter for data.js strings: `code`, **bold**, [[Key]]
  const fmt = (s) => {
    const codes = [];
    let out = String(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    out = esc(out)
      .replace(/\[\[([^\]]+)\]\]/g, (_, k) => k.split('+').map((x) => `<kbd>${x.trim()}</kbd>`).join('+'))
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  };
  const trackOf = (id) => TRACKS.find((t) => t.id === id);
  const lessonById = (id) => LESSONS.find((l) => l.id === id);
  const lessonsIn = (track, level) => LESSONS.filter((l) => l.track === track && (!level || l.level === level));
  const today = () => new Date().toISOString().slice(0, 10);

  function codeBlock(code, lang = 'bash') {
    return `<div class="code" data-lang="${esc(lang)}"><pre><code class="language-${esc(lang)}">${esc(code)}</code></pre></div>`;
  }

  // ---------------------------------------------------------------- storage
  const KEY = 'code-ladder-v1';
  const DEFAULTS = () => ({ done: {}, quiz: {}, tools: {}, projects: {}, habits: {}, last: null, days: [], os: null, theme: 'system', tipSeen: 0 });
  const store = {
    data: (() => {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? Object.assign(DEFAULTS(), JSON.parse(raw)) : DEFAULTS();
      } catch (e) {
        return DEFAULTS();
      }
    })(),
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* storage unavailable: progress lasts this visit only */ }
      updateChrome();
    },
    markActive() {
      const d = today();
      if (!this.data.days.includes(d)) this.data.days.push(d);
    },
  };

  function xp() {
    const d = store.data;
    let total = Object.keys(d.done).length * 40;
    total += Object.values(d.quiz).filter((v) => v === 1).length * 20;
    total += Object.values(d.projects).filter((v) => v === 'done').length * 150;
    total += Object.values(d.tools).filter(Boolean).length * 5;
    return total;
  }
  function rank(points = xp()) {
    let current = RANKS[0], next = null;
    for (let i = 0; i < RANKS.length; i++) {
      if (points >= RANKS[i][0]) { current = RANKS[i]; next = RANKS[i + 1] || null; }
    }
    return { name: current[1], floor: current[0], next };
  }
  function streak() {
    const days = new Set(store.data.days);
    let n = 0;
    const d = new Date();
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    while (days.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const isDone = (id) => Boolean(store.data.done[id]);
  function pct(track, level) {
    const list = lessonsIn(track, level);
    return list.length ? list.filter((l) => isDone(l.id)).length / list.length : 0;
  }
  function nextLesson() {
    const last = store.data.last && lessonById(store.data.last);
    if (last && !isDone(last.id)) return last;
    const order = LESSONS;
    if (last) {
      const i = order.indexOf(last);
      const after = order.slice(i + 1).find((l) => !isDone(l.id));
      if (after) return after;
    }
    return order.find((l) => !isDone(l.id)) || order[0];
  }

  // ---------------------------------------------------------------- toast
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
  }
  function copyText(text, fallbackEl) {
    const done = () => toast('Copied to clipboard');
    try {
      navigator.clipboard.writeText(text).then(done, () => selectFallback(fallbackEl));
    } catch (e) {
      selectFallback(fallbackEl);
    }
  }
  function selectFallback(el) {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    toast('Press Ctrl+C (Cmd+C) to copy the selected text');
  }

  // ---------------------------------------------------------------- theme
  const THEMES = ['system', 'light', 'dark'];
  function applyTheme() {
    const t = store.data.theme || 'system';
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const btn = $('#themeBtn');
    if (btn) btn.title = `Theme: ${t}`;
  }

  // ---------------------------------------------------------------- sidebar
  function renderSidebar() {
    const h = (location.hash || '#home').slice(1);
    const cur = (id) => (h === id || (id.startsWith('track-') && h.startsWith('lesson-') && lessonById(h.slice(7))?.track === id.slice(6)) ? ' aria-current="page"' : '');
    const rungs = (t) => `<span class="nav-rungs" aria-hidden="true">${LEVELS.map((lv) => `<i><b style="width:${Math.round(pct(t.id, lv.id) * 100)}%"></b></i>`).join('')}</span>`;
    $('#sidebar').innerHTML = `
      <div class="nav-group">
        <a class="nav-link" href="#home"${cur('home')}>Home</a>
        <a class="nav-link" href="#roadmap"${cur('roadmap')}>12-month roadmap</a>
        <a class="nav-link" href="#progress"${cur('progress')}>My progress</a>
      </div>
      <div class="nav-group">
        <p class="nav-label">Tracks</p>
        ${TRACKS.map((t) => `<a class="nav-link" href="#track-${t.id}"${cur('track-' + t.id)}>${t.name}${rungs(t)}</a>`).join('')}
      </div>
      <div class="nav-group">
        <p class="nav-label">Interactive tools</p>
        ${TOOL_PAGES.map((t) => `<a class="nav-link" href="#${t.id}"${cur(t.id)}>${t.name}</a>`).join('')}
      </div>
      <div class="nav-group">
        <p class="nav-label">Reference</p>
        <a class="nav-link" href="#toolkit"${cur('toolkit')}>Install everything<span class="count">${countTools()}</span></a>
        <a class="nav-link" href="#tips"${cur('tips')}>Tips &amp; tricks<span class="count">${D.tips.length}</span></a>
        <a class="nav-link" href="#projects"${cur('projects')}>Projects<span class="count">${D.projects.length}</span></a>
        <a class="nav-link" href="#glossary"${cur('glossary')}>Glossary<span class="count">${D.glossary.length}</span></a>
      </div>`;
  }
  const countTools = () => D.toolkit.reduce((n, c) => n + c.items.length, 0);

  function updateChrome() {
    const chip = $('#xpChip');
    if (chip) chip.textContent = `${xp().toLocaleString()} XP`;
    renderSidebar();
  }

  // ---------------------------------------------------------------- views
  function viewHome() {
    const next = nextLesson();
    const done = Object.keys(store.data.done).length;
    const r = rank();
    const tipIndex = Math.floor(Date.now() / 86400000) % D.tips.length;
    const tip = D.tips[tipIndex];
    const progressToNext = r.next ? (xp() - r.floor) / (r.next[0] - r.floor) : 1;
    return `
    <div class="page-wide">
      <section class="hero">
        <p class="eyebrow">Self-paced coding school</p>
        <h1>Climb from your first HTML tag to shipping smart contracts.</h1>
        <p class="lede">${LESSONS.length} lessons in four tracks, each with a quiz. Projects for every level, an install guide for every tool a professional uses, and four hands-on labs. Your progress saves in this browser.</p>
        <div class="row">
          <a class="btn btn-primary" href="#lesson-${next.id}">${done ? 'Continue' : 'Start'}: ${esc(next.title)}</a>
          <a class="btn" href="#roadmap">See the 12-month roadmap</a>
        </div>
      </section>

      <section class="section" aria-labelledby="where">
        <h2 class="section-title" id="where">Where you are on the ladder</h2>
        <div class="ladders">
          ${TRACKS.map((t) => {
            const total = lessonsIn(t.id).length;
            const d = lessonsIn(t.id).filter((l) => isDone(l.id)).length;
            return `<a class="ladder" href="#track-${t.id}">
              <span class="ladder-name">${t.name}</span>
              <span class="ladder-frame">
                ${[...LEVELS].reverse().map((lv) => {
                  const list = lessonsIn(t.id, lv.id);
                  const n = list.filter((l) => isDone(l.id)).length;
                  return `<span class="rung rung-${lv.id}" title="${lv.name}: ${n} of ${list.length}"><b style="width:${list.length ? Math.round((n / list.length) * 100) : 0}%"></b><span><span>${lv.name}</span><span>${n}/${list.length}</span></span></span>`;
                }).join('')}
              </span>
              <span class="ladder-meta">${d} of ${total} lessons done</span>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class="grid-2">
        <div class="card" style="display:grid;gap:10px">
          <p class="eyebrow">Your rank</p>
          <p class="rank-big">${r.name}</p>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressToNext * 100)}" aria-label="Progress to next rank"><span style="width:${Math.round(progressToNext * 100)}%"></span></div>
          <p class="muted small">${r.next ? `${(r.next[0] - xp()).toLocaleString()} XP to <strong>${r.next[1]}</strong>. Lessons give 40 XP, perfect quizzes 20, shipped projects 150.` : 'Top rank reached. Now teach someone else.'}</p>
          <p class="muted small">Active days in a row: <strong>${streak()}</strong></p>
        </div>
        <div class="card" style="display:grid;gap:10px;align-content:start">
          <p class="eyebrow">Tip of the day &middot; ${esc(tip.cat)}</p>
          <h3 style="font-size:20px">${esc(tip.title)}</h3>
          <p class="muted">${fmt(tip.body)}</p>
          ${tip.code ? codeBlock(tip.code, tip.lang || 'js') : ''}
          <a href="#tips" class="small">All ${D.tips.length} tips</a>
        </div>
      </section>

      <section class="section" aria-labelledby="labs">
        <h2 class="section-title" id="labs">Hands-on labs</h2>
        <div class="grid-2">
          ${TOOL_PAGES.map((t) => `<a class="card tool-card" href="#${t.id}"><h3>${t.name}</h3><p>${t.blurb}</p></a>`).join('')}
        </div>
      </section>

      <section class="section card" aria-labelledby="how">
        <h2 class="section-title" id="how">How to use Code Ladder</h2>
        <ol class="steps">
          <li><div><strong>Install the toolkit.</strong> <span class="muted">Work through <a href="#toolkit">Install everything</a> for your operating system. Tick items off as you go.</span></div></li>
          <li><div><strong>Do one lesson a day.</strong> <span class="muted">Read it, type the code yourself, then pass the quiz. Passing marks it complete.</span></div></li>
          <li><div><strong>Build the level's projects.</strong> <span class="muted">Lessons teach; <a href="#projects">projects</a> make it stick. Do not move up a level without building something.</span></div></li>
          <li><div><strong>Keep your progress safe.</strong> <span class="muted">Progress lives in this browser. Copy a backup code from <a href="#progress">My progress</a> now and then.</span></div></li>
        </ol>
      </section>
    </div>`;
  }

  function viewTrack(trackId) {
    const t = trackOf(trackId);
    if (!t) return viewHome();
    const all = lessonsIn(t.id);
    const n = all.filter((l) => isDone(l.id)).length;
    let num = 0;
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Track</p>
        <h1>${t.name}</h1>
        <p>${t.blurb}</p>
        <div style="display:grid;gap:6px;max-width:420px">
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${n}" aria-label="Track progress"><span style="width:${all.length ? (n / all.length) * 100 : 0}%"></span></div>
          <span class="muted small">${n} of ${all.length} lessons complete</span>
        </div>
      </header>
      ${LEVELS.map((lv) => {
        const list = lessonsIn(t.id, lv.id);
        if (!list.length) return '';
        const projects = D.projects.filter((p) => p.track === t.id && p.level === lv.id);
        return `<section class="level-block">
          <div class="level-head"><h2 class="lv lv-${lv.id}">${lv.name}</h2><span class="muted small">${list.filter((l) => isDone(l.id)).length}/${list.length} done</span></div>
          <ol class="lesson-list">
            ${list.map((l) => {
              num++;
              return `<li><a class="lesson-item${isDone(l.id) ? ' done' : ''}" href="#lesson-${l.id}">
                <span class="lesson-num" aria-hidden="true">${isDone(l.id) ? '&#10003;' : num}</span>
                <span style="min-width:0"><span class="lesson-title">${esc(l.title)}</span><span class="lesson-sum" style="display:block">${esc(l.summary)}</span></span>
                <span class="lesson-min">${l.minutes} min</span>
              </a></li>`;
            }).join('')}
          </ol>
          ${projects.length ? `<p class="small muted">Build at this level: ${projects.map((p) => `<a href="#projects">${esc(p.title)}</a>`).join(', ')}</p>` : ''}
        </section>`;
      }).join('')}
      <section class="section card">
        <h2 class="section-title">Best free resources for this track</h2>
        <ul class="resource-list">
          ${(D.resources[t.id] || []).map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener">${esc(r.name)}</a><span class="note">${esc(r.note)}</span></li>`).join('')}
        </ul>
      </section>
    </div>`;
  }

  function viewLesson(id) {
    const l = lessonById(id);
    if (!l) return `<div class="page"><h1>Lesson not found</h1><p><a href="#home">Back home</a></p></div>`;
    store.data.last = l.id;
    store.save();
    const t = trackOf(l.track);
    const list = lessonsIn(l.track);
    const i = list.indexOf(l);
    const prev = list[i - 1];
    const next = list[i + 1];
    const best = store.data.quiz[l.id];
    return `
    <article class="page">
      <header class="lesson-head">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#track-${t.id}">${t.name}</a><span aria-hidden="true">/</span><span class="lv lv-${l.level}">${l.level}</span><span aria-hidden="true">/</span><span>${l.minutes} min</span>${isDone(l.id) ? '<span class="chip chip-good">Completed</span>' : ''}</nav>
        <h1>${esc(l.title)}</h1>
        <p class="summary">${esc(l.summary)}</p>
      </header>
      <div class="prose">${l.html}</div>
      ${l.quiz.length ? `
      <section class="section" aria-labelledby="quiz-title">
        <h2 class="section-title" id="quiz-title">Check your understanding</h2>
        <form class="quiz" id="quiz" novalidate>
          ${l.quiz.map((q, qi) => `
            <fieldset class="quiz-q" data-q="${qi}">
              <legend>${qi + 1}. ${q.q}</legend>
              ${q.options.map((o, oi) => `<label class="quiz-opt"><input type="radio" name="q${qi}" value="${oi}" id="q-${l.id}-${qi}-${oi}"><span>${o}</span></label>`).join('')}
              <p class="quiz-explain" hidden></p>
            </fieldset>`).join('')}
          <div class="row">
            <button class="btn btn-primary" type="submit">Check answers</button>
            <button class="btn" type="button" id="quizReset" hidden>Try again</button>
            <span class="quiz-result" id="quizResult" role="status">${best === 1 ? 'You have passed this quiz before.' : ''}</span>
          </div>
        </form>
      </section>` : ''}
      <div class="lesson-actions">
        <button class="btn${isDone(l.id) ? '' : ' btn-primary'}" type="button" id="toggleDone">${isDone(l.id) ? 'Mark as not done' : 'Mark lesson complete'}</button>
        <a class="btn" href="#track-${t.id}">All ${t.name} lessons</a>
      </div>
      <nav class="pager" aria-label="Lesson navigation">
        ${prev ? `<a href="#lesson-${prev.id}"><span class="dir">Previous</span><span>${esc(prev.title)}</span></a>` : '<span></span>'}
        ${next ? `<a class="next" href="#lesson-${next.id}"><span class="dir">Next</span><span>${esc(next.title)}</span></a>` : `<a class="next" href="#track-${t.id}"><span class="dir">Finished the track</span><span>Back to ${t.name}</span></a>`}
      </nav>
    </article>`;
  }

  function mountLesson(id) {
    const l = lessonById(id);
    if (!l) return;
    $('#toggleDone')?.addEventListener('click', () => {
      if (isDone(l.id)) delete store.data.done[l.id];
      else { store.data.done[l.id] = Date.now(); store.markActive(); toast('Lesson complete: +40 XP'); }
      store.save();
      route();
    });
    const form = $('#quiz');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let correct = 0;
      l.quiz.forEach((q, qi) => {
        const fs = $(`fieldset[data-q="${qi}"]`, form);
        const picked = $(`input[name="q${qi}"]:checked`, fs);
        const opts = $$('.quiz-opt', fs);
        opts.forEach((o) => o.classList.remove('correct', 'wrong'));
        const ok = picked && Number(picked.value) === q.answer;
        if (ok) correct++;
        opts[q.answer].classList.add('correct');
        if (picked && !ok) picked.closest('.quiz-opt').classList.add('wrong');
        const ex = $('.quiz-explain', fs);
        ex.innerHTML = `<strong>${ok ? 'Correct.' : picked ? 'Not quite.' : 'No answer chosen.'}</strong> ${q.explain}`;
        ex.hidden = false;
      });
      const all = correct === l.quiz.length;
      $('#quizResult').textContent = all ? `${correct}/${l.quiz.length}: perfect. Lesson marked complete.` : `${correct}/${l.quiz.length} correct. Read the explanations and try again.`;
      $('#quizReset').hidden = false;
      if (all) {
        const firstPass = store.data.quiz[l.id] !== 1;
        const newlyDone = !isDone(l.id);
        store.data.quiz[l.id] = 1;
        if (newlyDone) store.data.done[l.id] = Date.now();
        store.markActive();
        store.save();
        const gained = (firstPass ? 20 : 0) + (newlyDone ? 40 : 0);
        if (gained) toast(`Quiz passed: +${gained} XP`);
        const btn = $('#toggleDone');
        if (btn) { btn.textContent = 'Mark as not done'; btn.classList.remove('btn-primary'); }
      } else if (store.data.quiz[l.id] !== 1) {
        store.data.quiz[l.id] = correct / l.quiz.length;
        store.save();
      }
    });
    $('#quizReset').addEventListener('click', () => {
      form.reset();
      $$('.quiz-opt', form).forEach((o) => o.classList.remove('correct', 'wrong'));
      $$('.quiz-explain', form).forEach((x) => { x.hidden = true; });
      $('#quizResult').textContent = '';
      $('#quizReset').hidden = true;
    });
  }

  function detectOS() {
    const ua = navigator.userAgent || '';
    if (/Windows/i.test(ua)) return 'win';
    if (/Mac|iPhone|iPad/i.test(ua)) return 'mac';
    return 'linux';
  }

  function viewToolkit() {
    const os = store.data.os || detectOS();
    const total = countTools();
    const have = D.toolkit.reduce((n, c) => n + c.items.filter((i) => store.data.tools[i.id]).length, 0);
    const osName = { mac: 'macOS', win: 'Windows', linux: 'Linux' };
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Reference</p>
        <h1>Install everything</h1>
        <p>Every tool a professional web and blockchain developer uses, in the order you need it. Commands go in your terminal. Tick each one once it works.</p>
        <div class="row">
          <div class="seg" role="group" aria-label="Operating system">
            ${['mac', 'win', 'linux'].map((o) => `<button type="button" data-os="${o}" aria-pressed="${o === os}">${osName[o]}</button>`).join('')}
          </div>
          <span class="muted small">${have} of ${total} installed</span>
        </div>
      </header>
      <aside class="callout callout-pro"><p class="callout-title">How to run a command</p>
        <p>${os === 'win' ? 'Press the Windows key, type <strong>Terminal</strong> and open it.' : os === 'mac' ? 'Press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type <strong>Terminal</strong> and press Enter.' : 'Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>.'} Copy a command with the Copy button, paste it in, press Enter. Lines starting with <code>#</code> are comments for you to read, not run. If something fails, read the error, then search it word for word.</p>
      </aside>
      ${D.toolkit.map((cat) => `
        <section class="kit-cat">
          <div class="kit-cat-head"><h2 class="section-title">${esc(cat.name)}</h2><p class="muted">${fmt(cat.blurb)}</p></div>
          ${cat.items.map((it) => {
            const cmd = it.cmd.all || it.cmd[os] || '';
            return `<div class="card kit-item">
              <div class="kit-top">
                <input type="checkbox" data-tool="${it.id}" id="tool-${it.id}" ${store.data.tools[it.id] ? 'checked' : ''} aria-label="Mark ${esc(it.name)} as installed">
                <div style="min-width:0;flex:1">
                  <label class="kit-name" for="tool-${it.id}">${esc(it.name)}</label>
                  <p class="kit-what">${fmt(it.what)}</p>
                </div>
                <div class="kit-meta"><span class="chip">${esc(it.when)}</span></div>
              </div>
              ${cmd ? codeBlock(cmd, os === 'win' && !it.cmd.all ? 'powershell' : 'bash') : ''}
              ${it.note ? `<p class="kit-note">${fmt(it.note)}</p>` : ''}
              ${it.link ? `<p class="kit-note"><a href="${it.link}" target="_blank" rel="noopener">Official site</a></p>` : ''}
            </div>`;
          }).join('')}
        </section>`).join('')}
    </div>`;
  }
  function mountToolkit() {
    $$('[data-os]').forEach((b) => b.addEventListener('click', () => { store.data.os = b.dataset.os; store.save(); route(true); }));
    $$('[data-tool]').forEach((c) => c.addEventListener('change', () => {
      store.data.tools[c.dataset.tool] = c.checked;
      if (c.checked) { store.markActive(); toast('Installed: +5 XP'); }
      store.save();
    }));
  }

  let tipFilter = { cat: 'All', q: '' };
  function viewTips() {
    const cats = ['All', ...new Set(D.tips.map((t) => t.cat))];
    return `
    <div class="page-wide">
      <header class="page-head">
        <p class="eyebrow">Reference</p>
        <h1>Tips &amp; tricks</h1>
        <p>The shortcuts and habits that make experienced developers look fast. Learn two a week and use them until they are automatic.</p>
      </header>
      <div class="filter-row">
        <label class="sr-only" for="tipSearch">Filter tips</label>
        <input type="text" id="tipSearch" placeholder="Filter tips" value="${esc(tipFilter.q)}">
      </div>
      <div class="filter-row" role="group" aria-label="Tip categories">
        ${cats.map((c) => `<button type="button" class="pill-btn" data-cat="${esc(c)}" aria-pressed="${c === tipFilter.cat}">${esc(c)}</button>`).join('')}
      </div>
      <div class="grid-3" id="tipGrid"></div>
    </div>`;
  }
  function mountTips() {
    const draw = () => {
      const q = tipFilter.q.toLowerCase();
      const list = D.tips.filter((t) => (tipFilter.cat === 'All' || t.cat === tipFilter.cat) && (!q || (t.title + ' ' + t.body + ' ' + (t.code || '')).toLowerCase().includes(q)));
      $('#tipGrid').innerHTML = list.length ? list.map((t) => `
        <div class="card tip">
          <span class="tip-cat">${esc(t.cat)}</span>
          <h3>${esc(t.title)}</h3>
          <p>${fmt(t.body)}</p>
          ${t.code ? codeBlock(t.code, t.lang || 'js') : ''}
        </div>`).join('') : '<p class="muted">No tips match that filter.</p>';
      enhanceCode($('#tipGrid'));
    };
    $('#tipSearch').addEventListener('input', (e) => { tipFilter.q = e.target.value; draw(); });
    $$('[data-cat]').forEach((b) => b.addEventListener('click', () => {
      tipFilter.cat = b.dataset.cat;
      $$('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    draw();
  }

  function viewProjects() {
    const label = { todo: 'Not started', doing: 'Building', done: 'Shipped' };
    return `
    <div class="page-wide">
      <header class="page-head">
        <p class="eyebrow">Practice</p>
        <h1>Projects</h1>
        <p>Lessons teach you. Projects make you a developer. Build each one without a tutorial open, push it to GitHub, and write a short README explaining what you learned. Shipping a project earns 150 XP.</p>
      </header>
      ${LEVELS.map((lv) => `
        <section class="section">
          <div class="level-head"><h2 class="lv lv-${lv.id}">${lv.name}</h2></div>
          <div class="grid-3">
            ${D.projects.filter((p) => p.level === lv.id).map((p) => {
              const s = store.data.projects[p.id] || 'todo';
              return `<div class="card project${s === 'done' ? ' done' : ''}">
                <span class="tip-cat">${esc(trackOf(p.track).name)}</span>
                <h3>${esc(p.title)}</h3>
                <p class="muted" style="font-size:15px">${esc(p.brief)}</p>
                <ul>${p.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
                <p class="small"><strong>Stretch goal:</strong> <span class="muted">${esc(p.stretch)}</span></p>
                <label class="field"><span class="field-label">Status</span>
                  <select data-project="${p.id}" id="proj-${p.id}">${Object.entries(label).map(([k, v]) => `<option value="${k}"${k === s ? ' selected' : ''}>${v}</option>`).join('')}</select>
                </label>
              </div>`;
            }).join('')}
          </div>
        </section>`).join('')}
    </div>`;
  }
  function mountProjects() {
    $$('[data-project]').forEach((s) => s.addEventListener('change', () => {
      store.data.projects[s.dataset.project] = s.value;
      if (s.value === 'done') { store.markActive(); toast('Project shipped: +150 XP'); }
      store.save();
      s.closest('.project').classList.toggle('done', s.value === 'done');
    }));
  }

  function viewRoadmap() {
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Plan</p>
        <h1>The 12-month roadmap</h1>
        <p>About one to two focused hours a day. Nobody can download fifteen years of experience, but you can adopt the habits of people who have it from day one, and build real things every month.</p>
      </header>
      <section>
        ${D.roadmap.map((m) => {
          const ls = m.lessons.map(lessonById).filter(Boolean);
          const n = ls.filter((l) => isDone(l.id)).length;
          const p = D.projects.find((x) => x.id === m.project);
          return `<div class="month">
            <div class="month-num">Month ${m.month}</div>
            <div style="min-width:0">
              <h3>${esc(m.title)}</h3>
              <span class="muted small">${n}/${ls.length} lessons done</span>
              <ul>${m.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
              <div class="row small">${ls.map((l) => `<a href="#lesson-${l.id}"${isDone(l.id) ? ' style="text-decoration:line-through"' : ''}>${esc(l.title)}</a>`).join('<span class="muted" aria-hidden="true">&middot;</span>')}</div>
              ${p ? `<p class="small" style="margin-top:8px"><strong>Project:</strong> <a href="#projects">${esc(p.title)}</a></p>` : ''}
            </div>
          </div>`;
        }).join('')}
      </section>
      <section class="section card">
        <h2 class="section-title">Habits of a 15-year developer</h2>
        <p class="muted">Experience is mostly habits. Tick the ones you already do without thinking. Come back monthly.</p>
        <div style="display:grid;gap:8px">
          ${D.habits.map((hb, i) => `<label class="quiz-opt"><input type="checkbox" data-habit="${i}" id="habit-${i}" ${store.data.habits[i] ? 'checked' : ''}><span>${esc(hb)}</span></label>`).join('')}
        </div>
      </section>
    </div>`;
  }
  function mountRoadmap() {
    $$('[data-habit]').forEach((c) => c.addEventListener('change', () => { store.data.habits[c.dataset.habit] = c.checked; store.save(); }));
  }

  let glossQ = '';
  function viewGlossary() {
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Reference</p>
        <h1>Glossary</h1>
        <p>${D.glossary.length} terms you will meet in docs, job posts and code reviews, in plain English.</p>
      </header>
      <div class="filter-row"><label class="sr-only" for="glossSearch">Filter terms</label><input type="text" id="glossSearch" placeholder="Filter terms, e.g. gas, DNS, vesting" value="${esc(glossQ)}"></div>
      <dl class="glossary-list" id="glossList"></dl>
    </div>`;
  }
  function mountGlossary() {
    const draw = () => {
      const q = glossQ.toLowerCase();
      const list = D.glossary.filter((g) => !q || (g.term + ' ' + g.def).toLowerCase().includes(q)).sort((a, b) => a.term.localeCompare(b.term));
      $('#glossList').innerHTML = list.length ? list.map((g) => `<div class="term"><dt>${esc(g.term)}<br><span class="chip">${esc(trackOf(g.track).name)}</span></dt><dd>${esc(g.def)}</dd></div>`).join('') : '<p class="muted">No terms match.</p>';
    };
    $('#glossSearch').addEventListener('input', (e) => { glossQ = e.target.value; draw(); });
    draw();
  }

  function viewProgress() {
    const d = store.data;
    const r = rank();
    const quizPassed = Object.values(d.quiz).filter((v) => v === 1).length;
    const shipped = Object.values(d.projects).filter((v) => v === 'done').length;
    const tools = Object.values(d.tools).filter(Boolean).length;
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">You</p>
        <h1>My progress</h1>
        <p>Rank: <strong>${r.name}</strong>. Everything is stored in this browser only, so back it up with the code below if you switch devices or clear your history.</p>
      </header>
      <div class="stats">
        <div class="stat"><b>${xp().toLocaleString()}</b><span>XP</span></div>
        <div class="stat"><b>${Object.keys(d.done).length}/${LESSONS.length}</b><span>Lessons complete</span></div>
        <div class="stat"><b>${quizPassed}</b><span>Quizzes passed</span></div>
        <div class="stat"><b>${shipped}/${D.projects.length}</b><span>Projects shipped</span></div>
        <div class="stat"><b>${tools}/${countTools()}</b><span>Tools installed</span></div>
        <div class="stat"><b>${d.days.length}</b><span>Active days</span></div>
      </div>
      <section class="section">
        <h2 class="section-title">By track</h2>
        <div class="table-wrap"><table>
          <thead><tr><th>Track</th>${LEVELS.map((lv) => `<th>${lv.name}</th>`).join('')}</tr></thead>
          <tbody>${TRACKS.map((t) => `<tr><td><a href="#track-${t.id}">${t.name}</a></td>${LEVELS.map((lv) => {
            const list = lessonsIn(t.id, lv.id);
            return `<td style="font-variant-numeric:tabular-nums">${list.filter((l) => isDone(l.id)).length} / ${list.length}</td>`;
          }).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="section card">
        <h2 class="section-title">Back up or move your progress</h2>
        <p class="muted small">Copy this code and keep it somewhere safe (a note, an email to yourself). Paste it below on another device to restore.</p>
        <div class="field"><label class="field-label" for="backupOut">Your backup code</label><textarea id="backupOut" rows="3" readonly class="mono" style="width:100%">${esc(backupCode())}</textarea></div>
        <div class="row"><button class="btn" type="button" id="copyBackup">Copy backup code</button></div>
        <div class="field"><label class="field-label" for="backupIn">Restore from a backup code</label><textarea id="backupIn" rows="3" class="mono" style="width:100%" placeholder="Paste a backup code here"></textarea></div>
        <div class="row"><button class="btn" type="button" id="restoreBackup">Restore</button><span class="small" id="restoreMsg" role="status"></span></div>
      </section>
      <section class="section card">
        <h2 class="section-title">Start over</h2>
        <p class="muted small">Clears every lesson, quiz, project and tool tick in this browser.</p>
        <div class="row"><button class="btn btn-danger" type="button" id="resetAll">Reset all progress</button><button class="btn btn-danger" type="button" id="resetConfirm" hidden>Yes, erase everything</button><button class="btn" type="button" id="resetCancel" hidden>Cancel</button></div>
      </section>
    </div>`;
  }
  function backupCode() {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(store.data)))); } catch (e) { return ''; }
  }
  function mountProgress() {
    $('#copyBackup').addEventListener('click', () => copyText($('#backupOut').value, $('#backupOut')));
    $('#restoreBackup').addEventListener('click', () => {
      const msg = $('#restoreMsg');
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob($('#backupIn').value.trim()))));
        if (!data || typeof data.done !== 'object') throw new Error('bad');
        store.data = Object.assign(DEFAULTS(), data);
        store.save();
        applyTheme();
        route(true);
        toast('Progress restored');
      } catch (e) {
        msg.textContent = 'That code did not work. Copy the whole code with no extra spaces and try again.';
      }
    });
    $('#resetAll').addEventListener('click', () => { $('#resetConfirm').hidden = false; $('#resetCancel').hidden = false; $('#resetAll').hidden = true; });
    $('#resetCancel').addEventListener('click', () => { $('#resetConfirm').hidden = true; $('#resetCancel').hidden = true; $('#resetAll').hidden = false; });
    $('#resetConfirm').addEventListener('click', () => { store.data = DEFAULTS(); store.save(); applyTheme(); route(true); toast('Progress reset'); });
  }

  function viewTool(id) {
    const t = TOOL_PAGES.find((x) => x.id === id);
    return `<div class="page-wide" id="toolRoot"><header class="page-head"><p class="eyebrow">Interactive lab</p><h1>${t.name}</h1><p>${t.blurb}</p></header><div id="toolBody"></div></div>`;
  }

  // ---------------------------------------------------------------- code blocks
  function enhanceCode(root) {
    $$('.code', root).forEach((block) => {
      if (block.dataset.ready) return;
      block.dataset.ready = '1';
      const lang = block.dataset.lang || 'text';
      const codeEl = $('code', block);
      const raw = codeEl.textContent;
      const head = document.createElement('div');
      head.className = 'code-head';
      head.innerHTML = `<span class="code-lang">${esc(lang)}</span>${block.dataset.try ? '<button type="button" class="code-btn run">Run in Playground</button>' : ''}<button type="button" class="code-btn copy">Copy</button>`;
      block.prepend(head);
      $('.copy', head).addEventListener('click', () => copyText(raw, codeEl));
      const run = $('.run', head);
      if (run) run.addEventListener('click', () => {
        if (TOOLS.loadIntoPlayground) TOOLS.loadIntoPlayground(lang, raw);
        location.hash = 'playground';
      });
      if (window.hljs) {
        const map = { sol: 'solidity', solidity: 'solidity', sh: 'bash', powershell: 'shell', html: 'xml', ts: 'typescript', tsx: 'typescript', jsx: 'javascript', js: 'javascript', py: 'python', text: 'plaintext' };
        const l = map[lang] || lang;
        if (hljs.getLanguage(l)) {
          try { codeEl.innerHTML = hljs.highlight(raw, { language: l, ignoreIllegals: true }).value; } catch (e) { /* plain text is fine */ }
        }
      }
    });
  }
  function registerSolidity() {
    if (!window.hljs || hljs.getLanguage('solidity')) return;
    hljs.registerLanguage('solidity', (h) => ({
      name: 'Solidity',
      keywords: {
        keyword: 'pragma solidity contract interface library abstract is function modifier event emit struct enum mapping returns return if else for while do break continue new delete import from as using public private internal external view pure payable constant immutable override virtual memory storage calldata require revert assert error unchecked constructor receive fallback try catch indexed anonymous',
        type: 'address bool string bytes byte int uint int8 int16 int32 int64 int128 int256 uint8 uint16 uint32 uint64 uint128 uint256 bytes1 bytes4 bytes32',
        literal: 'true false wei gwei ether seconds minutes hours days weeks',
        built_in: 'msg block tx this super abi keccak256 sha256 ecrecover type',
      },
      contains: [h.C_LINE_COMMENT_MODE, h.C_BLOCK_COMMENT_MODE, h.QUOTE_STRING_MODE, h.APOS_STRING_MODE, h.C_NUMBER_MODE],
    }));
  }

  // ---------------------------------------------------------------- search
  let index = null;
  function buildIndex() {
    index = [];
    LESSONS.forEach((l) => index.push({ kind: `Lesson · ${trackOf(l.track).name}`, title: l.title, hay: (l.title + ' ' + l.summary).toLowerCase(), body: l.text.toLowerCase(), href: `#lesson-${l.id}` }));
    TOOL_PAGES.forEach((t) => index.push({ kind: 'Lab', title: t.name, hay: (t.name + ' ' + t.blurb).toLowerCase(), body: '', href: `#${t.id}` }));
    D.toolkit.forEach((c) => c.items.forEach((i) => index.push({ kind: 'Install', title: i.name, hay: (i.name + ' ' + i.what).toLowerCase(), body: '', href: '#toolkit' })));
    D.glossary.forEach((g) => index.push({ kind: 'Glossary', title: g.term, hay: (g.term + ' ' + g.def).toLowerCase(), body: '', href: '#glossary', gloss: g.term }));
    D.tips.forEach((t) => index.push({ kind: `Tip · ${t.cat}`, title: t.title, hay: (t.title + ' ' + t.body).toLowerCase(), body: '', href: '#tips' }));
    D.projects.forEach((p) => index.push({ kind: 'Project', title: p.title, hay: (p.title + ' ' + p.brief).toLowerCase(), body: '', href: '#projects' }));
  }
  function search(q) {
    if (!index) buildIndex();
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return index
      .map((it) => {
        let score = 0;
        for (const w of words) {
          if (it.title.toLowerCase().includes(w)) score += 6;
          else if (it.hay.includes(w)) score += 3;
          else if (it.body.includes(w)) score += 1;
          else return null;
        }
        if (it.title.toLowerCase().startsWith(words[0])) score += 4;
        return { it, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.it);
  }
  function setupSearch() {
    const input = $('#searchInput');
    const box = $('#searchResults');
    let results = [];
    let sel = -1;
    const close = () => { box.hidden = true; sel = -1; };
    const draw = () => {
      const q = input.value.trim();
      if (!q) { close(); return; }
      results = search(q);
      box.innerHTML = results.length
        ? results.map((r, i) => `<a href="${r.href}" role="option" data-i="${i}" aria-selected="${i === sel}"><span class="sr-kind">${esc(r.kind)}</span><span class="sr-title">${esc(r.title)}</span></a>`).join('')
        : `<p class="sr-empty">Nothing found for "${esc(q)}".</p>`;
      box.hidden = false;
    };
    const go = (r) => {
      if (r.gloss) glossQ = r.gloss;
      input.value = '';
      close();
      if (location.hash === r.href) route(true); else location.hash = r.href.slice(1);
    };
    input.addEventListener('input', () => { sel = -1; draw(); });
    input.addEventListener('focus', draw);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
      else if (e.key === 'Enter') { const r = results[Math.max(sel, 0)]; if (r) { e.preventDefault(); go(r); } }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    box.addEventListener('mousedown', (e) => {
      const a = e.target.closest('a[data-i]');
      if (a) { e.preventDefault(); go(results[Number(a.dataset.i)]); }
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && !['input', 'textarea', 'select'].includes(tag)) { e.preventDefault(); input.focus(); }
    });
  }

  // ---------------------------------------------------------------- router
  const VIEWS = {
    home: [viewHome],
    toolkit: [viewToolkit, mountToolkit],
    tips: [viewTips, mountTips],
    projects: [viewProjects, mountProjects],
    roadmap: [viewRoadmap, mountRoadmap],
    glossary: [viewGlossary, mountGlossary],
    progress: [viewProgress, mountProgress],
  };
  const TOOL_MOUNT = { playground: 'playground', 'hash-lab': 'hashLab', 'token-sim': 'tokenSim', 'amm-lab': 'amm' };

  let lastHash = null;
  function route(keepScroll) {
    const h = (location.hash || '#home').slice(1) || 'home';
    const main = $('#main');
    const sameView = h === lastHash;
    lastHash = h;
    if (TOOLS.beforeLeave) TOOLS.beforeLeave();
    if (h.startsWith('track-')) {
      main.innerHTML = viewTrack(h.slice(6));
    } else if (h.startsWith('lesson-')) {
      main.innerHTML = viewLesson(h.slice(7));
      mountLesson(h.slice(7));
    } else if (TOOL_MOUNT[h]) {
      main.innerHTML = viewTool(h);
      const fn = TOOLS[TOOL_MOUNT[h]];
      if (fn) fn($('#toolBody'), { toast, copyText, enhanceCode });
      else $('#toolBody').innerHTML = '<p class="muted">This tool failed to load.</p>';
    } else {
      const v = VIEWS[h] || VIEWS.home;
      main.innerHTML = v[0]();
      if (v[1]) v[1]();
    }
    enhanceCode(main);
    renderSidebar();
    closeMenu();
    const titleEl = $('h1', main);
    document.title = h === 'home' || !titleEl ? 'Code Ladder' : `${titleEl.textContent} · Code Ladder`;
    if (!keepScroll && !sameView) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }

  // ---------------------------------------------------------------- menu
  function openMenu() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); }
  function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }

  // ---------------------------------------------------------------- boot
  function boot() {
    registerSolidity();
    applyTheme();
    updateChrome();
    setupSearch();
    $('#menuBtn').addEventListener('click', () => ($('#sidebar').classList.contains('open') ? closeMenu() : openMenu()));
    $('#scrim').addEventListener('click', closeMenu);
    $('#themeBtn').addEventListener('click', () => {
      const i = THEMES.indexOf(store.data.theme || 'system');
      store.data.theme = THEMES[(i + 1) % THEMES.length];
      store.save();
      applyTheme();
      toast(`Theme: ${store.data.theme}`);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('hashchange', () => route());
    if (!LESSONS.length) {
      $('#main').innerHTML = '<div class="page"><h1>No lessons found</h1><p>Run <code>npm run build</code> to generate assets/content.js from the /content folder.</p></div>';
      return;
    }
    route();
  }
  boot();
})();
