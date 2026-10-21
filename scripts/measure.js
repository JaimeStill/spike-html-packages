// The import extension's facts (README, Measures) as a dated markdown table. Copies the one
// package's build (mise run build) and builds a Vite page beside it in a scratch directory it
// removes, loads the page in the pinned chrome-headless-shell, and reads no network.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch } from "../test/browser/support/browser-pipe.js";
import { serve } from "../test/browser/support/server.js";
import { listFiles } from "../test/consumers/release.js";

const root = join(import.meta.dirname, "..");
const one = join(root, "packages/spike-html-packages");
const grammarSource = "packages/foundation/src/keys-grammar.ts";
const keysSource = "packages/foundation/src/keys.ts";
const fixture = join(root, "test/fixtures/measure");
const scratch = mkdtempSync(join(tmpdir(), "measure."));
const dist = join(scratch, "dist");
const rows = [];

/** Runs a command, returning whether it exited 0 and its stdout and stderr, trimmed. */
function run(command, args, cwd = root) {
  const { status, stdout, stderr } = spawnSync(command, args, { cwd, encoding: "utf8" });
  return { ok: status === 0, output: `${stdout}${stderr}`.trim() };
}

/** The version a tool's --version prints. */
const version = (command, ...args) =>
  run(command, [...args, "--version"]).output.match(/\d+(?:\.\d+)+/)?.[0];

/** The relative specifiers a module or declaration names, in import, export, and import(). */
const specifiers = (path) =>
  [...readFileSync(path, "utf8").matchAll(/\b(?:from|import)\s*\(?\s*"(\.\.?\/[^"]+)"/g)].map(
    ([, specifier]) => specifier,
  );

/** Adds a row, its result yes or no with what was observed. */
const row = (measure, holds, observed) =>
  rows.push(`| ${measure} | ${holds ? "yes" : "no"}${observed ? `: ${observed}` : ""} |`);

/** The first line of a failed command's output. */
const firstError = (output) => output.split("\n").find((line) => /error/i.test(line)) ?? output;

try {
  cpSync(join(one, "dist"), dist, { recursive: true });
  symlinkSync(join(one, "node_modules"), join(scratch, "node_modules"));
  const built = listFiles(dist);

  const emitted = built.filter((path) => path.endsWith(".js"));
  // The .css specifiers are the components' CSS module scripts, which keep their extension.
  const modules = emitted
    .flatMap((path) => specifiers(join(dist, path)))
    .filter((specifier) => !specifier.endsWith(".css"));
  const other = modules.filter((specifier) => !specifier.endsWith(".js"));
  const help = specifiers(join(dist, "foundation/keys.js")).includes("./keys-help.js");
  row(
    "the emitted .js names its modules by .js relative specifiers, the help import included",
    other.length === 0 && help,
    `${modules.length} specifiers${other.length ? `; not .js: ${other.join(", ")}` : ""}`,
  );

  const keepTs = built.filter(
    (path) => path.endsWith(".d.ts") && specifiers(join(dist, path)).some((s) => s.endsWith(".ts")),
  );
  row("the emitted .d.ts keep .ts specifiers", keepTs.length > 0, keepTs.join(", "));

  // A consumer's tsc: no allowImportingTsExtensions, and skipLibCheck off.
  const consumer = {
    compilerOptions: {
      target: "es2024",
      lib: ["es2024", "dom", "dom.iterable"],
      module: "esnext",
      moduleResolution: "bundler",
      types: [],
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    include: ["dist/**/*.d.ts"],
  };
  writeFileSync(join(scratch, "tsconfig.json"), JSON.stringify(consumer));
  const typescript = join(root, "node_modules/typescript/bin/tsc");
  for (const [name, command, args] of [
    ["typescript-go", "tsc", []],
    ["typescript", "node", [typescript]],
  ]) {
    const check = run(command, [...args, "-p", scratch]);
    row(
      `${name} ${version(command, ...args)} checks a consumer of dist/**/*.d.ts`,
      check.ok,
      check.ok ? "" : firstError(check.output),
    );
  }

  const grammar = run("node", [grammarSource]);
  row(
    `node ${process.versions.node} runs ${grammarSource}`,
    grammar.ok,
    grammar.ok ? "" : firstError(grammar.output),
  );
  // keys.ts needs a DOM, so it stops at evaluation, which node reaches only once every import
  // has resolved and linked.
  const keys = run("node", [keysSource]);
  const linked = keys.output.includes("ReferenceError: document is not defined");
  row(
    `node resolves ${keysSource}'s imports`,
    linked,
    linked ? "it stops at evaluation, on document" : firstError(keys.output),
  );

  copyFileSync(join(fixture, "index.html"), join(scratch, "index.html"));
  const out = join(scratch, "out");
  const vite = run("vite", [
    "build",
    scratch,
    ...["--config", join(fixture, "vite.config.js"), "--configLoader", "native"],
    ...["--outDir", out],
  ]);
  const chunk = vite.ok && listFiles(out).find((path) => /^assets\/keys-help-.*\.js$/.test(path));
  row(
    `Vite ${version("vite")} builds the page, keys-help in its own chunk`,
    vite.ok && chunk !== undefined,
    vite.ok ? chunk : firstError(vite.output),
  );

  if (vite.ok) {
    const browser = await launch();
    const server = await serve(out);
    try {
      const page = await browser.open(`${server.origin}/index.html`);
      const loaded = await page.evaluate(`(async () => {
        const rendered = [];
        for (const tag of ["sl-status-badge", "sl-entry-lit-shadow", "sl-pagination-lit-shadow"]) {
          const element = document.querySelector(tag);
          await element.updateComplete;
          const shadow = element.shadowRoot;
          if (shadow?.childElementCount && shadow.adoptedStyleSheets.length) rendered.push(tag);
        }
        const list = document.querySelector("#help [data-keys-list]");
        document.getElementById("help").showModal();
        for (const end = performance.now() + 2000; !list.childElementCount;) {
          if (performance.now() > end) break;
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        const fetched = performance.getEntriesByType("resource").map(({ name }) => name);
        return {
          rendered: rendered.length,
          filled: list.childElementCount > 0,
          help: fetched.find((name) => /keys-help-.*\\.js$/.test(name)) ?? null,
        };
      })()`);
      const shell = version(process.env.BROWSER_EXECUTABLE);
      row(
        `chrome-headless-shell ${shell} renders the built page's three components`,
        loaded.rendered === 3,
        `${loaded.rendered}/3 with adopted sheets`,
      );
      row(
        `chrome-headless-shell ${shell} loads the help chunk, which fills the dialog`,
        loaded.help !== null && loaded.filled,
        `${loaded.help ? new URL(loaded.help).pathname.slice(1) : "no chunk"} fetched; dialog ${loaded.filled ? "filled" : "empty"}`,
      );
    } finally {
      await server.stop();
      await browser.close();
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const date = new Date().toISOString().slice(0, 10);
console.log(`## Measures, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
