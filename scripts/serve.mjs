// A tiny static file server so you can open Code Ladder at http://localhost:3000
// Run it with:  npm start   (or:  node scripts/serve.mjs)
// Only uses Node's built-in modules. Read it: it's a good first look at how web servers work.

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;

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

const server = http.createServer(async (req, res) => {
  // 1. Work out which file the browser asked for
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(root, urlPath);

  // 2. Security: never serve files outside the project folder (stops "../../" tricks)
  if (!filePath.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
  // 3. Log every request, like real servers do
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${urlPath}  ${res.statusCode}`);
});

server.listen(PORT, () => {
  console.log(`\n  Code Ladder is running at  http://localhost:${PORT}\n  Press Ctrl+C to stop.\n`);
});
