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
    { id: 'security', name: 'Cybersecurity', blurb: 'From the security mindset and phishing to web hacking, key management, audits, incident response, formal verification and securing a blockchain launch. Beginner to expert.' },
    { id: 'keys', name: 'Keys & Accounts', blurb: 'Private keys, seed phrases, sessions, OAuth and third-party API access, account takeover, launchpad signing, KMS and MPC, recovery and automated detection. The number one way blockchains and apps get drained, from beginner to expert.' },
    { id: 'encrypt', name: 'Encryption', blurb: 'Make every hack worth less: encrypt your devices, backups, files, secrets, traffic and app data, then go deep on envelope encryption with a KMS, end-to-end encryption, how real encryption gets broken, and post-quantum cryptography. Beginner to expert.' },
    { id: 'tokenomics', name: 'Tokenomics', blurb: 'Supply, allocation, vesting, liquidity and incentives, and how to model a token economy honestly.' },
  ];
  const LEVELS = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'expert', name: 'Expert' },
  ];
  const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  // levels that actually have lessons in a track (only the security tracks go up to Expert)
  const levelsOf = (trackId) => LEVELS.filter((lv) => LESSONS.some((l) => l.track === trackId && l.level === lv.id));
  const TOOL_PAGES = [
    { id: 'playground', name: 'Code Playground', blurb: 'Write HTML, CSS and JavaScript and see it run instantly, with a console.' },
    { id: 'hash-lab', name: 'Hash Lab', blurb: 'Watch SHA-256 scramble your text, and mine a block with proof of work.' },
    { id: 'token-sim', name: 'Tokenomics Simulator', blurb: 'Design an allocation and vesting schedule and see circulating supply month by month.' },
    { id: 'amm-lab', name: 'AMM Lab', blurb: 'Swap against an x*y=k pool, see price impact and impermanent loss.' },
    { id: 'critical-moment', name: 'Critical Moment', blurb: 'A live attack on a virtual machine and a clock. Identify the attack, decode the evidence, stop it in the right order. Describe any scenario and the AI builds it, then ask the AI coach anything.' },
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
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|#)[^)\s]+)\)/g, (_, t, href) => `<a href="${href}"${href.startsWith('#') ? '' : ' target="_blank" rel="noopener"'}>${t}</a>`);
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
  const DEFAULTS = () => ({ done: {}, quiz: {}, ex: {}, ctf: {}, hack: {}, crit: {}, cards: {}, tools: {}, projects: {}, habits: {}, last: null, days: [], os: null, theme: 'system', tipSeen: 0 });
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
    total += Object.values(d.ex || {}).reduce((n, v) => n + (v === 'solved' ? 15 : v === 'assisted' ? 5 : 0), 0);
    total += Math.round(hackPoints() / 5);
    total += Object.values(d.crit || {}).reduce((n, v) => n + Math.round(v / 2), 0);
    total += Object.values(d.cards || {}).filter((c) => c.box >= MASTERED_BOX).length * 5;
    return total;
  }
  // points from captured CTF flags and ticked hackathon milestones
  function hackPoints() {
    const d = store.data;
    let pts = 0;
    for (const h of D.hackathons || []) {
      if (h.type === 'ctf') pts += h.challenges.filter((c) => (d.ctf || {})[c.id]).reduce((n, c) => n + c.points, 0);
      else pts += h.milestones.filter((m) => ((d.hack || {})[h.id] || {}).done?.[m.id]).reduce((n, m) => n + m.points, 0);
    }
    return pts;
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
  const exDone = (l) => l.exercises.filter((_, i) => (store.data.ex || {})[`${l.id}#${i}`]).length;
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
    const rungs = (t) => `<span class="nav-rungs" aria-hidden="true">${levelsOf(t.id).map((lv) => `<i class="nr-${lv.id}"><b style="width:${Math.round(pct(t.id, lv.id) * 100)}%"></b></i>`).join('')}</span>`;
    $('#sidebar').innerHTML = `
      <div class="nav-group">
        <a class="nav-link" href="#home"${cur('home')}>Home</a>
        <a class="nav-link" href="#roadmap"${cur('roadmap')}>12-month roadmap</a>
        <a class="nav-link" href="#progress"${cur('progress')}>My progress</a>
        <a class="nav-link" href="#refresh"${cur('refresh')}>Mind refresh${(() => { const n = dueCards().length; return n ? `<span class="count">${n}</span>` : ''; })()}</a>
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
        <p class="nav-label">Practice</p>
        <a class="nav-link" href="#projects"${cur('projects')}>Projects<span class="count">${D.projects.length}</span></a>
        <a class="nav-link" href="#hackathons"${cur('hackathons')}>Hackathons &amp; CTF<span class="count">${(D.hackathons || []).length}</span></a>
      </div>
      <div class="nav-group">
        <p class="nav-label">Reference</p>
        <a class="nav-link" href="#toolkit"${cur('toolkit')}>Install everything<span class="count">${countTools()}</span></a>
        <a class="nav-link" href="#tips"${cur('tips')}>Tips &amp; tricks<span class="count">${D.tips.length}</span></a>
        <a class="nav-link" href="#glossary"${cur('glossary')}>Glossary<span class="count">${D.glossary.length}</span></a>
      </div>`;
  }
  const countTools = () => D.toolkit.reduce((n, c) => n + c.items.length, 0);

  function updateChrome() {
    const chip = $('#xpChip');
    if (chip) chip.textContent = `${xp().toLocaleString()} XP`;
    renderSidebar();
  }

  // ---------------------------------------------------------------- mind refresh
  // Every finished lesson gets a recap: what it covered, the code you wrote, and flashcards made from
  // its quiz. Cards then come back on a spaced-repetition schedule (the Leitner system): remember one
  // and it waits longer before returning; forget it and it comes back tomorrow.
  const BOX_DAYS = [0, 1, 3, 7, 16, 35]; // box number -> days until the next review
  const MASTERED_BOX = 4; // remembered three times in a row
  const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const cardsOf = (l) => l.quiz.map((q, i) => ({ id: `${l.id}#q${i}`, l, q }));
  const cardById = (id) => { const [lid, qi] = id.split('#q'); const l = lessonById(lid); return l && l.quiz[+qi] ? { id, l, q: l.quiz[+qi] } : null; };
  const sectionsOf = (l) => (l.html.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || []).map((h) => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  function cardState(id) { return (store.data.cards || {})[id]; }
  // Cards join the schedule when their lesson is finished; the first review is tomorrow.
  function enrolCards(l, dueToday) {
    store.data.cards = store.data.cards || {};
    cardsOf(l).forEach((c) => { if (!store.data.cards[c.id]) store.data.cards[c.id] = { box: 1, due: dueToday ? today() : addDays(1) }; });
  }
  function gradeCard(id, remembered) {
    store.data.cards = store.data.cards || {};
    const cur = store.data.cards[id] || { box: 0 };
    const box = remembered ? Math.min(cur.box + 1, BOX_DAYS.length - 1) : 1;
    store.data.cards[id] = { box, due: addDays(BOX_DAYS[box]), seen: (cur.seen || 0) + 1 };
    store.markActive();
    store.save();
    return BOX_DAYS[box];
  }
  // Cards due today from finished lessons. Lessons finished before this feature existed join now.
  function dueCards() {
    const due = [];
    const t = today();
    LESSONS.filter((l) => isDone(l.id)).forEach((l) => cardsOf(l).forEach((c) => {
      const st = cardState(c.id);
      if (!st || st.due <= t) due.push(c);
    }));
    return due;
  }
  const masteredCount = () => Object.values(store.data.cards || {}).filter((c) => c.box >= MASTERED_BOX).length;
  const levelName = (id) => (LEVELS.find((lv) => lv.id === id) || {}).name || id;
  const levelDone = (track, level) => { const list = lessonsIn(track, level); return list.length > 0 && list.every((l) => isDone(l.id)); };

  function flashHTML(c, big) {
    return `<div class="flash${big ? ' flash-big' : ''}" data-card="${esc(c.id)}">
      <p class="flash-q">${c.q.q}</p>
      <button type="button" class="btn btn-sm flash-show">Show answer</button>
      <div class="flash-a" hidden>
        <p class="flash-ans">${c.q.options[c.q.answer]}</p>
        <p class="muted">${c.q.explain}</p>
        <div class="row flash-grade"><span class="small muted">Did you remember it?</span><button type="button" class="btn btn-sm btn-primary" data-grade="1">Yes, got it</button><button type="button" class="btn btn-sm" data-grade="0">Not yet</button></div>
      </div>
    </div>`;
  }
  // Wires every flashcard inside root. onGraded(id, remembered) runs after each answer.
  // practiceOnly(id) = true means a second try in the same session: no change to the schedule.
  function wireFlash(root, onGraded, practiceOnly) {
    $$('.flash', root).forEach((card) => {
      $('.flash-show', card).addEventListener('click', (e) => {
        e.target.hidden = true;
        $('.flash-a', card).hidden = false;
        $('[data-grade="1"]', card).focus();
      });
      $$('[data-grade]', card).forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.grade === '1';
        card.classList.add(ok ? 'flash-ok' : 'flash-again');
        if (practiceOnly && practiceOnly(card.dataset.card)) {
          $('.flash-grade', card).innerHTML = `<span class="small">${ok ? 'Good, it is fresher now. It still comes back tomorrow.' : 'It comes back tomorrow. Have a quick look at the lesson before then.'}</span>`;
        } else {
          const days = gradeCard(card.dataset.card, ok);
          $('.flash-grade', card).innerHTML = `<span class="small">${ok ? `Nice. It comes back in ${days} day${days === 1 ? '' : 's'}.` : 'No problem: it comes back tomorrow, and the more you see it the longer it sticks.'}</span>`;
        }
        if (onGraded) onGraded(card.dataset.card, ok);
      }));
    });
  }

  function recapHTML(l) {
    const secs = sectionsOf(l);
    return `
      <div class="recap-head"><p class="eyebrow">Mind refresh</p><h2 class="section-title" id="recap-title">Recap: ${esc(l.title)}</h2><p class="muted">${esc(l.summary)}</p></div>
      <div class="recap-grid">
        <div class="recap-box"><h3 class="small-title">What you covered</h3><ol class="recap-sections">${secs.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
        ${l.exercises.length ? `<div class="recap-box"><h3 class="small-title">Code you wrote</h3>${l.exercises.map((e) => `<details class="recap-code"><summary>${e.title}</summary>${codeBlock(e.solution, e.lang)}</details>`).join('')}</div>` : ''}
      </div>
      ${l.quiz.length ? `<div class="recap-cards"><h3 class="small-title">Test your memory</h3><p class="muted small">Answer each one in your head before you reveal it. Recalling beats rereading. These cards come back in your daily <a href="#refresh">Mind refresh</a>.</p><div class="flash-list">${cardsOf(l).map((c) => flashHTML(c)).join('')}</div></div>` : ''}
      <div id="levelDone"></div>`;
  }
  function levelBanner(l) {
    if (!levelDone(l.track, l.level)) return '';
    const t = trackOf(l.track);
    const n = lessonsIn(l.track, l.level).reduce((k, x) => k + x.quiz.length, 0);
    return `<div class="recap-level"><p class="eyebrow">Level complete</p><h3>You finished ${esc(t.name)}: ${levelName(l.level)}</h3><p class="muted">Lock it in before you move up: read the level recap and run through all ${n} of its cards.</p><div class="row"><a class="btn btn-primary btn-sm" href="#recap-${l.track}-${l.level}">Level recap</a><a class="btn btn-sm" href="#refresh-${l.track}-${l.level}">Refresh the whole level</a></div></div>`;
  }

  function viewLevelRecap(key) {
    const [trackId, level] = key.split('-');
    const t = trackOf(trackId);
    const list = lessonsIn(trackId, level);
    if (!t || !list.length) return `<div class="page"><h1>Recap not found</h1><p><a href="#home">Back home</a></p></div>`;
    const done = list.filter((l) => isDone(l.id));
    return `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Mind refresh &middot; Level recap</p>
        <h1>${esc(t.name)}: ${levelName(level)}</h1>
        <p>${done.length} of ${list.length} lessons finished. The key ideas from each finished lesson, in one place. Lessons you have not finished stay hidden so the recap does not spoil their quizzes.</p>
        <div class="row">${done.length ? `<a class="btn btn-primary" href="#refresh-${trackId}-${level}">Refresh this level (${done.reduce((k, l) => k + l.quiz.length, 0)} cards)</a>` : ''}<a class="btn" href="#track-${trackId}">Back to ${esc(t.name)}</a></div>
      </header>
      ${list.map((l) => isDone(l.id) ? `
        <section class="card recap-lesson">
          <h2 class="recap-lesson-title"><a href="#lesson-${l.id}">${esc(l.title)}</a></h2>
          <p class="muted">${esc(l.summary)}</p>
          <ul class="recap-ideas">${l.quiz.map((q) => `<li><span class="recap-q">${q.q}</span><span class="recap-a">${q.options[q.answer]}</span></li>`).join('')}</ul>
        </section>` : `
        <section class="card recap-lesson recap-locked">
          <h2 class="recap-lesson-title"><a href="#lesson-${l.id}">${esc(l.title)}</a></h2>
          <p class="muted small">Not finished yet. Its key ideas appear here when you finish it.</p>
        </section>`).join('')}
    </div>`;
  }

  // A review session: today's due cards, or every card from one level.
  let session = null;
  function viewRefresh(scope) {
    let cards;
    let title = 'Mind refresh';
    let note = 'A few minutes of recall from lessons you have finished. Answer in your head, reveal, then be honest: cards you remember wait longer before coming back; cards you forget return tomorrow.';
    if (scope) {
      const [trackId, level] = scope.split('-');
      const t = trackOf(trackId);
      cards = lessonsIn(trackId, level).filter((l) => isDone(l.id)).flatMap(cardsOf);
      title = t ? `Refresh: ${t.name}, ${levelName(level)}` : title;
      note = 'Every card from the lessons you have finished at this level, in a shuffled order.';
      for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    } else {
      cards = dueCards().slice(0, 12);
    }
    session = { cards, firstCount: cards.length, i: 0, remembered: 0, again: [], requeued: new Set() };
    const levels = [];
    TRACKS.forEach((t) => LEVELS.forEach((lv) => { if (lessonsIn(t.id, lv.id).some((l) => isDone(l.id))) levels.push({ t, lv }); }));
    return `
    <div class="page">
      <header class="page-head"><p class="eyebrow">Practice</p><h1>${esc(title)}</h1><p>${note}</p></header>
      <div id="refreshBody"></div>
      ${levels.length ? `<section class="section"><h2 class="section-title">Level recaps</h2><div class="recap-links">${levels.map(({ t, lv }) => `<a class="chip" href="#recap-${t.id}-${lv.id}">${esc(t.name)}: ${lv.name}${levelDone(t.id, lv.id) ? ' &#10003;' : ''}</a>`).join('')}</div></section>` : ''}
      <p class="muted small">Mastered cards: <strong>${masteredCount()}</strong> (5 XP each). A card is mastered once you have remembered it three reviews in a row.</p>
    </div>`;
  }
  function mountRefresh() {
    const body = $('#refreshBody');
    if (!body || !session) return;
    const s = session;
    if (!s.cards.length) {
      const any = LESSONS.some((l) => isDone(l.id));
      body.innerHTML = `<div class="card refresh-empty"><h2 class="section-title">${any ? 'All caught up' : 'Nothing to refresh yet'}</h2><p class="muted">${any ? 'No cards are due today. Come back tomorrow, or refresh a whole level below.' : 'Finish a lesson (pass its quiz or mark it complete) and its key ideas become cards here.'}</p></div>`;
      return;
    }
    const show = () => {
      if (s.i >= s.cards.length) {
        body.innerHTML = `<div class="card refresh-done"><p class="eyebrow">Session complete</p><h2 class="section-title">You remembered ${s.remembered} of ${s.firstCount}</h2><p class="muted">${s.again.length ? `Cards you missed come back tomorrow. Worth a quick reread: ${[...new Set(s.again.map((id) => cardById(id).l))].map((l) => `<a href="#lesson-${l.id}">${esc(l.title)}</a>`).join(', ')}.` : 'A clean sweep. Those cards now wait longer before coming back.'}</p><div class="row"><a class="btn btn-primary" href="#home">Back home</a><a class="btn" href="#progress">My progress</a></div></div>`;
        return;
      }
      const c = s.cards[s.i];
      body.innerHTML = `<div class="refresh-top"><span class="small muted">Card ${s.i + 1} of ${s.cards.length} &middot; from <a href="#lesson-${c.l.id}">${esc(c.l.title)}</a></span><div class="bar"><span style="width:${(s.i / s.cards.length) * 100}%"></span></div></div>${flashHTML(c, true)}`;
      enhanceCode(body);
      const secondTry = s.i >= s.firstCount;
      wireFlash(body, (id, ok) => {
        if (ok && !secondTry) s.remembered++;
        if (!ok && !secondTry) { s.again.push(id); s.requeued.add(id); s.cards.push(c); }
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn btn-primary btn-sm refresh-next';
        next.textContent = s.i + 1 < s.cards.length ? 'Next card' : 'Finish';
        next.addEventListener('click', () => { s.i++; show(); });
        $('.flash-grade', body).append(next);
        next.focus();
      }, () => secondTry);
    };
    show();
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
        <p class="lede">${LESSONS.length} lessons in ${NUM_WORDS[TRACKS.length] || TRACKS.length} tracks, with ${LESSONS.reduce((n, l) => n + l.exercises.length, 0)} coding exercises and a quiz in every lesson. Projects for every level, hackathons and a capture-the-flag, an install guide for every tool a professional uses, and ${NUM_WORDS[TOOL_PAGES.length]} hands-on labs, including the Critical Moment attack simulator with an AI coach. Your progress saves in this browser.</p>
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
                ${[...levelsOf(t.id)].reverse().map((lv) => {
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
          <p class="muted small">${r.next ? `${(r.next[0] - xp()).toLocaleString()} XP to <strong>${r.next[1]}</strong>. Lessons give 40 XP, coding exercises 15, perfect quizzes 20, shipped projects 150, and CTF flags and hackathon milestones a fifth of their points, Critical Moment runs half your best score, and every Mind refresh card you master 5.` : 'Top rank reached. Now teach someone else.'}</p>
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

      ${(() => {
        const anyDone = LESSONS.some((l) => isDone(l.id));
        const due = dueCards().length;
        return `<section class="card refresh-home" aria-labelledby="refresh-h">
          <div><p class="eyebrow">Mind refresh</p><h2 class="section-title" id="refresh-h">${!anyDone ? 'Remember what you learn' : due ? `${due} card${due === 1 ? '' : 's'} to refresh today` : 'All caught up for today'}</h2>
          <p class="muted small">${!anyDone ? 'Every lesson you finish ends with a recap and memory cards. They come back here on a schedule, just before you would forget them.' : due ? 'A few minutes of recall now saves relearning later.' : `You have mastered ${masteredCount()} card${masteredCount() === 1 ? '' : 's'}. New cards arrive as you finish lessons.`}</p></div>
          ${anyDone ? `<a class="btn${due ? ' btn-primary' : ''}" href="#refresh">${due ? 'Start refresh' : 'Open Mind refresh'}</a>` : ''}
        </section>`;
      })()}

      <section class="section" aria-labelledby="labs">
        <h2 class="section-title" id="labs">Hands-on labs</h2>
        <div class="grid-2">
          ${TOOL_PAGES.map((t) => `<a class="card tool-card${t.id === 'critical-moment' ? ' tool-card-feature' : ''}" href="#${t.id}">${t.id === 'critical-moment' ? '<span class="tip-cat">New &middot; attack simulator + AI coach</span>' : ''}<h3>${t.name}</h3><p>${t.blurb}</p></a>`).join('')}
        </div>
      </section>

      <section class="section" aria-labelledby="compete">
        <h2 class="section-title" id="compete">Hackathons and capture the flag</h2>
        <div class="grid-3">
          ${(D.hackathons || []).map((h) => `<a class="card tool-card" href="#hackathons"><span class="tip-cat">${esc(h.level)} &middot; ${esc(h.duration.split('.')[0])}</span><h3>${esc(h.name)}</h3><p>${esc(h.tagline)}</p></a>`).join('')}
        </div>
      </section>

      <section class="section card" aria-labelledby="how">
        <h2 class="section-title" id="how">How to use Code Ladder</h2>
        <ol class="steps">
          <li><div><strong>Install the toolkit.</strong> <span class="muted">Work through <a href="#toolkit">Install everything</a> for your operating system. Tick items off as you go.</span></div></li>
          <li><div><strong>Do one lesson a day.</strong> <span class="muted">Read it and solve the coding exercises in the built-in editor. Get one wrong five times and the answer appears as faded ghost text for you to type over. Then pass the quiz to complete the lesson.</span></div></li>
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
          <div class="level-head"><h2 class="lv lv-${lv.id}">${lv.name}</h2><span class="muted small">${list.filter((l) => isDone(l.id)).length}/${list.length} done${list.some((l) => isDone(l.id)) ? ` &middot; <a href="#recap-${t.id}-${lv.id}">${levelDone(t.id, lv.id) ? 'Level recap &#10003;' : 'Recap so far'}</a>` : ''}</span></div>
          <ol class="lesson-list">
            ${list.map((l) => {
              num++;
              return `<li><a class="lesson-item${isDone(l.id) ? ' done' : ''}" href="#lesson-${l.id}">
                <span class="lesson-num" aria-hidden="true">${isDone(l.id) ? '&#10003;' : num}</span>
                <span style="min-width:0"><span class="lesson-title">${esc(l.title)}</span><span class="lesson-sum" style="display:block">${esc(l.summary)}</span></span>
                <span class="lesson-min">${l.minutes} min${l.exercises.length ? `<br>${exDone(l)}/${l.exercises.length} exercises` : ''}</span>
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
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#track-${t.id}">${t.name}</a><span aria-hidden="true">/</span><span class="lv lv-${l.level}">${l.level}</span><span aria-hidden="true">/</span><span>${l.minutes} min</span>${l.exercises.length ? `<span aria-hidden="true">/</span><a href="#" class="ex-jump">${l.exercises.length} coding exercise${l.exercises.length > 1 ? 's' : ''}</a>` : ''}${isDone(l.id) ? '<span class="chip chip-good">Completed</span>' : ''}</nav>
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
      <section class="section recap" id="recap" aria-labelledby="recap-title"${isDone(l.id) ? '' : ' hidden'}>${isDone(l.id) ? recapHTML(l) : ''}</section>
      ${isDone(l.id) ? '' : '<p class="recap-teaser" id="recapTeaser"><strong>Mind refresh:</strong> finish this lesson (pass the quiz or mark it complete) to unlock a recap of what you covered, the code you wrote and memory cards.</p>'}
      <div class="lesson-actions">
        <button class="btn${isDone(l.id) ? '' : ' btn-primary'}" type="button" id="toggleDone">${isDone(l.id) ? 'Mark as not done' : 'Mark lesson complete'}</button>
        <a class="btn" href="#track-${t.id}">All ${t.name} lessons</a>
        <button class="btn" type="button" id="askCoach">Ask the AI coach</button>
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
    $('#askCoach')?.addEventListener('click', () => {
      if (!window.CL_AI) return;
      window.CL_AI.openDrawer({
        title: 'AI coach',
        intro: `Ask me anything about **${l.title}**: what a line of code does, why something matters, or for a harder example.`,
        suggestions: ['Explain this lesson more simply', 'Give me a real-world example', 'Quiz me on this lesson'],
        getContext: () => `Lesson: ${l.title} (${trackOf(l.track).name}, ${l.level}). Summary: ${l.summary}\n\nLesson text:\n${l.text.slice(0, 18000)}`,
      });
    });
    // Shows the Mind refresh recap once the lesson is finished.
    const showRecap = (scroll) => {
      const box = $('#recap');
      if (!box) return;
      enrolCards(l);
      store.save();
      box.innerHTML = recapHTML(l);
      box.hidden = false;
      $('#recapTeaser')?.remove();
      enhanceCode(box);
      wireFlash(box);
      $('#levelDone', box).innerHTML = levelBanner(l);
      if (scroll) setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    };
    if (isDone(l.id)) { wireFlash($('#recap')); $('#levelDone').innerHTML = levelBanner(l); }
    $('#toggleDone')?.addEventListener('click', () => {
      const btn = $('#toggleDone');
      if (isDone(l.id)) delete store.data.done[l.id];
      else { store.data.done[l.id] = Date.now(); store.markActive(); toast('Lesson complete: +40 XP. Here is your mind refresh.'); }
      store.save();
      btn.textContent = isDone(l.id) ? 'Mark as not done' : 'Mark lesson complete';
      btn.classList.toggle('btn-primary', !isDone(l.id));
      if (isDone(l.id)) showRecap(true);
    });
    $('.ex-jump')?.addEventListener('click', (e) => {
      e.preventDefault();
      $('.exercise')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // coding exercises
    const EX = window.CL_EXERCISES;
    $$('.exercise[data-ex]').forEach((host) => {
      const i = Number(host.dataset.ex);
      const ex = l.exercises[i];
      const key = `${l.id}#${i}`;
      if (!EX || !ex) return;
      EX.mount(host, ex, {
        id: `${l.id}-${i}`,
        n: i + 1,
        total: l.exercises.length,
        getState: () => (store.data.ex || {})[key],
        onSolved(kind) {
          const cur = store.data.ex[key];
          if (kind === 'solved' && cur !== 'solved') { store.data.ex[key] = 'solved'; toast(cur === 'assisted' ? 'Solved from memory: +10 XP' : 'Exercise solved: +15 XP'); }
          else if (kind === 'assisted' && !cur) { store.data.ex[key] = 'assisted'; toast('Typed it out: +5 XP'); }
          store.markActive();
          store.save();
        },
      });
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
        if (gained) toast(`Quiz passed: +${gained} XP${newlyDone ? '. Here is your mind refresh.' : ''}`);
        const btn = $('#toggleDone');
        if (btn) { btn.textContent = 'Mark as not done'; btn.classList.remove('btn-primary'); }
        if (newlyDone) showRecap(true);
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
      ${LEVELS.filter((lv) => D.projects.some((p) => p.level === lv.id)).map((lv) => `
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
              ${m.hackathon ? `<p class="small"><strong>Hackathon:</strong> <a href="#hackathons">${esc((D.hackathons.find((x) => x.id === m.hackathon) || {}).name || '')}</a></p>` : ''}
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
        <div class="stat"><b>${Object.keys(d.ctf || {}).length}/${(D.hackathons || []).filter((h) => h.type === 'ctf').reduce((n, h) => n + h.challenges.length, 0)}</b><span>CTF flags captured</span></div>
        <div class="stat"><b>${Object.values(d.ex || {}).filter((v) => v === 'solved').length}/${LESSONS.reduce((n, l) => n + l.exercises.length, 0)}</b><span>Exercises solved on your own</span></div>
        <div class="stat"><b>${Object.keys(d.crit || {}).length}/${(window.CL_SCENARIOS || []).length}</b><span>Critical Moment scenarios scored</span></div>
        <div class="stat"><b>${masteredCount()}/${LESSONS.reduce((n, l) => n + l.quiz.length, 0)}</b><span>Mind refresh cards mastered</span></div>
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
            return list.length ? `<td style="font-variant-numeric:tabular-nums">${list.filter((l) => isDone(l.id)).length} / ${list.length}</td>` : '<td class="muted">&ndash;</td>';
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

  // ---------------------------------------------------------------- hackathons & CTF
  let hackTimer = null;
  const hackState = (id) => {
    store.data.hack = store.data.hack || {};
    store.data.hack[id] = store.data.hack[id] || { start: null, done: {} };
    return store.data.hack[id];
  };
  function hackScore(h) {
    if (h.type === 'ctf') {
      const total = h.challenges.reduce((n, c) => n + c.points, 0);
      const got = h.challenges.filter((c) => (store.data.ctf || {})[c.id]).reduce((n, c) => n + c.points, 0);
      return { got, total };
    }
    const st = (store.data.hack || {})[h.id] || { done: {} };
    return { got: h.milestones.filter((m) => st.done[m.id]).reduce((n, m) => n + m.points, 0), total: h.milestones.reduce((n, m) => n + m.points, 0) };
  }
  function clockText(h) {
    const st = (store.data.hack || {})[h.id];
    if (!st || !st.start) return `Not started. You have ${h.hours} hours once you start the clock.`;
    const left = st.start + h.hours * 3600000 - Date.now();
    const fmtDur = (ms) => { const m = Math.floor(Math.abs(ms) / 60000); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };
    return left > 0 ? `${fmtDur(left)} left` : `Time is up (ended ${fmtDur(left)} ago). Finish your write-up and present.`;
  }
  function ctfCard(c) {
    const solved = Boolean((store.data.ctf || {})[c.id]);
    return `<article class="card ctf${solved ? ' solved' : ''}" data-ctf="${c.id}">
      <div class="ctf-head">
        <span class="lv lv-${c.level}">${c.level}</span>
        <span class="chip">${esc(c.cat)}</span>
        <span class="ctf-points">${c.points} pts</span>
      </div>
      <h4>${esc(c.title)}</h4>
      <p class="ctf-body">${fmt(c.body)}</p>
      ${c.html || ''}
      ${c.code ? codeBlock(c.code, c.lang || 'text') : ''}
      ${c.lab === 'sqli' ? `<div class="lab" aria-label="Login form lab">
        <div class="grid-2">
          <label class="field"><span class="field-label">Username</span><input type="text" id="sqliUser" autocomplete="off" spellcheck="false" placeholder="admin"></label>
          <label class="field"><span class="field-label">Password</span><input type="text" id="sqliPass" autocomplete="off" spellcheck="false" placeholder="you do not know it"></label>
        </div>
        <span class="field-label">The query the server builds from your input</span>
        <pre class="hash-out" id="sqliQuery"></pre>
        <div class="row"><button type="button" class="btn" id="sqliGo">Log in</button></div>
        <div id="sqliResult" role="status"></div>
      </div>` : ''}
      ${c.starter ? `<div class="row"><button type="button" class="btn btn-sm" data-starter="${c.id}">Open a starter in the Playground</button></div>` : ''}
      <details class="ctf-hint"><summary>Show a hint</summary><p>${fmt(c.hint)}</p></details>
      <form class="ctf-form" data-flag="${c.id}" novalidate>
        <label class="sr-only" for="flag-${c.id}">Flag for ${esc(c.title)}</label>
        <input type="text" id="flag-${c.id}" placeholder="${solved ? 'Captured' : 'flag{...}'}" autocomplete="off" spellcheck="false" ${solved ? 'disabled' : ''}>
        <button type="submit" class="btn ${solved ? '' : 'btn-primary'}" ${solved ? 'disabled' : ''}>${solved ? 'Captured' : 'Submit'}</button>
      </form>
      <p class="ctf-msg" role="status">${solved ? '<strong>Flag captured.</strong>' : ''}</p>
    </article>`;
  }
  function viewHackathons() {
    const hs = D.hackathons || [];
    return `
    <div class="page-wide">
      <header class="page-head">
        <p class="eyebrow">Practice</p>
        <h1>Hackathons &amp; CTF</h1>
        <p>Security is learned by attacking and defending for real. Start with the capture-the-flag in your browser, then run the two timed hackathons against practice targets and your own projects. When you are ready, the list at the bottom shows real competitions to enter.</p>
      </header>
      <div class="grid-3">
        ${hs.map((h) => { const s = hackScore(h); return `<button type="button" class="card tool-card hack-jump" data-jump="${h.id}"><span class="tip-cat">${esc(h.level)}</span><h3>${esc(h.name)}</h3><p>${esc(h.tagline)}</p><span class="small muted">${s.got} / ${s.total} points</span></button>`; }).join('')}
      </div>
      <aside class="callout callout-warn"><p class="callout-title">Stay legal</p><p>Only attack the challenges here, practice apps running on your own machine, and platforms or bug bounties that give you permission. Testing anything else without written permission can be a federal crime under the US Computer Fraud and Abuse Act, and break state computer crime laws (and similar laws in other countries).</p></aside>
      ${hs.map((h) => {
        const s = hackScore(h);
        const head = `<div class="hack-head">
            <div><p class="eyebrow">${h.type === 'ctf' ? 'Capture the flag' : 'Build hackathon'}</p><h2 class="section-title">${esc(h.name)}</h2><p class="muted">${esc(h.tagline)}</p></div>
            <div class="hack-score"><b>${s.got}</b><span>of ${s.total} points</span></div>
          </div>
          <div class="row">${[h.level, h.duration.split('.')[0], h.team].map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
          <p>${fmt(h.intro)}</p>`;
        if (h.type === 'ctf') {
          return `<section class="section hack" id="hack-${h.id}">${head}
            ${LEVELS.map((lv) => {
              const list = h.challenges.filter((c) => c.level === lv.id);
              return list.length ? `<div class="level-head"><h3 class="lv lv-${lv.id}">${lv.name}</h3></div><div class="ctf-grid">${list.map(ctfCard).join('')}</div>` : '';
            }).join('')}
          </section>`;
        }
        const st = (store.data.hack || {})[h.id] || { start: null, done: {} };
        const phases = [...new Set(h.milestones.map((m) => m.phase))];
        return `<section class="section hack" id="hack-${h.id}">${head}
          <div class="card hack-clock">
            <div><span class="field-label">Clock</span><p class="clock-text" data-clock="${h.id}">${esc(clockText(h))}</p></div>
            <div class="row">${st.start ? `<button type="button" class="btn btn-sm" data-restart="${h.id}">Restart the clock</button>` : `<button type="button" class="btn btn-primary" data-start="${h.id}">Start the ${h.hours}-hour clock</button>`}</div>
          </div>
          <div class="grid-2">
            <div class="card" style="display:grid;gap:8px;align-content:start"><h3 class="small-title">Rules</h3><ul class="plain-list">${h.rules.map((r) => `<li>${fmt(r)}</li>`).join('')}</ul></div>
            <div class="card" style="display:grid;gap:8px;align-content:start"><h3 class="small-title">How it is judged</h3>
              <div class="table-wrap"><table><thead><tr><th>Criterion</th><th>Weight</th></tr></thead><tbody>${h.rubric.map((r) => `<tr><td><strong>${esc(r.name)}</strong><br><span class="muted small">${esc(r.desc)}</span></td><td>${r.weight}%</td></tr>`).join('')}</tbody></table></div>
              <p class="muted small">Judge yourself honestly, or swap scores with a friend doing the same hackathon.</p>
            </div>
          </div>
          ${phases.map((ph) => `<div class="level-head"><h3 class="small-title">${esc(ph)}</h3></div>
            <div class="milestones">${h.milestones.filter((m) => m.phase === ph).map((m) => `<label class="quiz-opt milestone"><input type="checkbox" data-ms="${h.id}:${m.id}" id="ms-${h.id}-${m.id}" ${st.done[m.id] ? 'checked' : ''}><span>${fmt(m.text)}</span><span class="ctf-points">${m.points} pts</span></label>`).join('')}</div>`).join('')}
        </section>`;
      }).join('')}
      <section class="section">
        <h2 class="section-title">Real competitions to enter</h2>
        <p class="muted">All of these give you permission to hack within their rules. Start at the top and work down.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Event</th><th>Type</th><th>Level</th><th>What it is</th></tr></thead>
          <tbody>${(D.competitions || []).map((c) => `<tr><td><a href="${c.url}" target="_blank" rel="noopener">${esc(c.name)}</a></td><td>${esc(c.kind)}</td><td>${esc(c.level)}</td><td>${esc(c.note)}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="section card">
        <h2 class="section-title">How to do well at a hackathon</h2>
        <ol class="steps">${(D.hackTips || []).map((t) => `<li><div>${fmt(t)}</div></li>`).join('')}</ol>
      </section>
    </div>`;
  }

  // A deliberately vulnerable "server" for the SQL injection lab. It mimics how SQL
  // evaluates the WHERE clause: a -- comments out the rest, and AND binds before OR.
  function sqliLogin(user, pass) {
    const query = `SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'`;
    const cut = query.indexOf('--');
    const core = (cut >= 0 ? query.slice(0, cut) : query).trim();
    if (((core.match(/'/g) || []).length) % 2) return { query, ok: false, msg: 'SQL error: unbalanced quote. Your quote broke out of the string; now finish the job, or comment out the rest with --' };
    const always = /\bOR\s+(?:'([^']*)'\s*=\s*'\1|(\d+)\s*=\s*\2\b)/i;
    const andAt = core.search(/\bAND\s+password\s*=/i);
    let ok;
    if (andAt < 0) ok = /WHERE\s+username\s*=\s*'admin'\s*$/i.test(core) || always.test(core);
    else ok = always.test(core.slice(andAt));
    return { query, ok, msg: ok ? '' : 'Login failed: wrong username or password.' };
  }

  function mountHackathons() {
    const main = $('#main');
    const refreshScores = () => {
      $$('.hack-jump', main).forEach((b) => {
        const h = D.hackathons.find((x) => x.id === b.dataset.jump);
        const s = hackScore(h);
        b.querySelector('.small').textContent = `${s.got} / ${s.total} points`;
      });
      $$('.hack', main).forEach((sec) => {
        const h = D.hackathons.find((x) => `hack-${x.id}` === sec.id);
        if (h) sec.querySelector('.hack-score b').textContent = hackScore(h).got;
      });
    };
    $$('.hack-jump', main).forEach((b) => b.addEventListener('click', () => $(`#hack-${b.dataset.jump}`).scrollIntoView({ behavior: 'smooth', block: 'start' })));
    // CTF flags: compare the SHA-256 of the answer with the stored hash
    $$('form[data-flag]', main).forEach((form) => form.addEventListener('submit', (e) => {
      e.preventDefault();
      const c = D.hackathons.flatMap((h) => h.challenges || []).find((x) => x.id === form.dataset.flag);
      const input = form.querySelector('input');
      const msg = form.parentElement.querySelector('.ctf-msg');
      const v = input.value.trim();
      if (!v) { msg.textContent = 'Type the flag first.'; return; }
      const candidates = v.startsWith('flag{') ? [v] : [v, `flag{${v}}`];
      const hit = candidates.some((x) => TOOLS.sha256 && TOOLS.sha256(x) === c.hash);
      if (hit) {
        store.data.ctf = store.data.ctf || {};
        store.data.ctf[c.id] = Date.now();
        store.markActive();
        store.save();
        toast(`Flag captured: +${c.points} points`);
        form.parentElement.classList.add('solved');
        input.disabled = true;
        form.querySelector('button').disabled = true;
        form.querySelector('button').textContent = 'Captured';
        form.querySelector('button').classList.remove('btn-primary');
        msg.innerHTML = '<strong>Flag captured.</strong>';
        refreshScores();
      } else {
        msg.textContent = 'Not the flag. Check the format (flag{...}), spelling and case, or open the hint.';
      }
    }));
    $$('[data-starter]', main).forEach((b) => b.addEventListener('click', () => {
      const c = D.hackathons.flatMap((h) => h.challenges || []).find((x) => x.id === b.dataset.starter);
      if (TOOLS.loadIntoPlayground) TOOLS.loadIntoPlayground('js', c.starter);
      location.hash = 'playground';
    }));
    // SQL injection lab
    const u = $('#sqliUser', main), p = $('#sqliPass', main);
    if (u && p) {
      const show = () => { $('#sqliQuery', main).textContent = sqliLogin(u.value, p.value).query; };
      u.addEventListener('input', show);
      p.addEventListener('input', show);
      show();
      $('#sqliGo', main).addEventListener('click', () => {
        const r = sqliLogin(u.value, p.value);
        $('#sqliResult', main).innerHTML = r.ok
          ? '<div class="fb fb-good"><p><strong>Logged in as admin.</strong> Welcome back! Your flag: <code>flag{sql_injection_logs_you_in}</code></p><p>Why it worked: your input was pasted into the SQL text, so it changed the query\'s logic. The fix is a parameterised query (<code>WHERE username = $1 AND password = $2</code>), which always treats input as data, plus hashed passwords.</p></div>'
          : `<div class="fb fb-bad"><p>${esc(r.msg)}</p></div>`;
      });
    }
    // build hackathons: clocks and milestones
    $$('[data-start], [data-restart]', main).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.start || b.dataset.restart;
      hackState(id).start = Date.now();
      store.markActive();
      store.save();
      toast('Clock started. Good luck!');
      route(true);
    }));
    $$('[data-ms]', main).forEach((cb) => cb.addEventListener('change', () => {
      const [hid, mid] = cb.dataset.ms.split(':');
      const st = hackState(hid);
      if (cb.checked) { st.done[mid] = Date.now(); store.markActive(); } else delete st.done[mid];
      store.save();
      const m = D.hackathons.find((h) => h.id === hid).milestones.find((x) => x.id === mid);
      if (cb.checked) toast(`Milestone done: +${m.points} points`);
      refreshScores();
    }));
    const tick = () => $$('[data-clock]', main).forEach((el) => { el.textContent = clockText(D.hackathons.find((h) => h.id === el.dataset.clock)); });
    clearInterval(hackTimer);
    hackTimer = setInterval(tick, 30000);
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
    (window.CL_SCENARIOS || []).forEach((s) => index.push({ kind: 'Critical Moment', title: s.title, hay: (s.title + ' ' + s.tags.join(' ') + ' scenario attack simulator').toLowerCase(), body: s.brief.toLowerCase(), href: '#critical-moment' }));
    (D.hackathons || []).forEach((h) => {
      index.push({ kind: 'Hackathon', title: h.name, hay: (h.name + ' ' + h.tagline + ' hackathon ctf').toLowerCase(), body: h.intro.toLowerCase(), href: '#hackathons' });
      (h.challenges || []).forEach((c) => index.push({ kind: `CTF challenge · ${c.cat}`, title: c.title, hay: (c.title + ' ' + c.cat + ' ctf').toLowerCase(), body: c.body.toLowerCase(), href: '#hackathons' }));
    });
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
    hackathons: [viewHackathons, mountHackathons],
  };
  const TOOL_MOUNT = { playground: 'playground', 'hash-lab': 'hashLab', 'token-sim': 'tokenSim', 'amm-lab': 'amm', 'critical-moment': 'critical' };
  // Critical Moment keeps your best score per scenario
  function saveScore(id, score) {
    store.data.crit = store.data.crit || {};
    const before = store.data.crit[id] || 0;
    if (score > before) {
      store.data.crit[id] = score;
      store.markActive();
      store.save();
      toast(before ? `New best: ${score}/100 (+${Math.round(score / 2) - Math.round(before / 2)} XP)` : `Scored ${score}/100: +${Math.round(score / 2)} XP`);
    }
  }

  let lastHash = null;
  function route(keepScroll) {
    const h = (location.hash || '#home').slice(1) || 'home';
    const main = $('#main');
    const sameView = h === lastHash;
    lastHash = h;
    if (TOOLS.beforeLeave) TOOLS.beforeLeave();
    if (window.CL_EXERCISES) window.CL_EXERCISES.cleanup();
    if (window.CL_CRITICAL) window.CL_CRITICAL.cleanup();
    if (window.CL_AI) window.CL_AI.closeDrawer();
    clearInterval(hackTimer);
    if (h.startsWith('track-')) {
      main.innerHTML = viewTrack(h.slice(6));
    } else if (h.startsWith('recap-')) {
      main.innerHTML = viewLevelRecap(h.slice(6));
    } else if (h === 'refresh' || h.startsWith('refresh-')) {
      main.innerHTML = viewRefresh(h === 'refresh' ? '' : h.slice(8));
      mountRefresh();
    } else if (h.startsWith('lesson-')) {
      main.innerHTML = viewLesson(h.slice(7));
      mountLesson(h.slice(7));
    } else if (TOOL_MOUNT[h]) {
      main.innerHTML = viewTool(h);
      const fn = h === 'critical-moment' ? (window.CL_CRITICAL && window.CL_CRITICAL.mount) : TOOLS[TOOL_MOUNT[h]];
      if (fn) fn($('#toolBody'), { toast, copyText, enhanceCode, saveScore, getBest: () => ({ ...(store.data.crit || {}) }) });
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
