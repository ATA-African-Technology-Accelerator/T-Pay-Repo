/**
 * Layout facts that both the build and the verification depend on.
 *
 * Kept in one place so "the page a heading starts on" cannot mean two slightly
 * different things in the builder and the checker.
 */

import { squash } from './pdf-text.mjs';

/** Page indexes (0-based) whose text begins with the contents title. */
export function contentsPageIndexes(pages) {
  return pages
    .map((text, index) => ({ text, index }))
    .filter(({ text, index }) => index > 0 && squash(text).startsWith('Contents'))
    .map(({ index }) => index);
}

/**
 * Reads the printed contents page back into entries.
 * A title may wrap, so lines accumulate until a bare page number closes them.
 */
export function parseContents(pages) {
  const tocPages = contentsPageIndexes(pages);
  if (tocPages.length !== 1) return { tocPages, entries: [] };

  const lines = pages[tocPages[0]]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Everything from the running footer onwards is not contents.
  const footerAt = lines.findIndex((line) => line.includes('Product Requirements Document'));
  const scope = footerAt === -1 ? lines : lines.slice(0, footerAt);

  const entries = [];
  let pending = [];

  for (const line of scope) {
    if (/^Contents$/.test(line)) continue;
    if (/^\d+\s*\/$/.test(line)) continue;
    if (/^\d+$/.test(line) && pending.length > 0) {
      entries.push({ title: pending.join(' '), page: Number(line) });
      pending = [];
      continue;
    }
    pending.push(line);
  }

  return { tocPages, entries };
}

/**
 * Which page (1-based) each heading actually starts on, read from the PDF.
 * Skips the contents pages and searches forward from the previous heading so
 * repeated wording cannot match an earlier page.
 */
export function locateHeadings(headings, pages) {
  const tocPages = contentsPageIndexes(pages);
  const firstBodyPage = tocPages.length > 0 ? Math.max(...tocPages) + 1 : 0;

  const pageMap = {};
  let cursor = firstBodyPage;

  for (const heading of headings) {
    const needle = squash(heading.text);
    if (!needle) continue;

    let found = -1;
    for (let index = cursor; index < pages.length; index += 1) {
      if (squash(pages[index]).includes(needle)) {
        found = index;
        break;
      }
    }

    if (found === -1) {
      throw new Error(`Heading not found in rendered PDF: "${heading.text}"`);
    }

    pageMap[heading.id ?? heading.text] = found + 1;
    cursor = found;
  }

  return pageMap;
}
