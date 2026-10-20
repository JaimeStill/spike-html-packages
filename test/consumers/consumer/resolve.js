// A consumer's runtime view of the installed release, run by node or bun from the install: every
// subpath in subpaths.json with a runtime target resolves to it, and every types-only one to
// nothing. Then one module is imported and run.

import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const name = "spike-html-packages";
const subpaths = JSON.parse(readFileSync(new URL("subpaths.json", import.meta.url), "utf8"));
const installed = realpathSync(fileURLToPath(new URL(`node_modules/${name}/`, import.meta.url)));

for (const { subpath, runtime } of subpaths) {
  const specifier = `${name}${subpath.slice(1)}`;
  if (runtime) {
    const resolved = realpathSync(fileURLToPath(import.meta.resolve(specifier)));
    assert.equal(resolved, `${installed}/${runtime}`, specifier);
  } else {
    assert.throws(() => import.meta.resolve(specifier), undefined, `${specifier} resolved`);
  }
}

const { parse, stringify } = await import(`${name}/foundation/keys-grammar.js`);
assert.equal(stringify(parse("Control+k g")), "Control+k g");
