// Writes a consumer's subpaths.json for resolve.js: each subpath of each installed release that
// reaches one of its files, with the runtime and types targets it resolves to, the directory it is
// installed in, and the directory it is resolved from: the consumer's, for a release it declares,
// or the installed release's that declares it, for one it reaches only through another, as the
// components alone reach the foundation. Run by scripts/consumers.sh with the consumer, then each
// installed release.
// Adapted from spike-html-packages (c2b4a19): test/consumers/consumers.js, without its tsc and
// license halves.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listFiles, resolveExport, subpathsOf } from "./exports.js";

const [consumer, ...releases] = process.argv.slice(2);

// package.json, LICENSE, and README.md ship beside the exports, not through them; bun's .bun-tag
// is the manager's, not the release's, and consumers.sh holds it to the tag.
const unexported = new Set(["package.json", "LICENSE", "README.md", ".bun-tag"]);

const manifest = (dir) => JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
const declares = (dir, name) => Object.hasOwn(manifest(dir).dependencies ?? {}, name);

const entries = [];
for (const installed of releases) {
  const { name, exports } = manifest(installed);
  const from = [consumer, ...releases].find((dir) => declares(dir, name));
  if (from === undefined) throw new Error(`neither the consumer nor a release declares ${name}`);
  const subpaths = new Map();
  for (const file of listFiles(installed).filter((path) => !unexported.has(path))) {
    for (const { subpath } of subpathsOf(exports, file)) {
      const { targets } = resolveExport(exports, subpath);
      const target = (condition) => targets[condition]?.replace(/^\.\//, "") ?? null;
      subpaths.set(subpath, {
        name,
        subpath,
        installed,
        from,
        runtime: target("default"),
        types: target("types"),
      });
    }
  }
  entries.push(...subpaths.values());
}
writeFileSync(join(consumer, "subpaths.json"), `${JSON.stringify(entries, null, 2)}\n`);
