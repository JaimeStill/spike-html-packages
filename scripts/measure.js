// The README's Measures as two dated markdown tables, in a scratch directory it removes, reading no
// network. The import extension's facts: it copies the one package's build (mise run build), builds
// a Vite page beside it, and loads the page in the pinned chrome-headless-shell. The layer
// violations' catchers: it lints test/unit/layers-tree.js's violation tree, then installs the tree
// as a workspace under each package manager's layout, offline from copies of the caches mise run
// install warms in .cache/consumers/, and has tsc or node resolve each case's import.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { launch } from "../test/browser/support/browser-pipe.js";
import { serve } from "../test/browser/support/server.js";
import { listFiles } from "../test/consumers/release.js";
import {
  externals,
  extraneous,
  lint,
  manifests,
  relativePackages,
  sources,
  table,
  uncaught,
  violations,
  writeTree,
} from "../test/unit/layers-tree.js";

const root = join(import.meta.dirname, "..");
const one = join(root, "packages/spike-html-packages");
const grammarSource = "packages/foundation/src/keys-grammar.ts";
const keysSource = "packages/foundation/src/keys.ts";
const fixture = join(root, "test/fixtures/measure");
const scratch = mkdtempSync(join(tmpdir(), "measure."));
const dist = join(scratch, "dist");
const rows = [];
const layoutRows = [];

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

// The install layouts: each manager's offline install of the workspace, from its cache in
// `cache`. npm has no workspace: protocol, so its copies declare each sibling by version.
const offline = ["--offline", "--no-audit", "--no-fund"];
const layouts = [
  {
    name: "pnpm",
    manager: "pnpm",
    args: (cache) => ["--store-dir", cache, `--config.cache-dir=${cache}`, "--offline"],
  },
  { name: "npm hoisted", manager: "npm", args: (cache) => ["--cache", cache, ...offline] },
  {
    name: "npm linked",
    manager: "npm",
    args: (cache) => ["--cache", cache, ...offline, "--install-strategy=linked"],
  },
  {
    name: "bun isolated",
    manager: "bun",
    args: (cache) => ["--cache-dir", cache, "--offline", "--linker", "isolated"],
  },
];

// One case per edge: a forms() edge by its side-effect import, the other three forms left out, and
// the uncaught edge, four forms of one value import, by the first.
const cases = {
  ...sources(
    Object.fromEntries(
      Object.entries(violations).filter(
        ([path]) => !/\/forms\/.*-(type|export|dynamic)\.ts$/.test(path),
      ),
    ),
  ),
  ...Object.fromEntries(Object.entries(uncaught).slice(0, 1)),
};
// tsc judges a type import, which has no runtime; node, which runs the sources unbuilt, judges the
// rest.
const judge = (source) => (source.startsWith("import type") ? "tsc" : "node");
// tsc's codes for an import it can't resolve, and node's, each by what it says of the import.
const tscUnresolved = ["TS2307", "TS2792", "TS2834", "TS2835"];
const nodeUnresolved = {
  ERR_MODULE_NOT_FOUND: "not found",
  ERR_PACKAGE_PATH_NOT_EXPORTED: "not exported",
  ERR_UNSUPPORTED_DIR_IMPORT: "a directory",
};

/** The workspace's manifests for `manager`'s copy: the root's devDependencies cut to the two the
 * cases import, each a packed stub in stubs/, and for npm and bun a workspaces field, which pnpm
 * reads from pnpm-workspace.yaml. With `plain`, each workspace: spec becomes the sibling's version. */
function layoutManifests(manager, plain) {
  const versions = Object.fromEntries(Object.values(manifests).map((m) => [m.name, m.version]));
  return Object.fromEntries(
    Object.entries(manifests).map(([dir, manifest]) => {
      const copy = structuredClone(manifest);
      if (!dir) {
        copy.devDependencies = {
          eslint: "file:stubs/eslint.tgz",
          typescript: "file:stubs/typescript.tgz",
        };
        if (manager !== "pnpm") copy.workspaces = ["packages/*"];
      }
      for (const field of ["dependencies", "devDependencies"]) {
        for (const [name, spec] of Object.entries(copy[field] ?? {})) {
          if (plain && spec.startsWith("workspace:")) copy[field][name] = versions[name];
        }
      }
      return [dir, copy];
    }),
  );
}

/** Writes the cases under `dir` for `manager`, with the stubs packed beside them. */
function writeLayout(dir, manager, plain) {
  writeTree(dir, cases, { manifests: layoutManifests(manager, plain), link: false });
  if (manager === "pnpm") {
    copyFileSync(join(root, "pnpm-workspace.yaml"), join(dir, "pnpm-workspace.yaml"));
  }
  for (const name of ["eslint", "typescript"]) {
    const stub = join(dir, "stubs", name, "package");
    mkdirSync(stub, { recursive: true });
    for (const [path, source] of Object.entries(externals[name])) {
      writeFileSync(join(stub, path), source);
    }
    const manifest = JSON.parse(externals[name]["package.json"]);
    manifest.version = manifests[""].devDependencies[name];
    writeFileSync(join(stub, "package.json"), JSON.stringify(manifest));
    const packed = run("tar", [
      "-czf",
      join(dir, "stubs", `${name}.tgz`),
      "-C",
      dirname(stub),
      "package",
    ]);
    if (!packed.ok) throw new Error(`tar: ${packed.output}`);
    rmSync(dirname(stub), { recursive: true });
  }
}

/** Installs `dir` by `layout`, from its manager's cache under `caches`. */
function install({ manager, args }, dir, caches) {
  const flag = { pnpm: "--dir", npm: "--prefix", bun: "--cwd" }[manager];
  return run(manager, ["install", flag, dir, ...args(join(caches, manager))], dir);
}

/** Each case by what `judge` says resolving its import under `dir`: the reason it can't, or "". */
function resolveCases(dir) {
  const found = {};
  const typed = Object.keys(cases).filter((path) => judge(cases[path]) === "tsc");
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({ extends: join(root, "tsconfig.json"), include: typed }),
  );
  const checked = run("tsc", ["-p", dir, "--pretty", "false"], dir).output;
  for (const path of typed) {
    const errors = checked.split("\n").filter((line) => line.startsWith(`${path}(`));
    found[path] = tscUnresolved.find((code) => errors.some((line) => line.includes(code))) ?? "";
  }
  for (const path of Object.keys(cases).filter((path) => !typed.includes(path))) {
    const ran = run("node", [join(dir, path)], dir);
    const code = ran.ok ? undefined : ran.output.match(/code: '(ERR_\w+)'/)?.[1];
    found[path] = nodeUnresolved[code] ?? "";
  }
  return found;
}

/** The layer violations' table: each case's catchers by the lint and by each install layout. Its
 * own scratch directory, since a node_modules above an install, as the first table's link to the one
 * package's, would resolve what the layout leaves out. */
function measureLayouts() {
  const scratch = mkdtempSync(join(tmpdir(), "measure-layouts."));
  try {
    for (let dir = dirname(scratch); dir !== dirname(dir); dir = dirname(dir)) {
      if (existsSync(join(dir, "node_modules"))) throw new Error(`${dir} holds a node_modules`);
    }
    layoutTable(scratch);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Fills layoutRows from installs under `scratch`. */
function layoutTable(scratch) {
  const caches = join(scratch, "caches");
  for (const manager of ["pnpm", "npm", "bun"]) {
    const cache = join(root, ".cache/consumers", manager);
    if (!existsSync(cache)) throw new Error(`${cache} is missing; run mise run install`);
    cpSync(cache, join(caches, manager), { recursive: true });
  }

  const linted = join(scratch, "lint");
  writeTree(linted, { ...sources(violations), ...uncaught });
  const rules = {};
  for (const file of lint(linted)) {
    rules[file.filePath.slice(linted.length + 1)] = new Set(file.messages.map((m) => m.ruleId));
  }

  const results = {};
  for (const layout of layouts) {
    const dir = join(scratch, layout.name.replace(" ", "-"));
    writeLayout(dir, layout.manager, layout.manager === "npm");
    const installed = install(layout, dir, caches);
    if (!installed.ok)
      throw new Error(`${layout.name} can't install offline:\n${installed.output}`);
    results[layout.name] = resolveCases(dir);
  }

  // npm on the manifests pnpm and bun install, workspace:* specs and all.
  const declared = join(scratch, "npm-workspace");
  writeLayout(declared, "npm", false);
  const refused = install(layouts[1], declared, caches);
  const gap = refused.ok
    ? "npm installs the workspace:* specs"
    : `npm refuses the workspace:* specs (${refused.output.split("\n").find((line) => /workspace:/.test(line)) ?? firstError(refused.output)}), so its copies declare each sibling by its version, ${manifests["packages/foundation"].version}`;

  const names = layouts.map(({ name }) => name);
  const yes = (reason) => (reason ? `yes: ${reason}` : "no");
  layoutRows.push(
    `| case | import | resolved by | table | manifest rules | ${names.join(" | ")} |`,
    `| --- | --- | --- | --- | --- | ${names.map(() => "---").join(" | ")} |`,
  );
  for (const [path, source] of Object.entries(cases)) {
    const by = rules[path] ?? new Set();
    const manifest = [extraneous, relativePackages]
      .filter((rule) => by.has(rule))
      .map((rule) => rule.replace("import-x/", ""))
      .join(", ");
    const cells = [
      path.replace(/^packages\//, ""),
      `\`${source}\``,
      judge(source),
      by.has(table) ? "yes" : "no",
      yes(manifest),
      ...names.map((name) => yes(results[name][path])),
    ];
    layoutRows.push(`| ${cells.join(" | ")} |`);
  }
  layoutRows.push("", `${gap}.`);
}

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
measureLayouts();

const date = new Date().toISOString().slice(0, 10);
console.log(`## Measures, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
console.log(`\n## Layer violations, ${date}\n\n${layoutRows.join("\n")}`);
