// The SDK and the foundation's formatters are declarations alone, and tsc, under tsconfig.json,
// refuses runtime code in a declaration file, run against scratch trees.
// From spike-html-conventions (a88828a): test/declarations.test.js.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

const root = join(import.meta.dirname, "../..");
// The check's own tsc, mise.toml's TypeScript-Go pin, not the typescript package in node_modules.
const tsc = "tsc";

/** Each "path code" tsc reports, sorted, for `files` (paths under layers/ to sources) in scratch. */
function check(files) {
  const scratch = mkdtempSync(join(tmpdir(), "declarations-"));
  try {
    for (const [path, source] of Object.entries(files)) {
      mkdirSync(join(scratch, "layers", path, ".."), { recursive: true });
      writeFileSync(join(scratch, "layers", path), `${source}\n`);
    }
    writeFileSync(
      join(scratch, "tsconfig.json"),
      JSON.stringify({ extends: join(root, "tsconfig.json"), include: ["layers"] }),
    );
    const run = spawnSync(tsc, ["--noEmit", "-p", "."], { cwd: scratch, encoding: "utf8" });
    assert.equal(run.error, undefined, `tsc didn't run: ${run.error}`);
    const errors = [...run.stdout.matchAll(/^layers\/(\S+)\(\d+,\d+\): error (TS\d+)/gm)];
    // An error outside the scratch layers/ (a config tsc can't read, say) would leave the list
    // empty and pass the cases that expect none, so every error tsc reports must be one of these.
    assert.equal(run.stdout.match(/error TS\d+/g)?.length ?? 0, errors.length, run.stdout);
    return errors.map(([, path, code]) => `${path} ${code}`).sort();
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const runtime = {
  "sdk/statement.d.ts": `export interface A {}\nconsole.log("runs");`,
  "sdk/body.d.ts": `export declare function f(): number;\nexport function g(): number { return 1; }`,
  "sdk/binding.d.ts": `let count = 0;`,
  "sdk/method.d.ts": `export declare class C { m(): void { } }`,
  "foundation/format.d.ts": `export declare function formatBytes(bytes: number): string;\nformatBytes(1);`,
};

// skipLibCheck off is the guard: with it on, tsc skips every .d.ts, and these errors with them.
describe("SDK and formatter declarations", () => {
  test("every file in the SDK is a declaration file", () => {
    const files = readdirSync(join(root, "layers", "sdk"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    assert.ok(files.length > 0);
    assert.deepEqual(
      files.filter((name) => !name.endsWith(".d.ts")),
      [],
    );
  });

  // A source beside format.d.ts (format.ts, format.js, ...) is what an import of format.js would
  // resolve to, past the declaration and the check's type-import rule, so none may stand there.
  test("the foundation's formatters are a declaration file alone", () => {
    const formats = readdirSync(join(root, "layers", "foundation")).filter((name) =>
      name.startsWith("format."),
    );
    assert.deepEqual(formats, ["format.d.ts"]);
  });

  test("tsc, under tsconfig.json, refuses runtime code in a declaration file", () => {
    assert.deepEqual(check(runtime), [
      "foundation/format.d.ts TS1036",
      "sdk/binding.d.ts TS1039",
      "sdk/binding.d.ts TS1046",
      "sdk/body.d.ts TS1183",
      "sdk/method.d.ts TS1183",
      "sdk/statement.d.ts TS1036",
    ]);
  });

  test("tsc, under tsconfig.json, checks a declaration file's types", () => {
    assert.deepEqual(check({ "sdk/types.d.ts": `export type A = Missing;` }), [
      "sdk/types.d.ts TS2304",
    ]);
  });

  test("tsc accepts declarations alone", () => {
    assert.deepEqual(
      check({
        "sdk/ok.d.ts": [
          `export interface A { token(): Promise<string | undefined> }`,
          `export type B<T> = { ok: true; data: T } | { ok: false };`,
          `export declare const a: A;`,
          `export declare function f(x: number): string;`,
        ].join("\n"),
      }),
      [],
    );
  });
});
