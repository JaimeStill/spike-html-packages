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
- spike-html-conventions' `.prettierrc.json` at main a88828a, as written.

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

## Layout

- `layers/`: the sources: the foundation, the components, and the SDK.
- `scripts/`: one entry script per task.
- `test/unit/`: `node --test` on the sources, types stripped, and on the release build;
  `layers-tree.js` holds the layer direction's cases.
- `test/browser/`: `node --test` on `dist/` in the pinned chrome-headless-shell; `support/` holds
  the pipe driver, the static server, and the case modules the pages import: the tools'
  `computed-styles.js` and the components' `probe.js` and `restyle.js`.
- `test/consumers/`: the consumer fixture that pnpm, npm, and bun each install, and the manifest
  step, `consumers.js`.
- `test/fixtures/`: v0.7.0's pages and sheets, as copied; the keys pages and their `keys-indicator.js`; the components page; and
  the measure page, a Vite page with its CSS plugin.
- `demo/`: the demo pages, and `documents.js`, the listings they show, which the browser cases'
  components modules also import.

## Tasks

- `mise run install`: `scripts/install.sh`, the mise pins, node_modules, and the consumer caches;
  the one task that reads the network.
- `mise run check`: lint, types, build, and the three tiers; reads no network; in the repository it
  writes only `dist/` and the consumer caches in `.cache/`.
- `mise run lint`: `lint:eslint` (with the layer direction), `lint:format` (Prettier), and
  `lint:shell` (shellcheck).
- `mise run types`: tsc, typescript-go, as `types:layers` over the layers and the demo, and
  `types:browser` over the browser cases' in-page modules against `dist/`.
- `mise run build`: the release, `layers/` into `dist/`.
- `mise run test:unit`, `test:browser`, `test:consumers`: the three tiers, each runnable alone.
  `test:unit` builds the release it checks into a temporary directory, so it needs no `dist/`.
- `mise run installs`: the consumer installs, with each install's file list.
- `mise run demo`: the demo pages, on a fresh `dist/`, served on the loopback address.
- `mise run measure`: the import extension's facts, below.
- `mise run currency`: every pin behind its latest.

## Measures

`mise run measure` prints two dated tables. It reads no network and leaves nothing behind.

The first copies the one package's `dist/` (`mise run build`) and builds a Vite page beside it in a
scratch directory, loads the page in the pinned chrome-headless-shell, and prints the import
extension's facts (evidence 5). The table of 2026-10-21:

| measure | result |
| --- | --- |
| the emitted .js names its modules by .js relative specifiers, the help import included | yes: 7 specifiers |
| the emitted .d.ts keep .ts specifiers | yes: foundation/keys.d.ts |
| typescript-go 7.0.2 checks a consumer of dist/**/*.d.ts | yes |
| typescript 6.0.3 checks a consumer of dist/**/*.d.ts | yes |
| node 26.12.1 runs packages/foundation/src/keys-grammar.ts | yes |
| node resolves packages/foundation/src/keys.ts's imports | yes: it stops at evaluation, on document |
| Vite 8.3.5 builds the page, keys-help in its own chunk | yes: assets/keys-help-DIeGkijY.js |
| chrome-headless-shell 156.0.8078.47 renders the built page's three components | yes: 3/3 with adopted sheets |
| chrome-headless-shell 156.0.8078.47 loads the help chunk, which fills the dialog | yes: assets/keys-help-DIeGkijY.js fetched; dialog filled |

The second lints the violation tree (`test/unit/layers-tree.js`), then installs it as a workspace
under four layouts, each offline from a copy of the caches `mise run install` warms in
`.cache/consumers/`: pnpm (isolated), npm hoisted, npm `--install-strategy=linked`, and bun
`--linker isolated`. Each row is one case, the four-form edges by their side-effect import. A layout
catches a case when a resolver named for it can't resolve the import there: tsc for a type import,
and for the rest node, running the case, and Vite, in one `vite build` of the layout with every case
an entry (`test/fixtures/measure/resolve.config.js`). Each cell names the resolvers that fail and
why, and where node and Vite disagree, which one resolves. The root's devDependencies are stub
packages, packed beside the tree. The table of 2026-10-21:

| case | import | resolved by | table | manifest rules | pnpm | npm hoisted | npm linked | bun isolated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| foundation/lit.ts | `import { html } from "lit";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| foundation/self.ts | `import { define } from "@jaimestill/spike-html-packages/foundation/dom.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| foundation/forms/lit.ts | `import "lit";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| foundation/forms/components-name.ts | `import "@jaimestill/spike-html-packages-components/status-badge.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| foundation/components.ts | `import "../components/badge.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| foundation/sdk-export.ts | `export { Client } from "../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| foundation/forms/components.ts | `import "../../components/badge.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| foundation/forms/sdk.ts | `import "../../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/sdk.ts | `import { Client } from "../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/sdk-dynamic.ts | `const sdk = await import("../sdk/client.ts");` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/sdk-dir.ts | `import "../sdk";` | node, Vite | yes | yes: no-relative-packages | yes: node (a directory), Vite (not exported) | yes: node (a directory), Vite (not exported) | yes: node (a directory), Vite (not exported) | yes: node (a directory), Vite (not exported) |
| components/nested/sdk.ts | `import "../../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/forms/sdk.ts | `import "../../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/foundation-climb.ts | `import "../foundation/../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/dot-segment.ts | `import "../foundation/./../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/empty-segment.ts | `import "../foundation//../sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/self.ts | `import "@jaimestill/spike-html-packages/components/status-badge.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| components/forms/sdk-name.ts | `import "@jaimestill/spike-html-packages-sdk/client.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | yes: node, Vite (not exported) | yes: node, Vite (not found) | yes: node, Vite (not found) |
| components/percent.ts | `import "../foundation/%2e%2e/sdk/client.ts";` | node, Vite | yes | no | Vite only (not found); node resolves | Vite only (not found); node resolves | Vite only (not found); node resolves | Vite only (not found); node resolves |
| components/absolute.ts | `import "/packages/sdk/client.ts";` | node, Vite | yes | no | node only (not found); Vite resolves | node only (not found); Vite resolves | node only (not found); Vite resolves | node only (not found); Vite resolves |
| sdk/components.ts | `import { StatusBadge } from "../components/status-badge.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| sdk/components-type.ts | `import type { StatusBadge } from "../components/status-badge.ts";` | tsc | yes | yes: no-relative-packages | no | no | no | no |
| sdk/forms/components.ts | `import "../../components/status-badge.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| sdk/self.ts | `import "@jaimestill/spike-html-packages/components/status-badge.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| sdk/forms/components-name.ts | `import "@jaimestill/spike-html-packages-components/status-badge.js";` | node, Vite | yes | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| sdk/forms/lit.ts | `import "lit";` | node, Vite | no | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| sdk/forms/foundation-name.ts | `import "@jaimestill/spike-html-packages-foundation/dom.js";` | node, Vite | no | yes: no-extraneous-dependencies | yes: node, Vite (not found) | no | yes: node, Vite (not found) | yes: node, Vite (not found) |
| components/forms/foundation.ts | `import "../../foundation/dom.ts";` | node, Vite | no | yes: no-relative-packages | no | no | no | no |
| components/dotted-sibling.ts | `import "../foundation/x..y/z.ts";` | node, Vite | no | yes: no-relative-packages | no | no | no | no |
| components/unnormalized.ts | `import "./x/../../foundation/dom.ts";` | node, Vite | no | yes: no-relative-packages | no | no | no | no |
| sdk/dotted-sibling.ts | `import "../foundation/.../a.ts";` | node, Vite | no | yes: no-relative-packages | no | no | no | no |
| components/forms/typescript.ts | `import "typescript";` | node, Vite | yes | yes: no-extraneous-dependencies | no | no | no | no |
| sdk/forms/eslint.ts | `import "eslint";` | node, Vite | yes | yes: no-extraneous-dependencies | no | no | no | no |
| components/forms/self-name.ts | `import "@jaimestill/spike-html-packages-components/status-badge.js";` | node, Vite | no | yes: no-extraneous-dependencies | no | no | no | no |
| foundation/forms/self-name.ts | `import "@jaimestill/spike-html-packages-foundation/dom.js";` | node, Vite | no | yes: no-extraneous-dependencies | no | no | no | no |
| index.ts | `export * from "./sdk/client.ts";` | node, Vite | yes | yes: no-relative-packages | no | no | no | no |
| components/format-value.ts | `import { formatBytes } from "@jaimestill/spike-html-packages-foundation/format.js";` | node, Vite | no | no | yes: node, Vite (not exported) | yes: node, Vite (not exported) | yes: node, Vite (not exported) | yes: node, Vite (not exported) |

npm refuses the workspace:* specs (npm error Unsupported URL Type "workspace:": workspace:*), so its copies declare each sibling by its version, 0.0.0.

## The answer

Pending: the `answer` task writes it.
