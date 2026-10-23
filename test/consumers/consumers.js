// Writes a consumer's subpaths.json for resolve.js: each subpath of each installed release that
// reaches one of its files, with the runtime and types targets it resolves to. Run by
// scripts/consumers.sh with the consumer, then each installed release.
// Adapted from spike-html-packages (c2b4a19): test/consumers/consumers.js, without its tsc and
// license halves.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listFiles, resolveExport, subpathsOf } from "./exports.js";

const [consumer, ...releases] = process.argv.slice(2);

// package.json, LICENSE, and README.md ship beside the exports, not through them; bun's .bun-tag
// is the manager's, not the release's, and consumers.sh holds it to the tag.
const unexported = new Set(["package.json", "LICENSE", "README.md", ".bun-tag"]);

const entries = [];
for (const installed of releases) {
  const { name, exports } = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
  const subpaths = new Map();
  for (const file of listFiles(installed).filter((path) => !unexported.has(path))) {
    for (const { subpath } of subpathsOf(exports, file)) {
      const { targets } = resolveExport(exports, subpath);
      const target = (condition) => targets[condition]?.replace(/^\.\//, "") ?? null;
      subpaths.set(subpath, { name, subpath, runtime: target("default"), types: target("types") });
    }
  }
  entries.push(...subpaths.values());
}
writeFileSync(join(consumer, "subpaths.json"), `${JSON.stringify(entries, null, 2)}\n`);
