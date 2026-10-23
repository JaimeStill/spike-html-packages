// The releases' facts on GitHub and jsDelivr, as one dated markdown table: the networked evidence
// the check's offline tier can't reach. It fails first, naming each v0.1.0 tag and release asset
// GitHub doesn't hold, and writes nothing to the repository: every fetch is in a scratch
// directory it removes. Each measure is a row, yes or no with what it observed; it exits 1 if any
// row is a no.
//
//   BROWSER_EXECUTABLE=... node scripts/live.js

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const rows = [];
let failed = false;
const cell = (text) => text.replaceAll("|", "\\|").replaceAll("\n", " ");
/** Adds the measure's row, its result yes or no with what it observed; a measure that throws is a
 * no, naming the error. */
async function measured(measure, body) {
  let holds, observed;
  try {
    [holds, observed] = await body();
  } catch (error) {
    [holds, observed] = [false, error.message];
  }
  failed ||= !holds;
  rows.push(`| ${cell(measure)} | ${holds ? "yes" : "no"}: ${cell(observed)} |`);
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
 * the scratch directory, made once. */
const trees = new Map();
function tagTree(layer) {
  if (trees.has(layer)) return trees.get(layer);
  const git = join(scratch, "git", repository(layer));
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

    const date = new Date().toISOString().slice(0, 10);
    console.log(`## Live, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
    if (failed) process.exitCode = 1;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
