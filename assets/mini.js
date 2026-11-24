/* Code Ladder: the mini project workspace and examiner.
   - Edit the project's files (autosaved in this browser), with a live preview for web projects.
   - "Examine my project" runs every requirement's check: file checks here, page checks inside a
     hidden, sandboxed copy of your page (your code cannot touch Code Ladder itself).
   - "Ask the AI examiner" sends the brief, the results and your files to the AI coach for feedback. */
window.CL_MINI_APP = (function () {
  'use strict';

  const LIST = window.CL_MINI || [];
  const FILES_KEY = 'code-ladder-mini-files';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const LEVEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' };
  const byId = (id) => LIST.find((p) => p.id === id);
  const forTrack = (track) => LIST.filter((p) => p.track === track);

  // ------------------------------------------------------------ saved work
  const loadAll = () => { try { return JSON.parse(localStorage.getItem(FILES_KEY) || '{}'); } catch (e) { return {}; } };
  const saved = (id) => loadAll()[id] || null;
  function save(id, files) {
    try { const all = loadAll(); all[id] = files; localStorage.setItem(FILES_KEY, JSON.stringify(all)); } catch (e) { /* storage full or blocked: work lasts this visit */ }
  }
  function forget(id) {
    try { const all = loadAll(); delete all[id]; localStorage.setItem(FILES_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
  }

  // ------------------------------------------------------------ helpers for file (static) checks
  const H = {
    // The text under "## Title" in Markdown, up to the next heading of the same or higher level.
    section(md, title) {
      const lines = String(md || '').split('\n');
      const i = lines.findIndex((l) => new RegExp(`^#{1,3}\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i').test(l.trim()));
      if (i < 0) return '';
      const out = [];
      for (let k = i + 1; k < lines.length; k++) { if (/^#{1,3}\s/.test(lines[k])) break; out.push(lines[k]); }
      return out.join('\n').trim();
    },
    bullets(text) { return String(text || '').split('\n').filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l)).length; },
    tableRows(text) {
      const rows = String(text || '').split('\n').filter((l) => /^\s*\|/.test(l));
      return rows.slice(1).filter((r) => !/^\s*\|?\s*:?-{3,}/.test(r) && r.replace(/[|\s-]/g, '').length > 0);
    },
  };

  // ------------------------------------------------------------ the examiner
  function fileMap(project, editors) {
    const files = {};
    project.files.forEach((f) => { files[f.name] = editors[f.name] ? editors[f.name].getValue() : f.starter; });
    return files;
  }
  function pageDoc(files) {
    return window.CL_TOOLS.buildDoc({ html: files['index.html'] || '', css: files['style.css'] || '', js: files['script.js'] || '' });
  }
  // Code that runs inside the page, after the learner's code, and reports back to Code Ladder.
  function harness(project, token) {
    const items = project.checks.map((c, i) => (c.page ? `{ i: ${i}, fn: ${c.page.toString()} }` : '')).filter(Boolean).join(',\n');
    return `
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const text = (el) => (el ? el.textContent.replace(/\\s+/g, ' ').trim() : '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = (el, p) => getComputedStyle(el)[p];
const need = (el, what) => { if (!el) throw new Error((what || 'An element') + ' the check needs is missing'); return el; };
const setInput = (el, v) => { need(el, 'An input'); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
const click = (el) => need(el, 'A button').click();
const submit = (form) => { need(form, 'The form'); if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); };
const until = async (fn, ms = 2000) => { const end = Date.now() + ms; for (;;) { let v = false; try { v = await fn(); } catch (e) { v = false; } if (v) return v; if (Date.now() > end) return false; await wait(40); } };
const results = [];
let finished = false;
const send = (extra) => parent.postMessage(Object.assign({ __exam: ${JSON.stringify(token)}, results }, extra), '*');
window.addEventListener('pagehide', () => { if (!finished) send({ reloaded: true }); });
const CHECKS = [${items}];
if (document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r, { once: true }));
await wait(80);
for (const c of CHECKS) {
  let r;
  try { r = await Promise.race([c.fn(), wait(12000).then(() => 'This check took too long: is something stuck in a loop?')]); }
  catch (e) { r = 'Error: ' + ((e && e.message) || e); }
  results.push({ i: c.i, ok: r === true, msg: r === true ? '' : (typeof r === 'string' ? r : '') });
  send({ progress: true });
}
finished = true;
send({ done: true });
`.replace(/<\/script/gi, '<\\/script');
  }

  let examFrame = null;
  let examListener = null;
  function runPageChecks(project, files) {
    return new Promise((resolve) => {
      const token = `exam-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let latest = [];
      const finish = (extra) => {
        window.removeEventListener('message', onMsg);
        clearTimeout(timer);
        if (examFrame) { examFrame.remove(); examFrame = null; }
        resolve({ results: latest, ...extra });
      };
      const onMsg = (e) => {
        if (!e.data || e.data.__exam !== token) return;
        latest = e.data.results || latest;
        if (e.data.reloaded) finish({ reloaded: true });
        else if (e.data.done) finish({});
      };
      examListener = onMsg;
      window.addEventListener('message', onMsg);
      const timer = setTimeout(() => finish({ timedOut: true }), 45000);
      if (examFrame) examFrame.remove();
      examFrame = document.createElement('iframe');
      examFrame.className = 'mini-exam-frame';
      examFrame.title = 'Examiner (hidden)';
      examFrame.setAttribute('aria-hidden', 'true');
      examFrame.setAttribute('tabindex', '-1');
      examFrame.setAttribute('sandbox', 'allow-scripts allow-forms');
      const doc = pageDoc(files);
      const script = `<script type="module">${harness(project, token)}<\/script>`;
      // a replacer function, because "$$" and "$&" in a replacement string are special patterns
      examFrame.srcdoc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, () => `${script}</body>`) : doc + script;
      document.body.append(examFrame);
    });
  }

  async function examine(project, files) {
    const out = project.checks.map((c) => ({ ok: false, msg: '' }));
    project.checks.forEach((c, i) => {
      if (!c.static) return;
      try {
        const r = c.static(files, H);
        out[i] = { ok: r === true, msg: r === true ? '' : (typeof r === 'string' ? r : '') };
      } catch (e) { out[i] = { ok: false, msg: `Error: ${e.message}` }; }
    });
    if (project.checks.some((c) => c.page)) {
      const r = await runPageChecks(project, files);
      const got = new Set();
      (r.results || []).forEach((x) => { out[x.i] = { ok: x.ok, msg: x.msg }; got.add(x.i); });
      project.checks.forEach((c, i) => {
        if (!c.page || got.has(i)) return;
        out[i] = {
          ok: false,
          msg: r.reloaded ? 'Your page reloaded during this check. If it submits a form, call event.preventDefault() in your submit handler.'
            : r.timedOut ? 'Your page did not finish running. Check the Console for errors, and look for a loop that never ends.'
              : 'This check did not run. Check the Console for an error in your code.',
        };
      });
    }
    return out;
  }

  // ------------------------------------------------------------ list of projects for a track (used on track pages)
  function cardsHTML(track, statusOf) {
    return forTrack(track).map((p, i) => {
      const st = statusOf(p.id);
      return `<a class="card mini-card${st === 'passed' ? ' is-passed' : ''}" href="#build-${p.id}">
        <span class="mini-card-top"><span class="mini-opt">Option ${i + 1}</span><span class="lv lv-${p.level}">${LEVEL[p.level]}</span>${st === 'passed' ? '<span class="chip chip-good">Passed</span>' : st === 'started' ? '<span class="chip chip-warn">In progress</span>' : ''}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.pitch)}</p>
        <span class="small muted">About ${p.minutes} minutes &middot; ${p.checks.length} requirements</span>
      </a>`;
    }).join('');
  }

  // ------------------------------------------------------------ the workspace
  let cleanupFns = [];
  function cleanup() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns = [];
    if (examListener) window.removeEventListener('message', examListener);
    if (examFrame) { examFrame.remove(); examFrame = null; }
  }

  function mount(root, id, api) {
    cleanup();
    const p = byId(id);
    if (!p) { root.innerHTML = '<div class="page"><h1>Project not found</h1><p><a href="#mini">All mini projects</a></p></div>'; return; }
    const web = (p.preview || 'web') === 'web';
    const track = api.trackName(p.track);
    const others = forTrack(p.track).filter((x) => x.id !== p.id);
    const savedFiles = saved(p.id) || {};
    const status = api.status(p.id);
    root.innerHTML = `
    <div class="page-wide mini">
      <header class="page-head">
        <p class="eyebrow">Mini project &middot; <a href="#track-${p.track}">${esc(track)}</a></p>
        <h1>${esc(p.title)}</h1>
        <p>${esc(p.brief)}</p>
        <div class="row mini-meta"><span class="lv lv-${p.level}">${LEVEL[p.level]}</span><span class="chip">About ${p.minutes} minutes</span>${p.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}${status === 'passed' ? '<span class="chip chip-good">Passed</span>' : ''}</div>
      </header>
      <div class="mini-grid${web ? '' : ' mini-grid-text'}">
        <section class="mini-code" aria-label="Your files">
          <div class="mini-tabs" role="tablist">${p.files.map((f, i) => `<button type="button" role="tab" class="mini-tab" data-file="${esc(f.name)}" aria-selected="${i === 0}">${esc(f.name)}</button>`).join('')}</div>
          <div class="mini-editors"></div>
          <div class="row mini-tools">
            ${web ? '<button type="button" class="btn btn-sm" id="miniRun">Run preview</button>' : ''}
            <button type="button" class="btn btn-sm" id="miniReset">Reset this file</button>
            <span class="small muted" id="miniSaved" role="status">${Object.keys(savedFiles).length ? 'Your saved work was loaded.' : 'Your work saves automatically in this browser.'}</span>
          </div>
        </section>
        ${web ? `<section class="mini-preview" aria-label="Preview">
          <div class="mini-preview-bar"><span>Preview</span><span class="small">updates as you type</span></div>
          <iframe class="mini-frame" title="Preview of your project" sandbox="allow-scripts allow-modals allow-forms"></iframe>
          <div class="pg-console mini-console" aria-label="Console"></div>
        </section>` : `<section class="card mini-textnote"><h2 class="small-title">How this one is examined</h2><p class="muted">There is no preview for this project: the examiner reads your file and checks each requirement. Use <strong>Ask the AI examiner</strong> for detailed feedback on the quality of your work.</p></section>`}
      </div>
      <section class="card mini-req" aria-labelledby="miniReqTitle">
        <div class="mini-req-head"><h2 class="section-title" id="miniReqTitle">Requirements</h2><span class="mini-score" id="miniScore"></span></div>
        <ol class="mini-checks">${p.checks.map((c, i) => `<li data-i="${i}"><span class="mini-mark" aria-hidden="true"></span><div><span class="mini-check-text">${esc(c.text)}</span><p class="mini-check-msg" hidden></p></div></li>`).join('')}</ol>
        <div class="row">
          <button type="button" class="btn btn-primary" id="miniExamine">Examine my project</button>
          <button type="button" class="btn" id="miniAI">Ask the AI examiner</button>
        </div>
        <div id="miniResult" role="status"></div>
      </section>
      <section class="grid-2">
        <div class="card"><h2 class="small-title">Stretch goals (optional)</h2><ul class="plain-list">${p.stretch.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
        <div class="card"><h2 class="small-title">Or choose another ${esc(track)} project</h2><ul class="plain-list">${others.map((o) => `<li><a href="#build-${o.id}">${esc(o.title)}</a> <span class="muted small">(${LEVEL[o.level]})</span></li>`).join('')}</ul><p class="small"><a href="#mini">All mini projects</a></p></div>
      </section>
    </div>`;

    // editors, one per file, with tabs
    const editors = {};
    const box = $('.mini-editors', root);
    p.files.forEach((f, i) => {
      const ed = window.CL_EDITOR.create({
        value: savedFiles[f.name] != null ? savedFiles[f.name] : f.starter,
        lang: f.lang,
        file: f.name,
        bare: true,
        minLines: 14,
        label: `${f.name} for ${p.title}`,
        onSubmit: () => runExam(),
        onChange: () => changed(),
      });
      ed.el.dataset.file = f.name;
      ed.el.hidden = i !== 0;
      box.append(ed.el);
      editors[f.name] = ed;
    });
    let current = p.files[0].name;
    $$('.mini-tab', root).forEach((t) => t.addEventListener('click', () => {
      current = t.dataset.file;
      $$('.mini-tab', root).forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      Object.values(editors).forEach((ed) => { ed.el.hidden = ed.el.dataset.file !== current; });
      editors[current].refresh();
      editors[current].focus();
    }));

    // autosave and live preview
    let saveTimer = 0;
    let runTimer = 0;
    function changed() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        save(p.id, fileMap(p, editors));
        $('#miniSaved', root).textContent = 'Saved in this browser.';
        api.started(p.id);
      }, 500);
      if (web) { clearTimeout(runTimer); runTimer = setTimeout(run, 700); }
    }
    const frame = $('.mini-frame', root);
    const con = $('.mini-console', root);
    function run() {
      if (!frame) return;
      con.innerHTML = '';
      frame.srcdoc = pageDoc(fileMap(p, editors));
    }
    const onConsole = (e) => {
      if (!frame || !e.data || !e.data.__pg || e.source !== frame.contentWindow) return;
      const line = document.createElement('div');
      line.className = e.data.type;
      line.textContent = (e.data.type === 'error' ? 'Error: ' : e.data.type === 'warn' ? 'Warning: ' : '') + e.data.text;
      con.append(line);
    };
    window.addEventListener('message', onConsole);
    cleanupFns.push(() => { window.removeEventListener('message', onConsole); clearTimeout(saveTimer); clearTimeout(runTimer); });
    if (web) { $('#miniRun', root).addEventListener('click', run); run(); }

    // reset the current file (two clicks, so nothing is lost by accident)
    const resetBtn = $('#miniReset', root);
    let armed = false;
    resetBtn.addEventListener('click', () => {
      if (!armed) { armed = true; resetBtn.textContent = `Really reset ${current}?`; setTimeout(() => { armed = false; resetBtn.textContent = 'Reset this file'; }, 4000); return; }
      armed = false;
      resetBtn.textContent = 'Reset this file';
      editors[current].setValue(p.files.find((f) => f.name === current).starter);
      changed();
    });

    // examine
    let lastResults = null;
    async function runExam() {
      const btn = $('#miniExamine', root);
      btn.disabled = true;
      btn.textContent = 'Examining...';
      $$('.mini-checks li', root).forEach((li) => { li.className = 'is-running'; });
      const files = fileMap(p, editors);
      save(p.id, files);
      const results = await examine(p, files);
      if (!root.isConnected) return;
      lastResults = results;
      let passed = 0;
      results.forEach((r, i) => {
        const li = $(`.mini-checks li[data-i="${i}"]`, root);
        li.className = r.ok ? 'is-ok' : 'is-bad';
        const msg = $('.mini-check-msg', li);
        if (r.ok) { passed++; msg.hidden = true; msg.textContent = ''; } else {
          msg.hidden = false;
          msg.innerHTML = `${r.msg ? `<span class="mini-found">${esc(r.msg)}</span> ` : ''}<span class="mini-hint">${esc(p.checks[i].hint)}</span>`;
        }
      });
      const all = passed === results.length;
      $('#miniScore', root).textContent = `${passed} of ${results.length} met`;
      $('#miniResult', root).innerHTML = all
        ? `<div class="fb fb-good"><p><strong>Passed!</strong> Every requirement is met.${api.status(p.id) === 'passed' ? '' : ' +100 XP.'} Try a stretch goal, or ask the AI examiner how a professional would improve it.</p></div>`
        : `<div class="fb fb-bad"><p><strong>${passed} of ${results.length} requirements met.</strong> Fix the ones marked with a cross (each has a hint), then examine it again.</p></div>`;
      if (all) api.passed(p.id);
      btn.disabled = false;
      btn.textContent = 'Examine again';
      $('#miniResult', root).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    $('#miniExamine', root).addEventListener('click', runExam);

    // the AI examiner
    $('#miniAI', root).addEventListener('click', () => {
      if (!window.CL_AI) return;
      const files = fileMap(p, editors);
      window.CL_AI.openDrawer({
        title: 'AI examiner',
        intro: `I will examine **${p.title}** against its brief and requirements, then tell you what works, what to fix first and how a professional would improve it.`,
        suggestions: ['What should I fix first?', 'How would a professional improve this?', 'Explain my mistakes simply'],
        autoAsk: 'Please examine my project. Give a mark out of 10, what works well, the most important things to fix (with the line or element), and one suggestion a professional would make.',
        getContext: () => [
          `Mini project: ${p.title} (${track}, ${LEVEL[p.level]}).`,
          `Brief: ${p.brief}`,
          'Requirements and the automatic examiner\'s latest results:',
          ...p.checks.map((c, i) => `- ${c.text}: ${lastResults ? (lastResults[i].ok ? 'met' : `NOT met${lastResults[i].msg ? ` (${lastResults[i].msg})` : ''}`) : 'not examined yet'}`),
          '',
          'The learner\'s files:',
          ...Object.entries(files).map(([name, code]) => `--- ${name} ---\n${code.slice(0, 9000)}`),
        ].join('\n'),
      });
    });
  }

  // ------------------------------------------------------------ all projects page
  function renderAll(root, api) {
    const tracks = [...new Set(LIST.map((p) => p.track))];
    const passed = LIST.filter((p) => api.status(p.id) === 'passed').length;
    root.innerHTML = `
    <div class="page-wide">
      <header class="page-head">
        <p class="eyebrow">Practice</p>
        <h1>Mini projects</h1>
        <p>Every track ends with a mini project. Choose one of three, build it here in the browser, then press <strong>Examine my project</strong>: an examiner checks every requirement and tells you what to fix. Passing earns 100 XP. You have passed ${passed} of ${LIST.length}.</p>
      </header>
      ${tracks.map((t) => `<section class="section"><div class="mini-track-head"><h2 class="section-title">${esc(api.trackName(t))}</h2><a class="small" href="#track-${t}">Track lessons</a></div><div class="grid-3">${cardsHTML(t, api.status)}</div></section>`).join('')}
    </div>`;
  }

  return { list: LIST, byId, forTrack, cardsHTML, mount, renderAll, cleanup, examine, H };
})();
