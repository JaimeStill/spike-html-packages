// A consumer's runtime view of the installed releases, run by node or bun from the install: every
// subpath in subpaths.json with a runtime target resolves to it, in the release installed for its
// name, and every types-only one to nothing, each resolved from the directory subpaths.json names:
// the consumer's, or the release's that declares a layer the consumer doesn't. Then the keys grammar
// is imported, by the foundation's package name, from where the foundation is resolved, and run.
// Adapted from spike-html-packages (c2b4a19): test/consumers/resolve.js.

import assert from "node:assert/strict";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const subpaths = JSON.parse(readFileSync(new URL("subpaths.json", import.meta.url), "utf8"));

// A module resolves a bare specifier from its own location, so each directory resolved from gets a
// module of its own that resolves and imports for it.
const resolvers = new Map();
async function resolverIn(from) {
  if (!resolvers.has(from)) {
    const module = join(from, "resolve-from.mjs");
    writeFileSync(
      module,
      "export const resolve = (specifier) => import.meta.resolve(specifier);\n" +
        "export const load = (specifier) => import(specifier);\n",
    );
    resolvers.set(from, await import(pathToFileURL(module)));
  }
  return resolvers.get(from);
}

for (const { name, subpath, installed, from, runtime } of subpaths) {
  const specifier = `${name}${subpath.slice(1)}`;
  const { resolve } = await resolverIn(from);
  if (runtime) {
    const resolved = realpathSync(fileURLToPath(resolve(specifier)));
    assert.equal(resolved, `${installed}/${runtime}`, specifier);
  } else {
    assert.throws(() => resolve(specifier), undefined, `${specifier} resolved`);
  }
}

// The foundation names it ./keys-grammar.js.
const grammar = subpaths.find(({ runtime }) => runtime?.endsWith("/keys-grammar.js"));
assert.ok(grammar, "no installed release exports keys-grammar.js");
const { load } = await resolverIn(grammar.from);
const { parse, stringify } = await load(`${grammar.name}${grammar.subpath.slice(1)}`);
assert.equal(stringify(parse("Control+k g")), "Control+k g");
