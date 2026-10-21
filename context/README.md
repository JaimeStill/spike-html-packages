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
2. Layout: the layers as one package with subpath exports, as several workspace packages in one
   repository, and as one repository per layer, with the layer direction enforced at install by
   declared dependencies measured against the lint rules alone. The `hosting` task measures one
   repository per layer.
3. Tag naming: one repo-wide `vX.Y.Z` against per-package `pkg/vX.Y.Z` and `pkg@X.Y.Z` in one
   repository, and against one repository per layer with its own tags, each resolved by npm, pnpm,
   bun, and jsDelivr.
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

The copied layers sit in three layer packages under `packages/`, one per layer; Layout below names
them. Lit is the one runtime dependency, of the components package and the one package. The
fixtures install the releases under npm, pnpm, and bun. Registry trials publish for real under
`@jaimestill` at 0.0.x, to GitHub Packages and to JSR.

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
3. `hosting`: the release by git tag, tarball, and import map, with tag naming, and one repository
   per layer (evidence 1, 2, 3).
4. `registries`: GitHub Packages and JSR (evidence 1).
5. `consumers`: the page and Vite app consumers, and the release flow (evidence 6, 7).
6. `answer`: the reweighed picks, the answer, and the answer section (evidence 8).

## Releases

0.y.z annotated tags, pushed as evidence by the tasks that need them and never changed or re-cut.
Their form is the tag-naming evidence's to settle. The `layers` and `layout` tasks push none.

## References

The spike reads these repositories and never writes to them. Each is a key in the coordinator's
`references.toml`, with its local checkout in `references.local.toml`:

- `spike-html-design`, at v0.7.0: the tools and modules copied.
- `spike-html-conventions`, at main a88828a: the layers copied and the toolchain adopted.

## Layout

- `packages/`: the pnpm workspace's four packages, each built into its own `dist/`:
  - `foundation/`: `@jaimestill/spike-html-packages-foundation`, the baseline, the tool sheets,
    the DOM helpers, the registry and keys family, and the formatter declarations. It exports the
    ambient `*.css` declaration as its `./css` types subpath, and has no dependencies.
  - `components/`: `@jaimestill/spike-html-packages-components`, the Lit shadow components. It
    depends on lit 3.3.3 and on the foundation by `workspace:*`.
  - `sdk/`: `@jaimestill/spike-html-packages-sdk`, the SDK declarations, types only, with no
    dependencies.
  - `spike-html-packages/`: `@jaimestill/spike-html-packages`, the one package. It has no sources:
    `scripts/assemble.js` copies the three builds into its `dist/`, one directory per layer, and
    rewrites each bare sibling specifier to a relative one. Lit is its one dependency, and the
    three layer packages are its devDependencies.
- `package.json`: the private root. It declares no runtime dependency and holds the lint and type
  tooling.
- `scripts/`: one entry script per task. `build.sh` builds the packages in pnpm's dependency order:
  tsc for each layer package, with its `.css` and handwritten `.d.ts` copied beside the emit, and
  `assemble.js` for the one package, last.
- `test/unit/`: `node --test` on the sources, types stripped, and on release builds it makes in a
  temporary directory; `layers-tree.js` holds the layer direction's cases.
- `test/browser/`: `node --test` on the one package's `dist/` in the pinned chrome-headless-shell;
  `support/` holds the pipe driver, the static server, and the case modules the pages import: the
  tools' `computed-styles.js` and the components' `probe.js` and `restyle.js`.
- `test/consumers/`: the consumer fixtures that pnpm, npm, and bun each install: `one/` the one
  package, `layers/` the three layer packages, and `components/` the components alone, with an
  undeclared import of the foundation. `consumers.js` writes each install's subpath list,
  `resolve.js` resolves every subpath, and `release.js` holds the exports and integrity checks the
  unit tier shares.
- `test/fixtures/`: v0.7.0's pages and sheets, as copied; the keys pages and their
  `keys-indicator.js`; the components page; and the measure's Vite page with its CSS plugin and
  `resolve.config.js`, the Vite build that judges each install layout.
- `demo/`: the demo pages, on the one package's build, and `documents.js`, the listings they show,
  which the browser cases' components modules also import.

## Tasks

- `mise run install`: `scripts/install.sh`, the mise pins, node_modules, and the consumer caches;
  the one task that reads the network.
- `mise run check`: lint, types, build, and the three tiers; reads no network; in the repository it
  writes only each package's `dist/` and the consumer caches in `.cache/`.
- `mise run lint`: `lint:eslint` (the layer table and import-x's manifest rules), `lint:format`
  (Prettier), and `lint:shell` (shellcheck).
- `mise run types`: tsc, typescript-go, as `types:foundation`, `types:components`, and `types:sdk`
  over each layer package, the components against the foundation's build; `types:demo` over the
  demo; and `types:browser` over the browser cases' in-page modules against the one package's
  `dist/`.
- `mise run build`: `scripts/build.sh`, each package into its `dist/` in dependency order, the one
  package last.
- `mise run test:unit`, `test:browser`, `test:consumers`: the three tiers, each runnable alone.
  `test:unit` builds the releases it checks into a temporary directory, so it needs no `dist/`.
- `mise run installs`: the consumer installs, with the one package's and the three layer packages'
  installed files.
- `mise run demo`: the demo pages, on a fresh build of the one package, served on the loopback
  address.
- `mise run measure`: the import extension's facts and the layer violations' catchers, below.
- `mise run currency`: every pin behind its latest, the root's and each package's.

## Consumer installs

`mise run test:consumers` packs each package with `pnpm pack`, installs the tarballs offline from
`.cache/consumers/`, and fails if a manager departs from the facts below, measured 2026-10-21. Each
manager installs in its default layout: pnpm isolated, npm hoisted, and bun hoisted, its default
outside a workspace. `pnpm pack` writes the components' `workspace:*` foundation spec as `0.0.0`,
which no registry holds, so a manager that looks it up needs an override:

| consumer | pnpm | npm | bun |
| --- | --- | --- | --- |
| the three layer packages | overrides | none: it dedupes against the consumer's foundation | overrides |
| the components alone | overrides | overrides | overrides |
| the components alone, importing the undeclared foundation | unresolved | resolves | resolves |

An override points the foundation at its tarball by a `file:` spec. pnpm 12 reads overrides only
from `pnpm-workspace.yaml`, and npm and bun from `package.json`. pnpm links only a project's
declared dependencies into its `node_modules`, so the undeclared import fails there; npm and bun
hoist the foundation where it resolves. pnpm's store and its metadata cache (`cacheDir`), which
`--offline` reads, both live in `.cache/consumers/pnpm/`.

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
`--linker isolated`. Its bun column is the isolated linker, not the hoisted layout the consumer tier
installs with. Each row is one case; an edge the tree writes in four import forms appears once, by
its side-effect import. The `table` column is the lint's layer table, and `manifest rules` are
import-x's no-extraneous-dependencies and no-relative-packages. A layout catches a case when a
resolver named for it can't resolve the import there: tsc for a type import, and for the rest node,
running the case, and Vite, in one `vite build` of the layout with every case an entry
(`test/fixtures/measure/resolve.config.js`). Each cell names the resolvers that fail and why, and
where node and Vite disagree, which one resolves. The root's devDependencies are stub packages,
packed beside the tree. The table of 2026-10-21:

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
