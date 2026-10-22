// The release builds' integrity: each workspace package's build against its package.json's files
// and exports, and its LICENSE against its license, by test/consumers/release.js's releaseProblems,
// on a fresh build of a scratch copy of the workspace and on scratch copies with one fault each.
// It builds into a temporary directory, so it needs no dist/.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { after, before, describe, test } from "node:test";
import { releaseProblems } from "../consumers/release.js";

const root = join(import.meta.dirname, "../..");
const packages = ["foundation", "components", "sdk", "spike-html-packages"];
const one = "spike-html-packages";
const scratches = [];

/** A new temporary directory, removed after the run. */
function scratchDir() {
  const scratch = mkdtempSync(join(tmpdir(), "release-"));
  scratches.push(scratch);
  return scratch;
}

/** Copies the workspace at `from` to `to`, each package's node_modules links as they stand, so a
 * package's siblings resolve within the copy and its other dependencies through the root's
 * node_modules/.pnpm, linked to the repository's. pnpm refuses a root node_modules that is itself
 * a link. */
function copyWorkspace(from, to, { dist }) {
  for (const file of ["package.json", "pnpm-workspace.yaml", "tsconfig.json"]) {
    cpSync(join(from, file), join(to, file));
  }
  cpSync(join(from, "packages"), join(to, "packages"), {
    recursive: true,
    verbatimSymlinks: true,
    filter: (path) => dist || basename(path) !== "dist",
  });
  mkdirSync(join(to, "node_modules"));
  symlinkSync(join(root, "node_modules/.pnpm"), join(to, "node_modules/.pnpm"));
}

// The workspace under test: its sources and manifests, built by scripts/build.sh into its copy.
let release;
before(() => {
  release = scratchDir();
  copyWorkspace(root, release, { dist: false });
  execFileSync(join(root, "scripts/build.sh"), [release]);
});
after(() => {
  for (const scratch of scratches) rmSync(scratch, { recursive: true, force: true });
});

/** A scratch copy of the built workspace, `change` applied to package `name` and its manifest,
 * and that package's problems. */
function faulted(name, change) {
  const scratch = scratchDir();
  copyWorkspace(release, scratch, { dist: true });
  const dir = join(scratch, "packages", name);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  change(dir, manifest);
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest));
  return releaseProblems(dir);
}

const remove = (path) => (dir) => rmSync(join(dir, path));

describe("release build", () => {
  for (const name of packages) {
    test(`a fresh build of ${name} is the release that files and exports declare`, () => {
      assert.deepEqual(releaseProblems(join(release, "packages", name)), []);
    });
  }

  const faults = {
    "a source .css with no built copy": [
      "components",
      remove("dist/status-badge.css"),
      "src/status-badge.css has no built dist/status-badge.css",
    ],
    "a .ts module with no emitted .js": [
      "foundation",
      remove("dist/dom.js"),
      "src/dom.ts has no built dist/dom.js",
    ],
    "a .ts module with no emitted .d.ts": [
      "foundation",
      remove("dist/registry.d.ts"),
      "src/registry.ts has no built dist/registry.d.ts",
    ],
    "a .d.ts source with no copy": [
      "sdk",
      remove("dist/auth.d.ts"),
      "src/auth.d.ts has no built dist/auth.d.ts",
    ],
    "a stray built file": [
      "foundation",
      (dir) => writeFileSync(join(dir, "dist/old.js"), ""),
      "dist/old.js is built from no source",
    ],
    "a sibling's built file the one package lacks": [
      one,
      remove("dist/components/status-badge.css"),
      "@jaimestill/spike-html-packages-components's dist/status-badge.css has no built dist/components/status-badge.css",
    ],
    "a stray file in the one package": [
      one,
      (dir) => writeFileSync(join(dir, "dist/foundation/old.js"), ""),
      "dist/foundation/old.js is built from no source",
    ],
    "a bare sibling specifier left in the one package": [
      one,
      (dir) => {
        const path = join(dir, "dist/components/status-badge.js");
        const source = readFileSync(path, "utf8").replace(
          '"../foundation/dom.js"',
          '"@jaimestill/spike-html-packages-foundation/dom.js"',
        );
        writeFileSync(path, source);
      },
      "dist/components/status-badge.js names @jaimestill/spike-html-packages-foundation/dom.js, a bare sibling specifier",
    ],
    "an export at a missing file": [
      one,
      (_, copy) => (copy.exports["./foundation/gone.css"] = "./dist/foundation/gone.css"),
      'exports["./foundation/gone.css"] default points at ./dist/foundation/gone.css, which isn\'t built',
    ],
    "a pattern export whose other condition is missing": [
      one,
      (_, copy) =>
        (copy.exports["./components/*.js"] = {
          types: "./dist/components/*.ts",
          default: "./dist/components/*.js",
        }),
      'exports["./components/status-badge.js"] types points at ./dist/components/status-badge.ts, which isn\'t built',
    ],
    "a built file no export reaches": [
      one,
      (_, copy) => delete copy.exports["./components/*.css"],
      "dist/components/entry-shadow.css is reachable through no export",
    ],
    "the foundation's declaration reached as a module": [
      "foundation",
      (_, copy) => delete copy.exports["./css.js"],
      'exports["./css.js"] default points at ./dist/css.js, which isn\'t built',
    ],
    "a pattern export that reaches nothing": [
      one,
      (_, copy) => (copy.exports["./apps/*.js"] = "./dist/apps/*.js"),
      'exports["./apps/*.js"] reaches no built file',
    ],
    "a package without its LICENSE": ["components", remove("LICENSE"), "LICENSE is missing"],
    "a LICENSE that isn't Apache 2.0": [
      "sdk",
      (dir) => writeFileSync(join(dir, "LICENSE"), "All rights reserved.\n"),
      "LICENSE isn't the Apache License 2.0",
    ],
    "a package that declares another license": [
      one,
      (_, copy) => (copy.license = "MIT"),
      "package.json declares license MIT, not Apache-2.0",
    ],
    "a build outside files": [
      one,
      (_, copy) => (copy.files = ["dist/foundation"]),
      "dist/components/status-badge.js isn't under package.json's files",
    ],
  };
  for (const [fault, [name, change, problem]] of Object.entries(faults)) {
    test(`fails on ${fault}`, () => {
      const problems = faulted(name, change);
      assert.ok(problems.includes(problem), `expected: ${problem}\ngot: ${problems.join("\n")}`);
    });
  }
});
