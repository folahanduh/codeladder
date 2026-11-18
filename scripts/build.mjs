// Builds every lesson in /content into assets/content.js.
// Run it with:  npm run build
//
// Lessons are plain Markdown files with a small header ("front matter") and an
// optional "## Quiz" section at the bottom. See CONTRIBUTING notes in README.md.
// No packages needed: this script only uses Node's built-in modules.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(root, 'content');
const OUT_FILE = path.join(root, 'assets', 'content.js');
const TRACKS = ['setup', 'web', 'crypto', 'tokenomics'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- inline formatting: `code`, **bold**, *italic*, [link](url), [[Ctrl+C]] ----------
function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s);
  s = s.replace(/\[\[([^\]]+)\]\]/g, (_, keys) =>
    keys.split('+').map((k) => `<kbd>${k.trim()}</kbd>`).join('+')
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:/.test(href);
    return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return s;
}

// ---------- lists (one level of nesting) ----------
function parseList(lines, start, ordered) {
  const itemRe = ordered ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
  const base = lines[start].match(/^(\s*)/)[1].length;
  const items = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(itemRe);
    if (m && m[1].length === base) {
      items.push({ text: m[2], sub: [] });
      i++;
      continue;
    }
    if (!line.trim()) break;
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent > base && items.length) {
      const sub = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
      if (sub) items[items.length - 1].sub.push(sub[1]);
      else items[items.length - 1].text += ' ' + line.trim();
      i++;
      continue;
    }
    break;
  }
  const tag = ordered ? 'ol' : 'ul';
  const html = `<${tag}>${items
    .map(
      (it) =>
        `<li>${inline(it.text)}${
          it.sub.length ? `<ul>${it.sub.map((s) => `<li>${inline(s)}</li>`).join('')}</ul>` : ''
        }</li>`
    )
    .join('')}</${tag}>`;
  return { html, next: i };
}

// ---------- block-level Markdown ----------
const BLOCK_START = /^(```|:::|#{2,4}\s|>|\s*[-*]\s|\s*\d+\.\s|\||---+\s*$)/;

function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // fenced code:  ```lang   or   ```html try   (try = adds a "Run in Playground" button)
    let m = line.match(/^```(\w*)\s*(.*)$/);
    if (m) {
      const lang = m[1] || 'text';
      const flags = m[2].trim().split(/\s+/);
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(
        `<div class="code" data-lang="${lang}"${flags.includes('try') ? ' data-try="1"' : ''}>` +
          `<pre><code class="language-${lang}">${esc(buf.join('\n'))}</code></pre></div>`
      );
      continue;
    }

    // callouts:  :::tip Optional title  ...  :::
    m = line.match(/^:::(\w+)\s*(.*)$/);
    if (m) {
      const buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') buf.push(lines[i++]);
      i++;
      out.push(
        `<aside class="callout callout-${m[1]}">` +
          (m[2] ? `<p class="callout-title">${inline(m[2])}</p>` : '') +
          markdown(buf.join('\n')) +
          `</aside>`
      );
      continue;
    }

    m = line.match(/^(#{2,4})\s+(.*)$/);
    if (m) {
      const n = m[1].length;
      out.push(`<h${n} id="${slug(m[2])}">${inline(m[2])}</h${n}>`);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` +
          `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      );
      continue;
    }

    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(buf.join('\n'))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) { const r = parseList(lines, i, false); out.push(r.html); i = r.next; continue; }
    if (/^\s*\d+\.\s+/.test(line)) { const r = parseList(lines, i, true); out.push(r.html); i = r.next; continue; }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !(buf.length && BLOCK_START.test(lines[i]))) {
      buf.push(lines[i++].trim());
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

// ---------- quiz ----------
//  ? Question
//  - [ ] wrong answer
//  - [x] right answer
//  > Why the right answer is right
function parseQuiz(src, file) {
  const quiz = [];
  let q = null;
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('? ')) {
      q = { q: inline(line.slice(2)), options: [], answer: -1, explain: '' };
      quiz.push(q);
    } else if (/^- \[( |x)\] /.test(line) && q) {
      if (line[3] === 'x') q.answer = q.options.length;
      q.options.push(inline(line.slice(6)));
    } else if (line.startsWith('>') && q) {
      q.explain += (q.explain ? ' ' : '') + inline(line.replace(/^>\s?/, ''));
    }
  }
  for (const item of quiz) {
    if (item.answer < 0) throw new Error(`${file}: quiz question has no [x] answer: ${item.q}`);
  }
  return quiz;
}

function parseLesson(text, file) {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  for (const key of ['id', 'title', 'level', 'summary']) {
    if (!meta[key]) throw new Error(`${file}: front matter needs "${key}"`);
  }
  if (!LEVELS.includes(meta.level)) throw new Error(`${file}: level must be one of ${LEVELS.join(', ')}`);
  let body = text.slice(fm[0].length);
  let quiz = [];
  const qi = body.search(/^## Quiz\s*$/m);
  if (qi >= 0) {
    quiz = parseQuiz(body.slice(qi).replace(/^## Quiz\s*$/m, ''), file);
    body = body.slice(0, qi);
  }
  const html = markdown(body);
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    id: meta.id,
    title: meta.title,
    level: meta.level,
    minutes: Number(meta.minutes || 10),
    summary: meta.summary,
    html,
    quiz,
    text: plain.slice(0, 4000),
  };
}

async function build() {
  const lessons = [];
  const seen = new Set();
  for (const track of TRACKS) {
    const dir = path.join(CONTENT_DIR, track);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
    for (const f of files) {
      const lesson = parseLesson(await readFile(path.join(dir, f), 'utf8'), `${track}/${f}`);
      if (seen.has(lesson.id)) throw new Error(`Duplicate lesson id: ${lesson.id}`);
      seen.add(lesson.id);
      lesson.track = track;
      lessons.push(lesson);
    }
  }
  // order: track, then level, then filename
  lessons.sort(
    (a, b) =>
      TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track) || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
  );
  const banner = '// AUTO-GENERATED by scripts/build.mjs from /content. Edit the Markdown, then run: npm run build\n';
  await writeFile(OUT_FILE, `${banner}window.CL_LESSONS = ${JSON.stringify(lessons)};\n`);
  const quizCount = lessons.reduce((n, l) => n + l.quiz.length, 0);
  console.log(`Built ${lessons.length} lessons and ${quizCount} quiz questions -> assets/content.js`);
}

build().catch((err) => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
