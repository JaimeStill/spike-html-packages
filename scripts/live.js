// The releases' facts on GitHub and jsDelivr, and the managers' installs of them from the network
// and from GitHub Packages, as one dated markdown table: the networked evidence the check's offline
// tier can't reach. The releases are the layers' latest tags, the foundation's and the SDK's v0.1.0
// and the components' v0.2.0, whose components name the foundation as a peer. It fails first,
// naming the token variable when it is unset, each tag and release asset GitHub doesn't hold, each
// package GitHub Packages doesn't hold at its tag's version or doesn't make public, and each 0.0.1
// it still holds. It writes nothing to the repository: every fetch and install is in a scratch
// directory it removes. Each measure is a row, yes or no with what it observed; it exits 1 if any
// row is a no.
//
// The rows: the tags and assets; jsDelivr's /gh/ of each tag, and the import-map page from it; each
// consumer installed under each manager at the tags, by the release assets, and from GitHub
// Packages, each install against the tags file for file; the page and the Vite build of each asset
// and GitHub Packages install, on one foundation; and the components alone, no foundation declared,
// from each hosting, against what each manager was measured to do.
//
//   GITHUB_PACKAGES_TOKEN=$(gh auth token) BROWSER_EXECUTABLE=... node scripts/live.js
//
// The token is read from the environment and never written to a file: npm's and bun's project
// config hold a reference to the variable, and pnpm takes it from its own environment.

import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "../test/live/browser-pipe.js";
import { followInstall } from "../test/live/installed-map.js";
import { serve } from "../test/live/server.js";
import { listFiles } from "../test/consumers/exports.js";

// The layers, each its own repository on GitHub, each released by its latest tag, the one
// scripts/consumers.sh and scripts/preflight.sh name it by.
const owner = "JaimeStill";
const scope = "@jaimestill/";
const layers = ["foundation", "sdk", "components"];
const repository = (layer) => `spike-html-packages-${layer}`;
const tags = { foundation: "v0.1.0", sdk: "v0.1.0", components: "v0.2.0" };
const versionOf = (layer) => tags[layer].slice(1);
const tagsNamed = layers.map((layer) => `${layer} ${tags[layer]}`).join(", ");
/** The layer a package name names. */
const layerOf = (name) => name.slice((scope + repository("")).length);
/** The asset each layer's release holds: pnpm pack's tarball name for its package. */
const asset = (layer) => `${scope.slice(1, -1)}-${repository(layer)}-${versionOf(layer)}.tgz`;
const cdn = "https://cdn.jsdelivr.net";
/** A layer's release asset by its GitHub download URL, a dependency a manager installs by. */
const assetURL = (layer) =>
  `https://github.com/${owner}/${repository(layer)}/releases/download/${tags[layer]}/${asset(layer)}`;
// The layers on GitHub Packages, scripts/publish.sh's publishes of the tags, each at its tag's
// version, read with gh's token; 0.0.1, the publishes before them, are deleted.
const registry = "https://npm.pkg.github.com";
const registryHost = new URL(registry).host;
const retired = "0.0.1";
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

/** Each layer's publish time at its tag's version in GitHub Packages' metadata, null where it names
 * none: filled by unpublished() and read by the pnpm rows, whose minimum release age reads the
 * same field. */
const publishTimes = new Map();

/** Each tag or release asset GitHub doesn't hold, each package GitHub Packages doesn't hold at its
 * tag's version or make public, and each 0.0.1 it still holds, named; none when all six are
 * published, the three packages public, and no 0.0.1 left. */
async function unpublished() {
  const absent = [];
  for (const layer of layers) {
    const [repo, tag, version] = [`${owner}/${repository(layer)}`, tags[layer], versionOf(layer)];
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
    if (!Object.hasOwn(metadata.versions ?? {}, version)) {
      absent.push(`${name}@${version} on GitHub Packages (status ${response.status})`);
    }
    if (Object.hasOwn(metadata.versions ?? {}, retired)) {
      absent.push(`${name}@${retired} deleted from GitHub Packages: it is still there`);
    }
    publishTimes.set(layer, metadata.time?.[version] ?? null);
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

/** A layer's tree at its tag, each file's path to its bytes, from a depth-1 fetch of the tag into
 * the scratch directory, made once: a bare repository at tags/<layer>, as scripts/installed.sh
 * and test/consumers/pages.js read it. */
const fetched = join(scratch, "tags");
const trees = new Map();
function tagTree(layer) {
  if (trees.has(layer)) return trees.get(layer);
  const [git, tag] = [join(fetched, layer), tags[layer]];
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
  const base = `${cdn}/gh/${owner}/${repository(layer)}@${tags[layer]}/`;
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
// the components with the foundation, the peer they leave to the consumer. Each has a Vite
// fixture, test/consumers/vite/<consumer>/, whose dependencies are its own with Vite beside them.
// The components alone, with no foundation declared, are the components fixture without it.
const consumers = ["three", "components"];
const described = {
  three: "the three",
  components: "the components and the foundation, their peer,",
  alone: "the components alone, no foundation declared,",
};
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
  registry: "from GitHub Packages at the tags' versions",
};

/** The consumer's fixture package.json, its devDependencies kept: the layers at their tags as
 * committed, each by its release asset's URL, or each at exactly its tag's version on GitHub
 * Packages. `vite/<consumer>` is the consumer's Vite fixture; `alone` the components fixture
 * without the foundation. */
function manifest(consumer, manager, by) {
  const fixture = join(fixtures, consumer === "alone" ? "components" : consumer, manager);
  const { description, ...json } = JSON.parse(readFileSync(join(fixture, "package.json"), "utf8"));
  if (consumer === "alone") delete json.dependencies[scope + repository("foundation")];
  for (const name of Object.keys(json.dependencies).filter((name) => name.startsWith(scope))) {
    if (by === "asset") json.dependencies[name] = assetURL(layerOf(name));
    else if (by === "registry") json.dependencies[name] = versionOf(layerOf(name));
  }
  return `${JSON.stringify(json, null, 2)}\n`;
}

/** Runs the task once fewer than `limit` others are running: the installs, a few dozen, each read
 * the network, and GitHub's codeload and release downloads are spared them all at once. */
function limiter(limit) {
  let active = 0;
  const waiting = [];
  return async (task) => {
    while (active >= limit) await new Promise((resolve) => waiting.push(resolve));
    active++;
    try {
      return await task();
    } finally {
      active--;
      waiting.shift()?.();
    }
  };
}
const limited = limiter(12);
/** One browser task at a time: each page and Vite build launches a browser of its own. */
const serially = limiter(1);

/** The consumer installed under the manager from the network, in a scratch project with no
 * lockfile and a fresh scratch cache, run from the project so the manager reads the guard in the
 * project's own config file, and through scripts/unconfigured.sh so it reads none of the user's
 * own. The manager's guard is tried least first, a refusal raising it; from GitHub Packages, the
 * registry settings are too, least first, any other failure raising the registry setting, the
 * guard kept where it stands. Resolves to the project and its settings, ok when an install passed,
 * or to the last project tried and the error that stopped it. */
async function attempt(consumer, manager, by) {
  const guard = guards[manager];
  const refused = [];
  const last = by === "registry" ? registrySettings.length - 1 : 0;
  let [setting, step] = [guard.least, 0];
  for (let n = 0; ; n++) {
    const name = `${consumer.replace("/", "-")}-${manager}-${by}-${n}`;
    const project = join(scratch, "installs", name);
    mkdirSync(project, { recursive: true });
    writeFileSync(join(project, "package.json"), manifest(consumer, manager, by));
    guard.write(project, setting);
    if (by === "registry") writeRegistry(project, manager, step);
    const pnpmToken = by === "registry" && manager === "pnpm" && step === 2;
    const args = [
      ...(pnpmToken ? ["--github-packages-token"] : []),
      ...[manager, ...installs[manager](`${project}.cache`)],
    ];
    const adding = pnpmToken ? { [`pnpm_config_//${registryHost}/:_authToken`]: token } : {};
    const install = await limited(() => started(unconfigured, args, { cwd: project, adding }));
    const settings =
      by !== "registry"
        ? guard.name(setting)
        : setting === guard.least
          ? registrySettings[step]
          : `${registrySettings[step]}, ${guard.name(setting)}`;
    if (!install.ok) {
      const code = errorCode(install.output);
      refused.push(`${settings} fails ${code}`);
      const raised = guard.raise(setting, code);
      if (raised) setting = raised;
      else if (step < last) step++;
      else return { ok: false, project, code, refused };
      continue;
    }
    const lesser = refused.length > 0 ? refused.join(", ") : "no lesser setting";
    return { ok: true, project, settings, setting, step, lesser, output: install.output };
  }
}

/** The install against the tags by scripts/installed.sh: resolves to its lines, or throws naming
 * the mismatch. */
async function checked(manager, project, by) {
  for (const layer of layers) tagTree(layer);
  const check = await started(join(root, "scripts/installed.sh"), [
    ...[manager, project, fetched, by],
  ]);
  if (!check.ok) {
    const mismatch = check.output.split("\n").findLast((line) => line.startsWith("installed:"));
    throw new Error(mismatch ?? check.output);
  }
  const lines = check.stdout.split("\n").map((line) => line.split(" "));
  return {
    releases: lines.filter(([kind]) => kind === "release").map(([, dir]) => dir),
    foundations: lines.filter(([kind]) => kind === "foundation").map(([, dir]) => dir),
    theirs: lines.find(([kind]) => kind === "components-foundation")?.[1],
  };
}

/** The foundations an installed.sh check found, counted, and whether the components resolve
 * theirs to one apart from the consumer's. */
function foundationCount({ releases: dirs, foundations, theirs }) {
  if (foundations.length === 1) return "one foundation";
  const apart = dirs.some((dir) => dir.endsWith("-foundation") && dir !== theirs);
  return `${foundations.length} foundations${apart ? ": the components resolve theirs to one apart from the consumer's" : ""}`;
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

/** The consumer installed at the tags or by the release assets (attempt()), then against the tags
 * by scripts/installed.sh: each layer its tag's tree, file for file, its manifest included, and
 * one foundation. A row with no passing setting, an install that isn't its tags, or a second
 * foundation is a no. Resolves `installed` to the project and the foundation the components
 * resolve, or null, for the page row. */
function installRow(consumer, manager, by, version) {
  let done;
  const installed = new Promise((resolve) => (done = resolve));
  const row = measured(
    `${manager} ${version} installs ${described[consumer]} ${releases[by]}`,
    async () => {
      try {
        const install = await attempt(consumer, manager, by);
        if (!install.ok) return [false, `no setting installs it: ${install.refused.join(", ")}`];
        const found = await checked(manager, install.project, by);
        done({ project: install.project, foundation: found.theirs });
        const facts = [
          `${install.settings} installs it`,
          install.lesser,
          "each layer its tag's tree, its manifest included",
          foundationCount(found),
        ];
        return [found.foundations.length === 1, facts.join("; ")];
      } finally {
        done(null);
      }
    },
  );
  return { row, installed };
}

/** Row e: the consumer installed from GitHub Packages, each layer at exactly its tag's version
 * (attempt()). Resolves `installed` to the project that installed, or null, for row f and the
 * page row. */
function registryRow(consumer, manager, version) {
  const guard = guards[manager];
  let done;
  const installed = new Promise((resolve) => (done = resolve));
  const row = measured(
    `${manager} ${version} installs ${described[consumer]} ${releases.registry}`,
    async () => {
      try {
        const install = await attempt(consumer, manager, "registry");
        if (!install.ok) return [false, `no setting installs it: ${install.refused.join(", ")}`];
        done({ project: install.project });
        const facts = [
          `${registrySettings[install.step]} installs it`,
          install.lesser,
          install.setting === guard.least
            ? `the git guard at its least (${guard.name(install.setting)})`
            : `git guard ${guard.name(install.setting)}`,
          ...(manager === "pnpm" ? [releaseAge(install.output)] : []),
        ];
        return [true, facts.join("; ")];
      } finally {
        done(null);
      }
    },
  );
  return { row, installed };
}

/** Row f: the install row e made, against the tags by scripts/installed.sh, file for file, its
 * manifests included: each is its tag's pack, unchanged; then every export subpath resolved by
 * package name, by test/consumers/resolve.js under node for npm and pnpm and bun for bun, with the
 * .css each layer installs. Resolves `installed` to the project and its foundation, or null, for
 * the page row. */
function registryTreeRow(consumer, manager, version, made) {
  const runtime = manager === "bun" ? "bun" : "node";
  let done;
  const installed = new Promise((resolve) => (done = resolve));
  const row = measured(
    `${manager} ${version}'s install of ${described[consumer]} ${releases.registry} is each layer's tag tree and resolves under ${runtime}`,
    async () => {
      try {
        const { project } = (await made) ?? {};
        if (project === undefined) return [false, "row e installed nothing to check"];
        const found = await checked(manager, project, "registry");
        done({ project, foundation: found.theirs });

        const steps = [
          [runtime, [join(fixtures, "consumers.js"), project, ...found.releases]],
          [runtime, ["resolve.js"]],
        ];
        copyFileSync(join(fixtures, "resolve.js"), join(project, "resolve.js"));
        for (const [command, args] of steps) {
          const step = await started(command, args, { cwd: project });
          if (!step.ok) return [false, `${runtime} ${args[0]} fails: ${errorCode(step.output)}`];
        }
        const subpaths = JSON.parse(readFileSync(join(project, "subpaths.json"), "utf8"));
        const css = found.releases.map((dir) => {
          const { name } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
          const files = listFiles(dir).filter((path) => path.endsWith(".css"));
          return `${layerOf(name)} ${files.length > 0 ? files.join(", ") : "none"}`;
        });
        const byName = subpaths.find(({ runtime: target }) => target?.endsWith(".css"));
        const facts = [
          "each layer its tag's tree, its manifest included",
          "one foundation, the one the components resolve to",
          "no devDependency",
          `all ${subpaths.length} export subpaths resolve under ${runtime} as their exports name them, types-only ones to nothing`,
          `.css installed: ${css.join("; ")}`,
          byName
            ? `${byName.name}${byName.subpath.slice(1)} resolves by package name to its ${byName.runtime}`
            : "no .css subpath",
        ];
        return [byName !== undefined, facts.join("; ")];
      } finally {
        done(null);
      }
    },
  );
  return { row, installed };
}

/** The last line of a runner's output that names what it checked or why it failed. */
const said = (output, prefix) =>
  output.split("\n").findLast((line) => line.startsWith(`${prefix}:`)) ?? output;

/** The page and the Vite build of a release-asset or GitHub Packages install, each by its own
 * runner. The page is test/consumers/pages/ copied into the install its row made, its manager's
 * import map rewritten to the install's directories (test/live/installed-map.js), loaded by
 * test/consumers/pages.js; the build is the consumer's Vite fixture installed as the row's was
 * (attempt()), checked against the tags, test/consumers/vite/app/ copied in, built and loaded by
 * test/consumers/vite.js --build. Each must render every root adopting the reset and elements
 * sheets the page or app imports, from the loopback address alone; a second foundation makes the
 * row a no, as either runner's sheet check finds it. */
function loadRow(consumer, manager, by, version, made) {
  return measured(
    `${manager} ${version}'s install of ${described[consumer]} ${releases[by]} loads on one foundation in its page and its Vite build`,
    async () => {
      const install = await made;
      if (install === null) return [false, "its install row installed nothing to load"];
      cpSync(join(fixtures, "pages"), join(install.project, "pages"), { recursive: true });
      followInstall(install.project, manager);
      const page = await serially(() =>
        started("node", [
          ...[join(fixtures, "pages.js"), fetched],
          ...[manager, consumer, install.project, install.foundation],
        ]),
      );
      if (!page.ok) return [false, `the page: ${said(page.output, "pages")}`];
      const rendered = /renders (.+?) from (\d+) files/.exec(
        said(page.output.split("\n")[0], "pages"),
      );

      const vite = await attempt(`vite/${consumer}`, manager, by);
      if (!vite.ok) {
        return [false, `the Vite fixture: no setting installs it: ${vite.refused.join(", ")}`];
      }
      const found = await checked(manager, vite.project, by);
      if (found.foundations.length !== 1) {
        return [false, `the Vite fixture's install holds ${foundationCount(found)}`];
      }
      const viteVersion = JSON.parse(
        readFileSync(join(vite.project, "node_modules/vite/package.json"), "utf8"),
      ).version;
      cpSync(join(fixtures, "vite/app"), vite.project, { recursive: true });
      const build = await serially(() =>
        started("node", [
          ...[join(fixtures, "vite.js"), "--build"],
          ...[manager, consumer, vite.project, found.theirs],
        ]),
      );
      if (!build.ok) return [false, `the Vite build: ${said(build.output, "vite")}`];
      const built = /from (\d+) files/.exec(said(build.output, "vite"));
      const facts = [
        `the page renders ${rendered?.[1]} from ${rendered?.[2]} files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation`,
        `Vite ${viteVersion}'s build of the app, its fixture installed under ${vite.settings} with each layer its tag's tree and one foundation, renders them from ${built?.[1]} files, every root adopting the sheets the app imports`,
      ];
      return [true, facts.join("; ")];
    },
  );
}

/** Each distinct directory the foundation is installed in below the project's node_modules, as
 * scripts/installed.sh's installs_of finds them. */
function foundationsIn(project) {
  const modules = join(project, "node_modules");
  if (!existsSync(modules)) return [];
  const name = scope + repository("foundation");
  const found = run("find", [modules, "-path", `*/node_modules/${name}`, "-prune", "-print0"]);
  const dirs = found.stdout.toString().split("\0").filter(Boolean);
  return [...new Set(dirs.map((dir) => realpathSync(dir)))];
}

/** What each manager does with the components alone, no foundation declared, by hosting, as
 * measured on 2026-10-26 (npm 12.2.1, pnpm 12.15.0, bun 1.4.4): from the tags and the release
 * assets each looks the peer up on npmjs, which holds no @jaimestill package, and fails 404, so
 * the components get no foundation; from GitHub Packages, the @jaimestill registry holds the
 * foundation at 0.1.0, which the peer's ^0.1.0 admits, and each installs it as the peer: one
 * foundation, the one the components resolve. `none` is a failed install or one that holds no
 * foundation; `peer` is an install whose one foundation is the peer, each layer its tag's tree. */
const alone = {
  tag: { npm: "none", pnpm: "none", bun: "none" },
  asset: { npm: "none", pnpm: "none", bun: "none" },
  registry: { npm: "peer", pnpm: "peer", bun: "peer" },
};
const outcomes = {
  none: "it gives the components no foundation",
  peer: "it installs the foundation as their peer",
};

/** The components alone, no foundation declared, installed under the manager from the hosting
 * (attempt()): yes when the manager does what it was measured to do, in `alone`, naming the error
 * a failed install stops on and what it leaves in node_modules. */
function aloneRow(manager, by, version) {
  const expected = alone[by][manager];
  return measured(
    `${manager} ${version} installs ${described.alone} ${releases[by]}: ${outcomes[expected]}`,
    async () => {
      const install = await attempt("alone", manager, by);
      const foundations = foundationsIn(install.project);
      if (!install.ok) {
        const components = existsSync(
          join(install.project, "node_modules", scope + repository("components")),
        );
        const left = `${components ? "the components" : "no components"} and ${foundations.length === 0 ? "no foundation" : `${foundations.length} foundations`}`;
        const facts = [
          `no setting installs it: ${install.refused.join(", ")}`,
          `it stops on ${install.code}, leaving ${left} in node_modules`,
        ];
        return [expected === (foundations.length === 0 ? "none" : "other"), facts.join("; ")];
      }
      if (foundations.length === 0) {
        return [expected === "none", `${install.settings} installs it with no foundation`];
      }
      const found = await checked(manager, install.project, by);
      const peer = JSON.parse(readFileSync(join(found.theirs, "package.json"), "utf8")).version;
      const facts = [
        `${by === "registry" ? registrySettings[install.step] : install.settings} installs it`,
        install.lesser,
        `the foundation ${peer} as their peer, one foundation, the one the components resolve`,
        "each layer its tag's tree",
      ];
      return [expected === "peer" && found.foundations.length === 1, facts.join("; ")];
    },
  );
}

try {
  const absent = await unpublished();
  if (absent.length > 0) {
    console.error(`live: GitHub doesn't hold what the table reads:\n- ${absent.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    await measured(
      `GitHub holds the layers' latest tags (${tagsNamed}) and their release assets; GitHub Packages each at its tag's version, public, and no ${retired}`,
      () => [true, layers.map(asset).join(", ")],
    );

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
    // A row takes its place when it starts: the tags' and assets' rows; rows e, each GitHub
    // Packages install, then rows f, each install's trees once row e has made it; the page and
    // Vite rows, each once its install's row has made and checked it; the components alone.
    const pairs = consumers.flatMap((consumer) => managers.map((manager) => [consumer, manager]));
    const byTag = pairs.map(([consumer, manager]) =>
      installRow(consumer, manager, "tag", versions[manager]),
    );
    const byAsset = pairs.map(([consumer, manager]) =>
      installRow(consumer, manager, "asset", versions[manager]),
    );
    const registryInstalls = pairs.map(([consumer, manager]) =>
      registryRow(consumer, manager, versions[manager]),
    );
    const registryTrees = pairs.map(([consumer, manager], at) =>
      registryTreeRow(consumer, manager, versions[manager], registryInstalls[at].installed),
    );
    const loads = [
      ...pairs.map(([consumer, manager], at) =>
        loadRow(consumer, manager, "asset", versions[manager], byAsset[at].installed),
      ),
      ...pairs.map(([consumer, manager], at) =>
        loadRow(consumer, manager, "registry", versions[manager], registryTrees[at].installed),
      ),
    ];
    const alones = ["tag", "asset", "registry"].flatMap((by) =>
      managers.map((manager) => aloneRow(manager, by, versions[manager])),
    );
    await Promise.all([
      ...[...byTag, ...byAsset, ...registryInstalls, ...registryTrees].map(({ row }) => row),
      ...loads,
      ...alones,
    ]);

    const date = new Date().toISOString().slice(0, 10);
    console.log(`## Live, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`);
    if (failed) process.exitCode = 1;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
