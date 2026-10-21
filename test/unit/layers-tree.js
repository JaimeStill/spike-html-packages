// The layer direction cases as file trees in the workspace's shape: one of violations, a file per
// forbidden edge and import form, each with the rules that catch it; one of violations no lint rule
// catches; and one of allowed imports in the same layout. layers.test.js lints them, and
// scripts/measure.js lints them and installs them under each package manager.
// Adapted from spike-html-conventions (a88828a): test/layers-tree.js, cut to this repository's
// layers and grown by the workspace's cases.

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = join(import.meta.dirname, "../..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

/** The workspace's manifests as they stand: the private root and each package under packages/,
 * by the directory each sits in. The trees carry them, so each import is judged against its own
 * package's manifest. */
export const manifests = Object.fromEntries(
  [
    "",
    "packages/foundation",
    "packages/components",
    "packages/sdk",
    "packages/spike-html-packages",
  ].map((dir) => [dir, read(join(dir, "package.json"))]),
);

const name = (dir) => manifests[`packages/${dir}`].name;
const foundation = name("foundation");
const components = name("components");
const sdk = name("sdk");
/** The one package, put together from the three layers' builds, which no layer imports. */
export const self = name("spike-html-packages");

// The rules a case names: the layer table, the two manifest rules, and no-unresolved.
export const table = "boundaries/dependencies";
export const extraneous = "import-x/no-extraneous-dependencies";
export const relativePackages = "import-x/no-relative-packages";
export const unresolved = "import-x/no-unresolved";

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

/** `files`, each path to its source and the rules that flag it, sorted. */
function by(rules, files) {
  return Object.fromEntries(
    Object.entries(files).map(([path, source]) => [path, { source, rules: [...rules].sort() }]),
  );
}

// Each file holds one import. The violating files are named for the edge they cross. A relative
// path into another package draws no-relative-packages beside the table; a package name the
// importing package's manifest doesn't declare draws no-extraneous-dependencies.
export const violations = {
  // foundation: native only, no layer and no package
  ...by([table, extraneous], {
    "packages/foundation/lit.ts": `import { html } from "lit";`,
    "packages/foundation/self.ts": `import { define } from "${self}/foundation/dom.js";`,
    ...forms("packages/foundation/forms/lit", "lit"),
    ...forms("packages/foundation/forms/components-name", `${components}/status-badge.js`),
  }),
  ...by([table, relativePackages], {
    "packages/foundation/components.ts": `import "../components/badge.ts";`,
    "packages/foundation/sdk-export.ts": `export { Client } from "../sdk/client.ts";`,
    ...forms("packages/foundation/forms/components", "../../components/badge.ts"),
    ...forms("packages/foundation/forms/sdk", "../../sdk/client.ts"),
  }),
  // components: never the SDK
  ...by([table, relativePackages], {
    "packages/components/sdk.ts": `import { Client } from "../sdk/client.ts";`,
    "packages/components/sdk-dynamic.ts": `const sdk = await import("../sdk/client.ts");`,
    "packages/components/sdk-dir.ts": `import "../sdk";`,
    "packages/components/nested/sdk.ts": `import "../../sdk/client.ts";`,
    ...forms("packages/components/forms/sdk", "../../sdk/client.ts"),
    // the same edge by a path that isn't normalized, climbing back through a name, a . or ..
    // segment, or an empty one, which a re-allowed layer prefix would otherwise let through
    "packages/components/foundation-climb.ts": `import "../foundation/../sdk/client.ts";`,
    "packages/components/dot-segment.ts": `import "../foundation/./../sdk/client.ts";`,
    "packages/components/empty-segment.ts": `import "../foundation//../sdk/client.ts";`,
  }),
  ...by([table, extraneous], {
    "packages/components/self.ts": `import "${self}/components/status-badge.js";`,
    ...forms("packages/components/forms/sdk-name", `${sdk}/client.js`),
  }),
  // A percent-encoded .. is a directory name to the resolver, and an absolute path starts at the
  // filesystem's root: neither reaches a file. The table refuses an import it can't place,
  // no-unresolved fails it, and the manifest rules, finding no file, judge neither.
  ...by([table, unresolved], {
    "packages/components/percent.ts": `import "../foundation/%2e%2e/sdk/client.ts";`,
    "packages/components/absolute.ts": `import "/packages/sdk/client.ts";`,
  }),
  // SDK: never components
  ...by([table, relativePackages], {
    "packages/sdk/components.ts": `import { StatusBadge } from "../components/status-badge.ts";`,
    "packages/sdk/components-type.ts": `import type { StatusBadge } from "../components/status-badge.ts";`,
    ...forms("packages/sdk/forms/components", "../../components/status-badge.ts"),
  }),
  ...by([table, extraneous], {
    "packages/sdk/self.ts": `import "${self}/components/status-badge.js";`,
    ...forms("packages/sdk/forms/components-name", `${components}/status-badge.js`),
  }),
  // The SDK declares no dependency: the table lets it import the foundation and lit, and its
  // manifest refuses both.
  ...by([extraneous], {
    ...forms("packages/sdk/forms/lit", "lit"),
    ...forms("packages/sdk/forms/foundation-name", `${foundation}/dom.js`),
  }),
  // A relative path into a sibling the layer may import: the table passes it, as it passes names
  // that hold dots, which it must tell from . and .. segments, and a path that isn't normalized.
  ...by([relativePackages], {
    ...forms("packages/components/forms/foundation", "../../foundation/dom.ts"),
    "packages/components/dotted-sibling.ts": `import "../foundation/x..y/z.ts";`,
    "packages/components/unnormalized.ts": `import "./x/../../foundation/dom.ts";`,
    "packages/sdk/dotted-sibling.ts": `import "../foundation/.../a.ts";`,
  }),
  // A root devDependency, which no package declares, from a package's source.
  ...by([table, extraneous], {
    ...forms("packages/components/forms/typescript", "typescript"),
    ...forms("packages/sdk/forms/eslint", "eslint"),
  }),
  // A self-import by the package's own name: the table allows a layer its own files, and the
  // manifest rule (with includeInternal) refuses a name the manifest doesn't declare.
  ...by([extraneous], {
    ...forms("packages/components/forms/self-name", `${components}/status-badge.js`),
    ...forms("packages/foundation/forms/self-name", `${foundation}/dom.js`),
  }),
  // outside a layer directory: a file there could re-export any layer, and it sits in the root's
  // package, not the SDK's
  ...by([table, relativePackages], {
    "packages/index.ts": `export * from "./sdk/client.ts";`,
  }),
};

/** `cases`, each path to its source alone. */
export const sources = (cases) =>
  Object.fromEntries(Object.entries(cases).map(([path, { source }]) => [path, source]));

// Violations no lint rule catches, each asserted to draw nothing, which the measure reports. A
// value import of a types-only subpath by package name: the subpath has no runtime, and the name
// resolves through its types condition to the .d.ts in the sibling's dist/, which the table's
// declaration policy leaves alone, since every sibling's name resolves to a .d.ts there.
export const uncaught = {
  "packages/components/format-value.ts": `import { formatBytes } from "${foundation}/format.js";`,
  "packages/components/format-side-effect.ts": `import "${foundation}/format.js";`,
  "packages/components/format-export.ts": `export { formatBytes } from "${foundation}/format.js";`,
  "packages/components/format-dynamic.ts": `await import("${foundation}/format.js");`,
};

// The same layout, every import one the layer may make, in each form, with names that hold dots,
// which a rule must tell from . and .. segments. A sibling is imported by its package name.
export const allowed = {
  "packages/foundation/dom.ts": `export { x } from "./events.ts";`,
  "packages/foundation/nested/own.ts": `import type { X } from "../dom.ts";\nawait import("../../foundation/dom.ts");`,
  "packages/foundation/nested/index.ts": `import "..";\nexport * from "./";`,
  "packages/components/badge.ts": [
    `import { html, LitElement } from "lit";`,
    `import { define } from "${foundation}/dom.js";`,
    `export { x } from "./other.ts";`,
  ].join("\n"),
  "packages/components/forms.ts": [
    `import type { X } from "${foundation}/dom.js";`,
    `import type { formatBytes } from "${foundation}/format.js";`,
    `export * from "${foundation}/dom.js";`,
    `await import("${foundation}/dom.js");`,
  ].join("\n"),
  "packages/sdk/client.ts": `import type { X } from "./api.ts";\nawait import("./api.ts");`,
  "packages/components/dotted.ts": `import "./..x/y.ts";\nimport "${foundation}/x..y/z.js";`,
  "packages/sdk/dotted.ts": `import "./.well-known/a.ts";`,
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

/** The build files the workspace package names in `files` reach through their packages' exports,
 * sorted: each condition's target of the first export key that matches the subpath, a key with a
 * * matching any run of characters. A null target, or a subpath no key matches, reaches none. */
export function builds(files) {
  const found = new Set();
  for (const source of Object.values(files)) {
    for (const [, specifier] of source.matchAll(/(?:from |import |import\()"([^"]*)"/g)) {
      for (const [dir, manifest] of Object.entries(manifests)) {
        if (!dir || !specifier.startsWith(`${manifest.name}/`)) continue;
        const subpath = `.${specifier.slice(manifest.name.length)}`;
        for (const [key, value] of Object.entries(manifest.exports)) {
          const [head, tail] = key.split("*");
          const match =
            tail === undefined
              ? subpath === key && ""
              : subpath.startsWith(head) &&
                subpath.endsWith(tail) &&
                subpath.slice(head.length, subpath.length - tail.length);
          if (match === false) continue;
          if (value === null) break;
          for (const target of typeof value === "string" ? [value] : Object.values(value)) {
            found.add(join(dir, target.replace("*", match)));
          }
          break;
        }
      }
    }
  }
  return [...found].sort();
}

/** The packages from the registry the cases import, as stubs: lit, a package's runtime
 * dependency, and eslint and typescript, the root's devDependencies, each a module and its types. */
export const externals = Object.fromEntries(
  ["lit", "eslint", "typescript"].map((name) => [
    name,
    {
      "package.json": JSON.stringify({
        name,
        type: "module",
        exports: { ".": { types: "./index.d.ts", default: "./index.js" } },
      }),
      "index.js": "export const html = () => {};\nexport class LitElement {}",
      "index.d.ts": [
        "export declare const html: () => void;",
        "export declare class LitElement {}",
        "export interface ReactiveController {}",
        "export interface X {}",
      ].join("\n"),
    },
  ]),
);

/** Writes `files` under `dir` as a workspace: the root's and each package's manifest, `given` or
 * the repository's, and each of the files' targets and builds as an empty module. With `link`, it
 * also writes a node_modules/ at the root holding the externals and a link to each workspace
 * package, hoisted as npm lays a workspace out, so every import resolves and the lint, not the
 * install, judges it; without, a package manager installs the tree. Returns every path written
 * outside node_modules/. */
export function writeTree(dir, files, { manifests: given = manifests, link = true } = {}) {
  const written = { ...files };
  for (const target of [...targets(files), ...builds(files)]) written[target] = "export {};";
  for (const [path, manifest] of Object.entries(given)) {
    written[join(path, "package.json")] = JSON.stringify(manifest);
  }
  for (const [path, source] of Object.entries(written)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), `${source}\n`);
  }
  if (!link) return Object.keys(written);
  for (const [name, stub] of Object.entries(externals)) {
    for (const [path, source] of Object.entries(stub)) {
      mkdirSync(join(dir, "node_modules", name), { recursive: true });
      writeFileSync(join(dir, "node_modules", name, path), `${source}\n`);
    }
  }
  for (const [path, manifest] of Object.entries(manifests)) {
    if (!path) continue;
    const link = join(dir, "node_modules", manifest.name);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(relative(dirname(link), join(dir, path)), link);
  }
  return Object.keys(written);
}

/** ESLint's JSON report on the tree under `dir`'s packages/. -c takes the repo's config, whose
 * patterns then match from the working directory, the tree, and whose plugins load from the repo's
 * node_modules. Throws when ESLint doesn't run or exits other than 0 or 1. */
export function lint(dir) {
  const eslint = join(root, "node_modules", ".bin", "eslint");
  const run = spawnSync(eslint, ["-c", join(root, "eslint.config.js"), "-f", "json", "packages"], {
    cwd: dir,
    encoding: "utf8",
  });
  if (run.error) throw new Error(`eslint didn't run: ${run.error}`);
  if (run.status !== 0 && run.status !== 1) {
    throw new Error(`eslint exited ${run.status}: ${run.stderr}`);
  }
  return JSON.parse(run.stdout);
}
