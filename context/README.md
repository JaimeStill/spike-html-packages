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
runtime dependency, of the components. The three layers are published for real to GitHub Packages
under `@jaimestill`, each at its latest tag's version and equal to that tag's pack; JSR is recorded
from dry runs, and no JSR package was published.

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
6. `registries`: `mise run publish`, publishing the three v0.1.0 trees to GitHub Packages at
   0.0.1, and `mise run live`'s rows of npm, pnpm, and bun installing them from there, the three
   together and the components alone; JSR, recorded from deno 2.9.8's dry runs, with no publish
   (evidence 1).
7. `consumers`: the components' v0.2.0, with the foundation as a peer at `^0.1.0`; a page loading
   each install unbundled and a Vite app with the local CSS module script plugin, each styled by the
   foundation's page.css, in `mise run check` over the tags and in `mise run live` over the release
   assets and GitHub Packages, now at the tags' versions; and `mise run release-flow`, comparing
   pnpm's change-intent versioning with the hand flow in scratch (evidence 6, 7). Both are measured:
   "Live, 2026-10-26, components v0.2.0" and "Release flow, 2026-10-26" record them.
8. `answer`: the reweighed picks, the answer, and the answer section (evidence 8).

## Releases

Each layer repository releases at 0.y.z by its own `release.yml`, which Hosting describes; this
repository releases nothing by tag. The layers are at foundation v0.1.0, sdk v0.1.0, and
components v0.2.0, whose foundation is a peer. Its `mise run publish` publishes each layer's latest tag to
GitHub Packages at the tag's version. A release or publish is never changed or re-cut, and Tags
lists each one, with the 0.0.1 publishes that were deleted.

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
  config), `preflight.sh`, `currency.sh`, `live.js`, `publish.sh`, and `release-flow.js`.
- `test/consumers/`: the twelve fixtures, each with its committed lockfile and, under npm, its
  guard. The six consumer fixtures, `<consumer>/<manager>/`, are the three together (`three/`) and
  the components with the foundation (`components/`) under npm, pnpm, and bun. The six Vite
  fixtures, `vite/<consumer>/<manager>/`, are the same two with Vite in their devDependencies.
  `consumers.js`, `exports.js`, and `resolve.js` resolve each install's exported subpaths; `pages/`
  holds each manager's page and `pages.js` loads them; `vite/app/` holds the Vite app and `vite.js`
  builds and serves it; `design.js` holds the design check that `pages.js`, `vite.js`, and `live.js`
  share.
- `test/live/`: the import-map page, the loopback server and browser pipe that the check's pages and
  Vite apps use too, and `installed-map.js`, which rewrites a page's import map and stylesheet links
  to a networked install's directories.
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
  on lit 3.3.3 and takes the foundation as a peer at `^0.1.0`, which the consumer declares; its
  devDependency is the foundation's exact tag,
  `github:JaimeStill/spike-html-packages-foundation#v0.1.0`.

All three are the goal's repositories in the coordinator's roadmap, located through the
coordinator's `.claude/marathon.toml`, under `[workspace.paths]`.

## Tasks

- `mise run install`: the mise pins, chrome-headless-shell among them, and node_modules, from the
  lockfile, then each fixture's frozen install from its lockfile, which fills `.cache/consumers/`,
  and the three tags, fetched into `.cache/tags/`; reads the network and changes no fixture.
- `mise run lock`: each of the twelve fixtures resolved anew under its manager and guard, in a
  scratch copy, its lockfile copied back over the committed one; reads the network, and with the
  tags unchanged leaves every lockfile as it is.
- `mise run check`: `lint:format`, Prettier over the code, JSON, and CSS; `lint:shell`, shellcheck
  0.11.0 over the scripts; and `test:consumers`, which Consumer installs describes: each fixture
  installed offline and frozen from its lockfile and checked against the tags, each consumer
  install's page and each Vite app loaded in chrome-headless-shell and held to the sheet and design
  checks, the jsDelivr page's pins and page.css link checked, and npm's guard proven by each
  consumer's install failing under it lowered. It reads no network and no token, and writes nothing
  in the repository outside `.cache/`; a preflight names `mise run install` when the browser, a
  cache, or a tag fetch is missing.
- `mise run currency`: every mise tool, package.json pin, fixture's layer tag, and Vite fixture's
  Vite pin behind its latest. It prints parse-changelog as held, at the 0.6.16 that
  create-gh-release-action v1.11.0 runs, and exits 0 when a held pin is all that is behind.
- `mise run live`: the dated tables that the Live sections record, from the network, in the pinned
  chrome-headless-shell; it writes nothing in the repository and exits 1 if any row is a no. Its
  GitHub Packages installs need a token with read:packages in `GITHUB_PACKAGES_TOKEN`, run as
  `GITHUB_PACKAGES_TOKEN=$(gh auth token) mise run live`; it fails naming the variable when it is
  unset, and, before it measures anything, names each package GitHub Packages doesn't hold at its
  tag's version or doesn't make public, and each that still holds a 0.0.1.
- `mise run release-flow`: the dated table that "Release flow, 2026-10-26" records, from the
  network. It cuts the foundation's 0.1.1 twice, by the hand flow and by pnpm's, each in a scratch
  clone of the foundation's main pushed to a local bare remote, through release.yml's own steps.
  It pushes nothing to GitHub, gives the steps no token, writes nothing in the repository, and
  removes its scratch. It exits 1 only when a flow can't be set up; a row's no is a measured fact.
- `mise run publish`: each layer's latest tag, the highest `vX.Y.Z` on its remote, published to
  GitHub Packages at the tag's version, in the order foundation, sdk, components, from a scratch
  copy of the tag's tree, unchanged. It runs by hand, as
  `GITHUB_PACKAGES_TOKEN=$(gh auth token) mise run publish`, and before it publishes anything fails
  naming the variable unset, the token's missing write:packages scope, a layer's missing tag, or a
  tag whose manifest names another version. It skips and names each layer GitHub Packages already
  holds at its tag's version, so a rerun publishes nothing; `mise run publish dry-run` uploads
  nothing. It reads the network, writes nothing in the repository, and writes the token to no file.

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
pack. jsDelivr /gh/ serves the tag's tree.

The components take the foundation as a peer at `^0.1.0`, so the consumer declares the foundation
beside them and one copy serves both. The components' v0.1.0 names it as a plain dependency by
its tag, which installs a second foundation whenever the consumer's comes from another source, a
release asset or GitHub Packages ("Live, 2026-10-23" counts two by the assets' URLs under every
manager; a scratch measure of 2026-10-26, a v0.1.0-form pack beside GitHub Packages' 0.0.1
foundation, counted two from GitHub Packages too). The sheets are per-module objects, so a consumer's restyle by package name then misses
the components' shadow roots. With the v0.2.0 peer, every hosting installs one foundation under
every manager, and each git dependency is the consumer's own, so the guards that remain are these:

- npm: `allow-git=root` at the tags, and `allow-remote=root` alone by the release assets' URLs.
- pnpm: none; `blockExoticSubdeps` no longer applies, since no dependency of a dependency is a git
  spec.
- bun: none.
- GitHub Packages, under every manager: the `@jaimestill` registry and a token with read:packages.

The components alone, with no foundation declared, fail at the tags and by the assets' URLs: each
manager looks the peer up on npmjs, which holds no `@jaimestill` package, and fails 404. npm and
pnpm leave neither layer installed; bun leaves the components without a foundation. From GitHub
Packages, every manager installs the foundation 0.1.0 as their peer, one foundation.

Consumer installs lists the guards this repository's fixtures hold, and "Live, 2026-10-26,
components v0.2.0" records each of these measures from the network. "Live, 2026-10-23" records
jsDelivr /gh/ and the v0.1.0 installs at the tags and by the release assets' URLs, and "Live,
2026-10-26, GitHub Packages at 0.0.1" adds the installs from GitHub Packages.

The facts below were measured on 2026-10-22 against releases of the monorepo's packages,
installed offline by `git+file://`, and again on the layer repositories' v0.1.0 tags, where the
components named the foundation by its tag:

- npm 12.2.1's `allow-git` defaults to none, which refuses even a root git dependency; root
  sufficed except where the nested git foundation was fetched, which needed all. It applies even
  to `npm ci --offline`, which refuses with `EALLOWGIT` before it reads the cache.
- pnpm 12.15.0 refuses a dependency's git dependency (`ERR_PNPM_EXOTIC_SUBDEP`) by default unless
  `blockExoticSubdeps` is false: v0.1.0's components alone, and the three together too, though the
  consumer declared the foundation itself by the same tag. A frozen install from a lockfile skips
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

`mise run publish` publishes from the workstation; Tags lists its publishes. "Live, 2026-10-26,
GitHub Packages at 0.0.1" and "Live, 2026-10-26, components v0.2.0" record npm, pnpm, and bun
installing them. The facts below were measured on those publishes:

- gh's OAuth token (`gho_`), granted read:packages and write:packages by
  `gh auth refresh -s read:packages,write:packages`, was accepted by npm.pkg.github.com for
  publishing, where GitHub's docs name a classic personal access token only.
- Each package at its tag's version is the tag's pack, unchanged: each layer installs as its tag's
  tree, file for file, its manifest included. The 0.0.1 publishes differed from their v0.1.0 tags
  only in the version and, in the components, the foundation dependency, `0.0.1`.
- A first publish is private. Neither gh nor the REST API can change a package's visibility or its
  repository link: the user packages endpoints list, get, delete, and restore only, and visibility
  and repository are read-only fields of their responses. The architect made the three public in
  each package's settings. A public package can't be made private again; its versions stay
  deletable while they have 5,000 downloads or fewer, and a deleted version is restorable within 30
  days.
- GitHub's docs say a package with no `repository` field is linked to the repository its name
  gives; measured, it isn't. The v0.1.0 manifests carry no `repository` field, and all three
  published unlinked. The architect linked them by hand, with Connect Repository on each package's
  page, in place of a 0.0.2 with a `repository` field. The publishes at the tags' versions went
  to the same packages, which stayed public and linked.
- Every manager needs two settings to install the public packages: the `@jaimestill` registry,
  `https://npm.pkg.github.com`, and a token with read:packages. With no registry setting, each
  looks the package up on npmjs and fails 404; with the registry alone, GitHub Packages refuses it
  401. That is a consumer's price for installing from GitHub Packages.
- Each manager takes the token its own way. npm expands `${GITHUB_PACKAGES_TOKEN}` in a project
  `.npmrc`, and bun expands `$GITHUB_PACKAGES_TOKEN` in `bunfig.toml`'s `[install.scopes]`. pnpm
  12.15.0 refuses environment expansion in registry credentials the repository controls, and
  rejects `pnpm_config__auth`; only the variable `pnpm_config_//npm.pkg.github.com/:_authToken`
  gives it the token.
- pnpm's minimum release age fell back for the same-day versions, at 0.0.1 and again at the tags'
  versions: it added them to `minimumReleaseAgeExclude` and installed them. GitHub Packages'
  metadata carried `time["0.0.1"]` alone, with no `created` or `modified`, and pnpm skipped
  nothing for a missing time.
- No install needs a git guard under any manager, since every layer comes from the registry; each
  installs one foundation, the one the components resolve to.
- The `.css` arrive whole, the foundation's 13 and the components' 3 (the SDK has none), and a
  `.css` subpath, such as `@jaimestill/spike-html-packages-components/entry-shadow.css`, resolves by
  package name. On JSR, below, none would.
- bun 1.4.4 writes no `.bun-tag` into a package it installs from a registry.

## Tags

Each layer repository tags a release with one plain `vX.Y.Z`:

| tag | repository | releases |
| --- | --- | --- |
| `v0.1.0` | `JaimeStill/spike-html-packages-foundation` | `@jaimestill/spike-html-packages-foundation` |
| `v0.1.0` | `JaimeStill/spike-html-packages-sdk` | `@jaimestill/spike-html-packages-sdk` |
| `v0.1.0` | `JaimeStill/spike-html-packages-components` | `@jaimestill/spike-html-packages-components` |
| `v0.2.0` | `JaimeStill/spike-html-packages-components` | `@jaimestill/spike-html-packages-components`, the foundation as a peer |

`mise run publish` published each layer's latest tag to GitHub Packages at the tag's version on
2026-10-26, so the components' v0.1.0 has no publish:

| version | package | published from |
| --- | --- | --- |
| `0.1.0` | `@jaimestill/spike-html-packages-foundation` | `v0.1.0` of `JaimeStill/spike-html-packages-foundation` |
| `0.1.0` | `@jaimestill/spike-html-packages-sdk` | `v0.1.0` of `JaimeStill/spike-html-packages-sdk` |
| `0.2.0` | `@jaimestill/spike-html-packages-components` | `v0.2.0` of `JaimeStill/spike-html-packages-components` |

Earlier on 2026-10-26, it published each layer's v0.1.0 tree at 0.0.1, a version no tag names.
The three 0.0.1 versions were deleted on 2026-10-26, through GitHub's REST API with gh's token
granted delete:packages, once the tags' versions were published:

| version | package | published from |
| --- | --- | --- |
| `0.0.1`, deleted | `@jaimestill/spike-html-packages-foundation` | `v0.1.0` of `JaimeStill/spike-html-packages-foundation` |
| `0.0.1`, deleted | `@jaimestill/spike-html-packages-sdk` | `v0.1.0` of `JaimeStill/spike-html-packages-sdk` |
| `0.0.1`, deleted | `@jaimestill/spike-html-packages-components` | `v0.1.0` of `JaimeStill/spike-html-packages-components` |

## Consumer installs

`mise run check`'s `test:consumers` tier installs the twelve fixtures in `test/consumers/`. The six
consumer fixtures are the three layers together and the components with the foundation, their
peer, each under npm, pnpm, and bun, by the tags `github:...-foundation#v0.1.0`,
`github:...-sdk#v0.1.0`, and `github:...-components#v0.2.0`. The six Vite fixtures are the same
two consumers under the same three managers, each with Vite 8.3.5 pinned in its devDependencies.
Each fixture installs offline and frozen from its committed lockfile and the caches in
`.cache/consumers/`, in a scratch copy, and leaves the fixture unchanged. Every copy of each layer
installed is its tag's tree, file for file, against the tags fetched into `.cache/tags/`; there is
one foundation, the one the components resolve theirs to, and no layer's devDependency. In each
consumer fixture, every exported subpath also resolves to its target under node, or bun for bun's
fixtures, where the keys grammar imports and runs. Only npm needs a guard, which each npm fixture
holds in its `.npmrc`:

| consumer | npm | pnpm | bun |
| --- | --- | --- | --- |
| the three together | `allow-git=root` | none | none |
| the components with the foundation | `allow-git=root` | none | none |

npm's guard is proven both ways: each npm consumer fixture's install fails under `allow-git=none`
with `EALLOWGIT`, and the package npm names as refused must be one the consumer declares, the sdk
for the three and the foundation for the components. The Vite fixtures repeat neither the subpath
nor the guard proof.

Each consumer fixture's install is then served from the loopback address, and chrome-headless-shell
loads that manager's page, `test/consumers/pages/<manager>.html`. Its import map is written by hand
to follow the manager's layout: npm and bun hoist every package to the top of `node_modules/`, and
pnpm puts each in its virtual store, `node_modules/.pnpm/`, with scopes giving each store directory
the packages pnpm links beside it. pnpm names a git dependency's store directory by its codeload
URL, cut short and hashed, so the pnpm page hard-codes those names, and the lockfile's tags fix
them. The page links the foundation's page.css from the install, loads lit and the layers unbundled
from it, and renders the three components, the pagination at its default size, 12, one of the 12,
24, 48, and 96 its size select offers. It passes when each shadow root adopts the same reset and
elements sheet objects that the page imports by package name, every file comes from the loopback
address, each package comes from one directory, the foundation from the one the install check found,
and the design check below passes; a page that finds two foundations fails. The check then requires
the jsDelivr import-map page, `test/live/import-map.html`, to map lit at the version the components'
v0.2.0 manifest pins and each layer at its tag, and to link the foundation's page.css from jsDelivr
at its tag.

Each Vite fixture's app, `test/consumers/vite/app/`, imports the components, the foundation's
sheets, and its page.css by package name. page.css is a plain import, which Vite's own CSS pipeline
bundles. Its config loads the local CSS module script plugin, `css-sheets.js`, copied from this
repository's history at c2b4a19, since Vite has no CSS module scripts of its own
(vitejs/vite#17700). The install's own Vite, run under node for every manager, builds the app; the
build is served statically, then the app is served from Vite's dev server, and each renders the
three components in chrome-headless-shell and passes the page's sheet and design checks. A build
bundles the packages, so the sheet check is what proves one foundation there. On the dev server,
Vite's pre-bundling leaves each CSS import out of the bundled modules, and the plugin rewrites it as
the server serves them, so the config needs no `optimizeDeps` setting. The dev server runs in the
offline check only; `mise run live` builds the Vite apps over its networked installs.

The design check, `test/consumers/design.js`, requires the foundation's page.css to shape the
document. It computes every value it compares, so it follows whatever the foundation's tokens
define:

- The body's background and font family must equal the `--bg` and `--font-body` tokens, as a
  property on the root resolves them.
- Each token must resolve inside every component's shadow root to the root's value, since custom
  properties inherit across the shadow boundary.
- The foundation's eight layers must appear in the document's layer order as page.css's `@layer`
  statement names them, whatever layers the page adds around them.

The check reads the layer order from the cascade, not from page.css's statement, since Vite's build
minifier drops the statement, whose order the blocks after it already give. It builds a tree of the
layer names in every sheet, each name under its parent in the order first named, by a statement, a
block, or an `@import`'s `layer()`, and reads the tree depth first. A sheet the page can't read,
such as one from another origin fetched without CORS, makes the order unknown when it comes before
every foundation layer is named. The jsDelivr page links page.css with `crossorigin="anonymous"`, so
the page can read its rules; its four imported sheets stay unreadable, but page.css's statement
names all eight layers before them.

Every install the check, `mise run lock`, and `mise run live` make runs through
`scripts/unconfigured.sh`, which points npm, pnpm, and bun at empty user and global config files
and unsets the `npm_config_*`, `pnpm_config_*`, and `BUN_CONFIG_*` variables, so a user's own
setting can't change a guard's result. The fixture's own config still applies; the wrapper
leaves git's config alone. It reads the variables it unsets from `env -0`: bash's `compgen -e`,
which it read before, lists no variable whose name bash can't hold, so pnpm's per-registry
settings, such as `pnpm_config_//npm.pkg.github.com/:_authToken`, passed through it. Its
`--github-packages-token` lets that one variable through, and only the live task's GitHub Packages
installs pass it, so the check, `mise run install`, and `mise run lock` read no token.

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

The components' v0.2.0 removes both, as "Live, 2026-10-26, components v0.2.0" records.

## Live, 2026-10-26, GitHub Packages at 0.0.1

`mise run live`, run with gh's token in `GITHUB_PACKAGES_TOKEN` and the three packages public,
printed the table below and exited 0. Its rows through the release assets' URLs read as on
2026-10-23. The rows after them install the three together and the components alone from GitHub
Packages at 0.0.1 under each manager, in a scratch project with no lockfile and a fresh cache, each
layer named at exactly 0.0.1. Each tries no registry setting, then the `@jaimestill` registry
alone, then the registry and the token, and names the least that installs, each lesser setting's
error, the git guard the install needed, and, under pnpm, whether its minimum release age fell
back. The last six rows hold each of those installs' trees to the tags and resolve every export
subpath, under node for npm and pnpm and under bun for bun's.

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
| npm 12.2.1 installs the three from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails E404, the registry alone fails E401; the git guard at its least (allow-git=none allow-remote=none) |
| pnpm 12.15.0 installs the three from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails ERR_PNPM_FETCH_404, the registry alone fails ERR_PNPM_FETCH_401; the git guard at its least (defaults); pnpm's minimum release age fell back: it added 3 versions to minimumReleaseAgeExclude, published foundation 2026-10-26T13:32:39Z, sdk 2026-10-26T13:32:40Z, components 2026-10-26T13:32:41Z |
| bun 1.4.4 installs the three from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-components - 404, the registry alone fails GET https://npm.pkg.github.com/@jaimestill%2fspike-html-packages-components - 401; the git guard at its least (defaults) |
| npm 12.2.1 installs the components alone from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails E404, the registry alone fails E401; the git guard at its least (allow-git=none allow-remote=none) |
| pnpm 12.15.0 installs the components alone from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails ERR_PNPM_FETCH_404, the registry alone fails ERR_PNPM_FETCH_401; the git guard at its least (defaults); pnpm's minimum release age fell back: it added 2 versions to minimumReleaseAgeExclude, published foundation 2026-10-26T13:32:39Z, sdk 2026-10-26T13:32:40Z, components 2026-10-26T13:32:41Z |
| bun 1.4.4 installs the components alone from GitHub Packages at 0.0.1 | yes: the registry and the token installs it; no registry setting fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-components - 404, the registry alone fails GET https://npm.pkg.github.com/@jaimestill%2fspike-html-packages-components - 401; the git guard at its least (defaults) |
| npm 12.2.1's install of the three from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under node | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| pnpm 12.15.0's install of the three from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under node | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| bun 1.4.4's install of the three from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under bun | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under bun as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| npm 12.2.1's install of the components alone from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under node | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| pnpm 12.15.0's install of the components alone from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under node | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| bun 1.4.4's install of the components alone from GitHub Packages at 0.0.1 is each layer's v0.1.0 tree and resolves under bun | yes: each layer its v0.1.0 tree but its manifest, which differs only in version 0.0.1 and the components' foundation dependency 0.0.1; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under bun as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |

## Live, 2026-10-26, components v0.2.0

`mise run live`, run with gh's token in `GITHUB_PACKAGES_TOKEN`, printed the table below and exited
0, over the components' v0.2.0, the foundation and the SDK at v0.1.0, and GitHub Packages at the
tags' versions. Its first row is the preflight: each tag and release asset on GitHub, and each
package on GitHub Packages at its tag's version, public, with no 0.0.1 left. Then come jsDelivr /gh/
and the import-map page, held to the design check against the foundation's page.css at its tag, and
each manager's installs with no lockfile and a fresh cache, at the tags, by the release assets'
URLs, and from GitHub Packages, the three together and the components with the foundation, each
compared with its tag's tree file for file, its manifest included. The page and Vite rows load the
release-asset and GitHub Packages installs: the manager's page, its import map and page.css link
rewritten to the install's directories by `test/live/installed-map.js`, and the Vite app's build,
each held to the sheet and design checks that Consumer installs describes; a second foundation makes
the row a no. The last rows install the components alone, with no foundation declared, and read yes
when the manager does what it was measured to do, naming the error.

Every install gives one foundation, and every page and Vite build renders the components with their
shadow roots adopting the sheets the consumer imports, styled by the foundation's page.css. Hosting
states the guards each install needs and what the components alone do.

| measure | result |
| --- | --- |
| GitHub holds the layers' latest tags (foundation v0.1.0, sdk v0.1.0, components v0.2.0) and their release assets; GitHub Packages each at its tag's version, public, and no 0.0.1 | yes: jaimestill-spike-html-packages-foundation-0.1.0.tgz, jaimestill-spike-html-packages-sdk-0.1.0.tgz, jaimestill-spike-html-packages-components-0.2.0.tgz |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-foundation@v0.1.0/ as the tag's tree | yes: 28/28 files byte-equal (status 200); .js `application/javascript; charset=utf-8`; .css `text/css; charset=utf-8`; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.1.0`; x-jsd-version-type `version` |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-sdk@v0.1.0/ as the tag's tree | yes: 7/7 files byte-equal (status 200); .js no files; .css no files; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.1.0`; x-jsd-version-type `version` |
| jsDelivr serves https://cdn.jsdelivr.net/gh/JaimeStill/spike-html-packages-components@v0.2.0/ as the tag's tree | yes: 12/12 files byte-equal (status 200); .js `application/javascript; charset=utf-8`; .css `text/css; charset=utf-8`; cache-control `public, max-age=31536000, s-maxage=31536000, immutable`; x-jsd-version `0.2.0`; x-jsd-version-type `version` |
| chrome-headless-shell 156.0.8078.47 renders the import-map page from jsDelivr, styled by the page.css it links there | yes: sl-status-badge 3 sheets, sl-entry-lit-shadow 3 sheets, sl-pagination-lit-shadow 3 sheets; the foundation's reset and elements sheets the same objects in every root; page.css shapes it: the body's background rgb(255, 252, 240) from --bg and its font from --font-body, both tokens resolving in every shadow root, and the foundation's 8 layers in page.css's order; loaded from the loopback page, https://cdn.jsdelivr.net |
| npm 12.2.1 installs the three at the tags, with no lockfile | yes: allow-git=root allow-remote=none installs it; allow-git=none allow-remote=none fails EALLOWGIT; each layer its tag's tree, its manifest included; one foundation |
| pnpm 12.15.0 installs the three at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| bun 1.4.4 installs the three at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| npm 12.2.1 installs the components and the foundation, their peer, at the tags, with no lockfile | yes: allow-git=root allow-remote=none installs it; allow-git=none allow-remote=none fails EALLOWGIT; each layer its tag's tree, its manifest included; one foundation |
| pnpm 12.15.0 installs the components and the foundation, their peer, at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| bun 1.4.4 installs the components and the foundation, their peer, at the tags, with no lockfile | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| npm 12.2.1 installs the three by their release assets' URLs | yes: allow-git=none allow-remote=root installs it; allow-git=none allow-remote=none fails EALLOWREMOTE; each layer its tag's tree, its manifest included; one foundation |
| pnpm 12.15.0 installs the three by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| bun 1.4.4 installs the three by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| npm 12.2.1 installs the components and the foundation, their peer, by their release assets' URLs | yes: allow-git=none allow-remote=root installs it; allow-git=none allow-remote=none fails EALLOWREMOTE; each layer its tag's tree, its manifest included; one foundation |
| pnpm 12.15.0 installs the components and the foundation, their peer, by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| bun 1.4.4 installs the components and the foundation, their peer, by their release assets' URLs | yes: defaults installs it; no lesser setting; each layer its tag's tree, its manifest included; one foundation |
| npm 12.2.1 installs the three from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails E404, the registry alone fails E401; the git guard at its least (allow-git=none allow-remote=none) |
| pnpm 12.15.0 installs the three from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails ERR_PNPM_FETCH_404, the registry alone fails ERR_PNPM_FETCH_401; the git guard at its least (defaults); pnpm's minimum release age fell back: it added 3 versions to minimumReleaseAgeExclude, published foundation 2026-10-26T18:23:29Z, sdk 2026-10-26T18:23:30Z, components 2026-10-26T18:23:31Z |
| bun 1.4.4 installs the three from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-components - 404, the registry alone fails GET https://npm.pkg.github.com/@jaimestill%2fspike-html-packages-components - 401; the git guard at its least (defaults) |
| npm 12.2.1 installs the components and the foundation, their peer, from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails E404, the registry alone fails E401; the git guard at its least (allow-git=none allow-remote=none) |
| pnpm 12.15.0 installs the components and the foundation, their peer, from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails ERR_PNPM_FETCH_404, the registry alone fails ERR_PNPM_FETCH_401; the git guard at its least (defaults); pnpm's minimum release age fell back: it added 2 versions to minimumReleaseAgeExclude, published foundation 2026-10-26T18:23:29Z, sdk 2026-10-26T18:23:30Z, components 2026-10-26T18:23:31Z |
| bun 1.4.4 installs the components and the foundation, their peer, from GitHub Packages at the tags' versions | yes: the registry and the token installs it; no registry setting fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-components - 404, the registry alone fails GET https://npm.pkg.github.com/@jaimestill%2fspike-html-packages-components - 401; the git guard at its least (defaults) |
| npm 12.2.1's install of the three from GitHub Packages at the tags' versions is each layer's tag tree and resolves under node | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| pnpm 12.15.0's install of the three from GitHub Packages at the tags' versions is each layer's tag tree and resolves under node | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| bun 1.4.4's install of the three from GitHub Packages at the tags' versions is each layer's tag tree and resolves under bun | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 30 export subpaths resolve under bun as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; sdk none; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| npm 12.2.1's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions is each layer's tag tree and resolves under node | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| pnpm 12.15.0's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions is each layer's tag tree and resolves under node | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under node as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| bun 1.4.4's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions is each layer's tag tree and resolves under bun | yes: each layer its tag's tree, its manifest included; one foundation, the one the components resolve to; no devDependency; all 26 export subpaths resolve under bun as their exports name them, types-only ones to nothing; .css installed: components dist/entry-shadow.css, dist/pagination-shadow.css, dist/status-badge.css; foundation dist/baseline.css, dist/baseline/elements.css, dist/baseline/reset.css, dist/baseline/tokens/color.css, dist/baseline/tokens/color/flexoki.css, dist/baseline/tokens/space.css, dist/baseline/tokens/space/regular.css, dist/baseline/tokens/type.css, dist/baseline/tokens/type/mono.css, dist/meta.css, dist/page.css, dist/structure.css, dist/utilities.css; @jaimestill/spike-html-packages-components/entry-shadow.css resolves by package name to its dist/entry-shadow.css |
| npm 12.2.1's install of the three by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under allow-git=none allow-remote=root with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| pnpm 12.15.0's install of the three by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under defaults with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| bun 1.4.4's install of the three by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under defaults with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| npm 12.2.1's install of the components and the foundation, their peer, by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under allow-git=none allow-remote=root with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| pnpm 12.15.0's install of the components and the foundation, their peer, by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under defaults with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| bun 1.4.4's install of the components and the foundation, their peer, by their release assets' URLs loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under defaults with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| npm 12.2.1's install of the three from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| pnpm 12.15.0's install of the three from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| bun 1.4.4's install of the three from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| npm 12.2.1's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| pnpm 12.15.0's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| bun 1.4.4's install of the components and the foundation, their peer, from GitHub Packages at the tags' versions loads on one foundation, styled by its page.css, in its page and its Vite build | yes: the page renders sl-status-badge, sl-entry-lit-shadow, sl-pagination-lit-shadow from 30 files of the install, its import map following the install's directories, every root adopting the reset and elements sheets the page imports from one foundation, and the page.css it links giving the body its background and font from the tokens, each token resolving in every shadow root, and the foundation's layer order; Vite 8.3.5's build of the app, its fixture installed under the registry and the token with each layer its tag's tree and one foundation, renders them from 3 files, every root adopting the sheets the app imports, and the page.css it imports by package name giving the same design |
| npm 12.2.1 installs the components alone, no foundation declared, at the tags, with no lockfile: it gives the components no foundation | yes: no setting installs it: allow-git=none allow-remote=none fails EALLOWGIT, allow-git=root allow-remote=none fails E404; it stops on E404, leaving no components and no foundation in node_modules |
| pnpm 12.15.0 installs the components alone, no foundation declared, at the tags, with no lockfile: it gives the components no foundation | yes: no setting installs it: defaults fails ERR_PNPM_FETCH_404; it stops on ERR_PNPM_FETCH_404, leaving no components and no foundation in node_modules |
| bun 1.4.4 installs the components alone, no foundation declared, at the tags, with no lockfile: it gives the components no foundation | yes: no setting installs it: defaults fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-foundation - 404; it stops on GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-foundation - 404, leaving the components and no foundation in node_modules |
| npm 12.2.1 installs the components alone, no foundation declared, by their release assets' URLs: it gives the components no foundation | yes: no setting installs it: allow-git=none allow-remote=none fails EALLOWREMOTE, allow-git=none allow-remote=root fails E404; it stops on E404, leaving no components and no foundation in node_modules |
| pnpm 12.15.0 installs the components alone, no foundation declared, by their release assets' URLs: it gives the components no foundation | yes: no setting installs it: defaults fails ERR_PNPM_FETCH_404; it stops on ERR_PNPM_FETCH_404, leaving no components and no foundation in node_modules |
| bun 1.4.4 installs the components alone, no foundation declared, by their release assets' URLs: it gives the components no foundation | yes: no setting installs it: defaults fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-foundation - 404; it stops on GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-foundation - 404, leaving the components and no foundation in node_modules |
| npm 12.2.1 installs the components alone, no foundation declared, from GitHub Packages at the tags' versions: it installs the foundation as their peer | yes: the registry and the token installs it; no registry setting fails E404, the registry alone fails E401; the foundation 0.1.0 as their peer, one foundation, the one the components resolve; each layer its tag's tree |
| pnpm 12.15.0 installs the components alone, no foundation declared, from GitHub Packages at the tags' versions: it installs the foundation as their peer | yes: the registry and the token installs it; no registry setting fails ERR_PNPM_FETCH_404, the registry alone fails ERR_PNPM_FETCH_401; the foundation 0.1.0 as their peer, one foundation, the one the components resolve; each layer its tag's tree |
| bun 1.4.4 installs the components alone, no foundation declared, from GitHub Packages at the tags' versions: it installs the foundation as their peer | yes: the registry and the token installs it; no registry setting fails GET https://registry.npmjs.org/@jaimestill%2fspike-html-packages-components - 404, the registry alone fails GET https://npm.pkg.github.com/@jaimestill%2fspike-html-packages-components - 401; the foundation 0.1.0 as their peer, one foundation, the one the components resolve; each layer its tag's tree |

## Release flow, 2026-10-26

`mise run release-flow` printed the table below and exited 0. It cut the foundation's 0.1.1 twice,
each in a scratch clone of the foundation's main pushed to a local bare remote that holds its tags.
In the hand flow, a person bumps the version and writes a Keep a Changelog section. In pnpm's flow,
a person marks the manifest `"private": true` and runs `pnpm change`, and `pnpm version -r` writes
the version and the changelog. Each flow then ran release.yml's own run steps, read from the
foundation's main, with the pinned tools standing in for jdx/mise-action and parse-changelog
0.6.16, the version create-gh-release-action v1.11.0 runs, standing in for the release notes; the
tarball's upload was skipped.

The table's findings are these:

- Both flows pass the check and land an annotated v0.1.1 on a pack commit whose tree is the
  tarball's, file for file.
- parse-changelog extracts the hand flow's section exactly.
- pnpm's flow needs `"private": true`: unmarked, `pnpm version -r` takes the unpublished 0.1.0 as
  a first release and never bumps. A private tree can't be published, and a `--dry-run` publish
  doesn't show it, since npm's and pnpm's both exit 0 on a private manifest; the table's row runs
  a real `pnpm publish` to a loopback registry nothing serves.
- pnpm writes `## 0.1.1`, then `### Patch Changes`, above the Keep a Changelog preamble, so
  parse-changelog's notes for 0.1.1 carry the preamble after the section.
- `pnpm change` and `pnpm version -r` read no network.
- pnpm bumps dependents only through `workspace:` ranges, so a dependent repository's bump, such as
  the components' peer range or devDependency tag, stays a hand edit.

| measure | result |
| --- | --- |
| hand flow: what the flow wrote | nothing: no tool writes before the workflow |
| hand flow: what a person wrote | M CHANGELOG.md, M package.json: the version 0.1.0 -> 0.1.1, the [v0.1.1] - 2026-10-26 section under ### Fixed, and the compare and tag links |
| hand flow: release.yml's steps | actions/checkout@v7.0.1: the clone; Read the version and whether it is tagged: ran; jdx/mise-action@v5.2.2: mise install ran; mise run install: ran; mise run check: ran; Pack, commit the pack's tree, and tag it: ran; Create the GitHub release: parse-changelog CHANGELOG.md 0.1.1 ran; Attach the tarball: skipped, it reaches GitHub |
| hand flow: the version, and the changelog section's form | 0.1.1; ## [v0.1.1] - 2026-10-26, then ### Fixed, between "## [Unreleased]" and "## [v0.1.0] - 2026-10-23"; 3 other changelog lines changed |
| hand flow: parse-changelog 0.6.16 extracts 0.1.1 | yes: the section as written, exactly |
| hand flow: pnpm's step read the network | no pnpm step: the person's edits read nothing |
| hand flow: the check is green | yes: mise run check: ran |
| hand flow: an annotated v0.1.1 on a pack commit equal to the tarball, in the bare remote | yes: annotated v0.1.1 on 14b3cd2, its one parent the pushed 6c1a6f7, its tree the tarball's package/ file for file; the remote's tags v0.1.1, v0.1.0 |
| hand flow: the tree can still be published | yes: pnpm publish passes its checks and sends @jaimestill/spike-html-packages-foundation@0.1.1's request, which the namespace refuses |
| pnpm flow: what the flow wrote | pnpm change: ?? .changeset/hungry-beds-bow.md; pnpm version -r: D .changeset/hungry-beds-bow.md, M CHANGELOG.md, M package.json, ?? .changeset/ledger.yaml |
| pnpm flow: what a person wrote | package.json's "private": true, and pnpm change's arguments: the package, --bump patch, and --summary "The foundation's next patch, cut to measure the release flow." |
| pnpm flow: release.yml's steps | actions/checkout@v7.0.1: the clone; Read the version and whether it is tagged: ran; jdx/mise-action@v5.2.2: mise install ran; mise run install: ran; mise run check: ran; Pack, commit the pack's tree, and tag it: ran; Create the GitHub release: parse-changelog CHANGELOG.md 0.1.1 ran; Attach the tarball: skipped, it reaches GitHub |
| pnpm flow: the version, and the changelog section's form | 0.1.1; ## 0.1.1, then ### Patch Changes, between "# Changelog" and "All notable changes to `@jaimestill/spik..."; 0 other changelog lines changed |
| pnpm flow: parse-changelog 0.6.16 extracts 0.1.1 | no: the section as written, then the file's next lines to the next heading, which the release notes would carry: All notable changes to `@jaimestill/spike-html-packages-foundation` are documented here. The ... |
| pnpm flow: pnpm's step read the network | no: pnpm change and pnpm version -r exit 0 under unshare -rn, the loopback interface alone, where a fetch of registry.npmjs.org fails |
| pnpm flow: the check is green | yes: mise run check: ran |
| pnpm flow: an annotated v0.1.1 on a pack commit equal to the tarball, in the bare remote | yes: annotated v0.1.1 on 29b7312, its one parent the pushed e0ef8a6, its tree the tarball's package/ file for file; the remote's tags v0.1.1, v0.1.0 |
| pnpm flow: the tree can still be published | no: pnpm publish refuses: This package has been marked as private |
| a dependent repository's bump stays a hand edit | yes: the foundation's workspace holds 1 project, @jaimestill/spike-html-packages-foundation; pnpm version -r changed D .changeset/hungry-beds-bow.md, M CHANGELOG.md, M package.json, ?? .changeset/ledger.yaml, all in the clone; the components' main names the foundation by peerDependencies ^0.1.0, devDependencies github:JaimeStill/spike-html-packages-foundation#v0.1.0, no workspace: range, so pnpm bumps nothing there |

## ESLint and Biome, 2026-10-26

`mise run biome` printed the table below and exited 0. It cloned each layer repository's main into
scratch, installed it from its lockfile, and wrote the tree the layer's own lint test writes,
`test/unit/layers-tree.js`, its violations and its allowed imports together. It linted the tree
with the layer's pinned ESLint, through the tree's own `lint()`, and with Biome 2.6.3, pinned in
mise for the measure alone. Biome's config is built from the layer's own: `noRestrictedImports`'
groups from `eslint.config.js`'s layer table, `noUndeclaredDependencies`, and two GritQL plugins,
`css-module.grit` for a `.css` import that isn't a static CSS module script and `declaration.grit`
for a value import of a declaration; its format settings are mapped option by option from
`.prettierrc.json`, and its files from `.prettierignore`. A case is a group of the tree's
violations by the rules that catch them, and each row names the files a rule misses. The task
wrote nothing in the repository, read no token, and removed its scratch.

The table's findings are these:

- ESLint and Biome each flag every case in every layer, and neither flags an allowed import.
- `noUndeclaredDependencies` reads the `package.json` beside `biome.json`, so the measure writes
  `biome.json` at the tree's root, where a layer would hold it; from anywhere else it reads no
  manifest and flags the declared packages too. In each layer it misses five files, the four imports
  of the layer's own name and the type import of `typescript`, a devDependency, and
  `noRestrictedImports` flags all five.
- `declaration.grit` can't resolve a specifier, so it judges by the layers' convention, not by the
  file imported: it flags a relative `.js` specifier, which only a declaration answers to, since
  the sources import each other by `.ts`. ESLint's boundaries judges the resolved file. The plugins
  match GritQL node names that Biome's version fixes, so a Biome upgrade is theirs too. In the
  components, `declaration.grit` misses 2 of the 7 relative paths into `node_modules/`, which
  `noRestrictedImports` flags.
- Every Prettier option the layers set has a Biome counterpart, and Biome at those options would
  still change files in every layer, in three ways Prettier doesn't: it puts a short JSON array on
  one line, `"files": ["dist"]` in each `package.json`; it breaks the foundation's long `@layer`
  statement in `page.css` one name per line, and indents the broken `:is()` lists in `meta.css` two
  spaces less; and it breaks a static import's `with { type: "css" }` past the line width over three
  lines, where Prettier leaves the line long, in the three components and the components' restyle
  test support. The table names the files; the three ways were read from `biome format --write`'s
  diff over a scratch rerun's clones the same day.
- Biome is one pin and 2 installed packages for lint and format together, beside `biome.json` and
  its plugins. ESLint is 8 pins and 133 to 138 installed packages, beside `eslint.config.js`, and
  Prettier one pin and one package, beside `.prettierrc.json` and `.prettierignore`.

| measure | result |
| --- | --- |
| foundation: the measure | main 5dd8a58, installed from pnpm-lock.yaml; ESLint 10.13.0, Biome 2.6.3; the tree's 41 violations and 10 allowed files, 56 code files under src/ |
| foundation: a package by name, 22 files | ESLint flags 22 of 22 (boundaries/dependencies 22, import-x/no-extraneous-dependencies 22); Biome flags 22 of 22 (noRestrictedImports 22, noUndeclaredDependencies 17 (not src/forms/typescript-type.ts, src/forms/self-name.ts, src/forms/self-name-type.ts, src/forms/self-name-export.ts, src/forms/self-name-dynamic.ts)) |
| foundation: a package by a relative path into node_modules/, 1 file | ESLint flags 1 of 1 (boundaries/dependencies 1, import-x/no-relative-packages 1); Biome flags 1 of 1 (declaration.grit 1, noRestrictedImports 1) |
| foundation: a value import of a declaration, 7 files | ESLint flags 7 of 7 (boundaries/dependencies 7); Biome flags 7 of 7 (declaration.grit 7) |
| foundation: a .css import that isn't a static CSS module script, 11 files | ESLint flags 11 of 11 (no-restricted-syntax 11); Biome flags 11 of 11 (css-module.grit 11) |
| foundation: false positives, on the allowed imports and the files they import | ESLint: none; Biome: none |
| foundation: config files | ESLint: eslint.config.js (111 lines); Prettier: .prettierrc.json (17 lines), .prettierignore (17 lines); Biome, for both: biome.json (66 lines), css-module.grit (16 lines), declaration.grit (15 lines) |
| foundation: pins to keep current | ESLint: 8, @eslint/js 10.0.1, eslint 10.13.0, eslint-import-resolver-typescript 4.4.5, eslint-plugin-boundaries 7.2.1, eslint-plugin-import-x 4.17.1, globals 17.13.0, typescript 6.0.3, typescript-eslint 8.72.0; Prettier: 1, prettier 3.9.10; Biome, for both: 1, @biomejs/biome 2.6.3 (mise's biome here), whose GritQL node names the plugins hold |
| foundation: installed packages, on this machine | ESLint: 138; Prettier: 1; Biome, for both: 2 |
| foundation: Biome's format, at .prettierrc.json's options, leaves the code, JSON, and CSS unchanged | no: of 39 files, its biome.json among them, it would change package.json, src/meta.css, src/page.css; every option has a Biome counterpart |
| sdk: the measure | main 9d10ca6, installed from pnpm-lock.yaml; ESLint 10.13.0, Biome 2.6.3; the tree's 30 violations and 6 allowed files, 40 code files under src/ |
| sdk: a package by name, 22 files | ESLint flags 22 of 22 (boundaries/dependencies 22, import-x/no-extraneous-dependencies 22); Biome flags 22 of 22 (noRestrictedImports 22, noUndeclaredDependencies 17 (not src/forms/typescript-type.d.ts, src/forms/self-name.d.ts, src/forms/self-name-type.d.ts, src/forms/self-name-export.d.ts, src/forms/self-name-dynamic.d.ts)) |
| sdk: a package by a relative path into node_modules/, 1 file | ESLint flags 1 of 1 (boundaries/dependencies 1, import-x/no-relative-packages 1); Biome flags 1 of 1 (noRestrictedImports 1) |
| sdk: a value import of a declaration, 7 files | ESLint flags 7 of 7 (boundaries/dependencies 7); Biome flags 7 of 7 (declaration.grit 7) |
| sdk: false positives, on the allowed imports and the files they import | ESLint: none; Biome: none |
| sdk: config files | ESLint: eslint.config.js (87 lines); Prettier: .prettierrc.json (17 lines), .prettierignore (13 lines); Biome, for both: biome.json (63 lines), declaration.grit (15 lines) |
| sdk: pins to keep current | ESLint: 8, @eslint/js 10.0.1, eslint 10.13.0, eslint-import-resolver-typescript 4.4.5, eslint-plugin-boundaries 7.2.1, eslint-plugin-import-x 4.17.1, globals 17.13.0, typescript 6.0.3, typescript-eslint 8.72.0; Prettier: 1, prettier 3.9.10; Biome, for both: 1, @biomejs/biome 2.6.3 (mise's biome here), whose GritQL node names the plugins hold |
| sdk: installed packages, on this machine | ESLint: 138; Prettier: 1; Biome, for both: 2 |
| sdk: Biome's format, at .prettierrc.json's options, leaves the code, JSON, and CSS unchanged | no: of 14 files, its biome.json among them, it would change package.json; every option has a Biome counterpart |
| components: the measure | main 4c0a5d8, installed from pnpm-lock.yaml; ESLint 10.13.0, Biome 2.6.3; the tree's 46 violations and 12 allowed files, 63 code files under src/ |
| components: a package by name, 19 files | ESLint flags 19 of 19 (boundaries/dependencies 19, import-x/no-extraneous-dependencies 19); Biome flags 19 of 19 (noRestrictedImports 19, noUndeclaredDependencies 14 (not src/forms/typescript-type.ts, src/forms/self-name.ts, src/forms/self-name-type.ts, src/forms/self-name-export.ts, src/forms/self-name-dynamic.ts)) |
| components: a package by a relative path into node_modules/, 7 files | ESLint flags 7 of 7 (boundaries/dependencies 7, import-x/no-relative-packages 7); Biome flags 7 of 7 (declaration.grit 5 (not src/forms/foundation-path-type.ts, src/foundation-sheet-path.ts), noRestrictedImports 7) |
| components: a value import of a declaration, 7 files | ESLint flags 7 of 7 (boundaries/dependencies 7); Biome flags 7 of 7 (declaration.grit 7) |
| components: a .css import that isn't a static CSS module script, 13 files | ESLint flags 13 of 13 (no-restricted-syntax 13); Biome flags 13 of 13 (css-module.grit 13) |
| components: false positives, on the allowed imports and the files they import | ESLint: none; Biome: none |
| components: config files | ESLint: eslint.config.js (124 lines); Prettier: .prettierrc.json (17 lines), .prettierignore (14 lines); Biome, for both: biome.json (76 lines), css-module.grit (16 lines), declaration.grit (15 lines) |
| components: pins to keep current | ESLint: 8, @eslint/js 10.0.1, eslint 10.13.0, eslint-import-resolver-typescript 4.4.5, eslint-plugin-boundaries 7.3.0, eslint-plugin-import-x 4.17.1, globals 17.13.0, typescript 6.0.3, typescript-eslint 8.72.0; Prettier: 1, prettier 3.9.10; Biome, for both: 1, @biomejs/biome 2.6.3 (mise's biome here), whose GritQL node names the plugins hold |
| components: installed packages, on this machine | ESLint: 133; Prettier: 1; Biome, for both: 2 |
| components: Biome's format, at .prettierrc.json's options, leaves the code, JSON, and CSS unchanged | no: of 23 files, its biome.json among them, it would change package.json, src/entry-lit-shadow.ts, src/pagination-lit-shadow.ts, src/status-badge.ts, test/browser/support/restyle.js; every option has a Biome counterpart |

## JSR

No JSR package was published. Every supported JSR publisher runs Deno: `deno publish`, and jsr
0.14.3's `npx jsr publish`, which downloads deno. Deno's runtime development ends a year after
2026-10-09, as its team joins Cloudflare (deno.com/blog/cloudflare); JSR continues on Cloudflare's
infrastructure. JSR is recorded instead from the `registries` plan's deno 2.9.8 dry runs of
2026-10-23, over scratch copies of the layers:

- JSR's exports are an explicit map, with no patterns, and a `.css` entry is refused ("Expected a
  JavaScript or TypeScript module, but identified a Css module"). The npm-compatibility tarball
  holds the published `.css` files, but its exports name only `jsr.json`'s entries, so no `.css`
  subpath resolves by package name for an npm consumer.
- CSS module script imports (`with { type: "css" }`) are refused, by the CLI and by the server's
  module graph (`unstable_css_imports` false), so the components can't go on JSR as built.
- The components' `github:` dependency on the foundation doesn't resolve.
- The foundation passes as TS sources, with no slow types. tsc's build passes too, but without
  `@ts-self-types`, so it gives npm consumers no types.
- The foundation's `./css` ambient subpath fails the slow-types check.
- The SDK's handwritten `.d.ts` passes only with `--no-check`.

A JSR version can be deleted only within 24 hours of its publish, with fewer than 10 downloads and
no dependents, and its number stays reserved; after that it can only be yanked
(jsr.io/docs/packages, jsr.io/docs/immutability). npm and bun install a JSR package through
npm.jsr.io as `@jsr/<scope>__<name>`, and pnpm 10.9 and later take `jsr:` specs natively
(jsr.io/docs/npm-compatibility, pnpm.io/package-sources).

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

## Evidence 8, reweighed

spike-html-conventions picked pnpm and ESLint+Prettier provisionally (its Results 1 and 6): a
registry release would reopen the manager, and making the layers packages would reopen the lint.
The spike has made the layers packages, one repository per layer, and recommends the git tag as
their release channel. This section weighs both picks again for a repository release at the git
tag, in conventions' order: first the standard and maintainability, then footprint, then speed,
which counts only on an order-of-magnitude gap.

**The standard and stewardship, read 2026-10-26.** On 2026-10-26, the npm downloads API's
`last-week` answered the week 2026-06-25 to 2026-07-01, and its daily counts since 2026-10-06 hold
days at 0: 2026-10-06, 2026-10-13 to 2026-10-15, and 2026-10-19 to 2026-10-21. So the week
conventions read, 2026-10-06 to 2026-10-12, counts six days, and the figures below are the last
complete week, 2026-09-28 to 2026-10-04, from the point range for that week
(`https://api.npmjs.org/downloads/point/2026-09-28:2026-10-04/<package>`). Like conventions', they
compare packages within one week only. Funding is each Open Collective's JSON, as conventions read
it: `yearlyIncome`, in cents, and `backersCount`, at `opencollective.com/<slug>.json`.

| package | npm downloads, 2026-09-28 to 2026-10-04 | 2026-10-06 to 2026-10-12, conventions' week |
| --- | ---: | ---: |
| npm | 19.6M | 16.3M |
| pnpm | 245.2M | 223.2M |
| eslint | 198.2M | 158.7M |
| prettier | 168.8M | 139.1M |
| @biomejs/biome | 21.1M | 17.9M |

| collective | Open Collective, read 2026-10-26 | read 2026-10-16, by conventions |
| --- | --- | --- |
| ESLint | $158,789 a year, 548 backers | $146,977 a year, 546 backers |
| Prettier | $63,054 a year, 352 backers | $58,056 a year, 351 backers |
| Biome | $30,433 a year, 38 backers | $30,433 a year, 38 backers |
| pnpm | $99,654 a year, 137 backers | a $87,654 yearly budget and 136 backers, from its page |

npm's figure for conventions' week was read 2026-10-26; conventions recorded none. npm's own
package counts only the installs of npm made through the registry, and node bundles npm, so it
isn't npm's use. The standard by use between the managers stays conventions' survey: npm 56.8%
against pnpm's 13.4% in Stack Overflow 2025, and npm in 10 of the 13 web-component libraries,
pnpm in none. npm has no Open Collective; it is GitHub's (conventions, Results 1).

**The manager: pnpm, no longer provisional.** First, the standard and maintainability. npm keeps
what it had in conventions: the standard by use, and the stronger stewardship, a corporate owner
with release lines kept in parallel and authorship spread wider. The registry release that would
reopen the call isn't the channel the answer recommends, so the repository-release facts still
count. One repository per layer, each one package, takes away part of pnpm's lead: the plain
`vX.Y.Z` tags (Tags) need no prefixed tag or subdirectory install, and each layer's workspace
holds one project ("Release flow, 2026-10-26"), so `workspace:`, graph-ordered runs, and catalogs
weigh on no layer repository. What remains is pnpm's:

- A consumer's own git tag installs with no setting. npm needs `allow-git=root` in every consumer
  that installs a layer at its tag (Consumer installs; "Live, 2026-10-26, components v0.2.0"), and
  refuses even `npm ci --offline` without it (Hosting).
- Phantom imports are refused by default: pnpm links only a project's declared dependencies, so an
  undeclared layer doesn't resolve (Measures, the pnpm column), where npm's default hoisted layout
  resolves it and its linked layout is opt-in (conventions, Results 1).
- A minimum release age by default: under no user config, pnpm 12.15.0 applied one to the
  same-day GitHub Packages versions and fell back to install them (Hosting), and it held
  eslint-plugin-boundaries 7.2.1 in the layout task (the goal record).

Against npm's standard by use and its stewardship, these are a consumer's guard and two install
defaults, and they decide it, as narrowly as conventions did. Second, footprint: npm is 46.5 MB
smaller than pnpm (conventions, Results 1), not an order of magnitude. Third, speed: pnpm installs
3.9 times faster than npm warm (conventions, Results 1), under an order of magnitude. Neither
overturns the first. The download figures above don't move the standard by use, which they don't
measure for npm.

**The release flow: the hand flow, not pnpm's change-intent flow.** Choosing pnpm as the manager
doesn't take its versioning. "Release flow, 2026-10-26" cut the foundation's 0.1.1 both ways. Both
pass the check and land an annotated tag on a pack commit equal to the tarball. pnpm's flow needs
the manifest marked `"private": true`, so its tree can't be published; its notes for 0.1.1 carry
the changelog's preamble; and it bumps a dependent only through `workspace:` ranges, so the
components' peer range and devDependency tag stay a hand edit. The hand flow is two edits a person
makes, the version and a Keep a Changelog section, which parse-changelog extracts exactly, and its
tree can still be published.

**The lint and format: ESLint+Prettier, settled.** First, the standard and maintainability.

- **The standard.** ESLint's 198.2M and Prettier's 168.8M weekly downloads against Biome's 21.1M,
  9.4 and 8.0 times, about the 8.9 and 7.8 times of conventions' week; SoJS and the web-component
  libraries stand as conventions read them.
- **Stewardship.** ESLint is an OpenJS project, at $158,789 a year from 548 backers, and Prettier
  draws $63,054 from 352; Biome's $30,433 from 38 is unchanged. ESLint's and Prettier's are the
  stronger, as on 2026-10-16.
- **Coverage.** Even: both flag every case in every layer, and neither flags an allowed import
  ("ESLint and Biome, 2026-10-26").
- **Mechanism.** ESLint's: boundaries judges a declaration import by the resolved file, and
  Biome's `declaration.grit` by the layers' naming convention, a relative `.js` specifier, on
  GritQL node names bound to Biome's version. That is Biome's gap.
- **Surface.** Biome's, clearly: one pin and 2 installed packages against nine pins and 134 to 139
  installed packages, ESLint's and Prettier's together, with a config file and its plugins against
  ESLint's config and Prettier's two.
- **Formatting.** The layers are formatted by Prettier, and Biome at the same options would change
  files in every layer, in the three ways "ESLint and Biome, 2026-10-26" names, so moving to it is
  a reformat, not a config swap.

Biome matched every case with far less surface, but ESLint is the standard by use, the tools are
better stewarded, and ESLint judges a declaration import by the resolved file. The first criterion
picks ESLint+Prettier. Footprint isn't measured again: conventions measured Biome at 66.7 MB and
ESLint+Prettier at 62.1 MB, even. Speed isn't measured here: conventions measured Biome's lint and
format 7.9 times faster, under an order of magnitude. Neither overturns the first. Biome is the
measured alternative, and a change in ESLint's or Prettier's stewardship reopens it.

## The answer

The question: how are the foundation's lateral concerns, its JS/TS modules, and the components
packaged and released by tag over spike-html-design v0.7.0: tag naming, release builds beside the
sources, and one library or several packages? It also decides the hosting and repository layout,
on which spike-html-conventions' pnpm pick depends, and the import extension the releases use.

**One repository per layer, each released by a plain `vX.Y.Z` git tag on a commit whose tree is
its pack, tsc's `.js` and `.d.ts` with every `.css` beside them, from `.ts` sources with `.ts`
specifiers; the components take the foundation as a peer; a release is cut by hand on a green
check; pnpm, and ESLint+Prettier.**

1. **Hosting** (Hosting): the git tag is the channel, installed by its tag under npm, pnpm, and
   bun, and loaded from jsDelivr /gh/ through an import map. Proven offline by the check's
   `test:consumers` tier, and from the network by "Live, 2026-10-23" and "Live, 2026-10-26,
   components v0.2.0", which add the release assets' URLs. GitHub Packages is the measured
   alternative, published for real ("Live, 2026-10-26, GitHub Packages at 0.0.1" and "Live,
   2026-10-26, components v0.2.0"): its one gain is that the peer range resolves there, so the
   components alone install their foundation, at the price of a registry setting and a token under
   every manager. JSR is recorded from deno 2.9.8's dry runs only, with no publish (JSR).
2. **Layout** (Hosting, Measures): one repository per layer, each one package, built on the layer
   below by its tag. The architect's end state, recorded in the goal record; one package against
   workspace packages was measured in Measures' tables of 2026-10-22, now retired, and the
   foundation, the SDK, and the components were built as repositories of their own, each with its
   own check, CI, and release workflow.
3. **Tag naming** (Tags): one plain `vX.Y.Z` per repository. Each tag resolves under npm, pnpm,
   and bun in the check's `test:consumers` tier and the Live tables, and on jsDelivr /gh/ in the
   Live tables.
4. **The release build** (Hosting): tsc's `.js` and `.d.ts` with every `.css` copied beside them,
   named by `exports` and `files`, carried in the tag's tree on a pack commit parented on the merge
   commit, with the same pack as the release asset. Every install is its tag's tree, file for
   file, in the check's `test:consumers` tier and the Live tables; the pack commit equals the
   tarball in "Release flow, 2026-10-26".
5. **The import extension** (Measures): `.ts` relative specifiers, rewritten to `.js` by tsc
   (`rewriteRelativeImportExtensions`), by the goal record's decision. The emitted `.d.ts` keep
   `.ts` specifiers, which typescript-go 7.0.2 and typescript 6.0.3 accept; other `.d.ts` readers
   are unmeasured. Measured in Measures' first table of 2026-10-22, now retired; the emit loads
   unbundled and through Vite in the check's `test:consumers` tier.
6. **Consumers** (Consumer installs): a page loading each install unbundled by an import map, and
   a Vite app with the local CSS module script plugin, built and on its dev server, each rendering
   the components on one foundation, styled by its page.css. Proven offline by the check's
   `test:consumers` tier over the tags, and from the network by "Live, 2026-10-26, components
   v0.2.0" over the release assets and GitHub Packages. With the foundation as a peer, only npm
   needs a guard, `allow-git=root` at the tags.
7. **The release flow** ("Release flow, 2026-10-26"): the hand flow, a version bump and a Keep a
   Changelog section, released by each layer's `release.yml` on a green check. pnpm's change-intent
   flow is rejected, by the goal record's decision on that table: its tree can't be published, its
   notes carry the changelog's preamble, and it bumps no dependent repository.
8. **The manager and the lint** (Evidence 8, reweighed): pnpm, no longer provisional, on a
   consumer's git tag with no setting, phantom imports refused, and a minimum release age by
   default, against npm's standard by use and stewardship. ESLint+Prettier, settled, with Biome
   the measured alternative ("ESLint and Biome, 2026-10-26"): it matched every case with far less
   surface, but judges a declaration import by a naming convention. Both picks are the goal
   record's decisions; the download and funding figures are sourced, read 2026-10-26.

**What reopens it.** A change in ESLint's or Prettier's stewardship reopens the lint, with Biome
the alternative. A registry release would reopen npm against pnpm, as conventions said; GitHub
Packages stays published as the measured alternative.

This answer is evidence for standards-lab's experiment.html intake; the spike decides nothing
itself.
