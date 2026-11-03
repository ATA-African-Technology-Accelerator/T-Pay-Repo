#!/usr/bin/env node
/**
 * Builds docs/T-Pay-PRD.pdf from docs/T-Pay-PRD.md.
 *
 * Markdown -> self-contained print HTML -> PDF, rendered by the Chrome that is
 * already installed. Chrome is driven over the DevTools protocol (instead of the
 * --print-to-pdf flag) so the footer can carry real running page numbers.
 *
 * Usage: npm run docs:pdf
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'docs/T-Pay-PRD.md');
const BUILD_DIR = path.join(ROOT, 'docs/.build');
const HTML_PATH = path.join(BUILD_DIR, 'T-Pay-PRD.html');
const PDF_PATH = path.join(ROOT, 'docs/T-Pay-PRD.pdf');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

function findChrome() {
  const found = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate));
  if (!found) fail('No Chrome or Chromium binary found. Set CHROME_PATH to one.');
  return found;
}

/** Minimal front-matter parser: `key: value` pairs between leading --- markers. */
function splitFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { meta: {}, body: markdown };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { meta, body: markdown.slice(match[0].length) };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STYLES = `
  :root {
    --ink: #14181f;
    --muted: #5b636e;
    --rule: #d9dee5;
    --accent: #0b5d4b;
    --accent-soft: #eef5f2;
    --warn: #8a4b00;
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    color: var(--ink);
    font: 10.5pt/1.55 "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    /* Ligatures turn "office" into glyphs that copy-paste as "o\uFB03ce". A document
       people will search and quote is worth more than the ligature. */
    font-variant-ligatures: none;
    hyphens: none;
  }
  h1, h2, h3, h4, .cover-title, .toc-title, th {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  h1 { font-size: 20pt; margin: 0 0 6pt; }
  h2 {
    font-size: 15pt;
    margin: 0 0 10pt;
    padding-bottom: 5pt;
    border-bottom: 1.5pt solid var(--ink);
    break-after: avoid;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    margin: 16pt 0 6pt;
    color: var(--accent);
    break-after: avoid;
    page-break-after: avoid;
  }
  h4 { font-size: 10.5pt; margin: 12pt 0 4pt; break-after: avoid; }
  p { margin: 0 0 7pt; }
  ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
  li { margin-bottom: 3pt; }
  code {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 8.6pt;
    background: #f4f6f8;
    border: 0.4pt solid #e3e7ec;
    border-radius: 2pt;
    padding: 0.4pt 2.6pt;
    word-break: break-word;
  }
  pre {
    background: #f7f9fa;
    border: 0.5pt solid var(--rule);
    border-left: 2.5pt solid var(--accent);
    border-radius: 2pt;
    padding: 8pt 10pt;
    margin: 0 0 10pt;
    font-size: 8.4pt;
    line-height: 1.45;
    white-space: pre-wrap;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  pre code { background: none; border: none; padding: 0; font-size: 8.4pt; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 12pt;
    font-size: 8.5pt;
    line-height: 1.4;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  thead { display: table-header-group; }
  th {
    background: var(--accent-soft);
    text-align: left;
    font-size: 8pt;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #26433c;
    border-bottom: 0.8pt solid var(--accent);
    padding: 4pt 5pt;
  }
  td {
    border-bottom: 0.4pt solid var(--rule);
    padding: 4pt 5pt;
    vertical-align: top;
  }
  /* Identifier columns: never let "W-23" or "G-N05" break across lines. */
  /* Reference tokens such as FR-07 must never break after the hyphen. */
  .ref { white-space: nowrap; }

  th:first-child,
  td:first-child {
    white-space: nowrap;
    width: 1%;
  }
  td:first-child code,
  th:first-child code { white-space: nowrap; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  tbody tr:nth-child(even) { background: #fbfcfd; }
  a { color: var(--accent); text-decoration: none; word-break: break-all; }
  strong { font-weight: 600; }
  blockquote {
    margin: 0 0 10pt;
    padding: 2pt 0 2pt 10pt;
    border-left: 2pt solid var(--rule);
    color: var(--muted);
    font-style: italic;
  }
  hr { border: none; border-top: 0.6pt solid var(--rule); margin: 14pt 0; }

  /* Cover */
  .cover {
    position: relative;
    height: 245mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    break-after: page;
    page-break-after: always;
  }
  .cover-top { border-top: 6pt solid var(--accent); padding-top: 14pt; }
  .cover-kicker {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 8pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .cover-title {
    font-size: 54pt;
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 18pt 0 6pt;
    font-weight: 700;
  }
  .cover-subtitle {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 15pt;
    font-weight: 400;
    color: var(--muted);
    margin-bottom: 14pt;
  }
  .cover-tagline {
    font-size: 13pt;
    max-width: 120mm;
    color: var(--ink);
    font-style: italic;
  }
  .cover-meta {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    color: var(--muted);
    border-top: 0.6pt solid var(--rule);
    padding-top: 8pt;
    display: flex;
    justify-content: space-between;
    gap: 10pt;
  }
  .cover-note {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    color: var(--warn);
    background: #fdf6ec;
    border: 0.5pt solid #f0dcc0;
    padding: 7pt 9pt;
    border-radius: 2pt;
    margin-bottom: 12pt;
  }

  /* Contents */
  .toc { break-after: page; page-break-after: always; }
  .toc-title {
    font-size: 15pt;
    border-bottom: 1.5pt solid var(--ink);
    padding-bottom: 5pt;
    margin-bottom: 12pt;
  }
  .toc ol { list-style: none; padding: 0; margin: 0; }
  .toc li {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10pt;
    padding: 3.5pt 0;
    border-bottom: 0.4pt dotted #cfd6de;
  }
  .toc li a { color: var(--ink); }
  .toc .toc-h3 {
    font-size: 9pt;
    color: var(--muted);
    padding-left: 14pt;
    border-bottom: none;
  }

  /* Sections */
  .section { break-before: page; page-break-before: always; }
  .section:first-of-type { break-before: auto; page-break-before: auto; }
`;

function buildToc(headings) {
  const items = headings
    .map((heading) => {
      const cls = heading.level === 3 ? ' class="toc-h3"' : '';
      return `<li${cls}><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`;
    })
    .join('\n');
  return `<section class="toc">\n<div class="toc-title">Contents</div>\n<ol>\n${items}\n</ol>\n</section>`;
}

function buildCover(meta) {
  const note = meta.status
    ? `<div class="cover-note">${escapeHtml(meta.status)}. This document records what is built, what is simulated, and what the system must do next. Section 1 is the register; section 3 is the specification.</div>`
    : '';
  return `<section class="cover">
  <div class="cover-top">
    <div class="cover-kicker">Product Requirements Document</div>
    <div class="cover-title">${escapeHtml(meta.title ?? 'T-Pay')}</div>
    <div class="cover-subtitle">${escapeHtml(meta.subtitle ?? '')}</div>
    <div class="cover-tagline">${escapeHtml(meta.tagline ?? '')}</div>
  </div>
  <div>
    ${note}
    <div class="cover-meta">
      <span>Version ${escapeHtml(meta.version ?? '1.0')}</span>
      <span>${escapeHtml(meta.date ?? '')}</span>
      <span>${escapeHtml(meta.author ?? '')}</span>
    </div>
  </div>
</section>`;
}

function renderBody(markdown) {
  const renderer = new marked.Renderer();
  const headings = [];

  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens, { renderer });
    const plain = text.replace(/<[^>]+>/g, '');
    const id = slugify(plain);
    if (depth === 2 || depth === 3) headings.push({ level: depth, text: plain, id });
    const cls = depth === 2 ? ' class="section"' : '';
    return `<h${depth} id="${id}"${cls}>${text}</h${depth}>`;
  };

  const rendered = marked.parse(markdown, { renderer, gfm: true, breaks: false });

  // Requirement ids are plain text in narrow table cells, where a default line
  // break can land after the hyphen and print "FR-" above "07". Keep them whole.
  const html = rendered.replace(/\b(NFR|FR|PP|DT|AR|G-F|G-N|W|O)-(\d{2})\b/g, (match) =>
    `<span class="ref">${match}</span>`,
  );
  return { html, headings };
}

function validate(markdown, html, meta) {
  const required = [
    'W-01', 'W-23',
    'FR-01', 'FR-35',
    'NFR-01', 'NFR-14',
    'PP-01', 'PP-12',
    'DT-01', 'DT-08',
    'AR-01', 'AR-09',
    'M0', 'M10',
  ];

  const missing = required.filter((token) => !html.includes(token));
  if (missing.length) fail(`Rendered HTML is missing required identifiers: ${missing.join(', ')}`);

  const leaks = [
    { pattern: /\*\*/, label: 'unparsed bold markers' },
    { pattern: /^\s*\|?\s*:?-{3,}/m, label: 'unparsed table separator' },
    { pattern: /^\s*---\s*$/m, label: 'unparsed horizontal rule' },
    { pattern: /\{\{|\}\}/, label: 'template braces' },
  ];

  for (const leak of leaks) {
    if (leak.pattern.test(html)) fail(`Markdown leak in output: ${leak.label}`);
  }

  const sourceUrls = [...markdown.matchAll(/https?:\/\/[^\s|)]+/g)].map((m) => m[0]);
  const droppedUrls = [...new Set(sourceUrls)].filter((url) => !html.includes(url.replace(/&/g, '&amp;')));
  if (droppedUrls.length) fail(`URLs missing from output: ${droppedUrls.slice(0, 3).join(', ')}`);

  const sections = (markdown.match(/^## /gm) ?? []).length;
  if (sections === 0) fail('No top-level sections found in source.');
  if (!meta.title) fail('Front matter is missing a title.');
  return { sections, urls: new Set(sourceUrls).size };
}

/** Chrome DevTools Protocol client: enough to render one page and print it. */
class Devtools {
  #socket;
  #nextId = 1;
  #pending = new Map();
  #listeners = [];

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.#pending.has(message.id)) {
        const { resolve, reject } = this.#pending.get(message.id);
        this.#pending.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : resolve(message.result);
        return;
      }
      for (const listener of this.#listeners) listener(message);
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error('DevTools websocket failed')), { once: true });
    });
    return new Devtools(socket);
  }

  send(method, params = {}, sessionId) {
    const id = this.#nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#socket.send(JSON.stringify(payload));
    });
  }

  onEvent(listener) {
    this.#listeners.push(listener);
  }

  once(method, sessionId, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const listener = (message) => {
        if (message.method !== method) return;
        if (sessionId && message.sessionId !== sessionId) return;
        clearTimeout(timer);
        this.#listeners = this.#listeners.filter((entry) => entry !== listener);
        resolve(message.params);
      };
      this.onEvent(listener);
    });
  }

  close() {
    this.#socket.close();
  }
}

function launchChrome(binary) {
  const profile = path.join(tmpdir(), `tpay-docs-chrome-${process.pid}`);
  const child = spawn(
    binary,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const endpoint = new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error('Chrome did not expose a DevTools endpoint')), 30000);
    const inspect = (chunk) => {
      buffer += chunk.toString();
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    };
    child.stderr.on('data', inspect);
    child.stdout.on('data', inspect);
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited early with code ${code}`));
    });
  });

  return { child, endpoint, profile };
}

const FOOTER = `
<div style="width:100%;padding:0 18mm;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#8a929c;display:flex;justify-content:space-between;border-top:0.4pt solid #e2e6eb;padding-top:3mm;">
  <span>T-Pay — Product Requirements Document</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

async function renderPdf(htmlPath, pdfPath) {
  const { child, endpoint } = launchChrome(findChrome());

  let client;
  try {
    client = await Devtools.connect(await endpoint);

    const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });

    await client.send('Page.enable', {}, sessionId);
    await client.send('Emulation.setEmulatedMedia', { media: 'print' }, sessionId);

    const loaded = client.once('Page.loadEventFired', sessionId);
    await client.send('Page.navigate', { url: `file://${htmlPath}` }, sessionId);
    await loaded;

    await client.send(
      'Runtime.evaluate',
      { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true },
      sessionId,
    );

    const { data } = await client.send(
      'Page.printToPDF',
      {
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: FOOTER,
        paperWidth: 8.27,
        paperHeight: 11.69,
        marginTop: 0.75,
        marginBottom: 0.72,
        marginLeft: 0.71,
        marginRight: 0.71,
        preferCSSPageSize: false,
      },
      sessionId,
    );

    await writeFile(pdfPath, Buffer.from(data, 'base64'));
  } finally {
    client?.close();
    child.kill('SIGKILL');
  }
}

function countPages(pdf) {
  const matches = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

async function main() {
  const markdown = await readFile(SOURCE, 'utf8');
  const { meta, body } = splitFrontMatter(markdown);
  const { html, headings } = renderBody(body);
  const { sections, urls } = validate(body, html, meta);

  if (headings.length === 0) fail('No headings were extracted, so the contents page would be empty.');

  const documentHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(meta.title ?? 'T-Pay')} — ${escapeHtml(meta.subtitle ?? 'PRD')}</title>
<style>${STYLES}</style>
</head>
<body>
${buildCover(meta)}
${buildToc(headings)}
${html}
</body>
</html>`;

  await mkdir(BUILD_DIR, { recursive: true });
  await writeFile(HTML_PATH, documentHtml, 'utf8');
  await renderPdf(HTML_PATH, PDF_PATH);

  const pdf = await readFile(PDF_PATH);
  const pages = countPages(pdf);
  if (pdf.subarray(0, 5).toString() !== '%PDF-') fail('Output is not a PDF.');
  if (pages < 8) fail(`PDF is suspiciously short (${pages} pages).`);

  const kb = (pdf.length / 1024).toFixed(0);
  console.log(`
  T-Pay PRD built
  ────────────────────────────────────────────
  source    docs/T-Pay-PRD.md
  html      ${path.relative(ROOT, HTML_PATH)}
  pdf       ${path.relative(ROOT, PDF_PATH)}
  pages     ${pages}
  size      ${kb} KB
  sections  ${sections}
  headings  ${headings.length}
  urls      ${urls}
  ────────────────────────────────────────────
`);
}

main().catch((error) => fail(error.message));
