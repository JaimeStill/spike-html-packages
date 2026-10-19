// The manifest step of scripts/consumers.sh, run under the column's runtime, node or bun. After
// spike-html-conventions a88828a: scripts/consumers.js, its exports step walking the release's
// exports map by scripts/release.js instead of reading its exact targets alone.
//
//   consumers.js subpaths <installed package directory> <consumer directory>
//       fails unless every installed file (package.json aside) is reachable through the installed
//       manifest's exports, and writes the consumer's subpaths.json, every subpath that reaches
//       an installed file with the files its runtime and types targets name, for the fixture's
//       resolve.js, and subpaths.ts, for tsc, a type import of every subpath with types (a types
//       reference for one whose declaration is a script)

import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listFiles, resolveExport, subpathsOf } from "./release.js";

const [command, installed, consumer] = process.argv.slice(2);

if (command === "subpaths") {
  const { name, exports } = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
  // Each subpath once, with the installed files its runtime and types targets name.
  const entries = new Map();
  const unreached = [];
  for (const file of listFiles(installed).filter((path) => path !== "package.json")) {
    const [reached] = subpathsOf(exports, file);
    if (reached === undefined) {
      unreached.push(file);
      continue;
    }
    const { targets } = resolveExport(exports, reached.subpath);
    const target = (condition) => targets[condition]?.replace(/^\.\//, "") ?? null;
    entries.set(reached.subpath, {
      subpath: reached.subpath,
      runtime: target("default"),
      types: target("types"),
    });
  }
  if (unreached.length > 0) {
    throw new Error(`${installed}: installed files no export reaches: ${unreached.join(", ")}`);
  }
  writeFileSync(
    join(consumer, "subpaths.json"),
    `${JSON.stringify([...entries.values()], null, 2)}\n`,
  );
  // A declaration file with no import or export is a script (css.d.ts, its ambient "*.css"
  // module), which a consumer includes by a types reference; any other is imported as a module.
  const lines = [...entries.values()]
    .filter(({ types }) => types !== null)
    .map(({ subpath, types }, i) => {
      const specifier = `${name}${subpath.slice(1)}`;
      const source = readFileSync(join(installed, types), "utf8");
      return /^(import|export)\b/m.test(source)
        ? `import type * as t${i} from "${specifier}";`
        : `/// <reference types="${specifier}" />`;
    })
    .sort((a, b) => b.startsWith("///") - a.startsWith("///"));
  writeFileSync(
    join(consumer, "subpaths.ts"),
    `// Written by scripts/consumers.js: every subpath with types.\n${lines.join("\n")}\nexport {};\n`,
  );
} else {
  throw new Error(`unknown command ${command}; expected subpaths`);
}
