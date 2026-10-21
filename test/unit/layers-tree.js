// The layer direction cases as file trees: one of violations, a file per forbidden edge and import
// form, and one of allowed imports in the same layout. layers.test.js lints them.
// Adapted from spike-html-conventions (a88828a): test/layers-tree.js, cut to this repository's
// layers.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** This package's own name, which every layer refuses. */
export const self = JSON.parse(
  readFileSync(join(import.meta.dirname, "../..", "package.json"), "utf8"),
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
  "packages/foundation/lit.ts": `import { html } from "lit";`,
  "packages/foundation/components.ts": `import "../components/badge.ts";`,
  "packages/foundation/sdk-export.ts": `export { Client } from "../sdk/client.ts";`,
  "packages/foundation/self.ts": `import { define } from "${self}/packages/foundation/dom.js";`,
  ...forms("packages/foundation/forms/components", "../../components/badge.ts"),
  ...forms("packages/foundation/forms/sdk", "../../sdk/client.ts"),
  // components: never the SDK
  "packages/components/sdk.ts": `import { Client } from "../sdk/client.ts";`,
  "packages/components/sdk-dynamic.ts": `const sdk = await import("../sdk/client.ts");`,
  "packages/components/sdk-dir.ts": `import "../sdk";`,
  "packages/components/nested/sdk.ts": `import "../../sdk/client.ts";`,
  "packages/components/self.ts": `import "${self}";`,
  "packages/components/absolute.ts": `import "/packages/sdk/client.ts";`,
  ...forms("packages/components/forms/sdk", "../../sdk/client.ts"),
  // the same edge by a path that isn't normalized, climbing back through a name, a . or ..
  // segment, or an empty one, which a re-allowed layer prefix would otherwise let through
  "packages/components/foundation-climb.ts": `import "../foundation/../sdk/client.ts";`,
  "packages/components/dot-segment.ts": `import "../foundation/./../sdk/client.ts";`,
  "packages/components/empty-segment.ts": `import "../foundation//../sdk/client.ts";`,
  "packages/components/percent.ts": `import "../foundation/%2e%2e/sdk/client.ts";`,
  // SDK: never components
  "packages/sdk/components.ts": `import { StatusBadge } from "../components/status-badge.ts";`,
  "packages/sdk/components-type.ts": `import type { StatusBadge } from "../components/status-badge.ts";`,
  "packages/sdk/self.ts": `import "${self}/packages/components/status-badge.js";`,
  ...forms("packages/sdk/forms/components", "../../components/status-badge.ts"),
  // outside a layer directory: a file there could re-export any layer
  "packages/index.ts": `export * from "./sdk/client.ts";`,
};

// The same layout, every import one the layer may make, in each form, with names that hold dots,
// which a rule must tell from . and .. segments.
export const allowed = {
  "packages/foundation/dom.ts": `export { x } from "./events.ts";`,
  "packages/foundation/nested/own.ts": `import type { X } from "../dom.ts";\nawait import("../../foundation/dom.ts");`,
  "packages/foundation/nested/index.ts": `import "..";\nexport * from "./";`,
  "packages/components/badge.ts": [
    `import { html, LitElement } from "lit";`,
    `import { define } from "../foundation/dom.ts";`,
    `export { x } from "./other.ts";`,
  ].join("\n"),
  "packages/sdk/client.ts": [
    `import type { ReactiveController } from "lit";`,
    `import { emit } from "../foundation/dom.ts";`,
    `await import("./api.ts");`,
  ].join("\n"),
  "packages/components/dotted.ts": `import "./..x/y.ts";\nimport "../foundation/x..y/z.ts";`,
  "packages/sdk/dotted.ts": `import "./.well-known/a.ts";\nimport "../foundation/.../a.ts";`,
  // A path that isn't normalized but reaches a file the layer may import: the foundation's dom.ts.
  "packages/components/unnormalized.ts": `import "./x/../../foundation/dom.ts";`,
};

/** The files the relative and absolute specifiers in `files` name and `files` doesn't hold, sorted:
 * each resolved by URL as a browser resolves it, an extensionless one to its directory's index.ts. */
export function targets(files) {
  const found = new Set();
  for (const [path, source] of Object.entries(files)) {
    for (const [, specifier] of source.matchAll(/(?:from |import |import\()"([^"]*)"/g)) {
      if (!specifier.startsWith(".") && !specifier.startsWith("/")) continue;
      let target = decodeURI(new URL(specifier, `file:///${path}`).pathname.slice(1));
      const name = target.slice(target.lastIndexOf("/") + 1);
      if (!/\.(js|ts)$/.test(name)) target = `${target.replace(/\/$/, "")}/index.ts`;
      target = target.replace(/^\//, "");
      if (!(target in files)) found.add(target);
    }
  }
  return [...found].sort();
}

/** Writes `files` under `dir`, with each of its targets as an empty module so every import resolves
 * and is judged by the file it reaches; returns every path written. */
export function writeTree(dir, files) {
  const written = { ...files };
  for (const target of targets(files)) written[target] = "export {};";
  for (const [path, source] of Object.entries(written)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), `${source}\n`);
  }
  return Object.keys(written);
}
