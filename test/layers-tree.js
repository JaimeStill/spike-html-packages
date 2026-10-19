// adapted from spike-html-conventions a88828a: test/layers-tree.js, its cases cut to the layers
// this repository packages (the foundation, the components, and the SDK) and to the files directly
// in layers/, without the apps' rows eslint.config.js leaves out.
//
// The layer tree's direction cases, as files: one tree of violations, one import per file and a
// file per forbidden edge and per import form, and one of allowed imports in the same layout.
// test/layers.test.js runs eslint.config.js's layer rules over them. Each maps a path under the
// repository root to its source, one line or several, without the trailing newline.
//
// The check's rule (eslint-plugin-boundaries) classifies the file an import resolves to, and a
// specifier that resolves to nothing fails no-unresolved, so each tree is written with the files
// its imports name: see targets below.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** This package's own name, which every layer refuses. */
export const self = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8"),
).name;

/** An edge in each of the four import forms, one file per form, each named for the edge and its
 * form: a side-effect import, a type import, a re-export, and an import(). */
function forms(base, specifier) {
  return {
    [`${base}.ts`]: `import "${specifier}";`,
    [`${base}-type.ts`]: `import type { X } from "${specifier}";`,
    [`${base}-export.ts`]: `export * from "${specifier}";`,
    [`${base}-dynamic.ts`]: `await import("${specifier}");`,
  };
}

// Each file holds one import. The violating files are named for the edge they cross.
export const violations = {
  // foundation: native only, no layer and no package
  "layers/foundation/lit.ts": `import { html } from "lit";`,
  "layers/foundation/components.ts": `import "../components/badge.js";`,
  "layers/foundation/sdk-export.ts": `export { Client } from "../sdk/client.js";`,
  "layers/foundation/self.ts": `import { define } from "${self}/layers/foundation/dom.js";`,
  ...forms("layers/foundation/forms/components", "../../components/badge.js"),
  ...forms("layers/foundation/forms/sdk", "../../sdk/client.js"),
  // components: never the SDK
  "layers/components/sdk.ts": `import { Client } from "../sdk/client.js";`,
  "layers/components/sdk-dynamic.ts": `const sdk = await import("../sdk/client.js");`,
  "layers/components/sdk-dir.ts": `import "../sdk";`,
  "layers/components/nested/sdk.ts": `import "../../sdk/client.js";`,
  "layers/components/self.ts": `import "${self}";`,
  "layers/components/absolute.ts": `import "/layers/sdk/client.js";`,
  ...forms("layers/components/forms/sdk", "../../sdk/client.js"),
  // the same edge by a path that isn't normalized, climbing back through a name, a . or ..
  // segment, or an empty one, which a re-allowed layer prefix would otherwise let through
  "layers/components/foundation-climb.ts": `import "../foundation/../sdk/client.js";`,
  "layers/components/dot-segment.ts": `import "../foundation/./../sdk/client.js";`,
  "layers/components/empty-segment.ts": `import "../foundation//../sdk/client.js";`,
  "layers/components/percent.ts": `import "../foundation/%2e%2e/sdk/client.js";`,
  // SDK: never components
  "layers/sdk/components.ts": `import { StatusBadge } from "../components/status-badge.js";`,
  "layers/sdk/components-type.ts": `import type { StatusBadge } from "../components/status-badge.js";`,
  "layers/sdk/self.ts": `import "${self}/layers/components/status-badge.js";`,
  ...forms("layers/sdk/forms/components", "../../components/status-badge.js"),
  // outside a layer directory: a file there could re-export any layer
  "layers/index.ts": `export * from "./sdk/client.js";`,
};

// The same layout, every import one the layer may make, in each form, with names that hold dots,
// which a rule must tell from . and .. segments.
export const allowed = {
  "layers/foundation/dom.ts": `export { x } from "./events.js";`,
  "layers/foundation/nested/own.ts": `import type { X } from "../dom.js";\nawait import("../../foundation/dom.js");`,
  "layers/foundation/nested/index.ts": `import "..";\nexport * from "./";`,
  "layers/components/badge.ts": [
    `import { html, LitElement } from "lit";`,
    `import { define } from "../foundation/dom.js";`,
    `export { x } from "./other.js";`,
  ].join("\n"),
  "layers/sdk/client.ts": [
    `import type { ReactiveController } from "lit";`,
    `import { emit } from "../foundation/dom.js";`,
    `await import("./api.js");`,
  ].join("\n"),
  "layers/components/dotted.ts": `import "./..x/y.js";\nimport "../foundation/x..y/z.js";`,
  "layers/sdk/dotted.ts": `import "./.well-known/a.js";\nimport "../foundation/.../a.js";`,
  // A path that isn't normalized but reaches a file the layer may import: the foundation's dom.ts.
  "layers/components/unnormalized.ts": `import "./x/../../foundation/dom.js";`,
};

/** The files the relative and absolute specifiers in `files` name and `files` doesn't hold,
 * sorted, each a path under the repository root. A specifier resolves as a browser resolves it,
 * by URL against the importing file, so `%2e%2e` is a `..` segment, an empty segment is one
 * segment, and a climb past the root stops there; then a `.js` file is its `.ts` source, as
 * TypeScript maps it, and a specifier with no file extension (`..`, `./`, `../sdk`) names a
 * directory, whose `index.ts` the resolvers take. A package name (`lit`, this package's own)
 * names no file in the tree. */
export function targets(files) {
  const found = new Set();
  for (const [path, source] of Object.entries(files)) {
    for (const [, specifier] of source.matchAll(/(?:from |import |import\()"([^"]*)"/g)) {
      if (!specifier.startsWith(".") && !specifier.startsWith("/")) continue;
      let target = decodeURI(new URL(specifier, `file:///${path}`).pathname.slice(1));
      const name = target.slice(target.lastIndexOf("/") + 1);
      if (!/\.(js|ts)$/.test(name)) target = `${target.replace(/\/$/, "")}/index.ts`;
      target = target.replace(/^\//, "").replace(/\.js$/, ".ts");
      if (!(target in files)) found.add(target);
    }
  }
  return [...found].sort();
}

/** Writes `files`, one of the trees above, under `dir`, each source with a trailing newline, and
 * each of its targets as an empty module; returns every path written. */
export function writeTree(dir, files) {
  const written = { ...files };
  for (const target of targets(files)) written[target] = "export {};";
  for (const [path, source] of Object.entries(written)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), `${source}\n`);
  }
  return Object.keys(written);
}
