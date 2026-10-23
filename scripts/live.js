// The releases' facts on GitHub and jsDelivr, and the managers' installs of them from the network,
// as one dated markdown table: the networked evidence the check's offline tier can't reach. It
// fails first, naming each v0.1.0 tag and release asset GitHub doesn't hold, and writes nothing to
// the repository: every fetch and install is in a scratch directory it removes. Each measure is a
// row, yes or no with what it observed; it exits 1 if any row is a no.
//
//   BROWSER_EXECUTABLE=... node scripts/live.js

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "../test/live/browser-pipe.js";
import { serve } from "../test/live/server.js";

// The layers, each its own repository on GitHub, released by the one tag.
const owner = "JaimeStill";
const scope = "@jaimestill/";
const layers = ["foundation", "sdk", "components"];
const repository = (layer) => `spike-html-packages-${layer}`;
const version = "0.1.0";
const tag = `v${version}`;
/** The asset each layer's release holds: pnpm pack's tarball name for its package. */
const asset = (layer) => `${scope.slice(1, -1)}-${repository(layer)}-${version}.tgz`;
const cdn = "https://cdn.jsdelivr.net";
/** A layer's release asset by its GitHub download URL, a dependency a manager installs by. */
const assetURL = (layer) =>
  `https://github.com/${owner}/${repository(layer)}/releases/download/${tag}/${asset(layer)}`;

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(root, "test/consumers");

const scratch = mkdtempSync(join(tmpdir(), "live."));
// git never prompts for credentials: a repository that isn't public fails.
const env = { ...process.env, GIT_TERMINAL_PROMPT: "0" };

/** Runs a command, returning whether it exited 0, its stdout as bytes, and its output, trimmed. */
function run(command, args, { cwd = scratch } = {}) {
  const { status, stdout, stderr } = spawnSync(command, args, {
    cwd,
    env,
    maxBuffer: 1 << 26,
  });
  return { ok: status === 0, stdout, output: `${stdout}${stderr}`.trim() };
}

/** run, without blocking the other rows: an install takes seconds of the network. */
function started(command, args, { cwd = scratch } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env });
    let [stdout, stderr] = ["", ""];
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => resolve({ ok: false, stdout, output: error.message }));
    child.on("close", (status) =>
      resolve({ ok: status === 0, stdout, output: `${stdout}${stderr}`.trim() }),
    );
  });
}

const rows = [];
let failed = false;
const cell = (text) => text.replaceAll("|", "\\|").replaceAll("\n", " ");
/** Adds the measure's row, its result yes or no with what it observed; a measure that throws is a
 * no, naming the error. The row takes its place when the measure starts, so measures run side by
 * side keep their order. */
async function measured(measure, body) {
  const at = rows.push(undefined) - 1;
  let holds, observed;
  try {
    [holds, observed] = await body();
  } catch (error) {
    [holds, observed] = [false, error.message];
  }
  failed ||= !holds;
  rows[at] = `| ${cell(measure)} | ${holds ? "yes" : "no"}: ${cell(observed)} |`;
}

/** Each tag or release asset GitHub doesn't hold, named; none when all six are published. */
function unpublished() {
  const absent = [];
  for (const layer of layers) {
    const repo = `${owner}/${repository(layer)}`;
    if (!run("gh", ["api", `repos/${repo}/git/ref/tags/${tag}`]).ok) {
      absent.push(`the tag ${tag} on ${repo}`);
    }
    const assets = run("gh", [
      ...["api", `repos/${repo}/releases/tags/${tag}`],
      ...["--jq", '.assets[] | select(.state == "uploaded") | .name'],
    ]);
    if (!assets.output.split("\n").includes(asset(layer))) {
      absent.push(`the release asset ${asset(layer)} on ${repo}'s ${tag}`);
    }
  }
  return absent;
}

/** A layer's tree at the tag, each file's path to its bytes, from a depth-1 fetch of the tag into
 * the scratch directory, made once: a bare repository at tags/<layer>, as scripts/installed.sh
 * reads it. */
const tags = join(scratch, "tags");
const trees = new Map();
function tagTree(layer) {
  if (trees.has(layer)) return trees.get(layer);
  const git = join(tags, layer);
  const steps = [
    ["init", "--quiet", "--bare", git],
    [
      ...["-C", git, "fetch", "--quiet", "--depth", "1"],
      `https://github.com/${owner}/${repository(layer)}.git`,
      `refs/tags/${tag}:refs/tags/${tag}`,
    ],
  ];
  for (const args of steps) {
    const step = run("git", args);
    if (!step.ok) throw new Error(`can't fetch ${tag} of ${repository(layer)}: ${step.output}`);
  }
  const paths = run("git", ["-C", git, "ls-tree", "-r", "-z", "--name-only", tag])
    .stdout.toString()
    .split("\0")
    .filter(Boolean);
  const tree = new Map(
    paths.map((path) => [
      path,
      run("git", ["-C", git, "cat-file", "blob", `${tag}:${path}`]).stdout,
    ]),
  );
  trees.set(layer, tree);
  return tree;
}

/** The distinct values of the header across the responses, each in backticks, "none" for a
 * response without it, or "no files" when there are no responses: the SDK's tree is types alone. */
const distinct = (responses, name) =>
  responses.length === 0
    ? "no files"
    : [...new Set(responses.map(({ headers }) => headers.get(name)))]
        .map((value) => (value === null ? "none" : `\`${value}\``))
        .join(", ");

/** jsDelivr's /gh/ at the tag against the tag's tree, byte for byte, with the headers it sends. */
function jsdelivrRow(layer) {
  const base = `${cdn}/gh/${owner}/${repository(layer)}@${tag}/`;
  return measured(`jsDelivr serves ${base} as the tag's tree`, async () => {
    const tree = tagTree(layer);
    const responses = [];
    const paths = [...tree.keys()];
    // Eight at a time: a tree is a few dozen files, and jsDelivr answers each from its cache.
    for (let at = 0; at < paths.length; at += 8) {
      const batch = paths.slice(at, at + 8).map(async (path) => {
        const response = await fetch(base + path);
        const body = Buffer.from(await response.arrayBuffer());
        return {
          path,
          status: response.status,
          headers: response.headers,
          equal: response.ok && body.equals(tree.get(path)),
        };
      });
      responses.push(...(await Promise.all(batch)));
    }
    const equal = responses.filter((response) => response.equal).length;
    const statuses = [...new Set(responses.map(({ status }) => status))].join("/");
    const of = (extension) => responses.filter(({ path }) => path.endsWith(extension));
    const facts = [
      `${equal}/${paths.length} files byte-equal (status ${statuses})`,
      `.js ${distinct(of(".js"), "content-type")}`,
      `.css ${distinct(of(".css"), "content-type")}`,
      `cache-control ${distinct(responses, "cache-control")}`,
      `x-jsd-version ${distinct(responses, "x-jsd-version")}`,
      `x-jsd-version-type ${distinct(responses, "x-jsd-version-type")}`,
    ];
    return [equal === paths.length, facts.join("; ")];
  });
}

/** The import-map page, test/live/import-map.html, from the loopback server in the pinned
 * chrome-headless-shell, which resolves no host but the loopback address and jsDelivr's. */
async function importMapRow(browser, origin) {
  const shell = /\d+(\.\d+)+/.exec(run(process.env.BROWSER_EXECUTABLE, ["--version"]).output)?.[0];
  await measured(
    `chrome-headless-shell ${shell} renders the import-map page from jsDelivr`,
    async () => {
      // A blank page first, so the network events are on before the page's first request.
      const page = await browser.open("about:blank");
      try {
        const origins = new Set();
        await page.cdp("Network.enable");
        page.on("Network.responseReceived", ({ response }) => {
          origins.add(new URL(response.url).origin);
        });
        await page.goto(`${origin}/test/live/import-map.html`);
        const { roots, error } = await page.evaluate("window.report");
        if (error) return [false, error];
        const adopted = roots.every((root) => root.elements > 0 && root.sheets === 3);
        const shared = roots.every((root) => root.reset && root.baseline);
        const foreign = [...origins].filter((at) => at !== origin && at !== cdn);
        const facts = [
          roots.map((root) => `${root.tag} ${root.sheets} sheets`).join(", "),
          `the foundation's reset and elements sheets ${shared ? "the same objects" : "not the same objects"} in every root`,
          `loaded from ${[...origins].map((at) => (at === origin ? "the loopback page" : at)).join(", ")}`,
        ];
        return [adopted && shared && foreign.length === 0, facts.join("; ")];
      } finally {
        await page.close();
      }
    },
  );
}

// The consumers the installs measure, each by its fixture's package.json: the three together, and
// the components alone, which reach the foundation through their own dependency on its tag.
const consumers = ["three", "components"];
const managers = ["npm", "pnpm", "bun"];

/** Each manager's install with no lockfile, into a cache of its own, run from the project so the
 * manager reads the guard in the project's own config file. pnpm's metadata cache (cacheDir)
 * defaults to the home directory: it goes beside the store. */
const installs = {
  npm: (cache) => ["install", "--cache", cache, "--no-audit", "--no-fund"],
  pnpm: (cache) => ["install", "--store-dir", cache, `--config.cache-dir=${cache}`],
  bun: (cache) => ["install", "--cache-dir", cache],
};

/** Each manager's guard over the dependencies the releases are installed by: its least setting,
 * the setting a refusal's error code raises it to, none for any other failure, and the config file
 * it is written to. npm 12 refuses git dependencies under allow-git and tarball URLs under
 * allow-remote, each none, root (the consumer's own), or all, both none by default; pnpm 12 refuses
 * a dependency's git dependency unless blockExoticSubdeps is false; bun 1.4.4 has no guard. */
const steps = ["none", "root", "all"];
const npmRaised = { EALLOWGIT: "allow-git", EALLOWREMOTE: "allow-remote" };
const guards = {
  npm: {
    least: { "allow-git": "none", "allow-remote": "none" },
    raise(setting, code) {
      const key = npmRaised[code];
      const next = key && steps[steps.indexOf(setting[key]) + 1];
      return next ? { ...setting, [key]: next } : null;
    },
    write(project, setting) {
      const lines = Object.entries(setting).map(([key, value]) => `${key}=${value}\n`);
      writeFileSync(join(project, ".npmrc"), lines.join(""));
    },
    name: (setting) =>
      Object.entries(setting)
        .map(([key, value]) => `${key}=${value}`)
        .join(" "),
  },
  pnpm: {
    least: {},
    raise: (setting, code) =>
      code === "ERR_PNPM_EXOTIC_SUBDEP" && !("blockExoticSubdeps" in setting)
        ? { blockExoticSubdeps: false }
        : null,
    write(project, setting) {
      if (!("blockExoticSubdeps" in setting)) return;
      writeFileSync(join(project, "pnpm-workspace.yaml"), "blockExoticSubdeps: false\n");
    },
    name: (setting) => ("blockExoticSubdeps" in setting ? "blockExoticSubdeps: false" : "defaults"),
  },
  bun: { least: {}, raise: () => null, write() {}, name: () => "defaults" },
};

/** The error code a failed install names: npm's `npm error code`, pnpm's ERR_PNPM_ code, or else
 * bun's first error line, or the output's last line. */
function errorCode(output) {
  const code = /^npm error code (\S+)$/m.exec(output) ?? /\b(ERR_PNPM_\w+)/.exec(output);
  if (code) return code[1];
  const line = /^error: (.+)$/m.exec(output)?.[1] ?? output.split("\n").at(-1);
  return line.length > 120 ? `${line.slice(0, 117)}...` : line;
}

const releases = { tag: "at the tags, with no lockfile", asset: "by their release assets' URLs" };

/** The consumer's fixture package.json: the layers at their tags as committed, or each by its
 * release asset's URL. */
function manifest(consumer, manager, by) {
  const fixture = join(fixtures, consumer, manager, "package.json");
  const { description, ...json } = JSON.parse(readFileSync(fixture, "utf8"));
  if (by === "asset") {
    json.dependencies = Object.fromEntries(
      layers
        .filter((layer) => Object.hasOwn(json.dependencies, scope + repository(layer)))
        .map((layer) => [scope + repository(layer), assetURL(layer)]),
    );
  }
  return `${JSON.stringify(json, null, 2)}\n`;
}

/** The consumer installed under the manager from the network, in a scratch project with no
 * lockfile and a fresh scratch cache, its guard tried least first until an install passes; then
 * the install against the tags by scripts/installed.sh. A row with no passing setting, or an
 * install that isn't its tags, is a no. */
function installRow(consumer, manager, by, version) {
  const guard = guards[manager];
  const which = consumer === "three" ? "the three" : "the components alone";
  return measured(`${manager} ${version} installs ${which} ${releases[by]}`, async () => {
    for (const layer of layers) tagTree(layer);
    const refused = [];
    for (let setting = guard.least, n = 0; setting; n++) {
      const project = join(scratch, "installs", `${consumer}-${manager}-${by}-${n}`);
      mkdirSync(project, { recursive: true });
      writeFileSync(join(project, "package.json"), manifest(consumer, manager, by));
      guard.write(project, setting);
      const install = await started(manager, installs[manager](`${project}.cache`), {
        cwd: project,
      });
      if (!install.ok) {
        const code = errorCode(install.output);
        refused.push(`${guard.name(setting)} fails ${code}`);
        setting = guard.raise(setting, code);
        continue;
      }

      const lesser = refused.length > 0 ? `; ${refused.join(", ")}` : "; no lesser setting";
      const check = await started(join(root, "scripts/installed.sh"), [
        ...[manager, project, tags, by],
      ]);
      if (!check.ok) {
        const mismatch = check.output.split("\n").findLast((line) => line.startsWith("installed:"));
        return [false, `${guard.name(setting)} installs it${lesser}; ${mismatch ?? check.output}`];
      }
      const lines = check.stdout.split("\n").map((line) => line.split(" "));
      const found = lines.filter(([kind]) => kind === "foundation");
      const theirs = lines.find(([kind]) => kind === "components-foundation")?.[1];
      const declared = lines.find(
        ([kind, dir]) => kind === "release" && dir.endsWith("-foundation") && dir !== theirs,
      );
      const foundations =
        found.length === 1
          ? "one foundation"
          : `${found.length} foundations${declared ? ": the components resolve theirs to one apart from the consumer's" : ""}`;
      return [
        true,
        `${guard.name(setting)} installs it${lesser}; each layer its ${tag} tree; ${foundations}`,
      ];
    }
    return [false, `no setting installs it: ${refused.join(", ")}`];
  });
}

try {
  const absent = unpublished();
  if (absent.length > 0) {
    console.error(`live: GitHub doesn't hold what the table reads:\n- ${absent.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    await measured(`GitHub holds the three ${tag} tags and their release assets`, () => [
      true,
      layers.map(asset).join(", "),
    ]);

    for (const layer of layers) await jsdelivrRow(layer);

    const browser = await launch({ hosts: [new URL(cdn).hostname] });
    const pages = await serve();
    try {
      await importMapRow(browser, pages.origin);
    } finally {
      await pages.stop();
      await browser.close();
    }

    // Every install side by side: each row's settings in turn, least first.
    const versions = Object.fromEntries(
      managers.map((manager) => [manager, run(manager, ["--version"]).output]),
    );
    await Promise.all(
      ["tag", "asset"].flatMap((by) =>
        consumers.flatMap((consumer) =>
          managers.map((manager) => installRow(consumer, manager, by, versions[manager])),
        ),
      ),
    );

    const date = new Date().toISOString().slice(0, 10);
    console.log(`## Live, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
    if (failed) process.exitCode = 1;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
