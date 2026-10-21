// A consumer's runtime view of the installed releases, run by node or bun from the install: every
// subpath in subpaths.json with a runtime target resolves to it, in the release its name installs,
// and every types-only one to nothing. Then the keys grammar is imported and run.

import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const subpaths = JSON.parse(readFileSync(new URL("subpaths.json", import.meta.url), "utf8"));
const installed = (name) =>
  realpathSync(fileURLToPath(new URL(`node_modules/${name}/`, import.meta.url)));

for (const { name, subpath, runtime } of subpaths) {
  const specifier = `${name}${subpath.slice(1)}`;
  if (runtime) {
    const resolved = realpathSync(fileURLToPath(import.meta.resolve(specifier)));
    assert.equal(resolved, `${installed(name)}/${runtime}`, specifier);
  } else {
    assert.throws(() => import.meta.resolve(specifier), undefined, `${specifier} resolved`);
  }
}

// The one package names it ./foundation/keys-grammar.js, the foundation ./keys-grammar.js.
const grammar = subpaths.find(({ runtime }) => runtime?.endsWith("/keys-grammar.js"));
const { parse, stringify } = await import(`${grammar.name}${grammar.subpath.slice(1)}`);
assert.equal(stringify(parse("Control+k g")), "Control+k g");
