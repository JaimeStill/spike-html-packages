// The releases' facts on GitHub and jsDelivr, and the managers' installs of them from the network
// and from GitHub Packages, as one dated markdown table: the networked evidence the check's offline
// tier can't reach. It fails first, naming the token variable when it is unset, and each v0.1.0 tag
// and release asset GitHub doesn't hold, and each package GitHub Packages doesn't hold at 0.0.1 or
// doesn't make public. It writes nothing to the repository: every fetch and install is in a scratch
// directory it removes. Each measure is a row, yes or no with what it observed; it exits 1 if any
// row is a no.
//
//   GITHUB_PACKAGES_TOKEN=$(gh auth token) BROWSER_EXECUTABLE=... node scripts/live.js
//
// The token is read from the environment and never written to a file: npm's and bun's project
// config hold a reference to the variable, and pnpm takes it from its own environment.

import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "../test/live/browser-pipe.js";
import { serve } from "../test/live/server.js";
import { listFiles } from "../test/consumers/exports.js";

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
// The layers on GitHub Packages, scripts/publish.sh's publishes of the tags, read with gh's token.
const registry = "https://npm.pkg.github.com";
const registryHost = new URL(registry).host;
const published = "0.0.1";
const tokenVariable = "GITHUB_PACKAGES_TOKEN";
const token = process.env[tokenVariable];
if (!token) {
  console.error(
    `live: ${tokenVariable} is unset; run ${tokenVariable}=$(gh auth token) mise run live`,
  );
  process.exit(1);
}

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

/** run, without blocking the other rows: an install takes seconds of the network. `adding` is
 * environment for this command alone. */
function started(command, args, { cwd = scratch, adding = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env: { ...env, ...adding } });
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

/** Each layer's 0.0.1 publish time in GitHub Packages' metadata, null where it names none: filled
 * by unpublished() and read by the pnpm rows, whose minimum release age reads the same field. */
const publishTimes = new Map();

/** Each tag or release asset GitHub doesn't hold, and each package GitHub Packages doesn't hold at
 * 0.0.1 or make public, named; none when all six are published and the three packages public. */
async function unpublished() {
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

    const name = scope + repository(layer);
    const response = await fetch(`${registry}/${name.replace("/", "%2f")}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const metadata = response.ok ? await response.json() : {};
    if (!Object.hasOwn(metadata.versions ?? {}, published)) {
      absent.push(`${name}@${published} on GitHub Packages (status ${response.status})`);
    }
    publishTimes.set(layer, metadata.time?.[published] ?? null);
    const visibility = run("gh", [
      ...["api", `users/${owner}/packages/npm/${repository(layer)}`],
      ...["--jq", ".visibility"],
    ]);
    if (visibility.output !== "public") {
      const is = visibility.ok ? visibility.output : "not found";
      absent.push(`${name} public on GitHub Packages: it is ${is}`);
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
 * manager reads the guard in the project's own config file, and through scripts/unconfigured.sh so
 * it reads none of the user's own: a row's "defaults" are the manager's. pnpm's metadata cache
 * (cacheDir) defaults to the home directory: it goes beside the store. */
const unconfigured = join(root, "scripts/unconfigured.sh");
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

const releases = {
  tag: "at the tags, with no lockfile",
  asset: "by their release assets' URLs",
  registry: `from GitHub Packages at ${published}`,
};

/** The consumer's fixture package.json: the layers at their tags as committed, each by its
 * release asset's URL, or each at exactly its GitHub Packages version. */
function manifest(consumer, manager, by) {
  const fixture = join(fixtures, consumer, manager, "package.json");
  const { description, ...json } = JSON.parse(readFileSync(fixture, "utf8"));
  if (by === "asset") {
    json.dependencies = Object.fromEntries(
      layers
        .filter((layer) => Object.hasOwn(json.dependencies, scope + repository(layer)))
        .map((layer) => [scope + repository(layer), assetURL(layer)]),
    );
  } else if (by === "registry") {
    json.dependencies = Object.fromEntries(
      Object.keys(json.dependencies).map((name) => [name, published]),
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
      const args = [manager, ...installs[manager](`${project}.cache`)];
      const install = await started(unconfigured, args, { cwd: project });
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

/** The settings a GitHub Packages install is tried under, least first: none; the @jaimestill
 * registry alone; then the registry and the token. npm reads both from a project .npmrc, the token
 * by a reference to its variable, which npm expands; bun from bunfig.toml's install.scopes, whose
 * token takes a $VARIABLE; pnpm the registry from the .npmrc and the token from its environment
 * alone, let through scripts/unconfigured.sh (which says why). */
const registrySettings = [
  "no registry setting",
  "the registry alone",
  "the registry and the token",
];
const registryScope = scope.slice(0, -1);
function writeRegistry(project, manager, step) {
  if (step === 0) return;
  if (manager === "bun") {
    const auth = step === 2 ? `, token = "$${tokenVariable}"` : "";
    writeFileSync(
      join(project, "bunfig.toml"),
      `[install.scopes]\n"${registryScope}" = { url = "${registry}"${auth} }\n`,
    );
    return;
  }
  const lines = [`${registryScope}:registry=${registry}\n`];
  if (manager === "npm" && step === 2) {
    lines.push(`//${registryHost}/:_authToken=\${${tokenVariable}}\n`);
  }
  // After the guard's .npmrc, if npm's guard wrote one.
  appendFileSync(join(project, ".npmrc"), lines.join(""));
}

/** What pnpm's minimum release age did to an install, from GitHub Packages' publish times and
 * pnpm's output: it skips a version whose metadata names no publish time, under
 * minimumReleaseAgeIgnoreMissingTime; it falls back, outside minimumReleaseAgeStrict, by adding a
 * version younger than the age to minimumReleaseAgeExclude and installing it; or it doesn't apply. */
function releaseAge(output) {
  const times = [...publishTimes].map(([layer, time]) => `${layer} ${time ?? "none"}`).join(", ");
  const missing = [...publishTimes].filter(([, time]) => time === null).map(([layer]) => layer);
  if (missing.length > 0) {
    return `pnpm's minimum release age skipped ${missing.join(", ")}, which name no publish time (${times})`;
  }
  const excluded = /Added (\d+) entr\w+ to minimumReleaseAgeExclude/.exec(output);
  return excluded
    ? `pnpm's minimum release age fell back: it added ${excluded[1]} versions to minimumReleaseAgeExclude, published ${times}`
    : `pnpm's minimum release age didn't apply: published ${times}`;
}

/** Row e: the consumer installed under the manager from GitHub Packages, each layer at exactly
 * 0.0.1, in a scratch project with no lockfile and a fresh scratch cache, the manager's guard and
 * the registry settings tried least first: a refusal raises the guard as installRow raises it, and
 * any other failure the registry setting, the guard kept where it stands. Resolves
 * `installed` to the project that installed, or null, for row f. */
function registryRow(consumer, manager, version) {
  const guard = guards[manager];
  const which = consumer === "three" ? "the three" : "the components alone";
  let done;
  const installed = new Promise((resolve) => (done = resolve));
  const row = measured(`${manager} ${version} installs ${which} ${releases.registry}`, async () => {
    try {
      const refused = [];
      let [setting, step] = [guard.least, 0];
      for (let n = 0; ; n++) {
        const project = join(scratch, "installs", `${consumer}-${manager}-registry-${n}`);
        mkdirSync(project, { recursive: true });
        writeFileSync(join(project, "package.json"), manifest(consumer, manager, "registry"));
        guard.write(project, setting);
        writeRegistry(project, manager, step);
        const pnpmToken = manager === "pnpm" && step === 2;
        const args = [
          ...(pnpmToken ? ["--github-packages-token"] : []),
          ...[manager, ...installs[manager](`${project}.cache`)],
        ];
        const adding = pnpmToken ? { [`pnpm_config_//${registryHost}/:_authToken`]: token } : {};
        const install = await started(unconfigured, args, { cwd: project, adding });
        const named =
          setting === guard.least
            ? registrySettings[step]
            : `${registrySettings[step]}, ${guard.name(setting)}`;
        if (!install.ok) {
          const code = errorCode(install.output);
          refused.push(`${named} fails ${code}`);
          const raised = guard.raise(setting, code);
          if (raised) setting = raised;
          else if (step < registrySettings.length - 1) step++;
          else return [false, `no setting installs it: ${refused.join(", ")}`];
          continue;
        }
        done(project);
        const facts = [
          `${registrySettings[step]} installs it`,
          refused.length > 0 ? refused.join(", ") : "no lesser setting",
          setting === guard.least
            ? `the git guard at its least (${guard.name(setting)})`
            : `git guard ${guard.name(setting)}`,
          ...(manager === "pnpm" ? [releaseAge(install.output)] : []),
        ];
        return [true, facts.join("; ")];
      }
    } finally {
      done(null);
    }
  });
  return { row, installed };
}

/** Row f: the install row e made, against the tags by scripts/installed.sh, its manifests held to
 * the registry's exception; then every export subpath resolved by package name, by
 * test/consumers/resolve.js under node for npm and pnpm and bun for bun, with the .css each layer
 * installs. */
function registryTreeRow(consumer, manager, version, installed) {
  const which = consumer === "three" ? "the three" : "the components alone";
  const runtime = manager === "bun" ? "bun" : "node";
  return measured(
    `${manager} ${version}'s install of ${which} ${releases.registry} is each layer's ${tag} tree and resolves under ${runtime}`,
    async () => {
      const project = await installed;
      if (project === null) return [false, "row e installed nothing to check"];
      for (const layer of layers) tagTree(layer);
      const check = await started(join(root, "scripts/installed.sh"), [
        ...[manager, project, tags, "registry"],
      ]);
      if (!check.ok) {
        const mismatch = check.output.split("\n").findLast((line) => line.startsWith("installed:"));
        return [false, mismatch ?? check.output];
      }
      const dirs = check.stdout
        .split("\n")
        .filter((line) => line.startsWith("release "))
        .map((line) => line.slice("release ".length));

      const steps = [
        [runtime, [join(fixtures, "consumers.js"), project, ...dirs]],
        [runtime, ["resolve.js"]],
      ];
      copyFileSync(join(fixtures, "resolve.js"), join(project, "resolve.js"));
      for (const [command, args] of steps) {
        const step = await started(command, args, { cwd: project });
        if (!step.ok) return [false, `${runtime} ${args[0]} fails: ${errorCode(step.output)}`];
      }
      const subpaths = JSON.parse(readFileSync(join(project, "subpaths.json"), "utf8"));
      const css = dirs.map((dir) => {
        const { name } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        const files = listFiles(dir).filter((path) => path.endsWith(".css"));
        const layer = name.slice((scope + repository("")).length);
        return `${layer} ${files.length > 0 ? files.join(", ") : "none"}`;
      });
      const byName = subpaths.find(({ runtime: target }) => target?.endsWith(".css"));
      const facts = [
        `each layer its ${tag} tree but its manifest, which differs only in version ${published} and the components' foundation dependency ${published}`,
        "one foundation, the one the components resolve to",
        "no devDependency",
        `all ${subpaths.length} export subpaths resolve under ${runtime} as their exports name them, types-only ones to nothing`,
        `.css installed: ${css.join("; ")}`,
        byName
          ? `${byName.name}${byName.subpath.slice(1)} resolves by package name to its ${byName.runtime}`
          : "no .css subpath",
      ];
      return [byName !== undefined, facts.join("; ")];
    },
  );
}

try {
  const absent = await unpublished();
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
    // A row takes its place when it starts: the tags' and assets' rows, then rows e, each GitHub
    // Packages install, then rows f, each install's trees once row e has made it.
    const pairs = consumers.flatMap((consumer) => managers.map((manager) => [consumer, manager]));
    const installed = ["tag", "asset"].flatMap((by) =>
      pairs.map(([consumer, manager]) => installRow(consumer, manager, by, versions[manager])),
    );
    const registryInstalls = pairs.map(([consumer, manager]) =>
      registryRow(consumer, manager, versions[manager]),
    );
    const registryTrees = pairs.map(([consumer, manager], at) =>
      registryTreeRow(consumer, manager, versions[manager], registryInstalls[at].installed),
    );
    await Promise.all([...installed, ...registryInstalls.map(({ row }) => row), ...registryTrees]);

    const date = new Date().toISOString().slice(0, 10);
    console.log(`## Live, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
    if (failed) process.exitCode = 1;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
