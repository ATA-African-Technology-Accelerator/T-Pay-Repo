/**
 * Minimal PDF text reader.
 *
 * We need to know which page each heading landed on in the paginated output,
 * and the only authority on that is the PDF itself. Chrome writes subset fonts
 * with Identity-H encoding plus a ToUnicode CMap, so text can be recovered
 * without a PDF library: walk the page tree, decode each content stream, and
 * map glyph codes back through the font's CMap.
 *
 * Deliberately narrow: enough to read our own generated document, nothing more.
 */

import zlib from 'node:zlib';

function inflate(raw) {
  for (const attempt of [zlib.inflateSync, zlib.inflateRawSync]) {
    try {
      return attempt(raw);
    } catch {
      /* try the next variant */
    }
  }
  return null;
}

function parseObjects(text) {
  const objects = new Map();
  const objectPattern = /(\d+)\s+(\d+)\s+obj/g;

  for (const match of text.matchAll(objectPattern)) {
    const number = Number(match[1]);
    const start = match.index + match[0].length;
    const end = text.indexOf('endobj', start);
    let dict = text.slice(start, end === -1 ? undefined : end);
    let stream = null;

    const streamMarker = /stream\r?\n/.exec(dict);
    if (streamMarker) {
      const streamStart = streamMarker.index + streamMarker[0].length;
      const streamEnd = dict.indexOf('endstream', streamStart);
      if (streamEnd !== -1) {
        stream = inflate(Buffer.from(dict.slice(streamStart, streamEnd), 'latin1'));
      }
      dict = dict.slice(0, streamMarker.index);
    }

    objects.set(number, { dict, stream });
  }

  return objects;
}

/** Identity-H CMaps store big-endian UTF-16 code units; Node has no 'utf16-be'. */
function decodeUtf16(hex) {
  const bytes = Buffer.from(hex, 'hex');
  let text = '';
  for (let offset = 0; offset + 1 < bytes.length; offset += 2) {
    text += String.fromCharCode((bytes[offset] << 8) | bytes[offset + 1]);
  }
  return text;
}

function parseToUnicode(stream) {
  const map = new Map();
  if (!stream) return map;
  const text = stream.toString('latin1');

  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(pair[1], 16), decodeUtf16(pair[2]));
    }
  }

  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const ranges = block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]+>|\[[^\]]*\])/g);
    for (const range of ranges) {
      const low = parseInt(range[1], 16);
      const high = parseInt(range[2], 16);
      if (range[3].startsWith('[')) {
        const items = [...range[3].matchAll(/<([0-9A-Fa-f]+)>/g)].map((item) => decodeUtf16(item[1]));
        items.forEach((value, offset) => map.set(low + offset, value));
      } else {
        const base = parseInt(range[3].slice(1, -1) || '0', 16);
        for (let code = low; code <= high; code += 1) {
          map.set(code, String.fromCodePoint(base + (code - low)));
        }
      }
    }
  }

  return map;
}

function fontMap(objects, fontNumber) {
  const font = objects.get(fontNumber);
  if (!font) return new Map();
  const ref = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(font.dict);
  if (!ref) return new Map();
  const cmap = objects.get(Number(ref[1]));
  return parseToUnicode(cmap?.stream);
}

function pageNumbersInOrder(objects) {
  const catalog = [...objects.values()].find((entry) => /\/Type\s*\/Catalog/.test(entry.dict));
  const root = catalog && /\/Pages\s+(\d+)\s+0\s+R/.exec(catalog.dict);
  const order = [];
  const seen = new Set();

  const walk = (number) => {
    if (seen.has(number)) return;
    seen.add(number);
    const node = objects.get(number);
    if (!node) return;
    const kids = /\/Kids\s*\[([\s\S]*?)\]/.exec(node.dict);
    if (kids) {
      for (const kid of kids[1].matchAll(/(\d+)\s+0\s+R/g)) walk(Number(kid[1]));
      return;
    }
    order.push(number);
  };

  if (root) walk(Number(root[1]));
  if (order.length === 0) {
    for (const [number, node] of objects) {
      if (/\/Type\s*\/Page[^s]/.test(node.dict)) order.push(number);
    }
  }
  return order;
}

function decodeTextBlock(block, cmap) {
  const pieces = [];

  for (const token of block.matchAll(/\[([\s\S]*?)\]\s*TJ|<([0-9A-Fa-f]+)>\s*Tj/g)) {
    const hexStrings = token[1] !== undefined
      ? [...token[1].matchAll(/<([0-9A-Fa-f]+)>/g)].map((entry) => entry[1])
      : [token[2]];

    for (const hex of hexStrings) {
      for (let offset = 0; offset + 4 <= hex.length; offset += 4) {
        pieces.push(cmap.get(parseInt(hex.slice(offset, offset + 4), 16)) ?? '');
      }
    }
  }

  return pieces.join('');
}

function pageText(objects, pageNumber) {
  const page = objects.get(pageNumber);
  if (!page) return '';

  const resourcesRef = /\/Resources\s+(\d+)\s+0\s+R/.exec(page.dict);
  const resources = resourcesRef ? objects.get(Number(resourcesRef[1]))?.dict ?? '' : page.dict;

  let fontBlock = /\/Font\s*<<([\s\S]*?)>>/.exec(resources);
  if (!fontBlock) {
    const fontRef = /\/Font\s+(\d+)\s+0\s+R/.exec(resources);
    if (fontRef) fontBlock = /<<([\s\S]*?)>>/.exec(objects.get(Number(fontRef[1]))?.dict ?? '');
  }

  const fonts = new Map();
  if (fontBlock) {
    for (const entry of fontBlock[1].matchAll(/\/(\w+)\s+(\d+)\s+0\s+R/g)) {
      fonts.set(entry[1], fontMap(objects, Number(entry[2])));
    }
  }

  const arrayRef = /\/Contents\s*\[([\s\S]*?)\]/.exec(page.dict);
  const singleRef = /\/Contents\s+(\d+)\s+0\s+R/.exec(page.dict);
  const contentNumbers = arrayRef
    ? [...arrayRef[1].matchAll(/(\d+)\s+0\s+R/g)].map((entry) => Number(entry[1]))
    : singleRef ? [Number(singleRef[1])] : [];

  const content = contentNumbers
    .map((number) => objects.get(number)?.stream?.toString('latin1') ?? '')
    .join('\n');

  const lines = [];
  for (const block of content.matchAll(/BT([\s\S]*?)ET/g)) {
    const font = /(\/\w+)\s+[\d.]+\s+Tf/.exec(block[1]);
    const cmap = font ? fonts.get(font[1].slice(1)) ?? new Map() : new Map();
    const line = decodeTextBlock(block[1], cmap);
    if (line) lines.push(line);
  }

  return lines.join('\n');
}

/** Returns one string of extracted text per page, in reading order. */
export function extractPageTexts(pdf) {
  const objects = parseObjects(pdf.toString('latin1'));
  return pageNumbersInOrder(objects).map((number) => pageText(objects, number));
}

/** Whitespace-insensitive form, for matching headings against extracted text. */
export function squash(text) {
  return text.replace(/\s+/g, '');
}
