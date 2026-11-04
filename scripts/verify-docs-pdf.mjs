#!/usr/bin/env node
/**
 * Verifies docs/T-Pay-PRD.pdf against docs/T-Pay-PRD.md.
 *
 * This is the guard that keeps the document honest. It reads the built PDF,
 * compares it with the markdown it claims to represent, and fails loudly when
 * the two have drifted — a heading the PDF does not carry, a contents entry
 * pointing at the wrong page, a source URL that never made it into print.
 *
 * Markdown expectations are re-derived here with a separate, deliberately
 * simple parse rather than reusing the builder's renderer: a checker that
 * borrows the builder's own parsing cannot catch the builder being wrong.
 *
 * Run with `npm run docs:verify`; the build runs it too.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPageTexts, squash } from './lib/pdf-text.mjs';
import { contentsPageIndexes, locateHeadings, parseContents } from './lib/prd-layout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MARKDOWN = path.join(ROOT, 'docs/T-Pay-PRD.md');
const DEFAULT_PDF = path.join(ROOT, 'docs/T-Pay-PRD.pdf');

const ID_GROUPS = [
  { prefix: 'W-', count: 26 },
  { prefix: 'FR-', count: 47 },
  { prefix: 'NFR-', count: 15 },
  { prefix: 'PP-', count: 16 },
  { prefix: 'DT-', count: 10 },
  { prefix: 'AR-', count: 9 },
  { prefix: 'G-F', count: 16 },
  { prefix: 'G-N', count: 10 },
  { prefix: 'O-', count: 10 },
];

const SECTIONS = [
  '1.Whereweare',
  '2.Requirementgaps',
  '3.ThePRD',
  '4.PayPalconstraints',
  '5.Devicetrust',
  '6.Architecturecontract',
  '7.Roadmap',
  '8.Openinputs',
  '9.Hackathondelivery',
];

/** Headings the markdown promises, in document order. */
function markdownHeadings(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/, '').trim());
}

/** Requirement identifiers the markdown promises. */
function markdownIdentifiers(markdown) {
  const tokens = new Set();
  for (const { prefix, count } of ID_GROUPS) {
    for (let n = 1; n <= count; n += 1) {
      const token = `${prefix}${String(n).padStart(2, '0')}`;
      if (markdown.includes(token)) tokens.add(token);
    }
  }
  for (let n = 0; n <= 10; n += 1) {
    if (markdown.includes(`M${n}`)) tokens.add(`M${n}`);
  }
  return tokens;
}

/**
 * @returns {Promise<{checks: {label: string, ok: boolean, detail?: string}[], failures: string[]}>}
 */
export async function verifyArtifact({ markdownPath = DEFAULT_MARKDOWN, pdfPath = DEFAULT_PDF } = {}) {
  const markdown = await readFile(markdownPath, 'utf8');
  const pdf = await readFile(pdfPath);

  if (pdf.subarray(0, 5).toString() !== '%PDF-') {
    return { checks: [{ label: 'file is a PDF', ok: false }], failures: ['file is a PDF'] };
  }

  const pages = extractPageTexts(pdf);
  const pageText = pages.map((lines) => lines);
  const joined = pageText.join('\n').replace(/\n/g, ' ');
  const squished = squash(pageText.join('\n'));

  const {
    checks,
    add,
  } = (() => {
    const collected = [];
    const push = (label, ok, detail) => collected.push({ label, ok, ...(detail ? { detail } : {}) });
    return { checks: collected, add: push };
  })();

  // --- structure -----------------------------------------------------------
  add('file is a PDF', true);
  add(`has a plausible page count (${pages.length})`, pages.length >= 8);

  const firstPage = squash(pageText[0] ?? '').toLowerCase();
  add('cover carries the title and document type',
    firstPage.includes('t-pay') && firstPage.includes('productrequirementsdocument'));

  const tocPages = contentsPageIndexes(pageText);
  add('contents starts on page 2', tocPages[0] === 1);
  add('contents fits on a single page', tocPages.length === 1, `pages ${tocPages.map((i) => i + 1).join(', ')}`);

  // --- contents against the markdown --------------------------------------
  const headings = markdownHeadings(markdown);
  const { entries } = parseContents(pageText);

  add(`every heading is in the contents (${headings.length})`, entries.length === headings.length,
    `contents ${entries.length} vs markdown ${headings.length}`);

  const orderMatches = entries.length === headings.length
    && entries.every((entry, index) => squash(entry.title) === squash(headings[index]));
  add('contents titles and order match the markdown', orderMatches,
    entries.find((entry, index) => squash(entry.title) !== squash(headings[index]))?.title);

  add('every contents entry has a page number', entries.every((entry) => Number.isInteger(entry.page) && entry.page > 0));

  const ascending = entries.every((entry, index) => index === 0 || entry.page >= entries[index - 1].page);
  add('contents page numbers never go backwards', ascending);

  // Re-derive each heading's page from the body and require agreement.
  // A heading the markdown promises but the PDF lacks is drift, not a crash.
  let missingHeading = null;
  let located = {};
  try {
    located = locateHeadings(headings.map((text) => ({ text, id: text })), pageText);
  } catch (error) {
    missingHeading = error.message;
  }

  const mismatches = entries
    .map((entry) => ({ entry, actual: located[entry.title] }))
    .filter(({ entry, actual }) => actual !== undefined && actual !== entry.page);
  add('every contents number matches where the heading starts',
    missingHeading === null && mismatches.length === 0,
    missingHeading ?? mismatches.slice(0, 3).map((m) => `${m.entry.title}: says ${m.entry.page}, is ${m.actual}`).join('; '));

  // --- drift: anything promised in markdown must exist in print ------------
  const requiredIds = [...markdownIdentifiers(markdown)];
  const missingIds = requiredIds.filter((token) => !squished.includes(squash(token)));
  add(`all ${requiredIds.length} requirement ids are printed`, missingIds.length === 0, missingIds.join(', '));

  const urls = [...new Set([...markdown.matchAll(/https?:\/\/[^\s|)]+/g)].map((match) => match[0]))];
  const missingUrls = urls.filter((url) => !squished.includes(squash(url)));
  add(`all ${urls.length} source urls are printed`, missingUrls.length === 0, missingUrls.slice(0, 2).join(', '));

  add('all nine sections are printed', SECTIONS.every((section) => squished.includes(section)));
  add('both appendices are printed and numbered',
    entries.some((entry) => entry.title.startsWith('Appendix A'))
    && entries.some((entry) => entry.title.startsWith('Appendix B')));

  // --- typography and pagination ------------------------------------------
  add('no unparsed bold markers', !joined.includes('**'));
  add('no unparsed table separators', !joined.includes('| ---'));
  add('no html tags in the text layer', !/<\/?(div|span|table|td|h2|code)\b/.test(joined));
  add('no ligature glyphs', !/[\uFB00-\uFB06]/.test(joined));

  const footers = pageText.map((text) => joinedPageFooter(text));
  add('every page carries a footer number', footers.every(Boolean));
  add('footer totals equal the page count', footers.every((footer) => footer && footer.total === pages.length));
  add('footer numbers run in order',
    footers.every((footer, index) => footer && footer.number === index + 1));

  const orphans = pageText
    .map((text, index) => ({ index, last: lastBodyLine(text) }))
    .filter(({ last }) => last && headings.some((heading) => last === heading || (last.length > 12 && heading.startsWith(last))))
    .map(({ index, last }) => `p${index + 1}: ${last}`);
  add('no page ends on a heading', orphans.length === 0, orphans.slice(0, 3).join('; '));

  const failures = checks.filter((check) => !check.ok).map((check) => check.label);
  return { checks, failures, pages: pages.length, entries: entries.length };
}

function joinedPageFooter(pageText) {
  const match = pageText.match(/(\d+)\s*\/\s*(\d+)/g);
  if (!match) return null;
  const last = match[match.length - 1].match(/(\d+)\s*\/\s*(\d+)/);
  return { number: Number(last[1]), total: Number(last[2]) };
}

function lastBodyLine(pageText) {
  const lines = pageText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes('Product Requirements Document'))
    .filter((line) => !/^\d+(\s*\/\s*\d+)?$/.test(line));
  return lines.length > 0 ? lines[lines.length - 1] : null;
}

async function main() {
  try {
    const { checks, failures, pages, entries } = await verifyArtifact();

    for (const check of checks) {
      const detail = check.ok || !check.detail ? '' : `  (${check.detail})`;
      console.log(`  ${check.ok ? 'PASS' : 'FAIL'}  ${check.label}${detail}`);
    }

    console.log('');
    console.log(`  ${checks.length - failures.length}/${checks.length} checks passed · ${pages} pages · ${entries} contents entries`);

    if (failures.length > 0) {
      console.log(`\n  ✗ ${failures.length} check(s) failed. Rebuild the document with: npm run docs:pdf\n`);
      process.exit(1);
    }

    console.log('  ✓ the committed PDF matches its markdown source\n');
  } catch (error) {
    console.error(`\n  ✗ verification could not run: ${error.message}\n`);
    process.exit(1);
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) main();
