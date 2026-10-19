// The lint the check runs (eslint .): @eslint/js's and typescript-eslint's recommended rules over
// the code, and the layer direction in layers/, by the file each import resolves to. Adapted from
// spike-html-conventions a88828a: eslint.config.js, its layer table cut to the layers this
// repository packages, the foundation, the components, and the SDK, without the apps' rows.
//
// The direction is eslint-plugin-boundaries' dependencies rule over the layer table below, with
// eslint-plugin-import-x's no-unresolved beside it. eslint-import-resolver-typescript resolves
// each specifier to the file it names, a .js specifier to its .ts source and a directory to its
// index.ts, and the rule judges the layer that file is in, never the specifier's text, so a path
// that climbs out and back in (./x/../../foundation/dom.js from a component) is the file it
// reaches. A package resolves into node_modules, so the only package a layer may name is one a
// policy names, lit. A specifier that resolves to nothing, the package's own name or an absolute
// path, fails no-unresolved, so no import passes by naming no file.
//
// test/layers.test.js runs this config over test/layers-tree.js's trees.
//
// A .css import is a static CSS module script, `with { type: "css" }`, everywhere: core
// no-restricted-syntax refuses an import or an export-from without that attribute, so no .css
// import leans on a bundler's own CSS handling, and refuses an import() of a .css file outright,
// attribute or not: a component imports its sheet statically.

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";
import globals from "globals";
import tseslint from "typescript-eslint";

const code = ["**/*.js", "**/*.ts"];

// The attribute a CSS module script carries among a declaration's attributes, by its key's name
// or its quoted key.
const cssType = `:matches(ImportAttribute[key.name='type'], ImportAttribute[key.value='type'])[value.value='css']`;
const cssSource = "[source.value=/\\.css$/]";
// An import() whose specifier ends in .css: a string, or a template whose last part does, matched
// at that part.
const cssDynamic = [
  `ImportExpression${cssSource}`,
  "ImportExpression > TemplateLiteral.source > TemplateElement[tail=true][value.cooked=/\\.css$/]",
];
const cssImports = [
  ...["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].map((type) => ({
    selector: `${type}${cssSource}:not(:has(${cssType}))`,
    message: "A .css import is a CSS module script: add with { type: 'css' }.",
  })),
  ...cssDynamic.map((selector) => ({
    selector,
    message:
      "A .css file is imported statically, as a CSS module script with { type: 'css' }, never by " +
      "import().",
  })),
];

// The layer table: each layer's directory and the layers it may import, "lit" the one package.
// The foundation imports nothing but itself; a component imports the foundation and lit; the SDK
// the foundation and lit, never a component. A file directly in layers/ imports nothing.
export const layers = [
  { name: "foundation", path: "layers/foundation", may: ["foundation"] },
  { name: "components", path: "layers/components", may: ["foundation", "components", "lit"] },
  { name: "sdk", path: "layers/sdk", may: ["foundation", "sdk", "lit"] },
];

// Each layer is an element by its directory, matched from the root (partialMatch false), with a
// second pattern for a file in a directory whose name starts with a dot, which micromatch's **
// never enters, so ./.well-known/ and ./..x/ stay in their layer. A file directly in layers/ is a
// "loose" element with no policy.
const elements = [
  ...layers.map(({ name, path }) => ({
    type: name,
    pattern: [path, `${path}/**/.*`],
    partialMatch: false,
  })),
  { type: "loose", pattern: ["layers"], partialMatch: false },
];

// The rule's default is disallow, and it checks every origin (lit is external) and local files no
// element holds: an import passes only when a policy names its target.
const policies = layers.map(({ name, may }) => ({
  from: { element: { type: name } },
  allow: {
    to: may.map((target) =>
      target === "lit"
        ? { module: { origin: "external", source: "lit" } }
        : { element: { type: target } },
    ),
  },
}));

// A declaration file (layers/sdk/*.d.ts, layers/foundation/format.d.ts) has no runtime, so an
// import that resolves to one passes only as a type import, `import type` or `export type`, which
// tsc erases: the last policy refuses any other kind, and as the last whose selector matches it
// overrides the allows before it. The dependency's kind is the declaration's, so
// `import { type X }` is a value import here, as it is to verbatimModuleSyntax, which keeps it as
// `import {}` and so loads the file. checkInternals has the rule judge an import within one layer
// too (the foundation's own import of format.d.ts); every row's policy allows its own layer.
const declarations = {
  disallow: { to: { internalPath: "**/*.d.ts" }, dependency: { kind: "value" } },
  message:
    "A .d.ts file is a declaration with no runtime: import it with `import type` (or export " +
    "from it with `export type`), never as a value, a side effect, or an import().",
};

export default defineConfig([
  // The release build and the consumer installs' caches, both gitignored, which ESLint doesn't read.
  { ignores: ["dist/", ".cache/"] },
  { files: code, extends: [js.configs.recommended, tseslint.configs.recommended] },
  { files: code, languageOptions: { globals: globals.browser } },
  { files: code, rules: { "no-restricted-syntax": ["error", ...cssImports] } },
  // The suite and the scripts run on node, or in the page they serve.
  { files: ["test/**", "scripts/**"], languageOptions: { globals: globals.node } },
  {
    files: ["layers/**"],
    plugins: { boundaries, "import-x": importX },
    settings: {
      "import/resolver": { typescript: true },
      "import-x/resolver": { typescript: true },
      "boundaries/elements": elements,
    },
    rules: {
      "import-x/no-unresolved": "error",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          checkAllOrigins: true,
          checkUnknownLocals: true,
          checkInternals: true,
          policies: [...policies, declarations],
        },
      ],
    },
  },
]);
