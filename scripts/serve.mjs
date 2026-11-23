// A small web server so you can open Code Ladder at http://localhost:3000
// Run it with:  npm start   (or:  node scripts/serve.mjs)
//
// It does two jobs:
// 1. Serves the site's files (HTML, CSS, JavaScript) to your browser.
// 2. Optionally runs the AI coach. If ANTHROPIC_API_KEY is set when you start it, the browser can
//    ask questions through /api/ai/... and THIS server calls Claude with your key. The key never
//    leaves your computer and is never sent to the browser.
//
// Security notes worth reading (they are real techniques you will use in your own servers):
// - It listens on 127.0.0.1 only, so nobody else on your Wi-Fi can use your API key.
// - API calls must come from this page: the Host and Origin headers are checked (stops
//   "DNS rebinding" and other websites calling your local server), and POSTs must be JSON.
// - Request bodies are size-limited and there is a simple per-minute rate limit.

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const MODEL = process.env.CODE_LADDER_MODEL || 'claude-opus-5-5';

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

// ------------------------------------------------------------------ AI setup
// The prompts live in assets/ai-prompts.js so the browser and the server ask for exactly the same thing.
const promptSandbox = {};
vm.runInNewContext(String(await readFile(path.join(root, 'assets', 'ai-prompts.js'))), promptSandbox, { filename: 'ai-prompts.js' });
const prompts = promptSandbox.CL_AI_PROMPTS;

const ai = { enabled: false, reason: '', client: null };
if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
  ai.reason = 'The server was started without an ANTHROPIC_API_KEY.';
} else {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    ai.client = new Anthropic({ maxRetries: 2 });
    ai.enabled = true;
  } catch {
    ai.reason = 'The Anthropic SDK is not installed yet: run "npm install" in the code-ladder folder, then start again.';
  }
}

// Every request opts into server-side fallback: if the main model declines a request for policy
// reasons (security topics occasionally trip this), the API retries on its default fallback model.
const BASE_REQUEST = {
  model: MODEL,
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
};

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

// Checks the conversation the browser sent before any of it reaches Claude.
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

function errorCode(err) {
  if (err && err.status === 429) return ['rate_limited', 'Claude is rate limiting this key. Wait a minute, then try again.'];
  if (err && (err.status === 401 || err.status === 403)) return ['auth', 'Your API key was rejected. Check ANTHROPIC_API_KEY and restart the server.'];
  if (err && err.status === 400) return ['bad_request', 'Claude could not accept that request.'];
  if (err && err.status >= 500) return ['server', 'Claude is having trouble right now. Try again shortly.'];
  return ['server', 'Something went wrong calling Claude.'];
}

// ------------------------------------------------------------------ AI endpoints
async function handleChat(req, res) {
  if (rateLimited('chat', 20, 60_000)) return sendJson(res, 429, { code: 'rate_limited', error: 'Too many questions in a minute.' });
  const body = await readJson(req);
  const messages = cleanMessages(body.messages);
  if (!messages) return sendJson(res, 400, { code: 'bad_request', error: 'The conversation was not in the expected shape.' });
  const system = typeof body.system === 'string' && body.system.trim()
    ? body.system.slice(0, 40_000)
    : prompts.COACH_RULES;

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  const write = (obj) => { if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n'); };
  const stream = ai.client.beta.messages.stream({
    ...BASE_REQUEST,
    max_tokens: 16000,
    output_config: { effort: 'low' },
    system,
    messages,
  });
  res.on('close', () => { if (!res.writableFinished) stream.abort(); });
  stream.on('text', (delta) => write({ type: 'text', text: delta }));
  try {
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') write({ type: 'error', code: 'refused', message: 'Claude declined to answer that.' });
    else if (final.stop_reason === 'max_tokens') write({ type: 'notice', message: 'The answer was cut short.' });
  } catch (err) {
    if (!res.writableEnded && !(err && err.name === 'APIUserAbortError')) {
      const [code, message] = errorCode(err);
      write({ type: 'error', code, message });
      console.error('  AI chat error:', err && err.message);
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
    .map((l) => ({ id: String(l && l.id || '').slice(0, 60), title: String(l && l.title || '').slice(0, 120) }))
    .filter((l) => l.id);
  if (!description) return sendJson(res, 400, { code: 'bad_request', error: 'Describe a scenario first.' });

  const controller = new AbortController();
  res.on('close', () => { if (!res.writableFinished) controller.abort(); });
  try {
    // Streaming keeps a long generation from hitting request timeouts; we only need the final message.
    const stream = ai.client.beta.messages.stream({
      ...BASE_REQUEST,
      max_tokens: 16000,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: prompts.SCENARIO_SCHEMA } },
      system: prompts.SCENARIO_RULES,
      messages: [{ role: 'user', content: prompts.scenarioRequest(description, level, lessons) }],
    }, { signal: controller.signal });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') return sendJson(res, 422, { code: 'refused', error: 'Claude declined to build that scenario. Try describing it as a defensive training exercise.' });
    if (final.stop_reason === 'max_tokens') return sendJson(res, 502, { code: 'server', error: 'The scenario came back incomplete. Try a shorter description.' });
    const text = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    let scenario;
    try { scenario = JSON.parse(text); } catch { return sendJson(res, 502, { code: 'server', error: 'The scenario came back in an unexpected format. Try again.' }); }
    return sendJson(res, 200, { scenario });
  } catch (err) {
    if (controller.signal.aborted) return undefined;
    const [code, message] = errorCode(err);
    console.error('  AI scenario error:', err && err.message);
    return sendJson(res, err && err.status === 429 ? 429 : 502, { code, error: message });
  }
}

async function handleApi(req, res, urlPath) {
  if (!sameSite(req)) return sendJson(res, 403, { code: 'forbidden', error: 'Requests must come from Code Ladder on this computer.' });
  if (urlPath === '/api/ai/status' && req.method === 'GET') {
    return sendJson(res, 200, { enabled: ai.enabled, reason: ai.enabled ? '' : ai.reason, model: ai.enabled ? MODEL : null });
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

server.listen(PORT, HOST, () => {
  console.log(`\n  Code Ladder is running at  http://localhost:${PORT}`);
  console.log(ai.enabled
    ? `  AI coach: ON (model ${MODEL}, with server-side fallback if it declines)`
    : `  AI coach: off. ${ai.reason}`);
  console.log('  Press Ctrl+C to stop.\n');
});
