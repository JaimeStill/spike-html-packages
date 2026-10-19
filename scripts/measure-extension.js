// The import-extension measure's node half (evidence 5), which scripts/measure.sh runs on the
// scratch copies it makes of the layers, one per form: the .js form, the sources as they are, and
// the .ts form, every relative .js specifier rewritten to .ts. It writes only into the directories
// it is given, all in measure's scratch, and reads no network.
//
//   rewrite DIR             rewrites every relative .js specifier in DIR's .ts and .d.ts files to
//                           .ts, printing how many it rewrote: each quoted string that starts
//                           with ./ or ../ and ends in .js, so an import's, an export's, an
//                           import()'s, and the URL keys.ts loads keys-help by alike
//   tsconfig FILE           adds allowImportingTsExtensions and rewriteRelativeImportExtensions to
//                           the tsconfig.json given, the two tsc needs to emit the .ts form
//   specifiers DIR          the relative specifiers ending in .ts left in DIR's .js and .d.ts
//                           files, one per line as path:line: specifier, sorted
//   page DIR NAME BASE EXT [PROBE]
//                           writes DIR/NAME.html and the probe module DIR/NAME.js (or NAME.ts,
//                           PROBE .ts), the probe page: it links BASE/foundation/page.css, maps lit
//                           by an import map onto /deps/, and imports the foundation's modules and
//                           the three components from BASE, each by its extension EXT (.js or
//                           .ts), then renders them (see probe). Vite's dev server maps a .js
//                           specifier onto its .ts source only from a .ts importer, so its pages
//                           take a .ts probe, the same code
//   load DIR PAGE MODE      serves DIR on the loopback address (see serveDirectory, MODE static,
//                           check, or ts), opens PAGE in the pinned chrome-headless-shell through
//                           the raw pipe (scripts/browser-pipe.js, BROWSER_EXECUTABLE), and prints
//                           the probe's one-line report; exits 0 when everything loaded and
//                           rendered, 1 when not, and 2 when the probe never reported
//   open URL                the same for a page another server serves, Vite's dev server

import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { stripTypeScriptTypes } from "node:module";
import { dirname, extname, join, normalize, relative } from "node:path";

import { settings } from "./browser-cases.js";
import { launch } from "./browser-pipe.js";

/** The root of the repository, whose installed lit /deps/ answers. */
const root = join(import.meta.dirname, "..");

/** How long the probe may take to report, once its page has loaded. */
const timeout = 30_000;

/** A quoted relative specifier ending in .js: its quote, its path without the extension. */
const relativeJs = /(["'])(\.\.?\/[^"'\n]*?)\.js\1/g;

/** A quoted relative specifier ending in .ts, the .d.ts of a declaration's own name aside. */
const relativeTs = /(["'])(\.\.?\/[^"'\n]*?\.ts)\1/g;

/** Every file under DIR, recursively, as absolute paths, sorted. */
function walk(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

function rewrite(dir) {
  let count = 0;
  for (const file of walk(dir).filter((path) => path.endsWith(".ts"))) {
    const source = readFileSync(file, "utf8");
    const rewritten = source.replace(relativeJs, (_, quote, path) => {
      count++;
      return `${quote}${path}.ts${quote}`;
    });
    if (rewritten !== source) writeFileSync(file, rewritten);
  }
  console.log(count);
}

function tsconfig(file) {
  // tsconfig.json is JSONC: its leading comment goes, the rest is JSON.
  const text = readFileSync(file, "utf8").replace(/^(\s*\/\/.*\n)+/, "");
  const config = JSON.parse(text);
  Object.assign(config.compilerOptions, {
    allowImportingTsExtensions: true,
    rewriteRelativeImportExtensions: true,
  });
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}

function specifiers(dir) {
  const found = [];
  for (const file of walk(dir).filter((path) => /\.(js|d\.ts)$/.test(path))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        // A comment's words aside: only code names a module.
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        for (const [, , path] of line.matchAll(relativeTs)) {
          found.push(`${relative(dir, file)}:${index + 1}: ${path}`);
        }
      });
  }
  if (found.length > 0) console.log(found.join("\n"));
}

/** The foundation's modules and the components the probe loads, by their paths under BASE. */
const modules = [
  "foundation/dom",
  "foundation/registry",
  "foundation/keys-grammar",
  "foundation/keys",
  "foundation/keys-help",
  "components/status-badge",
  "components/entry-lit-shadow",
  "components/pagination-lit-shadow",
];

/**
 * The probe, the page's module: it imports each module by a literal import(), so a bundler sees
 * and bundles every one, records what fails to load, renders each component with fields of its
 * own and reads its shadow root and adopted sheets, and opens a dialog holding [data-keys-list],
 * which has keys.js load keys-help by its own URL and fill it. window.result resolves to the report.
 * keys.js warns, rather than throws, when that load fails, so a warning starting "keys:" is an
 * error here; any other warning, Lit's dev mode notice under Vite's dev server, is not.
 */
const probe = (
  base,
  ext,
) => `// The import-extension probe, written by scripts/measure-extension.js.
const errors = [];
addEventListener("error", (event) => errors.push(event.message));
addEventListener("unhandledrejection", (event) => errors.push(String(event.reason?.message ?? event.reason)));
const warn = console.warn;
console.warn = (...args) => {
  if (String(args[0]).startsWith("keys:")) errors.push(args.map((arg) => arg?.message ?? String(arg)).join(" "));
  warn(...args);
};
const modules = [
${modules.map((path) => `  ["${path}", () => import("${base}/${path}${ext}")],`).join("\n")}
];
const components = [
  ["sl-status-badge", (element) => (element.label = "Draft")],
  ["sl-entry-lit-shadow", (element) => (element.item = { id: "d1", name: "docs", status: "ready", updated_at: "2026-10-19T00:00:00Z" })],
  ["sl-pagination-lit-shadow", (element) => Object.assign(element, { page: 2, size: 10, total: 25, more: false, pageSizes: [10, 25] })],
];
window.result = (async () => {
  let loaded = 0;
  for (const [name, load] of modules) {
    try {
      await load();
      loaded++;
    } catch (error) {
      // A module that failed to fetch, by the file the browser asked for, not its whole URL.
      errors.push(name + ": " + error.message.replace(/^Failed to fetch dynamically imported module: .*[/]/, "failed to fetch "));
    }
  }
  const rendered = [];
  for (const [tag, fields] of components) {
    if (!customElements.get(tag)) {
      rendered.push(tag + " undefined");
      continue;
    }
    const element = document.createElement(tag);
    fields(element);
    document.body.append(element);
    try {
      await element.updateComplete;
    } catch (error) {
      errors.push(tag + ": " + error.message);
    }
    const shadow = element.shadowRoot;
    const sheets = shadow?.adoptedStyleSheets ?? [];
    const ok = shadow?.childElementCount > 0 && sheets.length === 3 && sheets.every((sheet) => sheet.cssRules.length > 0);
    rendered.push(tag + (ok ? "" : " (" + (shadow?.childElementCount ?? "no root,") + " elements, " + sheets.length + " sheets)"));
  }
  const dialog = document.createElement("dialog");
  dialog.innerHTML = "<ul data-keys-list></ul>";
  document.body.append(dialog);
  dialog.showModal();
  const deadline = performance.now() + 5000;
  while (!dialog.querySelector("[data-keys-note]") && !errors.some((error) => error.startsWith("keys:")) && performance.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const help = dialog.querySelector("[data-keys-note]") !== null;
  dialog.close();
  const broken = rendered.filter((line) => line.includes(" "));
  return {
    ok: loaded === modules.length && broken.length === 0 && help && errors.length === 0,
    line: loaded + "/" + modules.length + " modules loaded; " +
      (rendered.length - broken.length) + "/" + components.length + " components rendered with 3 adopted sheets" +
      (broken.length ? " (" + broken.join(", ") + ")" : "") +
      "; keys-help " + (help ? "loaded by keys.js and filled the dialog" : "not loaded by keys.js") +
      (errors.length ? "; errors: " + [...new Set(errors)].join("; ") : "; no errors"),
  };
})();
`;

/** The probe page: the page entry, lit's import map onto /deps/, and the probe module. */
const html = (base, name, module) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${name}</title>
    <link rel="stylesheet" href="${base}/foundation/page.css" />
    <script type="importmap">
      {
        "imports": {
          "lit": "/deps/lit/index.js",
          "lit/": "/deps/lit/",
          "lit-html": "/deps/lit-html/lit-html.js",
          "lit-html/": "/deps/lit-html/",
          "lit-element/": "/deps/lit-element/",
          "@lit/reactive-element": "/deps/@lit/reactive-element/reactive-element.js",
          "@lit/reactive-element/": "/deps/@lit/reactive-element/"
        }
      }
    </script>
    <script type="module" src="./${module}"></script>
  </head>
  <body></body>
</html>
`;

function page(dir, name, base, ext, module = ".js") {
  writeFileSync(join(dir, `${name}.html`), html(base, name, `${name}${module}`));
  writeFileSync(join(dir, `${name}${module}`), probe(base, ext));
}

/** Each type the server serves, by extension; any other file is a 404. */
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

/**
 * Serves DIR over plain http on a free port of the loopback address, /deps/ answered from the
 * directory the installed lit sits in, as scripts/browser-cases.js's server answers it. MODE:
 *
 *   static  every file as it is, as any static server sends a release
 *   check   as the check's browser tier serves the working tree (scripts/browser-cases.js): a .js
 *           path that isn't there, with a .ts file beside it, answered with that file's
 *           JavaScript, its types stripped by node's stripTypeScriptTypes; a .ts path isn't served
 *   ts      the same, and a .ts path answered with its own JavaScript, its types stripped, as
 *           text/javascript
 */
async function serveDirectory(dir, mode) {
  const deps = dirname(realpathSync(join(root, "node_modules/lit")));
  const strip = (file) => stripTypeScriptTypes(readFileSync(file, "utf8"));
  const body = (file) => {
    if (mode === "ts" && file.endsWith(".ts") && existsSync(file)) return strip(file);
    if (types[extname(file)] === undefined) return undefined;
    if (existsSync(file)) return readFileSync(file);
    const source = file.replace(/\.js$/, ".ts");
    if (mode === "static" || source === file || !existsSync(source)) return undefined;
    return strip(source);
  };
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, "http://host").pathname));
    const file = path.startsWith("/deps/")
      ? join(deps, path.slice("/deps/".length))
      : join(dir, path);
    const served = body(file);
    if (served === undefined) {
      response.writeHead(404).end();
      return;
    }
    const type = types[extname(file)] ?? "text/javascript";
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" }).end(served);
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

/** Opens the URL, awaits the probe's report, prints its line, and exits by its verdict. */
async function report(url) {
  const browser = await launch(settings);
  let timer;
  try {
    const tab = await browser.open(url);
    const result = await Promise.race([
      tab.evaluate(`new Promise((resolve) => {
        const poll = () => (window.result ? window.result.then(resolve) : setTimeout(poll, 50));
        poll();
      })`),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(undefined), timeout);
      }),
    ]);
    if (!result) {
      console.log(`the probe never reported in ${timeout / 1000} s: its module didn't run`);
      return 2;
    }
    console.log(result.line);
    return result.ok ? 0 : 1;
  } finally {
    clearTimeout(timer);
    await browser.close();
  }
}

async function load(dir, path, mode) {
  const server = await serveDirectory(dir, mode);
  try {
    return await report(`${server.origin}/${path}`);
  } finally {
    await server.stop();
  }
}

const [command, ...args] = process.argv.slice(2);
const commands = {
  rewrite: () => rewrite(args[0]),
  tsconfig: () => tsconfig(args[0]),
  specifiers: () => specifiers(args[0]),
  page: () => page(...args),
  load: () => load(...args),
  open: () => report(args[0]),
};
if (!commands[command]) {
  console.error(`measure-extension: no command ${command}; see the head of this file`);
  process.exit(64);
}
process.exitCode = (await commands[command]()) ?? 0;
