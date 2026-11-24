/* Code Ladder AI coach.
   No API key anywhere. Three ways in, tried in order:
   1. Inside claude.ai (the published artifact): the page's built-in `sample` capability,
      which runs on the viewer's own Claude account.
   2. Served by the local server (http://localhost:3000): its /api/ai endpoints (scripts/serve.mjs),
      which use Claude Code signed in with your Claude account, or a free local model through Ollama.
   3. On GitHub Pages (or any website): the same local server, reached at http://127.0.0.1:3000 after you
      press "Connect to my computer". The server only accepts the site's own address (CORS), and the
      browser may ask you to allow the site to reach apps on your device. */
window.CL_AI = (function () {
  'use strict';

  const P = window.CL_AI_PROMPTS;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  let mode = 'checking';
  let offReason = '';
  let localLabel = '';
  let sample = null;
  let apiBase = ''; // '' = this page's own server; otherwise e.g. 'http://127.0.0.1:3000/'
  const LOCAL_URL = 'http://127.0.0.1:3000/';
  const LOCAL_KEY = 'code-ladder-coach-local';
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => { try { fn(mode); } catch (e) { /* ignore */ } });
  const remembered = () => { try { return localStorage.getItem(LOCAL_KEY); } catch (e) { return null; } };
  const remember = (v) => { try { if (v) localStorage.setItem(LOCAL_KEY, v); else localStorage.removeItem(LOCAL_KEY); } catch (e) { /* ignore */ } };
  // Is this page somewhere other than the local server (GitHub Pages, say), so it can connect to one?
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const canConnect = /^https?:$/.test(location.protocol) && !isLocalHost && window.top === window; // not inside claude.ai's frame

  // Asks a coach server whether it is ready. Returns { ok, label, reason }.
  async function probe(base, timeoutMs) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(`${base}api/ai/status`, { headers: { Accept: 'application/json' }, signal: ctl.signal });
      if (!r.ok) return { ok: false, reason: r.status === 403 ? 'Your Code Ladder server does not accept this website yet. Update it (git pull) and restart npm start.' : '' };
      const j = await r.json();
      return j.enabled ? { ok: true, label: j.label || '' } : { ok: false, reason: j.reason || '' };
    } catch (e) {
      return { ok: false, unreachable: true, reason: '' };
    } finally {
      clearTimeout(timer);
    }
  }

  // Inside claude.ai the page runs in a frame and the host adds window.claude, sometimes a moment
  // after our scripts start, so wait briefly for it. A page opened directly never gets one.
  async function claudeHost() {
    for (let i = 0; i < 20; i++) {
      if (window.claude && typeof window.claude.use === 'function') return window.claude;
      if (window.top === window) return null;
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  const ready = (async () => {
    const host = await claudeHost();
    if (host) {
      try {
        sample = await host.use('sample');
        if (sample) { mode = 'artifact'; return mode; }
      } catch (e) { /* fall through */ }
    }
    if (/^https?:$/.test(location.protocol) && isLocalHost) {
      const own = await probe('', 8000);
      if (own.ok) { mode = 'local'; localLabel = own.label; return mode; }
      if (own.reason) offReason = own.reason;
    }
    // Connected from this website before? Reconnect quietly (the browser already allowed it).
    const saved = canConnect && remembered();
    if (saved) {
      const r = await probe(saved, 8000);
      if (r.ok) { mode = 'local'; apiBase = saved; localLabel = r.label; return mode; }
    }
    mode = 'off';
    return mode;
  })();
  ready.then(notify);

  // "Connect to my computer": reach the Code Ladder server running on this computer from a website
  // such as GitHub Pages. The first time, Chrome and Edge ask permission to reach apps on this device.
  async function connectLocal(base = LOCAL_URL) {
    await ready;
    const r = await probe(base, 60000);
    if (r.ok) {
      mode = 'local';
      apiBase = base;
      localLabel = r.label;
      remember(base);
      notify();
      return { ok: true };
    }
    if (r.unreachable) {
      return { ok: false, message: 'Could not reach Code Ladder on this computer. Check that npm start is running in the code-ladder folder (and says your website can use the coach), then press Connect again. If your browser asked for permission to reach apps on this device, choose Allow; if you chose Block, click the icon to the left of the address bar and allow it. Safari may block this: use Chrome, Edge or Firefox.' };
    }
    return { ok: false, message: r.reason || 'Your Code Ladder server is running but the AI coach is off. Sign in to Claude Code (claude, then /login) or start Ollama, then restart npm start.' };
  }
  function disconnectLocal() {
    remember(null);
    if (apiBase) { apiBase = ''; mode = 'off'; localLabel = ''; notify(); }
  }
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function statusText() {
    if (mode === 'artifact') return 'Connected through claude.ai';
    if (mode === 'local') return `${apiBase ? 'Connected to your computer' : 'Connected'}${localLabel ? `: ${localLabel}` : ''}`;
    if (mode === 'checking') return 'Connecting...';
    return 'Not connected';
  }
  // Where to download Code Ladder from, worked out from a GitHub Pages address (owner.github.io/repo).
  function repoUrl() {
    const m = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    const repo = location.pathname.split('/').filter(Boolean)[0];
    return m && repo ? `https://github.com/${m[1]}/${repo}` : '';
  }
  function offHelp() {
    const reason = offReason ? `<p>${esc(offReason)}</p>` : '';
    if (canConnect) {
      const url = repoUrl();
      return `<p><strong>Use the AI coach here with your own Claude account, no API key.</strong> It runs through Code Ladder on your computer:</p>
        <ol class="coach-steps">
          <li>Once: download Code Ladder${url ? `: <code>git clone ${esc(url)}</code>` : ''} and sign in to Claude Code (run <code>claude</code>, then type <code>/login</code>). Or install Ollama for a free offline model.</li>
          <li>In the code-ladder folder, run <code>npm start</code> and leave it running.</li>
          <li>Press <strong>Connect</strong>. If your browser asks to let this site reach apps on your device, choose <strong>Allow</strong>.</li>
        </ol>${reason}
        <div class="row"><button type="button" class="btn btn-primary btn-sm coach-connect">Connect to my computer</button><span class="small coach-connect-msg" role="status"></span></div>
        <p class="small muted">Or use the claude.ai version of Code Ladder, which has the coach built in.</p>`;
    }
    return `<p><strong>The AI coach is not connected here.</strong></p>${reason}<p>It needs no API key. On your computer, either sign in to <strong>Claude Code</strong> with your Claude account (run <code>claude</code> in a terminal and type <code>/login</code>), or install <strong>Ollama</strong> for a free model that runs offline (<code>ollama pull llama3.1</code>). Then start Code Ladder with <code>npm start</code> and open <code>http://localhost:3000</code>. The coach also works in the claude.ai version of Code Ladder, using your Claude account.</p>`;
  }
  // Wires up the Connect button inside an offHelp() block.
  function wireConnect(el) {
    const btn = el.querySelector('.coach-connect');
    if (!btn) return;
    const msg = el.querySelector('.coach-connect-msg');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      msg.textContent = 'Connecting... (allow access if your browser asks)';
      const r = await connectLocal();
      btn.disabled = false;
      msg.textContent = r.ok ? 'Connected.' : r.message;
    });
  }
  const friendly = (code, message) => ({
    not_granted: 'You chose not to let this page use Claude. Reload the page to be asked again.',
    rate_limited: 'Too many questions in a short time. Wait a minute, then try again.',
    refused: 'Claude declined to answer that. Try rephrasing it as a defensive or learning question.',
    session_expired: 'Your claude.ai session expired. Sign in again.',
    prompt_too_large: 'That was too long. Ask something shorter.',
    cancelled: 'Stopped.',
    off: 'The AI coach is not connected.',
  }[code] || message || 'Something went wrong. Try again in a moment.');

  // Ask Claude. turns: [{role:'user'|'assistant', content}], ending on a user turn.
  async function ask(turns, { system, onText, signal } = {}) {
    await ready;
    if (mode === 'artifact') {
      try {
        // sample() has no separate system prompt, so the instructions lead the first user turn
        const merged = turns.map((t, i) => (i === 0 ? { role: 'user', content: `${system || ''}\n\n---\n\nLearner: ${t.content}` } : t));
        const { text } = await sample(merged, {
          cache: false,
          signal,
          onText: ({ text }) => onText && onText(text),
        });
        return text;
      } catch (e) {
        throw { code: e.code, message: friendly(e.code, e.message), text: e.text };
      }
    }
    if (mode === 'local') {
      let res;
      try {
        res = await fetch(`${apiBase}api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system, messages: turns }),
          signal,
        });
      } catch (e) {
        throw { code: signal && signal.aborted ? 'cancelled' : 'network', message: friendly(signal && signal.aborted ? 'cancelled' : 'network', apiBase ? 'Could not reach Code Ladder on your computer. Is npm start still running?' : 'Could not reach the local server.') };
      }
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw { code: j.code || 'server', message: friendly(j.code, j.error) };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let text = '';
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const msg = JSON.parse(line);
            if (msg.type === 'text') { text += msg.text; if (onText) onText(text); }
            else if (msg.type === 'error') throw { code: msg.code, message: friendly(msg.code, msg.message), text };
          }
        }
      } catch (e) {
        if (signal && signal.aborted) throw { code: 'cancelled', message: friendly('cancelled'), text };
        throw e.code ? e : { code: 'network', message: friendly('network', 'The connection dropped.'), text };
      }
      if (!text.trim()) throw { code: 'empty', message: 'No answer came back. Try asking again.' };
      return text;
    }
    throw { code: 'off', message: friendly('off') };
  }

  // Ask Claude to design a Critical Moment scenario; returns the raw object (validate before use).
  async function generateScenario(description, level, lessons) {
    await ready;
    if (mode === 'artifact') {
      const template = JSON.stringify(P.SCENARIO_SCHEMA);
      const prompt = `${P.SCENARIO_RULES}\n\n${P.scenarioRequest(description, level, lessons)}\n\nReply with only one JSON object that matches this JSON Schema exactly (every listed field present, no extra fields):\n${template}`;
      try {
        return await sample.json(prompt, { cache: false });
      } catch (e) {
        throw { code: e.code, message: friendly(e.code, e.message) };
      }
    }
    if (mode === 'local') {
      const res = await fetch(`${apiBase}api/ai/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, level, lessons }),
      }).catch(() => null);
      if (!res) throw { code: 'network', message: apiBase ? 'Could not reach Code Ladder on your computer. Is npm start still running?' : 'Could not reach the local server.' };
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw { code: j.code || 'server', message: friendly(j.code, j.error) };
      return j.scenario;
    }
    throw { code: 'off', message: friendly('off') };
  }

  // Minimal safe formatting for Claude's replies: escape everything, then add code, bold and line breaks.
  function formatReply(text) {
    const parts = String(text).split(/```(?:\w+)?\n?/);
    return parts.map((part, i) => {
      if (i % 2 === 1) return `<pre class="coach-code"><code>${esc(part.replace(/\n$/, ''))}</code></pre>`;
      return esc(part)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }).join('');
  }

  // A chat panel. opts: { title, intro, suggestions: [..], getContext: () => string }
  function mountCoach(host, opts) {
    const turns = [];
    let ctl = null;
    host.innerHTML = `
      <div class="coach">
        <div class="coach-head"><span class="coach-title">${esc(opts.title || 'AI coach')}</span><span class="chip coach-status">${esc(statusText())}</span></div>
        <div class="coach-log" role="log" aria-live="polite"><div class="coach-msg coach-ai">${formatReply(opts.intro || 'Ask me anything about what you are learning.')}</div></div>
        <div class="coach-off" hidden></div>
        <div class="coach-suggest"></div>
        <form class="coach-form">
          <label class="sr-only" for="${host.id || 'coach'}-input">Ask the AI coach</label>
          <textarea id="${host.id || 'coach'}-input" rows="2" placeholder="Ask a question, e.g. how do I spot this attack?"></textarea>
          <div class="row"><button type="submit" class="btn btn-primary btn-sm">Ask</button><button type="button" class="btn btn-sm coach-stop" hidden>Stop</button></div>
        </form>
      </div>`;
    const log = host.querySelector('.coach-log');
    const form = host.querySelector('.coach-form');
    const input = host.querySelector('textarea');
    const stop = host.querySelector('.coach-stop');
    const off = host.querySelector('.coach-off');
    const status = host.querySelector('.coach-status');
    const suggest = host.querySelector('.coach-suggest');
    (opts.suggestions || []).forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill-btn';
      b.textContent = s;
      b.addEventListener('click', () => { input.value = s; form.requestSubmit(); });
      suggest.append(b);
    });
    const refresh = () => {
      status.textContent = statusText();
      status.classList.toggle('chip-good', mode !== 'off' && mode !== 'checking');
      if (mode === 'off') {
        if (off.hidden) { off.innerHTML = offHelp(); wireConnect(off); off.hidden = false; }
      } else {
        off.hidden = true;
        off.innerHTML = '';
      }
    };
    ready.then(refresh);
    // A question handed over from elsewhere (for example "explain this word" in explored code)
    if (opts.autoAsk) {
      input.value = opts.autoAsk;
      ready.then(() => { if (mode !== 'off' && input.value === opts.autoAsk) form.requestSubmit(); });
    }
    const stopListening = onChange(() => { if (!host.isConnected) { stopListening(); return; } refresh(); });
    const add = (cls, html) => {
      const d = document.createElement('div');
      d.className = `coach-msg ${cls}`;
      d.innerHTML = html;
      log.append(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });
    stop.addEventListener('click', () => ctl && ctl.abort());
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q || ctl) return;
      input.value = '';
      add('coach-me', esc(q));
      turns.push({ role: 'user', content: q });
      const bubble = add('coach-ai', '<span class="coach-thinking">Thinking...</span>');
      ctl = new AbortController();
      stop.hidden = false;
      const context = (opts.getContext && opts.getContext()) || '';
      const system = `${P.COACH_RULES}\n\nWhat the learner is looking at right now:\n<context>\n${context.slice(0, 24000)}\n</context>`;
      try {
        const text = await ask(turns.slice(-16), {
          system,
          signal: ctl.signal,
          onText: (t) => { bubble.innerHTML = formatReply(t); log.scrollTop = log.scrollHeight; },
        });
        bubble.innerHTML = formatReply(text);
        turns.push({ role: 'assistant', content: text });
      } catch (err) {
        if (err.code === 'off') { bubble.innerHTML = offHelp(); wireConnect(bubble); }
        else {
          bubble.innerHTML = (err.text ? formatReply(err.text) + '<br>' : '') + `<em>${esc(err.message || 'Something went wrong.')}</em>`;
        }
        turns.pop(); // let the learner ask again without a dangling question
      } finally {
        ctl = null;
        stop.hidden = true;
      }
    });
    return { reset() { turns.length = 0; } };
  }

  // A slide-in drawer used on lesson pages.
  let drawer = null;
  function openDrawer(opts) {
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'coach-drawer';
      drawer.setAttribute('aria-label', 'AI coach');
      drawer.innerHTML = '<button type="button" class="icon-btn coach-close" aria-label="Close the AI coach">&times;</button><div id="coachDrawerBody"></div>';
      document.body.append(drawer);
      drawer.querySelector('.coach-close').addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer(); });
    }
    drawer.hidden = false;
    mountCoach(drawer.querySelector('#coachDrawerBody'), opts);
    drawer.querySelector('textarea').focus();
  }
  function closeDrawer() { if (drawer) drawer.hidden = true; }

  return {
    ready, ask, generateScenario, mountCoach, openDrawer, closeDrawer, formatReply,
    connectLocal, disconnectLocal, onChange, offHelp, wireConnect,
    get mode() { return mode; },
    get canConnect() { return canConnect; },
    get connectedToComputer() { return Boolean(apiBase); },
  };
})();
