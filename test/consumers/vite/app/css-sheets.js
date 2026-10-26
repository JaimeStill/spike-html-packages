// A Vite plugin that gives a CSS module script, `import sheet from "./x.css" with { type: "css" }`,
// the module a browser gives it: one constructed CSSStyleSheet, its default export.
// Adapted from spike-html-conventions (a88828a): scripts/css-sheets.js, its header cut.
// From spike-html-packages (c2b4a19): test/fixtures/measure/css-sheets.js.

import { readFile } from "node:fs/promises";

const query = "?css-sheet";
// The virtual module's id: Vite's own CSS handling claims an id ending in .css, so it ends in .js.
const prefix = "\0css-sheet:";
const suffix = ".js";

/** Whether an import or export-from declaration carries `with { type: "css" }`. */
const isSheet = (node) =>
  /\.css$/.test(node.source?.value ?? "") &&
  (node.attributes ?? []).some(
    (a) => (a.key.name ?? a.key.value) === "type" && a.value.value === "css",
  );

/** The plugin, which vite.config.js lists. */
export function cssSheets() {
  let build = false;
  return {
    name: "css-sheets",
    enforce: "pre",
    configResolved(config) {
      build = config.command === "build";
    },
    // Vite 8.3.4 passes no import attributes to resolveId or load, so a transform that runs
    // before Vite's reads them from the importer's syntax tree.
    transform(code, id) {
      if (!/\.[cm]?[jt]s$/.test(id.split("?")[0]) || !code.includes(".css")) return null;
      const lang = /\.[cm]?ts$/.test(id.split("?")[0]) ? "ts" : "js";
      const body = this.parse(code, { lang }).body.filter(isSheet).reverse();
      // Each declaration from its specifier to its end becomes the virtual specifier: the
      // attribute goes, as the module it names is JavaScript now.
      for (const { source, end } of body) {
        const semicolon = code[end - 1] === ";" ? ";" : "";
        const specifier = JSON.stringify(source.value + query);
        code = code.slice(0, source.start) + specifier + semicolon + code.slice(end);
      }
      return body.length > 0 ? { code, map: null } : null;
    },
    async resolveId(source, importer) {
      if (!source.endsWith(query)) return null;
      const resolved = await this.resolve(source.slice(0, -query.length), importer);
      return resolved && prefix + resolved.id + suffix;
    },
    async load(id) {
      if (!id.startsWith(prefix)) return null;
      const path = id.slice(prefix.length, -suffix.length);
      const sheet = (css) => `const sheet = new CSSStyleSheet();\nsheet.replaceSync(${css});\n`;
      // Vite's own ?inline import minifies the sheet as it minifies linked CSS.
      if (build) {
        return `import css from ${JSON.stringify(path + "?inline")};\n${sheet("css")}export default sheet;\n`;
      }
      this.addWatchFile(path);
      return `${sheet(JSON.stringify(await readFile(path, "utf8")))}export default sheet;\n`;
    },
  };
}
