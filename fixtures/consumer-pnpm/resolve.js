// A consumer's runtime resolution of the release, by the package's exports, run with node from
// this directory after the offline install. subpaths.json, which scripts/consumers.js writes from
// the installed package, lists every subpath that reaches a shipped file, with the files its
// runtime and types targets name: a subpath with a runtime target must resolve to that installed
// file, and one with types alone (the SDK,
// the formatters, the CSS module script declaration) must not resolve at runtime at all. Then a
// DOM-free module is imported and run, so the emitted .js loads as well as resolves.

import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const name = "spike-html-packages";
const column = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")).name;
const subpaths = JSON.parse(readFileSync(new URL("subpaths.json", import.meta.url), "utf8"));
const installed = realpathSync(fileURLToPath(new URL(`node_modules/${name}/`, import.meta.url)));
let resolved = 0;

for (const { subpath, runtime } of subpaths) {
  const specifier = `${name}${subpath.slice(1)}`;
  if (runtime) {
    const url = import.meta.resolve(specifier);
    assert.equal(realpathSync(fileURLToPath(url)), `${installed}/${runtime}`, specifier);
    resolved += 1;
  } else {
    assert.throws(
      () => import.meta.resolve(specifier),
      undefined,
      `${specifier} resolved at runtime`,
    );
  }
}

const { parse, stringify } = await import(`${name}/foundation/keys-grammar.js`);
assert.equal(stringify(parse("Control+k g")), "Control+k g");
console.log(
  `${column}: ${resolved} runtime subpaths resolved; imported ${name}/foundation/keys-grammar.js`,
);
