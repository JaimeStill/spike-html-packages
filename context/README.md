# spike-html-packages

spike-html-packages settles how the native web stack's layers are packaged and released by tag:
the foundation's lateral concerns, its JS/TS modules, and the Lit components, over the
spike-html-design v0.7.0 baseline and spike-html-conventions' settled toolchain. It decides the
tag naming, the release builds beside the sources, one package or several, the hosting and
repository layout, and the import extension the releases use. Its answer is evidence for
standards-lab's experiment.html intake; the spike decides nothing itself.

The layers live in repositories of their own, one per layer, each released by tag:
JaimeStill/spike-html-packages-foundation, JaimeStill/spike-html-packages-sdk, and
JaimeStill/spike-html-packages-components. This repository holds the spike's record, this README,
and the consumer check that installs the three layers by their tags.

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
   repository, and as one repository per layer, each released at a version and built on the one
   below by its tag, with the layer direction enforced at install by declared dependencies
   measured against the lint rules alone. The `layout` task measured the first two; the `hosting`
   and `components` tasks build one repository per layer.
3. Tag naming: one plain `vX.Y.Z` per repository, one repository per layer, each resolved by npm,
   pnpm, bun, and jsDelivr.
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

The copies live in the layer repositories: the foundation, its tool sheets, and the registry and
keys family in spike-html-packages-foundation, the SDK declarations in spike-html-packages-sdk,
and the components in spike-html-packages-components, taken from this repository's history at
c2b4a19, the last commit that holds `packages/`, which they name as provenance. Lit is the one
runtime dependency, of the components. Registry trials publish for real under
`@jaimestill` at 0.0.x, to GitHub Packages and to JSR.

## Capabilities

- **Layers:** the copied foundation, components, and SDK declarations.
- **Release build:** the emitted `.js` and `.d.ts` with the `.css` beside them.
- **Layout:** one package, several, or one repository per layer, and the layer direction they
  enforce.
- **Hosting:** git tag, release-asset tarball, registry, and import map.
- **Tags:** the tag naming each consumer resolves.
- **Consumption:** unbundled pages and Vite apps installing the releases.
- **Release flow:** cutting a release on a green check.

## Path

The tasks, in the order they run; each cites the evidence it proves.

1. `layers`: the copied layers, with the release build and the import extension, in the check
   (evidence 4, 5).
2. `layout`: one package against workspace packages (evidence 2).
3. `hosting`: the foundation and the SDK as repositories of their own, each with its own check, CI,
   and a release workflow that cuts v0.1.0 on its merge to main; `packages/` leaves this
   repository (evidence 2, 3).
4. `components`: the components as JaimeStill/spike-html-packages-components, copied from this
   repository's history at c2b4a19, built on the foundation's v0.1.0 tag, with its own check, CI,
   and a release workflow that cuts v0.1.0 on its merge to main (evidence 2, 3).
5. `by-tag`: this repository's consumer check, `mise run check`'s `test:consumers` tier, installing
   the three v0.1.0 tags under npm, pnpm, and bun, as the three together and as the components
   alone, offline from the caches `mise run install` fills and a lockfile per manager that
   `mise run lock` writes, with each manager's guard in the fixture's config; `mise run currency`
   over the fixtures' tags; and `mise run live`, a networked task printing a dated table of the
   tags and release assets on GitHub, jsDelivr /gh/ and the import-map page over the three tags in
   chrome-headless-shell, and each manager's installs at the tags and by the release assets' URLs
   (evidence 1, 3).
6. `registries`: GitHub Packages and JSR (evidence 1).
7. `consumers`: the page and Vite app consumers, and the release flow (evidence 6, 7).
8. `answer`: the reweighed picks, the answer, and the answer section (evidence 8).

## Releases

Each layer repository releases at 0.y.z by its own `release.yml`, which Hosting describes; this
repository releases nothing. A release is never changed or re-cut, and Tags lists each one.

## References

The spike reads these repositories and never writes to them. Each is a key in the coordinator's
`references.toml`, with its local checkout in `references.local.toml`:

- `spike-html-design`, at v0.7.0: the tools and modules copied.
- `spike-html-conventions`, at main a88828a: the layers copied and the toolchain adopted.

## Layout

This repository is the spike's record and its docs:

- `context/`: this README and the goal record, `goals/experiment.html.spike-html-packages.md`.
- `STANDARDS.md` and `CLAUDE.md`: the standards and the navigation pointers.
- `mise.toml`, `package.json`, and `.prettierrc.json`: the pins, the tasks, and Prettier's config.
- `scripts/`: the tasks' scripts: `install.sh`, `lock.sh`, `consumers.sh` (the consumer tier, and
  the cache warm `install.sh` runs), `installed.sh` (the comparison against the tags that
  `consumers.sh` and `live.js` share), `unconfigured.sh` (runs a manager with none of the user's
  config), `preflight.sh`, `currency.sh`, and `live.js`.
- `test/consumers/`: the six consumer fixtures, `<consumer>/<manager>/`, the three together
  (`three/`) and the components alone (`components/`) under npm, pnpm, and bun, each with its
  manager's guard and its committed lockfile; and `consumers.js`, `exports.js`, and `resolve.js`,
  which resolve each install's exported subpaths.
- `test/live/`: the live task's import-map page, its loopback server, and its browser pipe.
- `.cache/`, ignored: the managers' caches, `consumers/`, and the layers' tag fetches, `tags/`,
  which `mise run install` fills and the check reads.

The layers live in their own repositories, each a marathon project of its own with its own
working context, standards, check, CI, release workflow, and changelog:

- JaimeStill/spike-html-packages-foundation: `@jaimestill/spike-html-packages-foundation`, the
  baseline, the tool sheets, the DOM helpers, the registry and keys family, and the formatter
  declarations, with the ambient `*.css` declaration as its `./css` types subpath. It has no
  dependencies.
- JaimeStill/spike-html-packages-sdk: `@jaimestill/spike-html-packages-sdk`, the SDK
  declarations, types only, with no dependencies.
- JaimeStill/spike-html-packages-components: `@jaimestill/spike-html-packages-components`, the
  status badge, the entry, and the pagination, Lit with shadow roots, and their sheets. It depends
  on lit 3.3.3 and on the foundation by its tag,
  `github:JaimeStill/spike-html-packages-foundation#v0.1.0`.

All three are the goal's repositories in the coordinator's roadmap, located through the
coordinator's `.claude/marathon.toml`, under `[workspace.paths]`.

## Tasks

- `mise run install`: the mise pins and node_modules, from the lockfile, then each fixture's frozen
  install from its lockfile, which fills `.cache/consumers/`, and the three tags, fetched into
  `.cache/tags/`; reads the network and changes no fixture.
- `mise run lock`: each fixture resolved anew under its manager and guard, in a scratch copy, its
  lockfile copied back over the committed one; reads the network, and with the tags unchanged
  leaves every lockfile as it is.
- `mise run check`: `lint:format`, Prettier over the code, JSON, and CSS; `lint:shell`,
  shellcheck 0.11.0 over the scripts; and `test:consumers`, each fixture installed offline and
  frozen from its lockfile and checked against the tags, then npm's guard proven by each
  consumer's install failing under it lowered. It reads no network and writes nothing in the
  repository outside `.cache/`; a preflight names `mise run install` when a cache or tag fetch
  is missing.
- `mise run currency`: every mise tool, package.json pin, and fixture's layer tag behind its
  latest.
- `mise run live`: the dated table that Live records, from the network, in the pinned
  chrome-headless-shell; it writes nothing in the repository and exits 1 if any row is a no.

## Hosting

A layer repository's main holds sources only; `dist/` is ignored there and lives only in a release
tag's tree. Its `ci.yml` runs `mise run check` on every pull request into main and every push to
it. Main has the Go repositories' ruleset: a pull request is required, deletion and force-push are
refused, and the repository admin role bypasses it.

Its `release.yml` runs on every push to main. When `package.json`'s version has no tag on the
remote, in one job, it:

1. runs `mise run check`;
2. runs `pnpm pack`;
3. commits the pack's tree (`package.json`, `README.md`, `LICENSE`, and `dist/`), parented on the
   merge commit and on no branch, and checks that the commit's tree equals the tarball's
   `package/`, file for file;
4. tags it with an annotated `vX.Y.Z`, messaged `<repository> vX.Y.Z`, and pushes the tag alone;
5. creates the GitHub release from `CHANGELOG.md`'s section, with
   taiki-e/create-gh-release-action;
6. attaches the tarball with `gh release upload`.

When the version is already tagged, the run ends green and changes nothing; a version bump, with
its changelog section, is what releases. The git commands are inline in the workflow, and no
repository script cuts a release.

A consumer installs a release by its tag, for example
`github:JaimeStill/spike-html-packages-foundation#v0.1.0`, and the release's tarball is the same
pack. jsDelivr /gh/ serves the tag's tree. The components name their foundation by its tag, a git
dependency below the consumer's top level, so the components' README installs them with npm's
`--allow-git=all`, pnpm's `blockExoticSubdeps: false`, and no guard under bun. Consumer installs
lists the guards this repository's fixtures need, and "Live, 2026-10-23" records the measures of
jsDelivr /gh/ and of the installs at the tags and by the release assets' URLs.

The facts below were measured on 2026-10-22 against releases of the monorepo's packages,
installed offline by `git+file://`, and again on the layer repositories' tags:

- npm 12.2.1's `allow-git` defaults to none, which refuses even a root git dependency; root
  suffices except where a nested git foundation is fetched, which needs all. It applies even to
  `npm ci --offline`, which refuses with `EALLOWGIT` before it reads the cache.
- pnpm 12.15.0 refuses a dependency's git dependency (`ERR_PNPM_EXOTIC_SUBDEP`) by default unless
  `blockExoticSubdeps` is false: the components alone, and the three together too, though the
  consumer declares the foundation itself by the same tag. A frozen install from a lockfile skips
  that check.
- bun 1.4.4's overrides never reach a nested `github:` spec, and bun fails every `#semver:` git
  spec, so a layer names the one below by its exact tag.
- bun 1.4.4 writes `.bun-tag` into each package it installs: from GitHub, the repository and the
  annotated tag object's short hash, not the commit's; from a release asset, the tarball's sha512
  integrity.
- npm prepares a git dependency whose manifest has a build script, installing its devDependencies
  before it packs it, so a release manifest carries no scripts.
- pnpm 12.15.0 packs the workspace root's `LICENSE` into a package that has none, so a pack can't
  show a package's missing copy.

## Tags

Each layer repository tags a release with one plain `vX.Y.Z`:

| tag | repository | releases |
| --- | --- | --- |
| `v0.1.0` | `JaimeStill/spike-html-packages-foundation` | `@jaimestill/spike-html-packages-foundation` |
| `v0.1.0` | `JaimeStill/spike-html-packages-sdk` | `@jaimestill/spike-html-packages-sdk` |
| `v0.1.0` | `JaimeStill/spike-html-packages-components` | `@jaimestill/spike-html-packages-components` |

## Consumer installs

`mise run check`'s `test:consumers` tier installs the six fixtures in `test/consumers/`: the three
layers together and the components alone, each under npm, pnpm, and bun, by the layers'
`github:...#v0.1.0` specs. Each installs offline and frozen from its committed lockfile and the
caches in `.cache/consumers/`, in a scratch copy, and leaves the fixture unchanged. Every copy of
each layer installed is its tag's tree, file for file, against the tags fetched into
`.cache/tags/`; there is one foundation, the one the components resolve theirs to, and no layer's
devDependency; and every exported subpath resolves to its target under node, or bun for bun's
fixtures, where the keys grammar imports and runs. Each fixture holds its manager's guard in its
own config file, `.npmrc` or `pnpm-workspace.yaml`:

| consumer | npm | pnpm | bun |
| --- | --- | --- | --- |
| the three together | `allow-git=root` | `blockExoticSubdeps: false` | none |
| the components alone | `allow-git=all` | `blockExoticSubdeps: false` | none |

npm's guard is proven both ways: each npm fixture's install fails under its guard lowered one step,
`allow-git=none` for the three and `allow-git=root` for the components, with `EALLOWGIT`. A frozen
pnpm install skips the check its guard lowers, so the offline tier can't prove pnpm's; the live
task's installs with no lockfile do.

Every install the check, `mise run lock`, and `mise run live` make runs through
`scripts/unconfigured.sh`, which points npm, pnpm, and bun at empty user and global config files
and unsets the `npm_config_*`, `pnpm_config_*`, and `BUN_CONFIG_*` variables, so a user's own
setting can't change a guard's result. The fixture's own config still applies; the wrapper
leaves git's config alone.

Each lockfile records the tags by a hash, not by the tag's name:

- npm's `package-lock.json`: a `git+ssh://git@github.com/<owner>/<repository>.git#<commit>` URL at
  the tag's commit.
- pnpm's `pnpm-lock.yaml`: a codeload tarball,
  `https://codeload.github.com/<owner>/<repository>/tar.gz/<commit>`, at the tag's commit, with its
  sha512 integrity.
- bun's `bun.lock`: `github:<owner>/<repository>#<hash>`, the annotated tag object's short hash,
  not the commit's: the foundation's 8d83a25, whose commit is 29d16c0. The `.bun-tag` bun writes
  into each package names the same; for a release-asset install, it is the tarball's sha512
  integrity.

The layers and layout tasks' consumer tier packed each workspace package with `pnpm pack` and
installed the tarballs offline under pnpm (isolated), npm (hoisted), and bun (hoisted). The tier
and its fixtures retired with `packages/` and remain in history at c2b4a19; its facts of
2026-10-22 stay as the record. `pnpm pack` wrote the components' `workspace:*` foundation spec as
`0.1.0`, which no registry holds, so a manager that looked it up needed an override, a `file:`
spec pointing at the foundation's tarball:

| consumer | pnpm | npm | bun |
| --- | --- | --- | --- |
| the three layer packages | overrides | none: it dedupes against the consumer's foundation | overrides |
| the components alone | overrides | overrides | overrides |
| the components alone, importing the undeclared foundation | unresolved | resolves | resolves |

pnpm 12 reads overrides only from `pnpm-workspace.yaml`, and npm and bun from `package.json`.
pnpm links only a project's declared dependencies into its `node_modules`, so the undeclared import
failed there; npm and bun hoisted the foundation where it resolved.

## Live, 2026-10-23

`mise run live` printed the table below: the releases on GitHub and jsDelivr, the import-map page
in the pinned chrome-headless-shell, and each manager installing each consumer from the network in
a scratch project with no lockfile and a fresh cache, at the tags and by the release assets'
download URLs. Each install row names the least guard that installs it, tried least first, each
lesser setting's error, and the installed trees.

| measure | result |
| --- | --- |
| GitHub holds the three v0.1.0 tags and their release assets | yes: jaimestill-spike-html-packages-foundation-0.1.0.tgz, jaimestill-spike-html-packages-sdk-0.1.0.tgz, jaimestill-spike-html-packages-components-0.1.0.tgz |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-foundation@v0.1.0/ as the tag's tree | yes: 28/28 files byte-equal (status 200); .js `application/javascript; charset=utf-8`; .css `text/css; charset=utf-8`; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.1.0`; x-jsd-version-type `version` |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-sdk@v0.1.0/ as the tag's tree | yes: 7/7 files byte-equal (status 200); .js no files; .css no files; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.1.0`; x-jsd-version-type `version` |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-components@v0.1.0/ as the tag's tree | yes: 12/12 files byte-equal (status 200); .js `application/javascript; charset=utf-8`; .css `text/css; charset=utf-8`; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.1.0`; x-jsd-version-type `version` |
| chrome-headless-shell 156.0.8078.47 renders the import-map page from jsDelivr | yes: sl-status-badge 3 sheets, sl-entry-lit-shadow 3 sheets, sl-pagination-lit-shadow 3 sheets; the foundation's reset and elements sheets the same objects in every root; loaded from the loopback page, https://cdn.jsdelivr.net |
| npm 12.2.1 installs the three at the tags, with no lockfile | yes: allow-git=root allow-remote=none installs it; allow-git=none allow-remote=none fails EALLOWGIT; each layer its v0.1.0 tree; one foundation |
| pnpm 12.15.0 installs the three at the tags, with no lockfile | yes: blockExoticSubdeps: false installs it; defaults fails ERR_PNPM_EXOTIC_SUBDEP; each layer its v0.1.0 tree; one foundation |
| bun 1.4.4 installs the three at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its v0.1.0 tree; one foundation |
| npm 12.2.1 installs the components alone at the tags, with no lockfile | yes: allow-git=all allow-remote=none installs it; allow-git=none allow-remote=none fails EALLOWGIT, allow-git=root allow-remote=none fails EALLOWGIT; each layer its v0.1.0 tree; one foundation |
| pnpm 12.15.0 installs the components alone at the tags, with no lockfile | yes: blockExoticSubdeps: false installs it; defaults fails ERR_PNPM_EXOTIC_SUBDEP; each layer its v0.1.0 tree; one foundation |
| bun 1.4.4 installs the components alone at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its v0.1.0 tree; one foundation |
| npm 12.2.1 installs the three by their release assets' URLs | yes: allow-git=all allow-remote=root installs it; allow-git=none allow-remote=none fails EALLOWREMOTE, allow-git=none allow-remote=root fails EALLOWGIT, allow-git=root allow-remote=root fails EALLOWGIT; each layer its v0.1.0 tree; 2 foundations: the components resolve theirs to one apart from the consumer's |
| pnpm 12.15.0 installs the three by their release assets' URLs | yes: blockExoticSubdeps: false installs it; defaults fails ERR_PNPM_EXOTIC_SUBDEP; each layer its v0.1.0 tree; 2 foundations: the components resolve theirs to one apart from the consumer's |
| bun 1.4.4 installs the three by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its v0.1.0 tree; 2 foundations: the components resolve theirs to one apart from the consumer's |
| npm 12.2.1 installs the components alone by their release assets' URLs | yes: allow-git=all allow-remote=root installs it; allow-git=none allow-remote=none fails EALLOWREMOTE, allow-git=none allow-remote=root fails EALLOWGIT, allow-git=root allow-remote=root fails EALLOWGIT; each layer its v0.1.0 tree; one foundation |
| pnpm 12.15.0 installs the components alone by their release assets' URLs | yes: blockExoticSubdeps: false installs it; defaults fails ERR_PNPM_EXOTIC_SUBDEP; each layer its v0.1.0 tree; one foundation |
| bun 1.4.4 installs the components alone by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its v0.1.0 tree; one foundation |

The `answer` task is planned to weigh two of the table's findings:

- By the release assets' URLs, npm needs `allow-remote=root` beside `allow-git=all`: it refuses
  first with `EALLOWREMOTE`, then with `EALLOWGIT`, since the components' tarball still declares
  the foundation by its `github:` tag. pnpm and bun need the same guard as at the tags.
- Installing the three by the assets' URLs gives two foundations under every manager: the
  consumer's asset copy, and the components' own `github:` copy. Installing them by the tags gives
  one.

## Measures

`mise run measure` printed the two tables below, of 2026-10-22, which stay as the record. The task
and its fixtures retired with `packages/` and remain in history at c2b4a19; the paths below are
that commit's.

The first copied the one package's `dist/` and built a Vite page beside it in a scratch directory,
loaded the page in the pinned chrome-headless-shell, and printed the import extension's facts
(evidence 5). The table of 2026-10-22:

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

The second linted the violation tree (`test/unit/layers-tree.js`), then installed it as a
workspace under four layouts, each offline from a copy of the consumer caches: pnpm (isolated), npm
hoisted, npm `--install-strategy=linked`, and bun `--linker isolated`. Its bun column is the
isolated linker, not the hoisted layout the consumer tier installed with. Each row is one case; an
edge the tree writes in four import forms appears once, by its side-effect import. The `table`
column is the lint's layer table, and `manifest rules` are import-x's no-extraneous-dependencies
and no-relative-packages. A layout catches a case when a resolver named for it can't resolve the
import there: tsc for a type import, and for the rest node, running the case, and Vite, in one
`vite build` of the layout with every case an entry (`test/fixtures/measure/resolve.config.js`).
Each cell names the resolvers that fail and why, and where node and Vite disagree, which one
resolves. The root's devDependencies were stub packages, packed beside the tree. The table of
2026-10-22:

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

npm refused the workspace:* specs (`npm error Unsupported URL Type "workspace:": workspace:*`), so
its copies declared each sibling by its version, 0.1.0.

## The answer

Pending: the `answer` task writes it.
