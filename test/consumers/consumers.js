// Writes a consumer's subpaths.json, each subpath of each installed release with its runtime and
// types targets, for resolve.js, and subpaths.ts, a type import of each typed subpath, for tsc.
// Fails if an installed file is reachable through no export. Run by scripts/consumers.sh with the
// consumer, then each installed release: the one package, or the three layer packages.

import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listFiles, resolveExport, subpathsOf } from "./release.js";

const [consumer, ...releases] = process.argv.slice(2);

// Each release's subpaths once, with the installed files its runtime and types targets name, and
// the installed directory each was found in.
const entries = [];
const installedOf = new Map();
for (const installed of releases) {
  const { name, exports } = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
  const subpaths = new Map();
  const unreached = [];
  for (const file of listFiles(installed).filter((path) => path !== "package.json")) {
    const [reached] = subpathsOf(exports, file);
    if (reached === undefined) {
      unreached.push(file);
      continue;
    }
    const { targets } = resolveExport(exports, reached.subpath);
    const target = (condition) => targets[condition]?.replace(/^\.\//, "") ?? null;
    subpaths.set(reached.subpath, {
      name,
      subpath: reached.subpath,
      runtime: target("default"),
      types: target("types"),
    });
  }
  if (unreached.length > 0) {
    throw new Error(`${installed}: installed files no export reaches: ${unreached.join(", ")}`);
  }
  for (const entry of subpaths.values()) installedOf.set(entry, installed);
  entries.push(...subpaths.values());
}
writeFileSync(join(consumer, "subpaths.json"), `${JSON.stringify(entries, null, 2)}\n`);
// A declaration file with no import or export is a script (css.d.ts, its ambient "*.css"
// module), which a consumer includes by a types reference; any other is imported as a module.
const lines = entries
  .filter(({ types }) => types !== null)
  .map((entry, i) => {
    const specifier = `${entry.name}${entry.subpath.slice(1)}`;
    const source = readFileSync(join(installedOf.get(entry), entry.types), "utf8");
    return /^(import|export)\b/m.test(source)
      ? `import type * as t${i} from "${specifier}";`
      : `/// <reference types="${specifier}" />`;
  })
  .sort((a, b) => b.startsWith("///") - a.startsWith("///"));
writeFileSync(
  join(consumer, "subpaths.ts"),
  `// Written by consumers.js: every subpath with types.\n${lines.join("\n")}\nexport {};\n`,
);
