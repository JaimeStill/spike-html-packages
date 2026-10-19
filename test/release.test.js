// The release build's integrity: scripts/build.sh's dist/ against layers/ and package.json's files
// and exports, by scripts/release.js's releaseProblems. The check runs the build before this tier,
// so the first case reads a fresh emit. The other cases run releaseProblems on scratch copies of
// the working tree (layers/, dist/, package.json) with one fault each, so a checker that passes
// everything fails here: a sheet with no built copy, a module with no emitted .js or .d.ts, an
// export at a missing file, a built file no export reaches, a stray built file, a pattern export
// that reaches nothing, and a build outside files.

import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { releaseProblems, resolveExport, subpathsOf } from "../scripts/release.js";

const root = join(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const scratches = [];

after(() => {
  for (const scratch of scratches) rmSync(scratch, { recursive: true, force: true });
});

/** A scratch copy of the working tree's release inputs, `change` applied to it, and its problems. */
function faulted(change) {
  const scratch = mkdtempSync(join(tmpdir(), "release-"));
  scratches.push(scratch);
  cpSync(join(root, "layers"), join(scratch, "layers"), { recursive: true });
  cpSync(join(root, "dist"), join(scratch, "dist"), { recursive: true });
  const copy = structuredClone(manifest);
  change(scratch, copy);
  writeFileSync(join(scratch, "package.json"), JSON.stringify(copy));
  return releaseProblems(scratch);
}

const remove = (path) => (scratch) => rmSync(join(scratch, path));

describe("release build", () => {
  test("dist/ is the build of layers/ that files and exports declare", () => {
    assert.ok(existsSync(join(root, "dist")), "no dist/; run mise run build first");
    assert.deepEqual(releaseProblems(root), []);
  });

  test("the page entry and every component's module are exported", () => {
    const { exports } = manifest;
    assert.deepEqual(resolveExport(exports, "./foundation/page.css")?.targets, {
      default: "./dist/foundation/page.css",
    });
    assert.deepEqual(resolveExport(exports, "./components/status-badge.js")?.targets, {
      types: "./dist/components/status-badge.d.ts",
      default: "./dist/components/status-badge.js",
    });
    // The formatters are declarations alone: the exact key wins over ./foundation/*.js, so no
    // runtime target is exported for a module that has none.
    assert.deepEqual(resolveExport(exports, "./foundation/format.js")?.targets, {
      types: "./dist/foundation/format.d.ts",
    });
    assert.deepEqual(subpathsOf(exports, "dist/foundation/baseline/tokens/color/flexoki.css"), [
      {
        subpath: "./foundation/baseline/tokens/color/flexoki.css",
        key: "./foundation/*.css",
        condition: "default",
      },
    ]);
  });

  const faults = {
    "a source .css with no built copy": [
      remove("dist/components/status-badge.css"),
      "layers/components/status-badge.css has no built dist/components/status-badge.css",
    ],
    "a .ts module with no emitted .js": [
      remove("dist/foundation/dom.js"),
      "layers/foundation/dom.ts has no built dist/foundation/dom.js",
    ],
    "a .ts module with no emitted .d.ts": [
      remove("dist/foundation/registry.d.ts"),
      "layers/foundation/registry.ts has no built dist/foundation/registry.d.ts",
    ],
    "a .d.ts source with no copy": [
      remove("dist/sdk/auth.d.ts"),
      "layers/sdk/auth.d.ts has no built dist/sdk/auth.d.ts",
    ],
    "an export at a missing file": [
      (_, copy) => (copy.exports["./foundation/gone.css"] = "./dist/foundation/gone.css"),
      'exports["./foundation/gone.css"] default points at ./dist/foundation/gone.css, which isn\'t built',
    ],
    "a pattern export whose other condition is missing": [
      (_, copy) =>
        (copy.exports["./components/*.js"] = {
          types: "./dist/components/*.ts",
          default: "./dist/components/*.js",
        }),
      'exports["./components/status-badge.js"] types points at ./dist/components/status-badge.ts, which isn\'t built',
    ],
    "a built file no export reaches": [
      (_, copy) => delete copy.exports["./components/*.css"],
      "dist/components/entry-shadow.css is reachable through no export",
    ],
    "a stray built file": [
      (scratch) => writeFileSync(join(scratch, "dist/foundation/old.js"), ""),
      "dist/foundation/old.js is built from no source in layers/",
    ],
    "a pattern export that reaches nothing": [
      (_, copy) => (copy.exports["./apps/*.js"] = "./dist/apps/*.js"),
      'exports["./apps/*.js"] reaches no built file',
    ],
    "a build outside files": [
      (_, copy) => (copy.files = ["dist/foundation"]),
      "dist/components/status-badge.js isn't under package.json's files",
    ],
  };
  for (const [name, [change, problem]] of Object.entries(faults)) {
    test(`fails on ${name}`, () => {
      assert.ok(faulted(change).includes(problem), `expected: ${problem}`);
    });
  }
});
