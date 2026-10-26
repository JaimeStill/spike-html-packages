// Two release flows for the foundation's next version, 0.1.1, as one dated markdown table: the hand
// flow, a bump of the version and a Keep a Changelog section written by a person; and pnpm's flow,
// `pnpm change` and `pnpm version -r` on a manifest marked "private": true, which pnpm 12 bumps
// offline (unmarked, it takes the unpublished 0.1.0 as a first release and never bumps). Each flow
// runs in a scratch clone of the foundation's main, pushed to a local bare remote that holds its
// tags, and then runs release.yml's own steps, read from the foundation's main: each run: block in
// order, with the env and outputs the workflow wires between them, and a stand-in for each uses:
// step. It reads the network (the clone, mise install, the foundation's install from npmjs), pushes
// nothing to GitHub, writes nothing in the repository, and removes its scratch. It exits 1 when a
// flow can't be set up; a row's no is a measured fact, not a failure.
//
//   node scripts/release-flow.js

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repository = "spike-html-packages-foundation";
const origin = `https://github.com/JaimeStill/${repository}`;
const name = `@jaimestill/${repository}`;
const [from, to] = ["0.1.0", "0.1.1"];
const tag = `v${to}`;
const date = new Date().toISOString().slice(0, 10);
const components = "https://raw.githubusercontent.com/JaimeStill/spike-html-packages-components";
// What a person writes in either flow: the change's one line.
const summary = "The foundation's next patch, cut to measure the release flow.";

const scratch = mkdtempSync(join(tmpdir(), "release-flow."));
// The steps get no token, never prompt, and push nothing to GitHub: a push there is rewritten to a
// path that doesn't exist. Each step's mktemp lands in the scratch directory.
const env = { ...process.env, GIT_TERMINAL_PROMPT: "0", TMPDIR: join(scratch, "tmp") };
for (const variable of ["GH_TOKEN", "GITHUB_TOKEN", "GITHUB_PACKAGES_TOKEN", "MISE_GITHUB_TOKEN"]) {
  delete env[variable];
}
Object.assign(env, {
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: `url.${join(scratch, "github-unreachable")}/.pushInsteadOf`,
  GIT_CONFIG_VALUE_0: "https://github.com/",
  // mise reads the clones' mise.toml without a trust prompt, and records no trust.
  MISE_TRUSTED_CONFIG_PATHS: scratch,
});
mkdirSync(env.TMPDIR);

/** Runs a command, returning whether it exited 0 and its output, trimmed. */
function run(command, args, { cwd = scratch, adding = {} } = {}) {
  const { status, stdout, stderr, error } = spawnSync(command, args, {
    cwd,
    env: { ...env, ...adding },
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });
  return { ok: status === 0, output: (error?.message ?? `${stdout}${stderr}`).trim() };
}

/** run, failing with the command's output when it exits nonzero. */
function must(command, args, options) {
  const result = run(command, args, options);
  if (!result.ok) throw new Error(`${command} ${args.join(" ")}: ${result.output}`);
  return result.output;
}

/** Runs a command in a network namespace of its own, the loopback interface up and nothing else. */
const offline = (command, args, options) =>
  run(
    "unshare",
    ["-rn", "sh", "-c", 'ip link set lo up && exec "$@"', "sh", command, ...args],
    options,
  );

/** The last lines of a command's output, for a row that names why it failed. */
const tail = (output) => output.split("\n").slice(-3).join(" / ");

// The pinned tools, by path, set before the flows: a step under mise exec puts the clone's pins
// first on PATH.
let parseChangelog, pnpm, yq;

/** release.yml as JSON, read by the pinned yq. */
const workflow = (clone) =>
  JSON.parse(must(yq, ["-o=json", ".", join(clone, ".github/workflows/release.yml")]));

/** A ${{ }} expression's value: a step's output, or a secret, which the stand-ins never hold. */
function evaluate(expression, outputs) {
  const step = expression.match(/^steps\.([\w-]+)\.outputs\.([\w-]+)$/);
  if (step) return outputs[step[1]]?.[step[2]] ?? "";
  if (/^secrets\.\w+$/.test(expression)) return "";
  throw new Error(`release.yml's expression ${expression} has no stand-in`);
}
const interpolated = (text, outputs) =>
  String(text).replace(/\$\{\{\s*(.+?)\s*\}\}/g, (_, expression) => evaluate(expression, outputs));
/** A step's if:, the one form release.yml uses: an output compared to a string. */
function holds(condition, outputs) {
  if (condition === undefined) return true;
  const compared = condition.match(/^(\S+)\s*==\s*'([^']*)'$/);
  if (!compared) throw new Error(`release.yml's if: ${condition} has no stand-in`);
  return evaluate(compared[1], outputs) === compared[2];
}

/** release.yml's steps in the clone, at the pushed commit: each step's name and what became of it,
 * the outputs, the step that runs mise run check and what became of it, and, from the release
 * step's stand-in, parse-changelog's extract. */
function released(clone, sha) {
  const steps = workflow(clone).jobs.release.steps;
  const outputs = {};
  const ran = [];
  let [mise, failed, notes, check] = [false, false, null, null];
  for (const [at, step] of steps.entries()) {
    const label = step.name ?? step.uses;
    if (failed || !holds(step.if, outputs)) {
      ran.push(`${label}: not run`);
      continue;
    }
    const action = step.uses?.split("@")[0];
    if (action === "actions/checkout") {
      ran.push(`${label}: the clone`);
    } else if (action === "jdx/mise-action") {
      const installed = run("mise", ["install"], { cwd: clone });
      mise = installed.ok;
      failed = !installed.ok;
      ran.push(
        `${label}: mise install ${installed.ok ? "ran" : `failed (${tail(installed.output)})`}`,
      );
    } else if (action === "taiki-e/create-gh-release-action") {
      // The action strips refs/tags/ and the leading v, then runs parse-changelog on the file.
      const ref = interpolated(step.with.ref, outputs);
      const version = ref.replace(/^refs\/tags\//, "").replace(/^v/, "");
      const changelog = interpolated(step.with.changelog, outputs);
      notes = run(parseChangelog, [changelog, version], { cwd: clone });
      ran.push(`${label}: parse-changelog ${changelog} ${version} ${notes.ok ? "ran" : "failed"}`);
    } else if (step.uses) {
      throw new Error(`release.yml's ${step.uses} has no stand-in`);
    } else if (/\bgh release\b/.test(step.run)) {
      ran.push(`${label}: skipped, it reaches GitHub`);
    } else {
      const [script, output] = [join(scratch, `step-${at}.sh`), join(scratch, `step-${at}.out`)];
      writeFileSync(script, step.run);
      writeFileSync(output, "");
      const adding = {
        ...Object.fromEntries(
          Object.entries(step.env ?? {}).map(([key, value]) => [key, interpolated(value, outputs)]),
        ),
        CI: "true",
        GITHUB_OUTPUT: output,
        GITHUB_SHA: sha,
        GITHUB_WORKSPACE: clone,
      };
      // GitHub's bash for a run: block, under the mise pins once the mise step has run.
      const bash = ["bash", "--noprofile", "--norc", "-eo", "pipefail", script];
      const result = mise
        ? run("mise", ["exec", "--", ...bash], { cwd: clone, adding })
        : run(bash[0], bash.slice(1), { cwd: clone, adding });
      failed = !result.ok;
      if (step.id) {
        outputs[step.id] = Object.fromEntries(
          readFileSync(output, "utf8")
            .split("\n")
            .filter((line) => line.includes("="))
            .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
        );
      }
      ran.push(`${label}: ${result.ok ? "ran" : `failed (${tail(result.output)})`}`);
      if (/^\s*mise run check\s*$/.test(step.run)) check = [result.ok, ran.at(-1)];
    }
  }
  return { ran, outputs, notes, check };
}

const mirror = join(scratch, "foundation.git");

/** A flow's clone of the foundation's main, its origin a bare remote holding main and the tags. */
function cloned(flow) {
  const [remote, clone] = [join(scratch, flow, "remote.git"), join(scratch, flow, "clone")];
  must("git", ["clone", "--quiet", "--bare", mirror, remote]);
  must("git", ["clone", "--quiet", remote, clone]);
  must("git", ["-C", clone, "config", "user.name", "A person"]);
  must("git", ["-C", clone, "config", "user.email", "person@localhost"]);
  return { remote, clone, base: must("git", ["-C", mirror, "rev-parse", "main"]) };
}

/** Replaces the one occurrence of a string in a clone's file, as a person's edit would. */
function edit(clone, file, before, after) {
  const path = join(clone, file);
  const text = readFileSync(path, "utf8");
  if (text.split(before).length !== 2) throw new Error(`${file} doesn't hold ${before} once`);
  writeFileSync(path, text.replace(before, after));
}

/** The clone's changed paths, as git status names them. */
const changed = (clone) =>
  must("git", ["-C", clone, "status", "--porcelain", "--untracked-files=all"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().replace(/^(\S+)\s+/, "$1 "))
    .join(", ");

function committed(clone, message) {
  must("git", ["-C", clone, "add", "--all"]);
  must("git", ["-C", clone, "commit", "--quiet", "-m", message]);
}

/** The hand flow: the version and the changelog's section, links and all, written by a person. */
function handFlow() {
  const { remote, clone, base } = cloned("hand");
  edit(clone, "package.json", `"version": "${from}"`, `"version": "${to}"`);
  edit(
    clone,
    "CHANGELOG.md",
    "## [Unreleased]\n\n",
    `## [Unreleased]\n\n## [${tag}] - ${date}\n\n### Fixed\n\n- ${summary}\n\n`,
  );
  edit(clone, "CHANGELOG.md", `compare/v${from}...HEAD`, `compare/${tag}...HEAD`);
  edit(
    clone,
    "CHANGELOG.md",
    `[v${from}]: ${origin}/releases/tag/v${from}`,
    `[${tag}]: ${origin}/releases/tag/${tag}\n[v${from}]: ${origin}/releases/tag/v${from}`,
  );
  const person = changed(clone);
  committed(clone, `foundation ${tag}`);
  return {
    remote,
    clone,
    base,
    wrote: "nothing: no tool writes before the workflow",
    person: `${person}: the version ${from} -> ${to}, the [${tag}] - ${date} section under ### Fixed, and the compare and tag links`,
    network: "no pnpm step: the person's edits read nothing",
  };
}

/** pnpm's flow: the manifest marked private and the intent's summary by a person; pnpm change and
 * pnpm version -r, each in a namespace with no network, for the rest. */
function pnpmFlow() {
  const { remote, clone, base } = cloned("pnpm");
  edit(
    clone,
    "package.json",
    `"version": "${from}",\n`,
    `"version": "${from}",\n  "private": true,\n`,
  );
  committed(clone, "foundation private");
  const probe = offline("node", [
    "-e",
    "fetch('https://registry.npmjs.org/').then(() => process.exit(0), () => process.exit(1))",
  ]);
  const change = offline(pnpm, ["change", name, "--bump", "patch", "--summary", summary], {
    cwd: clone,
  });
  if (!change.ok) throw new Error(`pnpm change: ${change.output}`);
  const intent = changed(clone);
  committed(clone, "foundation change intent");
  const version = offline(pnpm, ["version", "-r"], { cwd: clone });
  if (!version.ok) throw new Error(`pnpm version -r: ${version.output}`);
  const applied = changed(clone);
  committed(clone, `foundation ${tag}`);
  return {
    remote,
    clone,
    base,
    applied,
    wrote: `pnpm change: ${intent}; pnpm version -r: ${applied}`,
    person: `package.json's "private": true, and pnpm change's arguments: the package, --bump patch, and --summary "${summary}"`,
    network: `${probe.ok ? "yes, the namespace reached registry.npmjs.org" : "no"}: pnpm change and pnpm version -r exit 0 under unshare -rn, the loopback interface alone, where a fetch of registry.npmjs.org fails`,
  };
}

/** The changelog section the flow wrote at the version: its heading, the lines written under it,
 * from the clone's diff against the foundation's main, and the lines either side of it. */
function section(clone, base) {
  const diff = must("git", ["-C", clone, "diff", "-U0", base, "HEAD", "--", "CHANGELOG.md"]);
  const added = diff.split("\n");
  const at = added.findIndex((line) => line.startsWith("+## ") && line.includes(to));
  if (at < 0) return { heading: "none", body: "", between: "" };
  const heading = added[at].slice(1);
  const end = added.findIndex((line, index) => index > at && !line.startsWith("+"));
  const block = added.slice(at + 1, end < 0 ? undefined : end).map((line) => line.slice(1));
  const lines = readFileSync(join(clone, "CHANGELOG.md"), "utf8").split("\n");
  const placed = lines.indexOf(heading);
  const shown = (line = "") => `"${line.length > 40 ? `${line.slice(0, 40)}...` : line}"`;
  const before = lines.slice(0, placed).findLast((line) => line.trim());
  const after = lines.slice(placed + 1 + block.length).find((line) => line.trim());
  return {
    heading,
    form: block.find((line) => line.startsWith("### ")),
    body: block.join("\n").trim(),
    between: `between ${shown(before)} and ${shown(after)}`,
    // The changelog's lines changed outside the section: the hand flow's links.
    elsewhere: added.filter(
      (line, index) => /^[+-](?![+-]{2} )/.test(line) && (index < at || (end >= 0 && index >= end)),
    ).length,
  };
}

/** Whether the bare remote holds an annotated tag on a pack commit, one parent the pushed commit,
 * whose tree is the tarball's package/ file for file. */
function tagged(remote, sha, tarball) {
  const type = run("git", ["-C", remote, "cat-file", "-t", `refs/tags/${tag}`]).output;
  if (type !== "tag") return [false, `${tag} in the bare remote is ${type || "absent"}`];
  const parents = must("git", [
    "-C",
    remote,
    "rev-list",
    "--parents",
    "-n",
    "1",
    `${tag}^{commit}`,
  ]);
  const [commit, ...rest] = parents.split(" ");
  if (rest.join(" ") !== sha) {
    return [false, `${commit}'s parents are ${rest.join(" ")}, not ${sha}`];
  }
  if (!tarball) return [false, "the tag step named no tarball"];
  const [pack, tree] = [join(scratch, "pack"), join(scratch, "tree")];
  rmSync(pack, { recursive: true, force: true });
  rmSync(tree, { recursive: true, force: true });
  mkdirSync(pack);
  mkdirSync(tree);
  must("tar", ["-xzf", tarball, "-C", pack]);
  must("sh", ["-c", 'git -C "$1" archive "$2" | tar -x -C "$3"', "sh", remote, tag, tree]);
  const diff = run("diff", ["-r", join(pack, "package"), tree]);
  const tags = must("git", ["-C", remote, "tag", "-l"]).split("\n").join(", ");
  return [
    diff.ok,
    diff.ok
      ? `annotated ${tag} on ${commit.slice(0, 7)}, its one parent the pushed ${sha.slice(0, 7)}, its tree the tarball's package/ file for file; the remote's tags ${tags}`
      : `the tree and the tarball differ: ${tail(diff.output)}`,
  ];
}

/** Whether pnpm would publish the tree: a publish, in a namespace with no network, to a loopback
 * registry nothing serves, so it ends at a refusal or at the request, and nothing leaves the
 * machine. A --dry-run doesn't measure it: npm's and pnpm's both exit 0 on "private": true. */
function publishable(clone) {
  const publish = offline(
    pnpm,
    ["publish", "--no-git-checks", "--registry", "http://127.0.0.1:9/"],
    {
      cwd: clone,
    },
  );
  const refusal = publish.output.split("\n").find((line) => /marked as private/.test(line));
  if (refusal) return [false, `pnpm publish refuses: ${refusal.replace(/^\W+/, "")}`];
  const request = /publish request failed/.test(publish.output);
  return [
    request,
    request
      ? `pnpm publish passes its checks and sends ${name}@${to}'s request, which the namespace refuses`
      : `pnpm publish ends before the request: ${tail(publish.output)}`,
  ];
}

const rows = [];
const cell = (text) => String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
const row = (measure, result) => rows.push(`| ${cell(measure)} | ${cell(result)} |`);
const yes = ([holds, observed]) => `${holds ? "yes" : "no"}: ${observed}`;

function measure(label, flow) {
  const sha = must("git", ["-C", flow.clone, "rev-parse", "HEAD"]);
  must("git", ["-C", flow.clone, "push", "--quiet", "origin", "HEAD:main"]);
  const version = JSON.parse(readFileSync(join(flow.clone, "package.json"), "utf8")).version;
  const written = section(flow.clone, flow.base);
  const { ran, outputs, notes, check } = released(flow.clone, sha);

  row(`${label}: what the flow wrote`, flow.wrote);
  row(`${label}: what a person wrote`, flow.person);
  row(`${label}: release.yml's steps`, ran.join("; "));
  row(
    `${label}: the version, and the changelog section's form`,
    `${version}; ${written.heading}${written.form ? `, then ${written.form}` : ""}, ${written.between}; ${written.elsewhere} other changelog lines changed`,
  );
  const extracted = notes?.output ?? "";
  const extract = !notes?.ok
    ? [false, notes ? tail(notes.output) : "the release step didn't run"]
    : extracted === written.body
      ? [true, "the section as written, exactly"]
      : extracted.startsWith(written.body)
        ? [
            false,
            `the section as written, then the file's next lines to the next heading, which the release notes would carry: ${extracted.slice(written.body.length).trim().split("\n")[0]} ...`,
          ]
        : [false, `not the section as written: ${extracted.split("\n")[0]} ...`];
  row(`${label}: parse-changelog 0.6.16 extracts ${to}`, yes(extract));
  row(`${label}: pnpm's step read the network`, flow.network);
  row(`${label}: the check is green`, yes(check ?? [false, "not reached"]));
  row(
    `${label}: an annotated ${tag} on a pack commit equal to the tarball, in the bare remote`,
    yes(tagged(flow.remote, sha, outputs.tag?.tarball)),
  );
  row(`${label}: the tree can still be published`, yes(publishable(flow.clone)));
}

/** pnpm propagates a bump only through workspace: ranges: the foundation's workspace holds one
 * project, and the components, in another repository, name the foundation by a peer range and a
 * github: devDependency. */
async function dependents(flow) {
  const listed = JSON.parse(
    must(pnpm, ["list", "-r", "--depth", "-1", "--json"], { cwd: flow.clone }),
  );
  const response = await fetch(`${components}/main/package.json`);
  if (!response.ok) throw new Error(`the components' package.json: status ${response.status}`);
  const manifest = await response.json();
  const specs = ["peerDependencies", "devDependencies"]
    .map((field) => `${field} ${manifest[field]?.[name]}`)
    .join(", ");
  const linked = Object.values({
    ...manifest.dependencies,
    ...manifest.peerDependencies,
    ...manifest.devDependencies,
  }).some((spec) => spec.startsWith("workspace:"));
  row(
    "a dependent repository's bump stays a hand edit",
    yes([
      listed.length === 1 && !linked,
      `the foundation's workspace holds ${listed.length} project, ${listed.map((project) => project.name).join(", ")}; pnpm version -r changed ${flow.applied}, all in the clone; the components' main names the foundation by ${specs}, no workspace: range, so pnpm bumps nothing there`,
    ]),
  );
}

const cleanup = () => rmSync(scratch, { recursive: true, force: true });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    cleanup();
    process.exit(1);
  });
}
try {
  parseChangelog = must("mise", ["which", "parse-changelog"], { cwd: process.cwd() });
  pnpm = must("mise", ["which", "pnpm"], { cwd: process.cwd() });
  yq = must("mise", ["which", "yq"], { cwd: process.cwd() });
  must("git", ["clone", "--quiet", "--bare", `${origin}.git`, mirror]);
  const hand = handFlow();
  measure("hand flow", hand);
  const flow = pnpmFlow();
  measure("pnpm flow", flow);
  await dependents(flow);
  console.log(
    `## Release flow, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`,
  );
} catch (error) {
  console.error(`release-flow: ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanup();
}
