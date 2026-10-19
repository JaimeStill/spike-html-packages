# spike-html-packages

spike-html-packages settles how the native web stack's layers are packaged and released by tag:
the foundation's lateral concerns, its JS/TS modules, and the Lit components, over the
spike-html-design v0.7.0 baseline and spike-html-conventions' settled toolchain. It decides the
tag naming, the release builds beside the sources, one package or several, the hosting and
repository layout, and the import extension the releases use. Its answer is evidence for
standards-lab's experiment.html intake; the spike decides nothing itself.

The spike is the sub-goal `experiment.html.spike-html-packages` in the coordinator's roadmap,
`standards-lab/context/roadmap.toml`, where its tasks live. Its question is framed in
`standards-lab/context/html-artifacts.md`, under "Experiment: spike-html-packages", which holds
spike-html-conventions' facts for these decisions. Its answer decides how v1.client packages its
layers.

## The question

How are the foundation's lateral concerns, its JS/TS modules, and the components packaged and
released by tag over spike-html-design v0.7.0: tag naming, release builds beside the sources, one
library or several packages, the hosting and repository layout, and the import extension?

## The evidence

1. Hosting: one release delivered by git tag (installed, and loaded from jsDelivr /gh/), by
   release-asset tarball URL, by a registry, and by URL imports through an import map.
2. Layout: the layers as one package with subpath exports against several workspace packages in
   one repository, with the layer direction enforced at install by declared dependencies measured
   against the lint rule alone.
3. Tag naming: one repo-wide `vX.Y.Z` against per-package `pkg/vX.Y.Z` and `pkg@X.Y.Z`, each
   resolved by npm, pnpm, bun, and jsDelivr.
4. The release build: tsc's `.js` and `.d.ts` with every `.css` copied beside them, `exports` and
   `files` naming them, carried in the tag, a release branch, or a release asset.
5. The import extension: `.js` specifiers against `.ts` specifiers rewritten by tsc, the emit
   loading unbundled and through Vite.
6. Consumers: a page loading the release unbundled and a Vite app with the local CSS plugin, both
   rendering components on the foundation, with the nested-dependency guards each hosting trips.
7. The release flow: a release cut on a green check with pnpm's built-in versioning, against a
   hand script.
8. npm against pnpm, and ESLint+Prettier against Biome, weighed again on the chosen hosting and
   layout.

## What it packages

Copies, each naming its source repository and commit:

- spike-html-conventions' layers at main a88828a: the foundation port (tokens on the default
  profiles, Flexoki, regular, and mono; reset; elements), its DOM helpers and formatter
  declarations, the Lit shadow components, and the SDK declarations.
- spike-html-design v0.7.0's tools, split into three lateral-concern sheets (utilities, structure,
  meta), and its registry and keys family (grammar, runtime, help).

Lit is the one runtime dependency. The fixtures install the releases under npm, pnpm, and bun.
Registry trials publish for real under `@jaimestill` at 0.0.x, to GitHub Packages and to JSR.

## Capabilities

- **Layers:** the copied foundation, components, and SDK declarations.
- **Release build:** the emitted `.js` and `.d.ts` with the `.css` beside them.
- **Layout:** one package or several, and the layer direction they enforce.
- **Hosting:** git tag, release-asset tarball, registry, and import map.
- **Tags:** the tag naming each consumer resolves.
- **Consumption:** unbundled pages and Vite apps installing the releases.
- **Release flow:** cutting a release on a green check.

## Path

The tasks, in the order they run; each cites the evidence it proves.

1. `layers`: the copied layers, with the release build and the import extension, in the check
   (evidence 4, 5).
2. `layout`: one package against workspace packages (evidence 2).
3. `hosting`: the release by git tag, tarball, and import map, with tag naming (evidence 1, 3).
4. `registries`: GitHub Packages and JSR (evidence 1).
5. `consumers`: the page and Vite app consumers, and the release flow (evidence 6, 7).
6. `answer`: the reweighed picks, the answer, and the answer section (evidence 8).

## Releases

0.y.z annotated tags, pushed as evidence by the tasks that need them and never changed or re-cut.
Their form is the tag-naming evidence's to settle. The `layers` task pushes none.

## References

The spike reads these repositories and never writes to them. Each is a key in the coordinator's
`references.toml`, with its local checkout in `references.local.toml`:

- `spike-html-design`, at v0.7.0: the tools and modules copied.
- `spike-html-conventions`, at main a88828a: the layers copied and the toolchain adopted.

## Measures

`mise run measure` (scripts/measure.sh) prints the measures as one dated markdown report. It is
not part of the check: it reads no network and writes nothing to the working tree, building and
serving everything in a scratch directory it removes on exit. A row's result is yes or no with
what was observed; a no is a finding, not a failed run.

### The import extension (evidence 5)

The layers built in two forms, each a scratch copy of `layers/`, the tsconfigs, and
`scripts/build.sh`: the **js** form, the sources as they are, every relative specifier naming
`.js`; and the **ts** form, every relative `.js` specifier rewritten to `.ts` (13, the URL
`keys.ts` loads `keys-help` by among them) and `tsconfig.json` given `allowImportingTsExtensions`
and `rewriteRelativeImportExtensions`. Each form is emitted by the release build (tsc, then the
`.css` and hand-written `.d.ts` copied beside). The probe page imports the foundation's five
modules and the three components, lit by an import map onto `/deps/`, renders each component,
and opens a keys help dialog, which `keys.js` fills by importing `keys-help` from
`new URL("./keys-help.js", import.meta.url)`. It runs in the pinned chrome-headless-shell through
the raw pipe: on the emit served as plain files; on Vite builds of the emit, without and with
`scripts/css-sheets.js` (copied from spike-html-conventions a88828a); and on each form's sources
with no build, from the check's server, from one that also answers a `.ts` path, and under Vite's
dev server. Node's row imports `foundation/keys.ts` by type stripping: node resolves and links a
module's whole graph before evaluating it, so an error at evaluation means every import resolved.

Reproduce with `mise run install` once, then `mise run measure`. The rows of 2026-10-19:

| tool | version |
| --- | --- |
| node | 26.12.0 |
| tsc | typescript-go 7.0.2 |
| typescript | 6.0.3 (the consumer check's second tsc) |
| vite | 8.3.4 |
| chrome-headless-shell | 155.0.8059.84 |
| lit | 3.3.3 |

| date | form | measure | result | observed |
| --- | --- | --- | --- | --- |
| 2026-10-19 | js | tsc emits cleanly | yes | tsc --noEmit exit 0; build exit 0 |
| 2026-10-19 | js | the emit carries .js specifiers, the .d.ts among them | yes | relative .ts specifiers in dist: none; a consumer's tsc over dist/**/*.d.ts (no allowImportingTsExtensions): typescript-go 7.0.2 exit 0, typescript 6.0.3 exit 0 |
| 2026-10-19 | js | the emit loads unbundled in chrome-headless-shell | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |
| 2026-10-19 | js | the emit builds through Vite 8 with no CSS plugin | no | vite build exit 1: [MISSING_EXPORT] "default" is not exported by "js/dist/foundation/baseline/elements.css". |
| 2026-10-19 | js | the emit builds through Vite with scripts/css-sheets.js and loads | no | vite build exit 0; built page: 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help not loaded by keys.js; errors: keys: the help module failed to load Failed to fetch dynamically imported module: http://127.0.0.1:45087/assets/keys-help-CRJuCUci.js |
| 2026-10-19 | js | the sources load unbundled, served as the check's browser tier serves them (.js to its .ts, stripped) | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |
| 2026-10-19 | js | the sources load unbundled, served with .ts answered too (stripped, text/javascript) | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |
| 2026-10-19 | js | node resolves foundation/keys.ts's relative imports by type stripping | no | exit 1: Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'layers/foundation/keys-grammar.js' imported from layers/foundation/keys.ts, at resolution |
| 2026-10-19 | js | the sources load under Vite's dev server with scripts/css-sheets.js | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |
| 2026-10-19 | ts | tsc emits cleanly | yes | tsc --noEmit exit 0; build exit 0; 13 specifiers rewritten .js to .ts |
| 2026-10-19 | ts | the emit carries .js specifiers, the .d.ts among them | no | relative .ts specifiers in dist: foundation/keys.d.ts:1: ./keys-grammar.ts foundation/keys.js:425: ./keys-help.ts sdk/api.d.ts:11: ./auth.ts sdk/service.d.ts:6: ./api.ts; a consumer's tsc over dist/**/*.d.ts (no allowImportingTsExtensions): typescript-go 7.0.2 exit 0, typescript 6.0.3 exit 0 |
| 2026-10-19 | ts | the emit loads unbundled in chrome-headless-shell | no | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help not loaded by keys.js; errors: keys: the help module failed to load Failed to fetch dynamically imported module: http://127.0.0.1:41807/dist/foundation/keys-help.ts |
| 2026-10-19 | ts | the emit builds through Vite 8 with no CSS plugin | no | vite build exit 1; Vite warns: new URL("./keys-help.ts", import.meta.url) doesn't exist at build time: left to resolve at runtime: [MISSING_EXPORT] "default" is not exported by "ts/dist/foundation/baseline/elements.css". |
| 2026-10-19 | ts | the emit builds through Vite with scripts/css-sheets.js and loads | no | vite build exit 0; Vite warns: new URL("./keys-help.ts", import.meta.url) doesn't exist at build time: left to resolve at runtime; built page: 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help not loaded by keys.js; errors: keys: the help module failed to load Failed to fetch dynamically imported module: http://127.0.0.1:42533/assets/keys-help.ts |
| 2026-10-19 | ts | the sources load unbundled, served as the check's browser tier serves them (.js to its .ts, stripped) | no | 0/8 modules loaded; 0/3 components rendered with 3 adopted sheets (sl-status-badge undefined, sl-entry-lit-shadow undefined, sl-pagination-lit-shadow undefined); keys-help not loaded by keys.js; errors: foundation/dom: failed to fetch dom.ts; foundation/registry: failed to fetch registry.ts; foundation/keys-grammar: failed to fetch keys-grammar.ts; foundation/keys: failed to fetch keys.ts; foundation/keys-help: failed to fetch keys-help.ts; components/status-badge: failed to fetch status-badge.ts; components/entry-lit-shadow: failed to fetch entry-lit-shadow.ts; components/pagination-lit-shadow: failed to fetch pagination-lit-shadow.ts |
| 2026-10-19 | ts | the sources load unbundled, served with .ts answered too (stripped, text/javascript) | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |
| 2026-10-19 | ts | node resolves foundation/keys.ts's relative imports by type stripping | yes | exit 1: ReferenceError: document is not defined, at evaluation: every import resolved and linked, the module itself needs a DOM |
| 2026-10-19 | ts | the sources load under Vite's dev server with scripts/css-sheets.js | yes | 8/8 modules loaded; 3/3 components rendered with 3 adopted sheets; keys-help loaded by keys.js and filled the dialog; no errors |

## The answer

Pending: the `answer` task writes it.
