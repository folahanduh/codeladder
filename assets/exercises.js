/* Code Ladder: the code editor (styled like a desktop code editor) and the coding-exercise engine.
   - CL_EDITOR.create(...) makes an editor: line numbers, syntax colours, Tab indents, Enter keeps indentation.
   - CL_EXERCISES.mount(...) turns a lesson's exercise into: task, editor, Check, hints, and after
     5 wrong tries in a row, the answer as faded "ghost text" that you type over. */

window.CL_EDITOR = (function () {
  'use strict';

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const LANG_NAMES = { js: 'JavaScript', ts: 'TypeScript', html: 'HTML', css: 'CSS', bash: 'Shell', python: 'Python', solidity: 'Solidity', sql: 'SQL', json: 'JSON', text: 'Plain Text' };
  const HL = { js: 'javascript', ts: 'typescript', html: 'xml', css: 'css', bash: 'bash', python: 'python', solidity: 'solidity', sql: 'sql', json: 'json' };
  const LINE_H = 22;   // must match the CSS line-height of .vsc-input and .vsc-mirror
  const PAD_Y = 12;    // must match the CSS vertical padding
  const EXTRA = 12;    // room for a horizontal scrollbar

  function highlight(code, lang) {
    const name = HL[lang];
    if (window.hljs && name && window.hljs.getLanguage(name)) {
      try { return window.hljs.highlight(code, { language: name, ignoreIllegals: true }).value; } catch (e) { /* fall through */ }
    }
    return esc(code);
  }

  // Typed text over a faded answer: correct characters normal, wrong ones red, the rest of the answer faded.
  function ghostHTML(typed, answer) {
    let out = '';
    let run = '';
    let cls = null;
    const flush = () => { if (run) out += `<span class="${cls}">${esc(run)}</span>`; run = ''; };
    for (let i = 0; i < typed.length; i++) {
      const c = typed[i];
      const ok = c === answer[i];
      if (c === '\n') {
        flush();
        cls = null;
        out += ok ? '\n' : '<span class="gh-badnl"></span>\n';
        continue;
      }
      const k = ok ? 'gh-ok' : 'gh-bad';
      if (k !== cls) { flush(); cls = k; }
      run += c;
    }
    flush();
    const rest = answer.slice(typed.length);
    if (rest) out += `<span class="gh-ghost">${esc(rest)}</span>`;
    return out;
  }

  function create(opts) {
    const lang = opts.lang || 'js';
    const file = opts.file || 'main.js';
    const unit = lang === 'python' ? 4 : 2;
    const minLines = opts.minLines || 3;
    const root = document.createElement('div');
    root.className = 'vsc' + (opts.bare ? ' vsc-bare' : '');
    root.innerHTML = `
      ${opts.bare ? '' : `<div class="vsc-tabs"><span class="vsc-tab"><span class="vsc-dot vsc-dot-${lang}" aria-hidden="true"></span>${esc(file)}</span></div>`}
      <div class="vsc-body">
        <div class="vsc-gutter" aria-hidden="true"></div>
        <div class="vsc-area">
          <pre class="vsc-mirror" aria-hidden="true"></pre>
          <textarea class="vsc-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${esc(opts.label || 'Code editor: ' + file)}"></textarea>
        </div>
      </div>
      <div class="vsc-status"><span class="vsc-mode" hidden>Ghost mode: type over the faded answer</span><span class="vsc-pos">Ln 1, Col 1</span><span>Spaces: ${unit}</span><span>UTF-8</span><span>${LANG_NAMES[lang] || lang}</span></div>`;
    const ta = root.querySelector('.vsc-input');
    const mirror = root.querySelector('.vsc-mirror');
    const gutter = root.querySelector('.vsc-gutter');
    const pos = root.querySelector('.vsc-pos');
    const mode = root.querySelector('.vsc-mode');
    if (opts.id) ta.id = opts.id;
    ta.value = opts.value || '';
    let ghost = null;
    let escaped = false;

    function render() {
      const v = ta.value;
      mirror.innerHTML = (ghost !== null ? ghostHTML(v, ghost) : highlight(v, lang)) + '\n';
      const lines = Math.max(v.split('\n').length, ghost !== null ? ghost.split('\n').length : 0, minLines);
      let nums = '';
      for (let i = 1; i <= lines; i++) nums += `<span>${i}</span>`;
      gutter.innerHTML = nums;
      ta.style.height = `${lines * LINE_H + PAD_Y * 2 + EXTRA}px`;
      mirror.scrollLeft = ta.scrollLeft;
    }
    function updatePos() {
      const before = ta.value.slice(0, ta.selectionStart).split('\n');
      pos.textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}`;
    }
    function insertText(text) {
      ta.focus();
      let ok = false;
      try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
      if (!ok) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    function lineBounds() {
      const v = ta.value;
      const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
      let end = v.indexOf('\n', ta.selectionEnd);
      if (end < 0) end = v.length;
      return { start, end };
    }
    function shiftLines(dir) {
      const { start, end } = lineBounds();
      const block = ta.value.slice(start, end);
      const changed = block.split('\n').map((l) => (dir > 0 ? ' '.repeat(unit) + l : l.replace(new RegExp(`^ {1,${unit}}`), ''))).join('\n');
      if (changed === block) return;
      ta.setSelectionRange(start, end);
      insertText(changed);
      ta.setSelectionRange(start, start + changed.length);
    }
    function newline() {
      const v = ta.value;
      const s = ta.selectionStart;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const current = v.slice(lineStart, s);
      let indent = current.match(/^[ \t]*/)[0];
      if (ghost !== null) {
        const nextLine = ghost.split('\n')[v.slice(0, s).split('\n').length];
        indent = nextLine !== undefined ? nextLine.match(/^[ \t]*/)[0] : '';
      } else if (/[{[(:]\s*$/.test(current) || /<(?!\/)(?!br|img|input|meta|link|hr)[a-z][^>]*>\s*$/i.test(current)) {
        indent += ' '.repeat(unit);
      } else if (lang === 'python' && /^\s*(return|pass|break|continue|raise)\b/.test(current)) {
        indent = indent.slice(0, Math.max(0, indent.length - unit)); // like VS Code: dedent after return
      }
      insertText('\n' + indent);
    }

    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { escaped = true; return; }
      if (e.key === 'Tab') {
        if (escaped) { escaped = false; return; } // let Tab move focus after Escape
        e.preventDefault();
        if (e.shiftKey) shiftLines(-1);
        else if (ta.selectionStart !== ta.selectionEnd && ta.value.slice(ta.selectionStart, ta.selectionEnd).includes('\n')) shiftLines(1);
        else insertText(' '.repeat(unit));
        return;
      }
      escaped = false;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (opts.onSubmit) opts.onSubmit(); return; }
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.isComposing) { e.preventDefault(); newline(); return; }
      if (ghost === null && ['}', ']', ')'].includes(e.key) && ta.selectionStart === ta.selectionEnd) {
        const v = ta.value;
        const lineStart = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
        const before = v.slice(lineStart, ta.selectionStart);
        if (before.length >= unit && /^ +$/.test(before)) {
          e.preventDefault();
          ta.setSelectionRange(ta.selectionStart - unit, ta.selectionStart);
          insertText(e.key);
        }
      }
    });
    ta.addEventListener('input', () => { render(); updatePos(); if (opts.onChange) opts.onChange(ta.value); });
    ta.addEventListener('scroll', () => { mirror.scrollLeft = ta.scrollLeft; mirror.scrollTop = ta.scrollTop; });
    ['keyup', 'click', 'select', 'focus'].forEach((ev) => ta.addEventListener(ev, updatePos));
    render();

    return {
      el: root,
      textarea: ta,
      getValue: () => ta.value,
      setValue(v) { ta.value = v; render(); updatePos(); },
      focus() { ta.focus(); },
      setGhost(answer) {
        ghost = answer;
        root.classList.toggle('vsc-ghost', answer !== null);
        mode.hidden = answer === null;
        render();
      },
      refresh: render,
    };
  }

  return { create, ghostHTML };
})();

window.CL_EXERCISES = (function () {
  'use strict';

  const MAX_TRIES = 5;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const COMMENT = {
    js: /^\s*\/\//, ts: /^\s*\/\//, solidity: /^\s*\/\//, css: /^\s*\/\*.*\*\/\s*$/,
    bash: /^\s*#/, python: /^\s*#/, sql: /^\s*--/, html: /^\s*<!--.*-->\s*$/,
  };

  // Turn code into a comparable form: ignore blank lines, comment-only lines, spacing, quote style,
  // and (for JavaScript, TypeScript and CSS) optional semicolons at line ends.
  function normalize(code, lang) {
    const out = [];
    code.replace(/\r/g, '').split('\n').forEach((raw, idx) => {
      if (!raw.trim() || (COMMENT[lang] && COMMENT[lang].test(raw))) return;
      let s = raw.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/'/g, '"');
      if (lang === 'js' || lang === 'ts' || lang === 'css') s = s.replace(/;+\s*$/, '');
      if (lang === 'css') s = s.replace(/;\s*}/g, '}');
      s = s.replace(/\s+/g, ' ').replace(/ ?([(){}[\];,.=+\-*/<>:!&|?%^~]) ?/g, '$1');
      if (lang === 'python') s = raw.match(/^\s*/)[0].replace(/\t/g, '    ').length + '|' + s;
      out.push({ s, line: idx + 1, raw });
    });
    return out;
  }
  const same = (a, b) => a.length === b.length && a.every((x, i) => x.s === b[i].s);

  // "console.log(stock)" -> "c______.l__(s____)": the shape of a line without giving it away
  const shape = (line) => line.trim().replace(/([A-Za-z0-9])([A-Za-z0-9]*)/g, (m, a, b) => a + '_'.repeat(b.length));

  // listen once for console output from every output frame
  let frames = [];
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__pg) return;
    const hit = frames.find((f) => f.frame.contentWindow === e.source);
    if (hit) hit.onLog(e.data.type, e.data.text);
  });
  function cleanup() { frames = []; }

  function mount(host, ex, ctx) {
    const solved = () => ctx.getState();
    host.innerHTML = `
      <div class="ex-head">
        <span class="ex-label">Your turn &middot; Exercise ${ctx.n} of ${ctx.total}</span>
        <span class="chip ex-state"></span>
      </div>
      <h3 class="ex-title">${ex.title}</h3>
      <div class="ex-prompt">${ex.prompt}</div>
      <div class="ex-editor"></div>
      <div class="ex-actions">
        <button type="button" class="btn btn-primary ex-check">Check my code</button>
        ${ex.run ? '<button type="button" class="btn ex-run">Run it</button>' : ''}
        <button type="button" class="btn ex-reset">Start over</button>
        <span class="ex-tries"><span class="ex-tries-label">Tries</span><span class="pips" aria-hidden="true">${'<i></i>'.repeat(MAX_TRIES)}</span><span class="sr-only ex-tries-sr"></span></span>
      </div>
      <p class="ex-keys">Shortcut: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (or <kbd>Cmd</kbd>+<kbd>Enter</kbd>) checks your code. <kbd>Esc</kbd> then <kbd>Tab</kbd> leaves the editor.</p>
      <div class="ex-feedback" role="status" aria-live="polite"></div>
      <div class="ex-output" hidden>
        <div class="ex-output-head"><span>Output</span><button type="button" class="btn btn-sm ex-close">Hide</button></div>
        <iframe class="ex-frame" title="Output of your code" sandbox="allow-scripts allow-modals allow-forms" hidden></iframe>
        <div class="pg-console ex-console"></div>
      </div>
      <div class="ex-explain" hidden>${ex.explain ? `<p class="ex-explain-title">How it works</p>${ex.explain}` : ''}</div>`;

    const $ = (sel) => host.querySelector(sel);
    let attempts = 0;
    let ghostOn = false;
    const editor = window.CL_EDITOR.create({
      value: ex.starter,
      lang: ex.lang,
      file: ex.file,
      id: `ex-${ctx.id}`,
      label: `Code editor for exercise ${ctx.n}: ${ex.title.replace(/<[^>]+>/g, '')}`,
      minLines: Math.max(ex.solution.split('\n').length + 1, (ex.starter || '').split('\n').length + 1, 3),
      onSubmit: () => check(),
      onChange: () => { if (ghostOn) ghostProgress(); },
    });
    $('.ex-editor').append(editor.el);

    const drawState = () => {
      const st = solved();
      const chip = $('.ex-state');
      chip.textContent = st === 'solved' ? 'Solved' : st === 'assisted' ? 'Solved with help' : 'To do';
      chip.className = 'chip ex-state' + (st === 'solved' ? ' chip-good' : st === 'assisted' ? ' chip-warn' : '');
      host.classList.toggle('is-solved', st === 'solved');
    };
    const drawPips = () => {
      host.querySelectorAll('.pips i').forEach((p, i) => p.classList.toggle('used', i < attempts));
      $('.ex-tries-sr').textContent = `${attempts} of ${MAX_TRIES} tries used`;
    };
    const feedback = (kind, html) => {
      $('.ex-feedback').innerHTML = html ? `<div class="fb fb-${kind}">${html}</div>` : '';
    };

    function tip(code) {
      const user = normalize(code, ex.lang);
      const answers = [ex.solution, ...ex.also].map((a) => ({ raw: a, n: normalize(a, ex.lang) }));
      // compare against the accepted answer the learner is closest to
      let best = answers[0];
      let bestIdx = -1;
      for (const a of answers) {
        let i = 0;
        while (i < user.length && i < a.n.length && user[i].s === a.n[i].s) i++;
        if (i > bestIdx) { bestIdx = i; best = a; }
      }
      const hint = ex.hints.find((h) => !new RegExp(h.re, 'm').test(code));
      const parts = [`<p><strong>Not quite.</strong> Try ${attempts} of ${MAX_TRIES}.</p>`];
      if (hint) parts.push(`<p><strong>Tip:</strong> ${hint.text}</p>`);
      const expected = best.n[bestIdx];
      let where = '';
      if (bestIdx < user.length) {
        where = `Line ${user[bestIdx].line} is where your code first differs: <code>${esc(user[bestIdx].raw.trim())}</code>`;
      } else if (expected) {
        where = `Everything you wrote matches so far, but something is missing after line ${user.length ? user[user.length - 1].line : 1}.`;
      }
      if (!hint || attempts >= 2) {
        if (!hint && !where) where = 'Check spelling, brackets and quotes carefully.';
        if (where) parts.push(`<p>${where}</p>`);
      }
      if (attempts >= 3 && expected) parts.push(`<p>That line should look like this (first letters only): <code class="ex-shape">${esc(shape(expected.raw))}</code></p>`);
      if (attempts === MAX_TRIES - 1) parts.push('<p>One more wrong try and the answer appears as ghost text for you to type over.</p>');
      return parts.join('');
    }

    function enterGhost() {
      ghostOn = true;
      editor.setValue('');
      editor.setGhost(ex.solution);
      feedback('ghost', `<p><strong>${MAX_TRIES} tries used, so here is the answer as faded ghost text.</strong> Type over it exactly, character by character, like a machine. Wrong characters turn red. Press Enter at the end of a line and the next line's spacing is added for you.</p><p class="ex-progress"></p>`);
      ghostProgress();
      editor.focus();
    }
    function ghostProgress() {
      const typed = editor.getValue();
      const tidy = (s) => s.replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
      if (tidy(typed) === tidy(ex.solution)) { success('assisted'); return; }
      let ok = 0;
      while (ok < typed.length && typed[ok] === ex.solution[ok]) ok++;
      const wrong = ok < typed.length;
      const p = $('.ex-progress');
      if (p) p.textContent = wrong ? `${ok} of ${ex.solution.length} characters correct. Fix the red character${typed.length - ok > 1 ? 's' : ''} (Backspace), then carry on.` : `${ok} of ${ex.solution.length} characters typed correctly.`;
    }

    function success(kind) {
      const before = solved();
      ghostOn = false;
      editor.setGhost(null);
      if (kind === 'solved') {
        feedback('good', `<p><strong>Correct!</strong> ${before === 'solved' ? 'Solved again.' : before === 'assisted' ? 'From memory this time. Full marks: +10 more XP.' : 'Well done: +15 XP.'}</p>`);
      } else {
        feedback('good', `<p><strong>You typed it perfectly.</strong> ${before ? '' : '+5 XP. '}Now close your eyes for a second, then <button type="button" class="linkish ex-memory">try it again from memory</button> to earn the full 15 XP.</p>`);
        const m = $('.ex-memory');
        if (m) m.addEventListener('click', reset);
      }
      ctx.onSolved(kind);
      drawState();
      if (ex.explain) $('.ex-explain').hidden = false;
      if (ex.run) run();
    }

    function check() {
      if (ghostOn) { ghostProgress(); return; }
      const code = editor.getValue();
      const user = normalize(code, ex.lang);
      if (!user.length || code.trim() === (ex.starter || '').trim()) {
        feedback('info', '<p>Type your code in the editor first, then press <strong>Check my code</strong>.</p>');
        return;
      }
      const ok = [ex.solution, ...ex.also].some((a) => same(user, normalize(a, ex.lang)));
      if (ok) { attempts = 0; drawPips(); success('solved'); return; }
      attempts++;
      drawPips();
      if (attempts >= MAX_TRIES) enterGhost();
      else feedback('bad', tip(code));
    }

    function run() {
      const out = $('.ex-output');
      const frame = $('.ex-frame');
      const con = $('.ex-console');
      const code = editor.getValue();
      out.hidden = false;
      con.innerHTML = '';
      const files = ex.lang === 'html' ? { html: code } : ex.lang === 'css' ? { html: ex.html || '<p>Preview</p>', css: code } : { html: ex.html || '', js: code };
      frame.hidden = ex.lang === 'js' && !ex.html;
      let printed = 0;
      frames = frames.filter((f) => f.frame !== frame);
      frames.push({
        frame,
        onLog(type, text) {
          printed++;
          const line = document.createElement('div');
          line.className = type;
          line.textContent = (type === 'error' ? 'Error: ' : type === 'warn' ? 'Warning: ' : '') + text;
          con.append(line);
        },
      });
      frame.srcdoc = window.CL_TOOLS.buildDoc(files);
      setTimeout(() => {
        if (!printed && frame.hidden) {
          con.innerHTML = '<div class="empty">Nothing was printed. Use console.log(...) to see values. (If your code fetches from the internet, the request may still be loading, or blocked in this preview; it works on localhost.)</div>';
        }
      }, 2500);
    }

    function reset() {
      attempts = 0;
      ghostOn = false;
      editor.setGhost(null);
      editor.setValue(ex.starter || '');
      drawPips();
      feedback('', '');
      $('.ex-output').hidden = true;
      editor.focus();
    }

    $('.ex-check').addEventListener('click', check);
    $('.ex-reset').addEventListener('click', reset);
    $('.ex-close').addEventListener('click', () => { $('.ex-output').hidden = true; });
    if (ex.run) $('.ex-run').addEventListener('click', run);
    if (solved() && ex.explain) $('.ex-explain').hidden = false;
    drawState();
    drawPips();
  }

  return { mount, normalize, cleanup, MAX_TRIES };
})();
