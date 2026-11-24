/* Code Ladder AI coach.
   No API key anywhere. Two ways in, tried in order:
   1. Inside claude.ai (the published artifact): the page's built-in `sample` capability,
      which runs on the viewer's own Claude account.
   2. On your computer: the local server's /api/ai endpoints (scripts/serve.mjs), which use
      Claude Code signed in with your Claude account, or a free local model through Ollama.
   On a static host such as GitHub Pages neither exists, so the coach explains how to turn it on. */
window.CL_AI = (function () {
  'use strict';

  const P = window.CL_AI_PROMPTS;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  let mode = 'checking';
  let offReason = '';
  let localLabel = '';
  let sample = null;

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
    try {
      const r = await fetch('api/ai/status', { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        if (j.enabled) { mode = 'local'; localLabel = j.label || ''; return mode; }
        offReason = j.reason || '';
      }
    } catch (e) { /* not running on the local server */ }
    mode = 'off';
    return mode;
  })();

  function statusText() {
    if (mode === 'artifact') return 'Connected through claude.ai';
    if (mode === 'local') return localLabel ? `Connected: ${localLabel}` : 'Connected through your local server';
    if (mode === 'checking') return 'Connecting...';
    return 'Not connected';
  }
  function offHelp() {
    return `<p><strong>The AI coach is not connected here.</strong> ${offReason ? esc(offReason) + ' ' : ''}It needs no API key. On your computer, either sign in to <strong>Claude Code</strong> with your Claude account (run <code>claude</code> in a terminal and type <code>/login</code>), or install <strong>Ollama</strong> for a free model that runs offline (<code>ollama pull llama3.1</code>). Then start Code Ladder with <code>npm start</code> and open <code>http://localhost:3000</code>. The coach also works in the claude.ai version of Code Ladder, using your Claude account.</p>`;
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
        res = await fetch('api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system, messages: turns }),
          signal,
        });
      } catch (e) {
        throw { code: signal && signal.aborted ? 'cancelled' : 'network', message: friendly(signal && signal.aborted ? 'cancelled' : 'network', 'Could not reach the local server.') };
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
      const res = await fetch('api/ai/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, level, lessons }),
      }).catch(() => null);
      if (!res) throw { code: 'network', message: 'Could not reach the local server.' };
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
    ready.then(() => {
      status.textContent = statusText();
      status.classList.toggle('chip-good', mode !== 'off');
      if (mode === 'off') { off.innerHTML = offHelp(); off.hidden = false; }
    });
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
        if (err.code === 'off') { bubble.innerHTML = offHelp(); }
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

  return { ready, ask, generateScenario, mountCoach, openDrawer, closeDrawer, get mode() { return mode; }, formatReply };
})();
