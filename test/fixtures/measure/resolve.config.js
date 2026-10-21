// The measure's Vite judge of an install layout: a build of the layout's root, its entries the
// cases in MEASURE_CASES, each a path under the root. A pre plugin hands each import a case makes to
// the rest of Vite's resolvers, records what they say, and marks the import external, so one case's
// failure stops no other and nothing past the case loads. It writes nothing but MEASURE_RESOLVED,
// a JSON object of each case by its import's resolution: the reason Vite can't, or "".

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const cases = JSON.parse(process.env.MEASURE_CASES ?? "[]");

/** Why Vite's resolver can't resolve an import, by its error's message: the package's exports
 * leave the subpath out, or, failing that, the message's cause, or its first line. */
const reason = (message) =>
  /is not exported under the conditions|^Missing ".*" specifier in ".*" package/m.test(message)
    ? "not exported"
    : (message.match(/Caused by:\s*\n\s*(.+)/)?.[1] ?? message.split("\n")[0]);

/** The judge: each case's import, through Vite's resolvers after this one. */
function judge() {
  const found = {};
  let paths = {};
  return {
    name: "measure-judge",
    enforce: "pre",
    configResolved({ root }) {
      paths = Object.fromEntries(cases.map((path) => [join(root, path), path]));
    },
    async resolveId(source, importer, options) {
      const path = importer && paths[importer];
      if (!path) return null;
      try {
        const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
        found[path] = !resolved ? "not found" : resolved.external ? "external" : "";
      } catch (error) {
        found[path] = reason(error.message);
      }
      return { id: source, external: true };
    },
    buildEnd() {
      writeFileSync(process.env.MEASURE_RESOLVED, JSON.stringify(found));
    },
  };
}

export default {
  plugins: [judge()],
  cacheDir: ".vite",
  logLevel: "silent",
  // As node's type stripping does, keep an import whose bindings go unused.
  oxc: { typescript: { onlyRemoveTypeImports: true } },
  build: { write: false, rollupOptions: { input: cases } },
};
