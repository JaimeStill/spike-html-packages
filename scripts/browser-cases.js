// The browser cases and the server their pages come from, shared by every driver
// (scripts/browser.test.js runs them), after spike-html-conventions a88828a's
// scripts/browser-cases.js: the foundation's tool classes on demo/tools.html, read once on
// spike-html-design v0.7.0's own sheets (test/fixtures/v0.7.0/, copied from the tag) and once on
// this repository's page entry, layers/foundation/page.css, and compared property for property.
//
// The server is node:http on the loopback address, serving the working tree itself: the pages
// need no tool between, as the sheets are plain CSS and the in-page half, scripts/computed-styles.js,
// a plain module. It serves only the types below, so nothing else in the tree is reachable, and
// reads no network. mise run demo serves the demo through it too.
//
// A driver keeps one interface: launch(settings) resolves to a browser with its version, an
// open(url) that resolves to a page once its load event fires, and a close(); a page has
// evaluate(expression), the expression's value awaited when it is a promise, and close().

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

/** The root of the repository, which the server serves. */
export const root = join(import.meta.dirname, "..");

/** The page every case reads, and the in-page module that reads it, by their paths on the server. */
export const page = "/demo/tools.html";
const module = "/scripts/computed-styles.js";

/** The two stacks of sheets the page is read on: v0.7.0's lean entry, and the page entry. */
export const reference = "/test/fixtures/v0.7.0/baseline.css";
export const entry = "/layers/foundation/page.css";

/** The directory the page entry's lateral-concern sheets sit in, by its path on the server. */
export const foundation = "/layers/foundation";

/**
 * What every browser runs with, so a reading is the same on any machine and in any driver: the
 * language and time zone, and the viewport every page has, which the foundation's fluid tokens
 * read (Playwright's default viewport), as spike-html-conventions' cases set them.
 */
export const settings = { lang: "en-US", tz: "UTC", width: 1280, height: 720 };

/** How long one evaluation may take, once the page has loaded. */
const timeout = 120_000;

/** Each type the server serves, by extension; any other file isn't served. */
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

/**
 * Serves the working tree over plain http on a free port of the loopback address. Resolves to its
 * origin and a stop() that ends it.
 */
export async function serve() {
  const server = createServer((request, response) => {
    // normalize() of an absolute path never climbs above its root, so every file is in the tree.
    const path = normalize(decodeURIComponent(new URL(request.url, "http://host").pathname));
    const file = join(root, path);
    const type = types[extname(file)];
    let body;
    try {
      if (type !== undefined) body = readFileSync(file);
    } catch {
      // A missing file is a 404, as is a type the server doesn't serve.
    }
    if (body === undefined) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" }).end(body);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
}

/**
 * Opens the page in the browser and evaluates the body in it, with the in-page module bound as
 * `m`, resolving to the body's value: each evaluation runs on a fresh page, so no case sees
 * another's rewrites.
 */
export async function inPage(browser, origin, body) {
  const tab = await browser.open(`${origin}${page}`);
  let timer;
  try {
    return await Promise.race([
      tab.evaluate(`import(${JSON.stringify(module)}).then(async (m) => { ${body} })`),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no result after ${timeout} ms`)), timeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    await tab.close();
  }
}

/** The page read on a stack of sheets, at rest and hovered, with how many rules hover rewrote. */
export const read = (browser, origin, sheets) =>
  inPage(
    browser,
    origin,
    `await m.useSheets(${JSON.stringify(sheets)});
     const hovered = m.hoverable();
     return { hovered, snapshot: m.snapshot() };`,
  );

/**
 * The page read on the page entry against the reference snapshot given: the differences, and every
 * declaration of the lateral-concern sheets with how many differences dropping it makes.
 */
export const compare = (browser, origin, snapshot) =>
  inPage(
    browser,
    origin,
    `const reference = ${JSON.stringify(snapshot)};
     await m.useSheets(${JSON.stringify(entry)});
     m.hoverable();
     return { differences: m.differences(reference, m.snapshot()), drops: m.drops(reference) };`,
  );

/** Each lateral-concern sheet adopted alone into a shadow root, as computed-styles.js's adopt(). */
export const adopt = (browser, origin) =>
  inPage(browser, origin, `return m.adopt(${JSON.stringify(foundation)});`);

/** The class names a stylesheet's selectors name, its comments aside, sorted. */
export function classes(css) {
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // A class name in a selector, never a number's decimal point in a value: the dot follows no digit.
  const names = [...code.matchAll(/(?<![\w-])\.(-?[A-Za-z_][\w-]*)/g)].map((match) => match[1]);
  return [...new Set(names)].sort();
}

/** The class names every element in an HTML page's class attributes carries, sorted. */
export function used(html) {
  const names = [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/));
  return [...new Set(names.filter(Boolean))].sort();
}
