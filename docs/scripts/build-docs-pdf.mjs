#!/usr/bin/env node
/**
 * Builds docs/T-Pay-PRD.pdf from docs/T-Pay-PRD.md.
 *
 * Markdown -> self-contained print HTML -> PDF, rendered by the installed
 * Chrome. The contents page is resolved honestly: the document is rendered,
 * the PDF is read back to find the page each heading actually landed on, those
 * numbers are written into the contents, and the cycle repeats until the
 * numbers stop moving. A reader therefore sees real page numbers rather than
 * a guess.
 *
 * Usage: npm run docs:pdf
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { createPrinter } from './lib/chrome-pdf.mjs';
import { extractPageTexts } from './lib/pdf-text.mjs';
import { contentsPageIndexes, locateHeadings } from './lib/prd-layout.mjs';
import { verifyArtifact } from './verify-docs-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = path.join(ROOT, 'docs/T-Pay-PRD.md');
const BUILD_DIR = path.join(ROOT, 'docs/.build');
const HTML_PATH = path.join(BUILD_DIR, 'T-Pay-PRD.html');
const PDF_PATH = path.join(ROOT, 'docs/T-Pay-PRD.pdf');

const MAX_PASSES = 6;
const MIN_PAGES = 8;

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
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
    /* Ligatures turn "office" into glyphs that copy-paste as "o\\uFB03ce". A document
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

  /* Reference tokens such as FR-07 must never break after the hyphen. */
  .ref { white-space: nowrap; }

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

  /* Contents: two columns so all entries fit a single page */
  .toc { break-after: page; page-break-after: always; }
  .toc-title {
    font-size: 15pt;
    border-bottom: 1.5pt solid var(--ink);
    padding-bottom: 5pt;
    margin: 0 0 9pt;
  }
  .toc ol {
    list-style: none;
    margin: 0;
    padding: 0;
    columns: 2;
    column-gap: 9mm;
    column-fill: balance;
  }
  .toc li {
    display: flex;
    align-items: baseline;
    gap: 3pt;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 8.7pt;
    line-height: 1.3;
    padding: 1.9pt 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .toc .t { flex: 0 1 auto; }
  .toc .leader {
    flex: 1 1 auto;
    min-width: 5pt;
    border-bottom: 0.5pt dotted #c7cfd8;
    margin-bottom: 2.2pt;
  }
  .toc .pg {
    flex: 0 0 auto;
    color: var(--muted);
    font-size: 8.4pt;
    font-variant-numeric: tabular-nums;
  }
  .toc .toc-h3 { padding-left: 9pt; font-size: 8.2pt; }
  .toc .toc-h3 .t { color: #414a55; }

  /* Sections */
  .section { break-before: page; page-break-before: always; }
  .section:first-of-type { break-before: auto; page-break-before: auto; }
`;

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

/** Contents page. `pageMap` is keyed by heading id; missing entries render blank. */
function buildContents(headings, pageMap) {
  const entries = headings
    .map((heading) => {
      const cls = heading.level === 3 ? ' class="toc-h3"' : '';
      const page = pageMap[heading.id] ?? '';
      return `<li${cls}><span class="t">${escapeHtml(heading.text)}</span><span class="leader"></span><span class="pg">${page}</span></li>`;
    })
    .join('\n');

  return `<section class="toc">
  <div class="toc-title">Contents</div>
  <ol>
${entries}
  </ol>
</section>`;
}

function buildDocument(meta, headings, bodyHtml, pageMap) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(meta.title ?? 'T-Pay')} — ${escapeHtml(meta.subtitle ?? 'PRD')}</title>
<style>${STYLES}</style>
</head>
<body>
${buildCover(meta)}
${buildContents(headings, pageMap)}
${bodyHtml}
</body>
</html>`;
}

function validateSource(markdown, html, meta) {
  const required = [
    'W-01', 'W-26',
    'FR-01', 'FR-47',
    'NFR-01', 'NFR-15',
    'PP-01', 'PP-16',
    'DT-01', 'DT-10',
    'AR-01', 'AR-09',
    'M0', 'M10',
  ];

  const missing = required.filter((token) => !html.includes(token));
  if (missing.length) fail(`Rendered HTML is missing required identifiers: ${missing.join(', ')}`);

  const leaks = [
    { pattern: /\*\*/, label: 'unparsed bold markers' },
    { pattern: /^\s*\|?\s*:?-{3,}/m, label: 'unparsed table separator' },
    { pattern: /^\s*---\s*$/m, label: 'unparsed horizontal rule' },
  ];

  for (const leak of leaks) {
    if (leak.pattern.test(html)) fail(`Markdown leak in output: ${leak.label}`);
  }

  const sourceUrls = [...markdown.matchAll(/https?:\/\/[^\s|)]+/g)].map((match) => match[0]);
  const dropped = [...new Set(sourceUrls)].filter((url) => !html.includes(url.replace(/&/g, '&amp;')));
  if (dropped.length) fail(`URLs missing from output: ${dropped.slice(0, 3).join(', ')}`);

  const sections = (markdown.match(/^## /gm) ?? []).length;
  if (sections === 0) fail('No top-level sections found in source.');
  if (!meta.title) fail('Front matter is missing a title.');
  return { sections, urls: new Set(sourceUrls).size };
}


function sameMap(left, right) {
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every((key) => left[key] === right[key]);
}

async function main() {
  const markdown = await readFile(SOURCE, 'utf8');
  const { meta, body } = splitFrontMatter(markdown);
  const { html, headings } = renderBody(body);
  const { sections, urls } = validateSource(body, html, meta);

  if (headings.length === 0) fail('No headings were extracted, so the contents page would be empty.');

  await mkdir(BUILD_DIR, { recursive: true });

  const printer = await createPrinter({
    footer: `
<div style="width:100%;padding:0 18mm;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#8a929c;display:flex;justify-content:space-between;border-top:0.4pt solid #e2e6eb;padding-top:3mm;">
  <span>T-Pay — Product Requirements Document</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`,
  });

  let pageMap = {};
  let pdf = null;
  let pages = [];
  let passes = 0;

  try {
    for (let attempt = 0; attempt < MAX_PASSES; attempt += 1) {
      passes = attempt + 1;
      await writeFile(HTML_PATH, buildDocument(meta, headings, html, pageMap), 'utf8');

      pdf = await printer.print(HTML_PATH);
      pages = extractPageTexts(pdf);

      if (pages.length < MIN_PAGES) fail(`PDF is suspiciously short (${pages.length} pages).`);

      let measured;
      try {
        measured = locateHeadings(headings, pages);
      } catch (error) {
        fail(`${error.message}. The contents page would lie.`);
      }
      if (sameMap(measured, pageMap)) break;

      pageMap = measured;
      if (attempt === MAX_PASSES - 1) fail('Contents page numbers never settled; the layout is unstable.');
    }
  } finally {
    printer.close();
  }

  const tocPages = contentsPageIndexes(pages).length;
  if (tocPages !== 1) fail(`Contents spilled onto ${tocPages} pages; it must fit on one.`);

  for (const heading of headings) {
    if (!pageMap[heading.id]) fail(`Contents has no page number for "${heading.text}".`);
  }

  await writeFile(PDF_PATH, pdf);

  // The build is not done because a file exists; it is done when the file
  // passes the same checks `npm run docs:verify` runs.
  const { checks, failures } = await verifyArtifact();
  if (failures.length > 0) {
    fail(`post-build verification failed: ${failures.slice(0, 3).join('; ')}`);
  }

  const kb = (pdf.length / 1024).toFixed(0);
  const sample = headings.slice(0, 6).map((heading) => `${pageMap[heading.id]}  ${heading.text}`);

  console.log(`
  T-Pay PRD built
  ────────────────────────────────────────────
  source    docs/T-Pay-PRD.md
  html      ${path.relative(ROOT, HTML_PATH)}
  pdf       ${path.relative(ROOT, PDF_PATH)}
  pages     ${pages.length}
  size      ${kb} KB
  sections  ${sections}
  headings  ${headings.length} (all numbered)
  urls      ${urls}
  passes    ${passes} (contents resolved against rendered pages)
  verified  ${checks.length} checks, 0 failures
  ────────────────────────────────────────────
  contents sample
${sample.map((line) => `    p${line}`).join('\n')}
  ────────────────────────────────────────────
`);
}

main().catch((error) => fail(error.message));
