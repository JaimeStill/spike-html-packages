// The Vite apps, run by scripts/consumers.sh with each Vite fixture's install as its manager,
// consumer, project, and the foundation scripts/installed.sh found in it, the app in
// test/consumers/vite/app/ copied in. Each app is built by the install's own Vite, its build
// served statically from the loopback address, then served by Vite's dev server on the loopback
// address, and each is loaded in the browser BROWSER_EXECUTABLE names: every root must render and
// adopt the reset and elements sheets the app imports from the foundation by package name, and
// every file must come from the loopback address, each a 200, and the foundation's page.css, which
// the app imports by package name through Vite's own CSS pipeline, must shape the document and
// every root (test/consumers/design.js). With --build first, as
// scripts/live.js runs it on its networked installs, each app is built and its build loaded, and no
// dev server is started: the dev server is the offline check's alone.
//
// A build bundles the packages, so its files name no package directory: the sheets every root
// adopts being the app's own is the check that it holds one foundation. The dev server pre-bundles
// the components' modules, lit and the foundation's dom.js with them, into
// node_modules/.vite/deps/, and Vite 8.3.5's pre-bundling leaves each CSS import out of the
// bundle, by its absolute path, its `with { type: "css" }` kept: css-sheets.js rewrites it as the
// dev server serves the pre-bundled module, so the components and the app reach one virtual module
// per sheet file, and the config needs no optimizeDeps of its own. Each sheet's module is served by
// its file's path, so there each package must also come from one directory, the foundation from
// the one installed.sh found, as test/consumers/pages.js holds the import-map pages.

import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { launch } from "../live/browser-pipe.js";
import { failure, installedOrder, measured, summary } from "./design.js";
import { serve } from "../live/server.js";

const installs = [];
const buildOnly = process.argv[2] === "--build";
const args = process.argv.slice(buildOnly ? 3 : 2);
for (let at = 0; at < args.length; at += 4) {
  const [manager, consumer, project, foundation] = args.slice(at, at + 4);
  installs.push({ manager, consumer, project, foundation });
}

const scope = "@jaimestill/spike-html-packages-";

/** Fails the check with the message. */
function fail(message) {
  console.error(`vite: ${message}`);
  process.exit(1);
}

/** Runs the install's Vite with the arguments from the project; resolves to the child, its output
 * gathered in output(), and exited, a promise of its exit code. */
function vite(project, args) {
  const child = spawn(
    process.execPath,
    [join(project, "node_modules/vite/bin/vite.js"), ...args, "--configLoader", "native"],
    // Plain text, for a failure's message.
    { cwd: project, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NO_COLOR: "1" } },
  );
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => (output += chunk));
  }
  const exited = new Promise((resolve) => child.once("exit", resolve));
  return { child, output: () => output, exited };
}

/** A port free on the loopback address, for the dev server's --strictPort. */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

/** The package directory and name a module path is in, as its last node_modules/<name>/; or
 * undefined for a path in no package. The dev server serves a file in the project by its path from
 * the root, one outside it by /@fs/ and its absolute path, and css-sheets.js's virtual module by
 * /@id/__x00__css-sheet: and the absolute path of the sheet it constructs: each becomes the file's
 * path on disk. Vite's pre-bundled dependencies, /node_modules/.vite/deps/, are in no package. */
function packageOf(project, pathname) {
  let path = pathname;
  if (path.startsWith("/node_modules/.vite/")) return undefined;
  if (path.startsWith("/@id/__x00__css-sheet:")) {
    path = path.slice("/@id/__x00__css-sheet:".length).replace(/\.js$/, "");
  } else if (path.startsWith("/@fs/")) {
    path = path.slice("/@fs".length);
  } else {
    path = join(project, path);
  }
  const match = /^(.*\/node_modules\/((?:@[^/]+\/)?[^/]+))\//.exec(path);
  return match && { dir: realpathSync(match[1]), name: match[2] };
}

/** Loads the app's page from the origin, failing unless it renders as one foundation's and as the
 * installed foundation's page.css shapes it; resolves to the responses it received and the line
 * the design adds. */
async function load(browser, named, origin, page, roots, foundation) {
  // A blank page first, so the network events are on before the page's first request.
  const tab = await browser.open("about:blank");
  try {
    const responses = [];
    await tab.cdp("Network.enable");
    tab.on("Network.responseReceived", ({ response }) => responses.push(response));
    await tab.goto(`${origin}/${page}`);
    const report = await tab.evaluate("window.report");
    if (report === undefined) fail(`${named} set no report: its modules failed to load`);

    const foreign = responses.filter(({ url }) => !url.startsWith(`${origin}/`));
    if (foreign.length > 0) fail(`${named} loaded ${foreign.map(({ url }) => url).join(", ")}`);
    const missing = responses.filter(({ status }) => status !== 200);
    if (missing.length > 0) {
      fail(`${named} found no ${missing.map(({ url }) => new URL(url).pathname).join(", ")}`);
    }
    for (const root of report.roots) {
      if (root.elements === 0) fail(`${named}'s ${root.tag} rendered nothing`);
      if (root.sheets !== 3) fail(`${named}'s ${root.tag} adopted ${root.sheets} sheets, not 3`);
      if (!root.reset || !root.baseline) {
        fail(
          `${named}'s ${root.tag} adopted a reset or elements sheet other than the app's: a` +
            " second foundation",
        );
      }
    }
    roots.push(...report.roots.map(({ tag }) => tag));

    const design = await tab.evaluate(measured(roots));
    const unstyled = failure(design, installedOrder(foundation));
    if (unstyled) fail(`${named} ${unstyled}`);
    return { responses, design: summary(design, installedOrder(foundation)) };
  } finally {
    await tab.close();
  }
}

/** Builds the install's app and loads the build, served statically; resolves to a line. */
async function build(browser, { manager, consumer, project, foundation }) {
  const named = `${manager}'s ${consumer} Vite build`;
  const out = `${project}.build`;
  const built = vite(project, ["build", "--outDir", out, "--emptyOutDir"]);
  if ((await built.exited) !== 0) fail(`${named} failed:\n${built.output()}`);
  const { origin, stop } = await serve(out);
  try {
    const roots = [];
    const { responses, design } = await load(
      browser,
      named,
      origin,
      "index.html",
      roots,
      foundation,
    );
    return (
      `vite: ${named} renders ${roots.join(", ")} from ${responses.length} files on the loopback` +
      " address, none from elsewhere; every root adopts the reset and elements sheets the app" +
      ` imports from the foundation: one foundation in the bundle; ${design}`
    );
  } finally {
    await stop();
  }
}

/** Serves the install's app from Vite's dev server and loads it; resolves to a line. */
async function dev(browser, { manager, consumer, project, foundation }) {
  const named = `${manager}'s ${consumer} Vite dev server`;
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = vite(project, ["--host", "127.0.0.1", "--port", `${port}`, "--strictPort"]);
  try {
    // Up once it answers the page.
    for (let tries = 0; ; tries++) {
      const up = await fetch(`${origin}/`).then(
        ({ ok }) => ok,
        () => false,
      );
      if (up) break;
      if (server.child.exitCode !== null || tries === 300) {
        fail(`${named} didn't start:\n${server.output()}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // The dev server serves index.html at the root, as a consumer opens it.
    const roots = [];
    const { responses, design } = await load(browser, named, origin, "", roots, foundation);

    // Each package from one directory: a second is a second copy, whose modules and sheets are
    // other objects.
    const dirs = new Map();
    for (const { url } of responses) {
      const found = packageOf(project, decodeURIComponent(new URL(url).pathname));
      if (found) dirs.set(found.name, new Set(dirs.get(found.name)).add(found.dir));
    }
    for (const [name, reached] of dirs) {
      if (reached.size > 1) fail(`${named} reached ${name} from ${[...reached].join(" and ")}`);
    }
    const [reached] = dirs.get(`${scope}foundation`) ?? [];
    if (reached === undefined) fail(`${named} reached no foundation`);
    if (reached !== foundation) {
      fail(`${named} reached the foundation at ${reached}, not the install's ${foundation}`);
    }
    if (/error/i.test(server.output())) fail(`${named} logged an error:\n${server.output()}`);
    return (
      `vite: ${named} renders ${roots.join(", ")} from ${responses.length} files on the loopback` +
      " address, none from elsewhere; one foundation, the install's, whose reset and elements" +
      ` sheets every root adopts as the app imports them; ${design}`
    );
  } finally {
    server.child.kill();
    await server.exited;
  }
}

const browser = await launch();
try {
  for (const install of installs) {
    console.log(await build(browser, install));
    if (!buildOnly) console.log(await dev(browser, install));
  }
} finally {
  await browser.close();
}
