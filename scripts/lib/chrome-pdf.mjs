/**
 * Headless Chrome printing.
 *
 * The DevTools protocol is used instead of the `--print-to-pdf` flag because
 * only `Page.printToPDF` accepts a footer template, and a page-numbered
 * document needs one. Keeping the browser alive across calls matters too: the
 * contents page is resolved by rendering, measuring, and re-rendering.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

export function findChrome() {
  const binary = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate));
  if (!binary) {
    throw new Error('No Chrome or Chromium binary found. Set CHROME_PATH to one.');
  }
  return binary;
}

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
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      for (const listener of [...this.#listeners]) listener(message);
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error('DevTools connection failed')), { once: true });
    });
    return new Devtools(socket);
  }

  send(method, params = {}, sessionId) {
    const id = this.#nextId++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#socket.send(JSON.stringify(message));
    });
  }

  once(method, sessionId, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#listeners = this.#listeners.filter((entry) => entry !== listener);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const listener = (message) => {
        if (message.method !== method) return;
        if (sessionId && message.sessionId !== sessionId) return;
        clearTimeout(timer);
        this.#listeners = this.#listeners.filter((entry) => entry !== listener);
        resolve(message.params);
      };

      this.#listeners.push(listener);
    });
  }

  close() {
    this.#socket.close();
  }
}

/**
 * Starts one browser and prints any number of HTML files with it.
 * Call `close()` when finished.
 */
export async function createPrinter({ footer } = {}) {
  const profile = path.join(tmpdir(), `tpay-docs-chrome-${process.pid}`);
  const child = spawn(
    findChrome(),
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

  const client = await Devtools.connect(await endpoint);
  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
  await client.send('Page.enable', {}, sessionId);
  await client.send('Emulation.setEmulatedMedia', { media: 'print' }, sessionId);

  return {
    async print(htmlPath) {
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
          footerTemplate: footer ?? '<div></div>',
          paperWidth: 8.27,
          paperHeight: 11.69,
          marginTop: 0.75,
          marginBottom: 0.78,
          marginLeft: 0.71,
          marginRight: 0.71,
          preferCSSPageSize: false,
        },
        sessionId,
      );

      return Buffer.from(data, 'base64');
    },

    close() {
      client.close();
      child.kill('SIGKILL');
    },
  };
}
