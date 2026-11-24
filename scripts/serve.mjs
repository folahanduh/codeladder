// A small web server so you can open Code Ladder at http://localhost:3000
// Run it with:  npm start   (or:  node scripts/serve.mjs)
//
// It does two jobs:
// 1. Serves the site's files (HTML, CSS, JavaScript) to your browser.
// 2. Runs the AI coach, without any API key. It uses whichever of these it finds on your computer:
//    - Claude Code, signed in with your Claude account (it runs `claude -p` behind the scenes, so the
//      coach uses your Claude plan), or
//    - Ollama, which runs a free open model entirely on your computer.
//
// Security notes worth reading (they are real techniques you will use in your own servers):
// - It listens on 127.0.0.1 only, so nobody else on your Wi-Fi can use your AI coach.
// - API calls must come from this page: the Host and Origin headers are checked (stops
//   "DNS rebinding" and other websites calling your local server), and POSTs must be JSON.
// - Request bodies are size-limited and there is a simple per-minute rate limit.
// - Claude Code runs with every tool switched off (no shell, no file access, no MCP servers), and
//   your text goes in through stdin, never on the command line, so a question cannot make it run anything.

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat, mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
// CODE_LADDER_AI picks the coach: "claude-code", "ollama" or "off". Unset = try Claude Code, then Ollama.
const CHOICE = (process.env.CODE_LADDER_AI || 'auto').toLowerCase();
const CLAUDE_BIN = process.env.CODE_LADDER_CLAUDE_BIN || 'claude';
const CLAUDE_MODEL = process.env.CODE_LADDER_MODEL || ''; // empty = Claude Code's own default model
const OLLAMA_URL = (process.env.OLLAMA_HOST ? (/^https?:\/\//.test(process.env.OLLAMA_HOST) ? process.env.OLLAMA_HOST : `http://${process.env.OLLAMA_HOST}`) : 'http://127.0.0.1:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.CODE_LADDER_OLLAMA_MODEL || '';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

// ------------------------------------------------------------------ prompts
// The prompts live in assets/ai-prompts.js so the browser and the server ask for exactly the same thing.
const promptSandbox = {};
vm.runInNewContext(String(await readFile(path.join(root, 'assets', 'ai-prompts.js'))), promptSandbox, { filename: 'ai-prompts.js' });
const prompts = promptSandbox.CL_AI_PROMPTS;

// ------------------------------------------------------------------ provider 1: Claude Code (your Claude login)
// The coach must never spend an API key, so the child process gets no Anthropic key variables:
// Claude Code then uses the account you signed in with (`claude`, then /login).
function claudeEnv() {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  return env;
}

// Runs `claude` with fixed arguments and the given text on stdin. On Windows an npm-installed
// `claude.cmd` can only start through a shell; the arguments are all fixed strings (no user text),
// so quoting them is safe.
function runClaude(args, input, { cwd, onLine, signal, timeoutMs = 180_000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = (useShell) => {
      let retried = false;
      const retry = () => { retried = true; start(true); };
      const finalArgs = useShell ? args.map((a) => `"${String(a).replace(/"/g, '\\"')}"`) : args;
      let child;
      try {
        child = spawn(CLAUDE_BIN, finalArgs, { cwd, env: claudeEnv(), shell: useShell, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (err) {
        if (!useShell && process.platform === 'win32') return retry();
        return reject(err);
      }
      let out = '';
      let err = '';
      let buf = '';
      const timer = setTimeout(() => child.kill(), timeoutMs);
      const onAbort = () => child.kill();
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
      child.on('error', (e) => {
        clearTimeout(timer);
        if (e.code === 'ENOENT' && !useShell && process.platform === 'win32') return retry();
        reject(e);
      });
      child.stdout.on('data', (d) => {
        const s = d.toString('utf8');
        out += s;
        if (onLine) {
          buf += s;
          let nl;
          while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (line) onLine(line);
          }
        }
      });
      child.stderr.on('data', (d) => { err += d.toString('utf8'); });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (retried) return;
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve({ code, out, err, aborted: Boolean(signal && signal.aborted) });
      });
      child.stdin.on('error', () => {});
      child.stdin.end(input || '');
    };
    start(false);
  });
}

// A throwaway folder per request: Claude Code runs there (so it never sees this project) and
// reads the system prompt from a file instead of the command line.
async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'code-ladder-'));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }).catch(() => {}); }
}

const CLAUDE_BASE_ARGS = [
  '-p',
  '--tools', '', // no tools at all: it can only write text
  '--strict-mcp-config', // and no MCP servers
  '--setting-sources', '', // ignore your Claude Code settings, hooks and plugins for these calls
  '--no-session-persistence', // keep coach chats out of your Claude Code history
];
const modelArgs = () => (CLAUDE_MODEL ? ['--model', CLAUDE_MODEL] : []);

function claudeProblem(res) {
  const text = `${res.err}\n${res.out}`;
  if (/log ?in|logged in|authenticat|invalid api key|oauth|credential/i.test(text)) {
    return ['auth', 'Claude Code is not signed in. Run "claude" in a terminal, type /login and sign in with your Claude account, then try again.'];
  }
  if (/rate.?limit|usage limit|limit reached|overloaded/i.test(text)) {
    return ['rate_limited', 'Your Claude plan\'s usage limit was reached, or Claude is busy. Try again later.'];
  }
  if (/unknown option|unrecognized|error: option/i.test(text)) {
    return ['server', 'Your Claude Code is too old for the coach. Run "claude update", then restart Code Ladder.'];
  }
  return ['server', 'Claude Code could not answer. Check the terminal running Code Ladder for details.'];
}

async function detectClaudeCode() {
  try {
    const res = await runClaude(['auth', 'status', '--json'], '', { cwd: os.tmpdir(), timeoutMs: 20_000 });
    if (res.code !== 0) return { ok: false, reason: 'Claude Code is installed but did not report its sign-in status. Run "claude update", then try again.' };
    const status = JSON.parse(res.out.slice(res.out.indexOf('{')));
    if (!status.loggedIn) return { ok: false, reason: 'Claude Code is installed but not signed in: run "claude", type /login, then restart Code Ladder.' };
    return { ok: true, label: 'Claude Code (your Claude account)', detail: `signed in via ${status.authMethod || 'your account'}` };
  } catch (err) {
    return { ok: false, reason: err.code === 'ENOENT' ? 'Claude Code is not installed.' : `Claude Code check failed (${err.message}).` };
  }
}

const claudeCode = {
  async chat({ system, messages, write, signal }) {
    return withTempDir(async (dir) => {
      await writeFile(path.join(dir, 'system.txt'), system);
      const args = [...CLAUDE_BASE_ARGS, ...modelArgs(), '--system-prompt-file', path.join(dir, 'system.txt'),
        '--output-format', 'stream-json', '--include-partial-messages', '--verbose'];
      let streamed = false;
      let final = null;
      const res = await runClaude(args, conversationText(messages), {
        cwd: dir,
        signal,
        onLine: (line) => {
          let ev;
          try { ev = JSON.parse(line); } catch { return; }
          if (ev.type === 'stream_event' && ev.event && ev.event.type === 'content_block_delta' && ev.event.delta && ev.event.delta.type === 'text_delta') {
            streamed = true;
            write({ type: 'text', text: ev.event.delta.text });
          } else if (ev.type === 'result') {
            final = ev;
          }
        },
      });
      if (res.aborted) return;
      if (final && !final.is_error) {
        if (!streamed && final.result) write({ type: 'text', text: final.result });
        if (final.stop_reason === 'refusal') write({ type: 'error', code: 'refused', message: 'Claude declined to answer that.' });
        return;
      }
      const [code, message] = claudeProblem({ ...res, out: res.out + (final ? JSON.stringify(final) : '') });
      console.error('  AI chat error (Claude Code):', (res.err || (final && final.result) || `exit ${res.code}`).slice(0, 300));
      write({ type: 'error', code, message });
    });
  },
  async scenario({ request, signal }) {
    return withTempDir(async (dir) => {
      await writeFile(path.join(dir, 'system.txt'), prompts.SCENARIO_RULES);
      const args = [...CLAUDE_BASE_ARGS, ...modelArgs(), '--system-prompt-file', path.join(dir, 'system.txt'),
        '--output-format', 'json', '--json-schema', JSON.stringify(prompts.SCENARIO_SCHEMA)];
      const res = await runClaude(args, request, { cwd: dir, signal, timeoutMs: 300_000 });
      if (res.aborted) return null;
      let result = null;
      try { result = JSON.parse(res.out.slice(res.out.indexOf('{'))); } catch { /* handled below */ }
      if (result && !result.is_error && result.structured_output) return result.structured_output;
      if (result && result.stop_reason === 'refusal') throw Object.assign(new Error('Claude declined to build that scenario. Try describing it as a defensive training exercise.'), { code: 'refused', status: 422 });
      const [code, message] = claudeProblem(res);
      console.error('  AI scenario error (Claude Code):', (res.err || (result && result.result) || `exit ${res.code}`).slice(0, 300));
      throw Object.assign(new Error(message), { code, status: 502 });
    });
  },
};

// Claude Code's print mode takes one prompt, so earlier turns are written out as a transcript.
function conversationText(messages) {
  if (messages.length === 1) return messages[0].content;
  const earlier = messages.slice(0, -1).map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`).join('\n\n');
  return `Our conversation so far:\n\n${earlier}\n\nThe learner now asks:\n${messages[messages.length - 1].content}`;
}

// ------------------------------------------------------------------ provider 2: Ollama (free, runs on your computer)
async function detectOllama() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return { ok: false, reason: 'Ollama did not respond properly.' };
    const names = ((await r.json()).models || []).map((m) => m.name);
    if (!names.length) return { ok: false, reason: 'Ollama is running but has no models: run "ollama pull llama3.1".' };
    const model = OLLAMA_MODEL
      ? (names.includes(OLLAMA_MODEL) || names.includes(`${OLLAMA_MODEL}:latest`) ? OLLAMA_MODEL : null)
      : (names.find((n) => /^(llama3|qwen|gemma|mistral|phi)/i.test(n)) || names[0]);
    if (!model) return { ok: false, reason: `Ollama does not have the model "${OLLAMA_MODEL}": run "ollama pull ${OLLAMA_MODEL}".` };
    return { ok: true, label: `Ollama (${model}, on your computer)`, model };
  } catch {
    return { ok: false, reason: 'Ollama is not running.' };
  }
}

const ollama = {
  model: null,
  async chat({ system, messages, write, signal }) {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, stream: true, messages: [{ role: 'system', content: system }, ...messages], options: { num_ctx: 16384 } }),
      signal,
    });
    if (!r.ok || !r.body) {
      write({ type: 'error', code: 'server', message: `Ollama returned an error (${r.status}). Check that the model is installed.` });
      return;
    }
    const decoder = new TextDecoder();
    let buf = '';
    for await (const chunk of r.body) {
      buf += decoder.decode(chunk, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const ev = JSON.parse(line);
        if (ev.error) { write({ type: 'error', code: 'server', message: `Ollama: ${ev.error}` }); return; }
        if (ev.message && ev.message.content) write({ type: 'text', text: ev.message.content });
      }
    }
  },
  async scenario({ request, signal }) {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        format: prompts.SCENARIO_SCHEMA, // Ollama constrains the output to this JSON Schema
        messages: [{ role: 'system', content: prompts.SCENARIO_RULES }, { role: 'user', content: request }],
        options: { num_ctx: 16384 },
      }),
      signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.message) throw Object.assign(new Error(`Ollama could not build the scenario${j.error ? `: ${j.error}` : '.'}`), { code: 'server', status: 502 });
    try { return JSON.parse(j.message.content); } catch {
      throw Object.assign(new Error('The local model returned a scenario in the wrong format. Try again, or use a larger model.'), { code: 'server', status: 502 });
    }
  },
};

// ------------------------------------------------------------------ choose a provider at start-up
const ai = { enabled: false, label: '', reason: '', provider: null };
const aiReady = (async () => {
  if (CHOICE === 'off') { ai.reason = 'The AI coach is switched off (CODE_LADDER_AI=off).'; return; }
  const reasons = [];
  if (CHOICE === 'auto' || CHOICE === 'claude-code') {
    const c = await detectClaudeCode();
    if (c.ok) { Object.assign(ai, { enabled: true, label: c.label, provider: claudeCode }); return; }
    reasons.push(c.reason);
  }
  if (CHOICE === 'auto' || CHOICE === 'ollama') {
    const o = await detectOllama();
    if (o.ok) { ollama.model = o.model; Object.assign(ai, { enabled: true, label: o.label, provider: ollama }); return; }
    reasons.push(o.reason);
  }
  ai.reason = reasons.join(' ');
})();

// ------------------------------------------------------------------ request guards
const allowedHosts = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`]);
const allowedOrigins = new Set([...allowedHosts].map((h) => `http://${h}`));

function sameSite(req) {
  if (!allowedHosts.has(String(req.headers.host || '').toLowerCase())) return false;
  const origin = req.headers.origin;
  return !origin || allowedOrigins.has(origin.toLowerCase());
}

const hits = new Map();
function rateLimited(bucket, limit, windowMs) {
  const now = Date.now();
  const list = (hits.get(bucket) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) { hits.set(bucket, list); return true; }
  list.push(now);
  hits.set(bucket, list);
  return false;
}

function readJson(req, maxBytes = 300_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) { reject(Object.assign(new Error('Request too large.'), { status: 413, code: 'prompt_too_large' })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(Object.assign(new Error('Body must be JSON.'), { status: 400, code: 'bad_request' })); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Checks the conversation the browser sent before any of it reaches the model.
function cleanMessages(messages) {
  if (!Array.isArray(messages) || !messages.length || messages.length > 20) return null;
  const out = [];
  for (const m of messages) {
    if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string') return null;
    const content = m.content.slice(0, 8000);
    if (!content.trim()) return null;
    out.push({ role: m.role, content });
  }
  if (out[0].role !== 'user' || out[out.length - 1].role !== 'user') return null;
  for (let i = 1; i < out.length; i++) if (out[i].role === out[i - 1].role) return null;
  return out;
}

// ------------------------------------------------------------------ AI endpoints
async function handleChat(req, res) {
  if (rateLimited('chat', 20, 60_000)) return sendJson(res, 429, { code: 'rate_limited', error: 'Too many questions in a minute.' });
  const body = await readJson(req);
  const messages = cleanMessages(body.messages);
  if (!messages) return sendJson(res, 400, { code: 'bad_request', error: 'The conversation was not in the expected shape.' });
  const system = typeof body.system === 'string' && body.system.trim() ? body.system.slice(0, 40_000) : prompts.COACH_RULES;

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  const write = (obj) => { if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n'); };
  const controller = new AbortController();
  res.on('close', () => { if (!res.writableFinished) controller.abort(); });
  try {
    await ai.provider.chat({ system, messages, write, signal: controller.signal });
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error('  AI chat error:', err && err.message);
      write({ type: 'error', code: 'server', message: 'The AI coach could not answer. Check the terminal running Code Ladder.' });
    }
  }
  res.end();
}

async function handleScenario(req, res) {
  if (rateLimited('scenario', 6, 10 * 60_000)) return sendJson(res, 429, { code: 'rate_limited', error: 'You can generate 6 scenarios every 10 minutes.' });
  const body = await readJson(req);
  const description = String(body.description || '').trim().slice(0, 1500);
  const level = ['beginner', 'intermediate', 'advanced', 'expert'].includes(body.level) ? body.level : 'intermediate';
  const lessons = (Array.isArray(body.lessons) ? body.lessons : [])
    .slice(0, 80)
    .map((l) => ({ id: String((l && l.id) || '').slice(0, 60), title: String((l && l.title) || '').slice(0, 120) }))
    .filter((l) => l.id);
  if (!description) return sendJson(res, 400, { code: 'bad_request', error: 'Describe a scenario first.' });

  const controller = new AbortController();
  res.on('close', () => { if (!res.writableFinished) controller.abort(); });
  try {
    const scenario = await ai.provider.scenario({ request: prompts.scenarioRequest(description, level, lessons), signal: controller.signal });
    if (controller.signal.aborted) return undefined;
    return sendJson(res, 200, { scenario });
  } catch (err) {
    if (controller.signal.aborted) return undefined;
    if (!err.code) console.error('  AI scenario error:', err && err.message);
    return sendJson(res, err.status || 502, { code: err.code || 'server', error: err.code ? err.message : 'The scenario could not be generated.' });
  }
}

async function handleApi(req, res, urlPath) {
  if (!sameSite(req)) return sendJson(res, 403, { code: 'forbidden', error: 'Requests must come from Code Ladder on this computer.' });
  await aiReady;
  if (urlPath === '/api/ai/status' && req.method === 'GET') {
    return sendJson(res, 200, { enabled: ai.enabled, label: ai.enabled ? ai.label : '', reason: ai.enabled ? '' : ai.reason });
  }
  if (req.method !== 'POST') return sendJson(res, 405, { code: 'bad_request', error: 'Method not allowed.' });
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return sendJson(res, 415, { code: 'bad_request', error: 'Send JSON.' });
  }
  if (!ai.enabled) return sendJson(res, 503, { code: 'off', error: ai.reason });
  if (urlPath === '/api/ai/chat') return handleChat(req, res);
  if (urlPath === '/api/ai/scenario') return handleScenario(req, res);
  return sendJson(res, 404, { code: 'not_found', error: 'Unknown endpoint.' });
}

// ------------------------------------------------------------------ static files
async function handleStatic(req, res, urlPath) {
  let filePath = path.join(root, urlPath);
  // Never serve files outside the project folder (stops "../../" tricks), or hidden files and dependencies.
  const rel = path.relative(root, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some((p) => p.startsWith('.') || p === 'node_modules')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
    return;
  }
  try {
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  try {
    if (urlPath.startsWith('/api/')) await handleApi(req, res, urlPath);
    else await handleStatic(req, res, urlPath);
  } catch (err) {
    if (!res.headersSent) sendJson(res, err.status || 500, { code: err.code || 'server', error: err.status ? err.message : 'Server error.' });
    else res.end();
  }
  // Log every request, like real servers do
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${urlPath}  ${res.statusCode}`);
});

server.listen(PORT, HOST, async () => {
  console.log(`\n  Code Ladder is running at  http://localhost:${PORT}`);
  await aiReady;
  console.log(ai.enabled
    ? `  AI coach: ON, using ${ai.label}. No API key needed.`
    : `  AI coach: off. ${ai.reason}\n  To turn it on, sign in to Claude Code ("claude", then /login) or install Ollama, then restart.`);
  console.log('  Press Ctrl+C to stop.\n');
});
