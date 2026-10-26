# goal · experiment.html.spike-html-packages

- **State:** building
- **Task:** answer
- **Branch:** answer

## Tasks

1. [x] layers
2. [x] layout
3. [x] hosting
4. [x] components
5. [x] by-tag
6. [x] registries
7. [x] consumers
8. [ ] answer

## Task brief · answer

```
Problem       Evidence 8 is the spike's last open item. spike-html-conventions
              picked pnpm and ESLint+Prettier provisionally: a registry release
              would reopen the manager, and making the layers packages would
              reopen the lint. The spike has since chosen one repository per
              layer, released by git tag. It has measured every hosting under
              every manager, but has never run Biome against the layers'
              per-package lint. Until the reweighing is written, the spike can't
              state its answer, and the intake can't weigh it.
Repositories  changes: spike-html-packages (a measure task, its pin, the
              README, STANDARDS.md, CLAUDE.md, and the goal record). Read-only:
              spike-html-packages-foundation, -sdk, and -components at main,
              cloned only into scratch. The coordinator's edits land as pending
              edits, applied at the sync.
Behaviors     1. A networked mise task, outside the check, clones each layer
                 repository's main into scratch and installs it from its
                 lockfile. It builds the layer's violation and allowed trees as
                 the layer's own lint test does. It lints them with the layer's
                 pinned ESLint and with Biome 2.6.3, which uses
                 noUndeclaredDependencies, noRestrictedImports, and GritQL
                 plugins for the CSS-module-script and .d.ts cases.
              2. Its dated table names, for each layer and each case, whether
                 ESLint and Biome flag it, and each side's false positives on the
                 allowed tree. Surface rows give each side's config files, pins
                 to keep current, and installed packages. A formatting row says
                 whether Biome, set to the layers' Prettier options, leaves the
                 layer's code, JSON, and CSS unchanged, naming each file it would
                 change.
              3. The task writes nothing in the repository, pushes nothing,
                 reads no token, and removes its scratch. It exits 1 only when a
                 layer can't be set up; a missed case is a measured fact.
              4. Biome is pinned in mise for the measure alone. `mise run
                 currency` reports it like the other pins, and `mise run check`
                 stays as it is.
              5. The README records the measure's table in a section headed
                 with its date. A reweighing section for evidence 8 picks the
                 manager and the lint and format tools for a repository release
                 at the git tag, in conventions' order: the standard and
                 maintainability, then footprint, then speed. It cites the
                 measured tables, and re-read download and funding figures with
                 their dates. Its lint pick is the one the architect made at
                 the measure stop.
              6. "The answer" in the README states the question, a one-line
                 answer, and evidence 1 to 8, each naming where it is proven: a
                 check tier, a networked task's dated table, or a decision
                 record. Each item proven only by tests or by sourced facts says
                 so. The answer covers the tag naming, the release build beside
                 the sources, one repository per layer, the git tag as the
                 channel with GitHub Packages as the measured alternative, the
                 import extension, the consumers, the hand release flow, pnpm,
                 and the lint pick.
              7. STANDARDS.md's Packages section states the peer form: the
                 foundation as a peer at a caret range, and a devDependency at
                 its exact tag. The Path, Tasks, and Layout sections and
                 CLAUDE.md name the measure task. The code meets STANDARDS.md's
                 Code section.
              8. The goal record logs the decisions. Its pending edits are:
                 - the answer section for html-artifacts.md under "Answers ·
                   experiment.html", in marathon's answer-section form;
                 - the JSR replacement, kept;
                 - the three roadmap restatements, dropped;
                 - the roadmap's removal of the goal, with its header comment;
                 - references.toml's spike-html-packages entry;
                 - the three layer [workspace.paths] entries, removed.
Test seams    The measure task's dated table; `mise run check`.
Slices        1. The measure, behaviors 1 to 4. Demo: the dated table prints,
                 and every repository is unchanged afterwards. BUILD stops for
                 the architect's lint pick.
              2. The reweighing and the answer, behaviors 5 and 6. Demo: the
                 README reads true against the tables and the decisions, and
                 `mise run check` passes.
              3. The docs and the pending edits, behaviors 7 and 8. Demo:
                 `mise run check` passes; the pending edits match the Sync.
Out of scope  Any change to, release of, or upgrade in the layer repositories
              (their trailing eslint-plugin-boundaries 7.3.0, mise-action
              v5.2.3, and typescript-eslint 8.72.1); adopting Biome or npm
              anywhere; re-measuring installs, hostings, or the release flow;
              oxlint+oxfmt or ESLint Stylistic again; lint speed; any publish,
              or deleting GitHub Packages versions; the intake's decisions.
Door          two-way: no tag or publish. The measure runs in scratch, and the
              coordinator's edits land through the sync pull request.
```

## Progress

slices 3/3 committed · standards — · spec — · editor —

## Decisions

- setup: the evidence is the eight items in `context/README.md`, "The evidence".
- setup: the spike packages copies with provenance: spike-html-conventions' layers (main a88828a)
  and spike-html-design v0.7.0's tools and modules; not fresh minimal fixtures, which would miss
  the `.css` beside the `.js` and the components-on-foundation dependency. Lit 3.3.3 is the runtime
  dependency.
- setup: v0.7.0's tools are split into three self-layered sheets (utilities: scroll and tables;
  structure: field stacks; meta: buttons and hue variants), not copied as one tools sheet.
- setup: v0.7.0's registry and keys family (grammar, runtime, help) are copied; preferences,
  theme-menu, register, and conformance stay out, since theme-menu and conformance write CSS from
  strings against the convention.
- setup: default profiles only (Flexoki, regular, mono); spike-html-design already proved
  profiles as extension packages.
- setup: superseded by the registries plan: registry trials publish for real to GitHub Packages and
  JSR, `@jaimestill` at 0.0.x; a JSR version can never be removed (a one-way door). How JSR is
  published (workstation or Actions OIDC) waits on the registries task's plan.
- setup: GitHub Packages uses gh's token, granted read:packages and write:packages by a one-time
  `gh auth refresh`, passed by environment variable and never written to a file.
- setup: consumers install under npm, pnpm, and bun; bun 1.4.3 is pinned as a consumer only.
- setup: kind code; `mise run check` = shellcheck, grown by the layers task to
  spike-html-conventions' check. `mise run currency` over conventions' pins. No gate, no
  `[remote] ci`. Public repository, since jsDelivr /gh/ serves public repositories only.
- setup: releases are 0.y.z annotated tags pushed as evidence and never changed; their form is
  the tag-naming evidence's. The layers task pushes no tag.
- setup: superseded by the registries plan: hosting splits into `hosting` (git tag, tarball,
  import map, tag naming) and `registries` (GitHub Packages, JSR), keeping the registries' one-way
  door apart.
- setup: references are keys in the coordinator's catalog: spike-html-design (v0.7.0) and
  spike-html-conventions (main a88828a), read-only; herald is spike-html-apps' concern. The spike
  keeps no references files.
- setup: the release tool and the lint choice wait on the layout task's evidence.
- layers: redirected at the review stop. Slices 1-5 work but miss the workspace's bar: essay
  prose in the copies, harness workarounds, and mise.toml and scripts/ a person can't follow.
  Four rework slices on the same branch.
- layers: .ts relative specifiers with rewriteRelativeImportExtensions, not .js. They match the
  tsconfig's erasableSyntaxOnly and verbatimModuleSyntax, and node runs the sources unbuilt.
- layers: the help dialog loads through a literal import(), not import(new URL(...).href). Vite
  and tsc can both see a literal, and the module still resolves relative to itself.
- layers: copied modules are rewritten to the workspace standard, keeping their behavior and a
  provenance line; the bar is spike-html-conventions' layers/ code at a88828a, not its scripts/.
- layers: the harness is rebuilt on standard mechanisms: browser tests on dist/,
  CSS.forcePseudoState for hover, the package managers' own offline modes. mise.toml becomes
  small named tasks, and the repository is laid out by role.
- layers: the tool sheets' layer order is meta, structure, utilities, after elements, which keeps
  v0.7.0's computed styles where a button combines with scroll or field classes.
- layers: the page entry is `layers/foundation/page.css`: one `@layer` statement, then the
  baseline and the three sheets.
- layers: `exports` maps a pattern per layer for modules and sheets; `./sdk/*.js` and
  `./foundation/format.js` are types-only; `files` is `["dist"]`.
- layers: the consumer caches live in the repository's `.cache/consumers/`, warmed by
  `mise run install`, because pnpm's default store follows the project's filesystem (tmpfs here).
  The check therefore writes `.cache/` too.
- layers: one consumer fixture, `test/consumers/consumer/`, copied once per manager, replaces
  three identical fixtures.
- layers: the browser tier's in-page case modules are plain `.js` with JSDoc, loaded unbuilt
  beside `dist/`.
- layers: only the copy that installed the listener loads the help module, as in v0.7.0. The test
  for behavior 10's "two copies each load their own" proves that the first copy loads the help
  beside it.
- layers: tsc's emitted `.d.ts` keep `.ts` relative specifiers. typescript-go 7.0.2 and
  typescript 6.0.3 accept them, as the README records; other `.d.ts` readers are unmeasured, and
  the registries (JSR) may find more.
- layers: Vite 8.3.4 still needs the local CSS module script plugin
  (`test/fixtures/measure/css-sheets.js`); without it, a build fails with MISSING_EXPORT on `.css`
  imports. The consumers task builds on this.
- layout: the layers become pnpm workspace packages in the repository, with the one package put
  together from their builds; both layouts stay releasable.
- layout: three packages, one per lint-table layer (foundation, components, sdk); the tool sheets
  stay in foundation. A further layer is resolved when one is needed.
- layout: the measure covers pnpm, npm hoisted, npm linked, and bun isolated, in scratch copies.
- layout: the consumer tier installs the three packages' local tarballs in this task; URL and git
  forms stay with hosting.
- layout: the boundaries table stays, with import-x's no-extraneous-dependencies and
  no-relative-packages added.
- layout: workspace packages are scoped `@jaimestill/spike-html-packages-<layer>`.
- layout: the one package is renamed `@jaimestill/spike-html-packages`.
- layout: siblings resolve through built output in dependency order, not a source condition,
  project references, or paths. It is the most common practice among publishing libraries (Vite,
  typescript-eslint, lit, rushstack) and the only one that carries to one repository per layer,
  as Go's pinned require with GOWORK=off does.
- layout: foundation owns the ambient `*.css` declaration as its ./css subpath.
- layout: the one package lives in its own workspace directory; the root is private with no
  runtime dependency, so the root can't leak lit to foundation.
- layout: the one package's build rewrites bare sibling specifiers to relative ones, not a
  `#foundation` subpath import.
- layout: the browser tier and the demo load only the one package's build.
- layout: the architect's end state is one repository per layer, like ~/architecture's Go
  repositories; the hosting task measures it with three scratch repositories by tag.
- layout: held typescript at 6.0.3: typescript-eslint 8.72.0's peer range (<6.1.0) declines 7.x;
  typescript-go 7.0.2 is the type checker.
- layout: held eslint-plugin-boundaries at 7.2.0: 7.2.1 (2026-10-21T10:55Z) is younger than
  pnpm 12's default minimum release age, and taking it would commit a minimumReleaseAgeExclude;
  retried before the brief, else the next task's currency takes it.
- layout: chrome-headless-shell 156 no longer caches a failed module fetch, so the help retry
  test counts a request per import(); keys.ts's retry was already right.
- layout: scripts/build.sh takes the build order from pnpm (`pnpm -r exec pwd`) but runs tsc
  itself, since pnpm's PATH puts node_modules/.bin's typescript 6.0.3 ahead of typescript-go.
- layout: pnpm-workspace.yaml sets `verifyDepsBeforeRun: false`, so `pnpm -r exec` never
  installs; the check reads no network, and `mise run install` installs.
- layout: foundation's exports map `./css.js` to null, so the ambient `*.css` declaration is a
  types subpath only and `./*.js` gives it no runtime subpath.
- layout: the one package declares its siblings as devDependencies, so a consumer installs none;
  `pnpm pack` writes them at their version (0.0.0 at the time), which a registry publish would
  carry.
- layout: the lint's declaration policy applies to `!(dist/**)*.d.ts`, so a value import of a
  types-only sibling subpath by package name passes the lint; node and Vite catch it ("not
  exported"), as the measure records.
- layout: pnpm's metadata cache (cacheDir) is kept in .cache/consumers/pnpm, beside its store,
  because `--offline` resolves from it and its default is in the home directory.
- layout: the measure judges value imports with Vite beside node; they disagree on the absolute
  path (Vite resolves it from its root) and the percent-encoded segment (node resolves it).
- layout: the consumer tier installs in each manager's default layout (pnpm isolated, npm hoisted,
  bun hoisted outside a workspace); the measure alone covers npm linked and bun isolated.
- layout: the consumer tier's overrides point the foundation at its tarball by `file:`, since
  npm's `$ref` needs the package as a direct dependency, which the components-alone consumer lacks.

- hosting: superseded by the hosting re-plan: a release build lives on a release commit whose tree
  is the package's pack, parented on the merge commit; dist/ stays ignored on main, and SHIP pushes
  tags cut by the release script rather than tagging the merge commit.
- hosting: superseded by the hosting re-plan: v0.1.0 releases the one package,
  `@jaimestill/spike-html-packages`.
- hosting: superseded by the hosting re-plan: each layer is tagged in both forms, `<layer>/v0.1.0`
  and `@jaimestill/spike-html-packages-<layer>@0.1.0`, on the same release commit.
- hosting: the release version is 0.1.0; the registries keep their own 0.0.x.
- hosting: superseded by the hosting re-plan: one repository per layer is three public GitHub
  repositories, JaimeStill/spike-html-packages-foundation, -components, and -sdk.
- hosting: superseded by the hosting re-plan: live deliveries are proven by a networked mise task
  that prints a dated table; the check gains an offline git+file:// tier over the same release
  commits.
- hosting: carried to the components task: the import map maps lit to jsDelivr /npm/lit@3.3.3/+esm,
  as one entry.
- hosting: superseded by the hosting re-plan: the components' release names its foundation by
  github:JaimeStill/spike-html-packages#foundation/v0.1.0, not a release-asset URL or 0.1.0 with
  consumer overrides.
- hosting: superseded by the hosting re-plan: each of this repository's seven tags gets a GitHub
  release with its pack as the asset; the per-layer repositories get none.
- hosting: superseded by the hosting re-plan: each per-layer repository holds its layer's sources,
  manifest, standalone build config, and LICENSE on main, with v0.1.0 a release commit built from
  them.
- hosting: the per-layer components name their foundation by the exact tag #v0.1.0, since bun fails
  every #semver: git spec.
- hosting: superseded by the hosting re-plan: the import-map page loads the layers from the
  per-layer repositories @v0.1.0, with no encoding needed.
- hosting: superseded by the hosting re-plan: SHIP pushes the tags and creates the repositories
  after acceptance; the live table lands in a follow-up pull request before registries.
- hosting: the license is Apache 2.0, a byte copy of the ~/architecture repositories' LICENSE (not
  MIT, per the architect), at the root, in each package, and in each per-layer repository, with
  "license": "Apache-2.0" in the four packages' and the per-layer repositories' manifests (the
  private root has none), and no NOTICE.
- hosting: the eslint-plugin-boundaries hold at 7.2.0 is lifted; 7.2.1 cleared pnpm's minimum
  release age on 2026-10-22 and brings handlebars 4.7.10.
- hosting: bun 1.4.4 writes `.bun-tag` into each package it installs, holding a tarball's integrity
  or a git release's commit hash; the monorepo's consumer and releases tiers asserted it and left it
  out of the file comparison.
- hosting: `licenseProblems`, now in each layer repository's `test/unit/release.js`, also requires
  the manifest's "Apache-2.0" and the LICENSE's Apache heading, not only the file's presence.
- hosting: pnpm 12.15.0 packs the root LICENSE into a package that has none, so a pack can't show a
  package's missing copy; the monorepo's unit tier checked each package's directory instead.
- hosting: npm 12's `allow-git` defaults to none; root suffices except where the nested git
  foundation is fetched (the components alone), which needs all.
- hosting: bun 1.4.4's overrides never reach a nested `github:` spec, so the monorepo's releases
  tier asserted the components unreachable offline under bun and installed the foundation and the
  SDK alone.
- hosting: superseded by the hosting re-plan: `scripts/release.sh` rebuilds `dist/` before packing,
  so a release comes from the committed sources.
- hosting: superseded by the hosting re-plan: the releases tier clones the working tree, uncommitted
  files included, and runs git with `GIT_CONFIG_GLOBAL=/dev/null` and a fixed identity.
- hosting: superseded by the hosting re-plan: the per-layer repositories build with typescript
  6.0.3, the root's pin, under pnpm.
- hosting: superseded by the hosting re-plan: the per-layer repositories carry no lockfile: a
  consumer never reads a dependency's lockfile, and generating one reads the registry.
- hosting: the per-layer release manifests carry no scripts, since npm prepares a git dependency
  that has a build script, installing its devDependencies first.
- hosting: superseded by the hosting re-plan: the per-layer repositories' commits and tags are dated
  at the workspace HEAD's commit date, so the same commit gives the same repositories.
- hosting: README.md ships in each per-layer repository's pack.
- hosting: superseded by the hosting re-plan: the offline import-map check serves a Vite bundle of
  the installed lit 3.3.3 at /npm/lit@3.3.3/+esm, in place of jsDelivr's build.
- hosting: superseded by the hosting re-plan: `scripts/live.js` tries each manager's guard settings
  least first, and first checks that all 17 remote items (the ten tags and the seven release assets)
  are published.
- hosting: superseded by the hosting re-plan: release assets keep `pnpm pack`'s names,
  jaimestill-spike-html-packages[-<layer>]-0.1.0.tgz.

- hosting (re-plan): the architect redirected the built brief at BRIEF: build what the spike proves
  the way it would be adopted, with real repositories released by version, as the Go workspace
  layers, not generated copies and release scripts.
- hosting (re-plan): the layers' sources move out of packages/ into repositories of their own; this
  repository keeps the record, the README, and later a consumer check (round 1, 1).
- hosting (re-plan): the layer repositories are this goal's repos, located through [workspace.paths]
  and catalogued in references.toml, not spike sub-goals (round 1, 2).
- hosting (re-plan): each layer repository's release workflow, on push to main, cuts the version
  that has no tag yet: the check, pnpm pack, a pack-tree commit on the merge commit, an annotated
  tag, and a GitHub release with CHANGELOG.md's notes and the tarball; main stays source-only and
  SHIP doesn't tag (round 2, replacing round 1, 3, and folding in round 1, 6's workflow).
- hosting (re-plan): hosting splits in two: this task releases foundation and sdk v0.1.0, and the
  `components` task builds the components and this repository's consumer on those tags, with no
  local bridge (round 1, 4).
- hosting (re-plan): each layer repository's CI runs `mise run check` on pull requests into main and
  pushes to it (round 1, 5).
- hosting (re-plan): each layer repository keeps a Keep a Changelog CHANGELOG.md, the source of its
  releases' notes (round 1, 6).
- hosting (re-plan): restarted from origin/main on a new `hosting` branch carrying the upgrade and
  license commits; the built branch stays local as `hosting-built` and is deleted after SHIP (round
  1, 7).
- hosting (re-plan): jsDelivr /gh/ and the import-map page belong to the `components` task (round 3,
  1).
- hosting (re-plan): a layer repository's lint keeps eslint-plugin-boundaries cut to its own layer,
  with the .d.ts rule and import-x's manifest rules (round 3, 2).
- hosting (re-plan): `mise run measure` retires; its tables of 2026-10-22 stay in the README (round
  3, 3).
- hosting (re-plan): this repository's check is Prettier alone under kind code until the
  `components` task adds its consumer tier (round 3, 4).
- hosting (re-plan): the release workflow uses inline git for the pack commit and tag,
  taiki-e/create-gh-release-action for the notes, and `gh release upload` for the tarball; no
  maintained action cuts a commit only a tag reaches (round 3, 5).
- hosting (re-plan): the layer repositories take the Go repositories' [remote] settings as written
  (round 3, 6).
- hosting (re-plan): each layer repository's main has the Go ruleset (pull request required, no
  deletion, no force push), with the repository admin role as its bypass, since a personal account
  has no organization admin, which the Go repositories bypass (round 3, 7).
- hosting (re-plan): the components layer's sources leave this repository with packages/; the
  `components` task copies them from this repository's history, naming the commit.
- hosting (re-plan): the coordinator's edits landed at plan apply (standards-lab #95): the goal's
  repos, [workspace.paths], references.toml, the restated hosting task, and the new `components`
  task.
- hosting (re-plan): pnpm 12.15.0 refuses a nested git dependency (`ERR_PNPM_EXOTIC_SUBDEP`) unless
  `blockExoticSubdeps` is false, measured on 2026-10-22 on `hosting-built`, which is deleted after
  SHIP.
- hosting (re-plan): the SDK's lint has no CSS module script rule, since the SDK holds declarations
  only and no stylesheet; a departure from behavior 4, decided without the architect.
- hosting (re-plan): actionlint and shellcheck run in each layer repository's check, since a pull
  request's CI never runs release.yml and the check is its only gate before SHIP.
- hosting (re-plan): Prettier ignores Markdown in all three repositories, a convention kept from
  spike-html-conventions, so this repository's check covers little beyond its JSON files.
- hosting (re-plan): release.yml runs the check itself and tags on a push to main, where the Go
  repositories' release runs on a tag push, because the tag's commit must carry dist/.
- hosting (re-plan): the release test resolves the exports with Node's own resolver
  (`import.meta.resolve`), not a copy of its algorithm.
- hosting (re-plan): the SDK's build copies src/ whole into dist/, since every source is a
  handwritten .d.ts.
- hosting (re-plan): jdx/mise-action is at v5.2.2 in the layer repositories; the Go repositories
  still pin v5.1.2, and taking it is theirs.
- hosting (re-plan): each layer repository's unit tier depends on build, because the release test
  packs dist/.
- hosting (re-plan): provenance lines in the layer repositories name spike-html-packages 7fb31a8;
  the SDK's tooling copied from the foundation names foundation 867b4fd, and its
  `test/unit/release.js` names 91f144d, the commit that moved the release test to Node's resolver.
- hosting (re-plan): the components layer's sources are last held at c2b4a19, the provenance the
  `components` task names.

- components: the components repository is set up by a `marathon plan` session after this brief
  is approved, as hosting's was (#95); this brief is its next brief (round 1, 1).
- components: the root's consumer check runs in `mise run check`, offline from caches and a
  committed lockfile per manager filled by `mise run install` (round 1, 2), carried to by-tag.
- components: consumers by tag are the three together and the components alone (round 1, 3),
  carried to by-tag.
- components: the import-map page is proven by a networked task in headless chrome printing a
  dated table, outside the check; the three map entries are hand-written (round 1, 4), carried
  to by-tag.
- components: round 1's answers 2-4 move to a new task `by-tag` between components and
  registries, since they need the components tag that only SHIP cuts (round 2, 1).
- components: the components repository copies the foundation's form; its manifest names the
  foundation by github:...#v0.1.0 and lit exactly 3.3.3; the SDK has no import-map entry; each
  manager's guard goes in the fixture's own config.
- components: the browser tier serves lit and its dependencies through the static server's
  /deps/, as at c2b4a19, since pnpm keeps them out of the top-level node_modules.
- components: superseded by consumers: the release integrity test requires both dependencies exact
  (lit 3.3.3 and an exact github: tag).
- components: tooling copied from the foundation names foundation 5dd8a58 as provenance; the
  layer's sources name spike-html-packages c2b4a19.
- components: currency compares the github: tag against the foundation's latest GitHub release.
- components: superseded by consumers: the README's pnpm guard for the components alone is
  block-exotic-subdeps=false.
- components: the root check stays Prettier alone in this task.
- components: the setup plan created the components repository from init's commit adfc3aa: the
  foundation's four init files, with downward-dependencies added to STANDARDS.md's pointers, and
  the foundation's main ruleset (25731073) created at setup, so BUILD verifies it (setup round 1,
  1-3).
- components: marathon-architecture's "Targets: marathon 0.16" is a minimum version, so it applies
  under 0.18.0 (setup round 1, 4).
- components: the coordinator's edits landed at plan apply (standards-lab #97): the goal's repos,
  [workspace.paths], references.toml, the restated components task, and the new by-tag task.
- components: superseded by consumers: the release test requires lit and the foundation as exact
  pins in form (an exact x.y.z, an exact `#vX.Y.Z` github: tag), not the literal 3.3.3, so a
  currency bump doesn't edit the test.
- components: a "packed manifest carries no scripts" test guards behavior 9's rule.
- components: the lint doesn't catch a value import of the foundation's types-only subpath (such
  as `format.js`) by package name, as layout's declaration-policy decision records for siblings;
  node and Vite catch it.
- components: the violation tree also requires the combined `@jaimestill/spike-html-packages`,
  typescript (a devDependency), and the layer's own name to be flagged as undeclared.
- components: pnpm needs no setting for a top-level github: dependency; the lockfile records the
  foundation as a codeload tarball at 29d16c0.
- components: superseded by consumers: the README's pnpm guard is
  `--config.block-exotic-subdeps=false` on `pnpm add`, with `blockExoticSubdeps: false` in
  pnpm-workspace.yaml as the lasting form, measured with pnpm 12.15.0 on a pack of this build.
- components: CI needs no guard or token to fetch the public github: foundation.
- components: the static server's /deps/ is a table of package directories by name (lit,
  lit-html, lit-element, and @lit/reactive-element from lit's pnpm store directory; the foundation
  from node_modules); any other path under it is a 404, and `..` can't leave a package.
- components: the pages' import maps map the foundation's prefix to /deps/<foundation>/dist/; the
  restyle and adoption cases import the foundation's sheets by package name, so they get the same
  sheet objects the shadow roots adopt.
- components: demo/documents.js is copied from c2b4a19 too, because the probe and the demo import
  it.
- components: `mise run types` splits into types:sources and types:browser, which runs
  `tsc -p test/browser` after the build.
- components: STANDARDS.md's judgement calls are the foundation's, adapted: the layer reaches the
  foundation only through its tag dependency, and the handwritten-.d.ts and literal-import() calls
  are dropped.
- components: a copied file changed from its source names it with "Adapted from", an unchanged one
  with "From" (standards review).
- components: the root's context/README.md Hosting names each manager's guard for installing the
  components, and by-tag's Path entry cites evidence 1 and 3.
- components: slice 3's demo, "CI green on its pull request", is shown at SHIP, since nothing is
  published before the session brief is accepted.
- components: the offline check needs the loopback up: `unshare -rn` alone fails the browser tier
  on 127.0.0.1, and `ip link set lo up` inside the namespace makes it pass.
- components: the guards each manager needs for the components' nested github: foundation (npm
  allow-git=all, pnpm block-exotic-subdeps=false, bun none) were measured on the real foundation
  tag at the plan's round 1, 2026-10-23, in scratch; by-tag measures them again on all three tags.
- by-tag: the consumers' lockfiles are committed per fixture; `mise run install` installs frozen
  from them, and a separate networked `mise run lock` re-locks (round 1, 1).
- by-tag: superseded by consumers: npm's guard is allow-git=root for the three together and
  allow-git=all for the components alone, both proven offline (round 1, 2).
- by-tag: superseded by consumers: pnpm's blockExoticSubdeps, which a frozen offline install skips,
  is proven at resolution in the networked task, guards tried least first (round 1, 3).
- by-tag: the offline check compares each install against its tag's tree, from a depth-1 fetch
  kept in the cache directory (round 1, 4).
- by-tag: no type-check of the installs; file and resolution checks only (round 1, 5).
- by-tag: shellcheck 0.11.0 joins the root's check as lint:shell; no ESLint (round 1, 6).
- by-tag: `mise run currency` also reports each fixture's github: tag behind its layer's latest
  GitHub release (round 1, 7).
- by-tag: the networked task's dated table is recorded in a dated section of context/README.md
  (round 1, 8).
- by-tag: the browser driver and static server are copied from spike-html-packages-components
  8cb64a8 with provenance; the import-map page and networked script are written new, and no
  provenance names the reflog-only 1605161, which gets no ref (round 1, 9).
- by-tag: the networked task adds release-asset tarball-URL installs; by-tag's roadmap entry is
  restated as a pending edit (round 1, 10).
- by-tag: npm's guard for a tarball URL is the pair allow-git and allow-remote, tried least first:
  npm 12 refuses tarball URLs under allow-remote=none (EALLOWREMOTE).
- by-tag: installing the three by release-asset URL gives two foundations under every manager (the
  consumer's asset copy and the components' own github: copy); row d reports the count, while the
  by-tag rows still require one foundation.
- by-tag: bun's .bun-tag holds the tarball's sha512 integrity for an asset install, and the
  annotated tag object's short hash for a GitHub install, which the check requires to name the tag.
- by-tag: scripts/installed.sh is the one comparison against the tags, shared by the check and
  `mise run live`.
- by-tag: the check resolves an undeclared foundation through the components, since pnpm keeps it
  out of the top-level node_modules.
- by-tag: every install runs through scripts/unconfigured.sh, which empties the user's npm, pnpm,
  and bun config and unsets npm_config_*, pnpm_config_*, and BUN_CONFIG_*, because those settings
  flipped guard results in trials.
- by-tag: left the user's git config read: isolating it is outside the brief.
- by-tag: left the import-map page's lit 3.3.3 unreported by currency: the right check is the
  page's lit equal to the components' lit at the tag, a consumers-task concern.
- by-tag: the driver and server live in test/live/, and the server drops /deps/, since the page's
  import map names no installed package.
- by-tag: the root package.json gains "type": "module".
- by-tag: the npm EALLOWGIT proof also requires npm's "Refusing to fetch" line to name the expected
  package (standards review).
- registries: JSR is dropped, with no publish, no deno pin, and no jsr CLI: every supported JSR
  publisher runs Deno, whose runtime development ends a year after 2026-10-09
  (deno.com/blog/cloudflare); JSR is recorded from PLAN round 1's deno 2.9.8 dry runs of 2026-10-23
  (round 1, 1, 7, 10; round 2, 1).
- registries: superseded by consumers: the publishes run from a networked `mise run publish` in this
  repository, from scratch copies of each layer's v0.1.0 tree at 0.0.1; the layer repositories stay
  read-only (round 1, 2).
- registries: superseded by consumers: the components' published manifest names the registry
  foundation at exactly 0.0.1, not the github: tag (round 1, 3).
- registries: the three GitHub Packages packages are made public by the architect after their
  first publish (round 1, 4).
- registries: the registry consumers are rows in `mise run live`'s dated table, with the token
  from the environment; `mise run check` stays token-free (round 1, 9).
- registries: round 1's answers 5, 6, 8, and 11 (JSR's sources, ./css, components attempt, and
  publish stop) lapse with JSR.
- registries: the architect ran `gh auth refresh -s read:packages,write:packages` during PLAN;
  gh's token lists write:packages.
- registries: gh's OAuth token (gho_) was accepted by npm.pkg.github.com for publishing, where the
  docs name a classic PAT only; the three layers were published at 0.0.1 on 2026-10-26, private.
- registries: a package with no `repository` field isn't linked to the repository its name names,
  contrary to GitHub's docs; the v0.1.0 manifests have none, so all three published unlinked.
- registries: `mise run publish` takes a positional `dry-run` argument, as preflight.sh takes
  `live`, since `mise run` has its own --dry-run flag.
- registries: the token reaches npm through a scratch `.npmrc` that holds the literal
  `${GITHUB_PACKAGES_TOKEN}` reference, not an npm_config_ variable, which unconfigured.sh unsets.
- registries: behavior 4's links are made by hand with each package page's Connect Repository, by
  the architect, beside the visibility change; the published manifests keep the brief's two
  differences, with no `repository` field and no 0.0.2 (escalation 1).
- registries: pnpm 12.15.0 takes GitHub Packages' token only from the variable
  `pnpm_config_//npm.pkg.github.com/:_authToken`: it ignores `${...}` in a project .npmrc's
  `_authToken` and refuses `pnpm_config__auth`. unconfigured.sh lets that variable through only
  with `--github-packages-token`, which only live.js passes.
- registries: unconfigured.sh reads variable names from `env -0`, since `compgen -e` omits names
  bash can't hold, such as pnpm's per-registry settings, which the wrapper therefore left set.
- registries: bun's registry and token go in the scratch project's bunfig.toml
  `[install.scopes]`, where bun expands `$GITHUB_PACKAGES_TOKEN`.
- registries: the public packages still need a token: with the registry alone, every manager
  fails 401.
- registries: bun 1.4.4 writes no .bun-tag for a registry install, so installed.sh's registry mode
  requires none.
- registries: rows e and f are separate rows, six each, after rows a-d.
- registries: publish's held check reads npm view's stdout alone, so a warning can't read as a
  version not held (standards review).
- registries: GitHub's REST API can't change a package's visibility or repository link, so both
  are hand steps in the package's settings.
- registries: live's preflight reads each package's visibility with gh's own login, and checks
  0.0.1 in the registry metadata with GITHUB_PACKAGES_TOKEN.

- consumers: the components repository joins the task, where round 1 kept the layers read-only;
  the foundation and the SDK need nothing (architect's redirect, superseding round 1, 1).
- consumers: the release-flow comparison runs in scratch clones with a local bare remote; no tag
  or repository is created (round 1, 2).
- consumers: pnpm's side is the change-intent flow, `pnpm change` then `pnpm version -r` (round
  1, 3).
- consumers: the hand side is the layers' current flow: a hand bump and a Keep a Changelog
  section, cut by release.yml's steps (round 1, 4).
- consumers: the installed page and the Vite app run offline in `mise run check` over the tag
  installs, with chrome-headless-shell joining the check, and in `mise run live` over the
  release-asset URLs and GitHub Packages (round 1, 5).
- consumers: the consumer shapes are the three together and the components alone (round 1, 6).
- consumers: the hostings are the tag, the release-asset URL, and GitHub Packages (round 1, 7).
- consumers: the managers are npm, pnpm, and bun (round 1, 8).
- consumers: the installed page loads the installed lit, unbundled (round 1, 9).
- consumers: the installed page's import map is written by hand for each manager's layout, not
  generated by @jspm/generator (round 1, 10).
- consumers: the Vite app runs `vite build`, served statically, and the dev server (round 1, 11).
- consumers: the Vite plugin is the local CSS module script plugin from c2b4a19, copied with
  provenance, not vite-plugin-standard-css-modules; Vite has no native support (vitejs/vite#17700)
  (round 1, 12).
- consumers: Vite is pinned in each Vite fixture, and `mise run currency` reads those pins (round
  1, 13).
- consumers: the offline check requires the jsDelivr page's lit to equal the components' lit pin
  at their latest tag (round 1, 14).
- consumers: pnpm's trial marks the scratch manifest "private": true; unmarked, `pnpm version -r`
  takes an unpublished version as a first release and never bumps (round 2, 1).
- consumers: the release-flow comparison is a networked mise task of its own printing a dated
  table, recorded in a dated README section (round 2, 2).
- consumers: held parse-changelog at 0.6.16: create-gh-release-action v1.11.0 runs 0.6.16 (round
  2, 3).
- consumers: the page on any install follows the install's resolution through import map scopes
  (round 2, 5).
- consumers: the Vite dev server runs in the offline check only (round 2, 7).
- consumers: six Vite fixtures of their own; the page reuses the consumer fixtures' installs
  (round 2, 8).
- consumers: the release-flow trial cuts the foundation alone; pnpm's bump propagation follows
  workspace: ranges only, so a dependent repository's bump stays a hand edit (round 2, 9).
- consumers: round 2's answers 4 (the dedupe row) and 6 (two-foundation rows) are superseded by
  round 3.
- consumers: two foundations are a defect of the components' v0.1.0: its plain github:
  dependency installs a second copy whenever the consumer's foundation comes from another source,
  and the sheets are per-module objects, so a consumer's restyle misses the shadow roots; the
  registry and keys state survive through Symbol.for on globalThis (round 3, architect's
  question).
- consumers: the components' foundation peer is ^0.1.0, not the git spec, which npm refuses
  (ERESOLVE) whenever the consumer's foundation comes from the release asset or GitHub Packages
  (round 3, 1).
- consumers: the components release v0.2.0, the 0.y breaking bump, with its CHANGELOG section
  (round 3, 2).
- consumers: lit stays an exact dependency of the components (round 3, 3).
- consumers: the components keep the foundation as a devDependency at its exact tag beside the
  peer, and their release test requires that form (round 3, 4).
- consumers: round 3's answer 5 (a 0.0.2 publish) is superseded by round 4.
- consumers: the six consumer fixtures move to v0.2.0; v0.1.0's evidence stays in the README's
  dated tables (round 3, 6).
- consumers: the components-alone consumer declares the components and the foundation (round 3,
  7).
- consumers: live adds rows of the components alone with no foundation on v0.2.0, which read yes
  when each manager fails as measured (round 3, 8).
- consumers: the jsDelivr import-map page names the components at v0.2.0 (round 3, 9).
- consumers: on v0.2.0, a page or Vite row that finds two foundations fails live and the check
  (round 3, 10).
- consumers: every page and Vite row requires the sheets the consumer imports by package name to
  be the objects the components' shadow roots adopt (round 3, 11).
- consumers: no Vite dedupe row (round 3, 12).
- consumers: BUILD stops after the components' slices for the architect to review and merge their
  pull request, then waits for release.yml to cut v0.2.0 with its asset before the root's slices
  (round 3, 13).
- consumers: GitHub Packages publishes each layer at its tag's version (the foundation and the SDK
  at 0.1.0, the components at 0.2.0), each package equal to the tag's pack with no rewrites;
  live's tree comparison drops its manifest exceptions; supersedes hosting's "the registries keep
  their own 0.0.x" and registries' 0.0.1 rewrite of the components' foundation (round 4, 1).
- consumers: the publish task publishes each layer's latest tag only, so there is no components
  0.1.0 on GitHub Packages (round 5, 1).
- consumers: the three 0.0.1 versions are deleted by the architect by hand, at a BUILD stop after
  `gh auth refresh -s delete:packages`, once the tag versions are published; live's preflight
  requires 0.0.1 absent (round 5, 2).
- consumers: measured in PLAN, 2026-10-26, with the components' pack rewritten at 0.2.0: with the
  foundation peer at ^0.1.0, the tag and release-asset installs give one foundation under npm
  12.2.1, pnpm 12.15.0, and bun 1.4.4, with no nested git guard (npm allow-git=root at the tags,
  allow-remote=root alone by the asset URLs); the components alone fail under every manager. The
  same measure with the foundation kept in dependencies at its tag (v0.1.0's form) gave two
  foundations by the release asset or beside GitHub Packages' 0.0.1 under every manager.
- consumers: the session deleted the three 0.0.1 versions through GitHub's REST API, once the
  architect had granted gh's token delete:packages, where round 5, 2 named a hand deletion.
- consumers: measured in PLAN: pnpm 12.15.0 doesn't apply blockExoticSubdeps to a peer it
  auto-installs, so a git-spec peer bypasses the guard.
- consumers: measured in PLAN: `pnpm version -r` reads the registry for an unmarked package and
  bumps a private one offline; it writes changesets-form `## X.Y.Z` / `### Patch Changes`
  sections above a Keep a Changelog preamble, with no format setting.

- consumers: held typescript-eslint at 8.72.0 in the components: 8.72.1 (2026-10-26T17:09Z) is
  younger than pnpm 12's default minimum release age, and taking it would commit a
  minimumReleaseAgeExclude; retried before the brief, as layout held eslint-plugin-boundaries.

- consumers: the components' slices were reviewed (standards, spec, editor) before their merge
  rather than at the task's end, since the merge cuts v0.2.0, which is never re-cut.
- consumers: the components' CHANGELOG and README leave GitHub Packages out, since 0.2.0 isn't
  published there until the publish slice (spec review).
- consumers: the components' currency imports `caretAdmits` from their `test/unit/release.js`, so
  the peer-range check runs the rule the release test covers (standards review).
- consumers: live's row c from GitHub Packages expects each manager to install the foundation as
  the peer, as measured, where the brief named only a failed install or no foundation; it reads
  yes only on one foundation (standards review).
- consumers: the pages run inside `test:consumers`, with no `test:pages` task of their own.
- consumers: pnpm's page hard-codes pnpm's hashed store directory names, which the lockfile's tags
  fix; live rewrites every page's map to its install with `test/live/installed-map.js`.
- consumers: Vite runs under node for every manager, bun's fixtures included.
- consumers: the Vite fixtures skip the subpath and npm guard proofs; their check is the build,
  the dev server, and the sheet check.
- consumers: the npm guard proof requires the refused package to be one the consumer declares;
  npm names one, the sdk for the three and the foundation for the components.
- consumers: publish takes a layer's latest tag as the highest `vX.Y.Z` on its remote, and fails
  when that tag's manifest names another version.
- consumers: release-flow's publishability row runs a real `pnpm publish`, offline, to a loopback
  registry nothing serves, since npm's and pnpm's `--dry-run` exit 0 on "private": true.
- consumers: release-flow exits 1 only when a flow can't be set up; a row's no is a measured fact.
- consumers: release-flow's extract row reads no when parse-changelog's notes carry more than the
  section; the check row finds its step by `mise run check`, not by its name (standards review).
- consumers: release-flow's steps run without GH_TOKEN, GITHUB_TOKEN, GITHUB_PACKAGES_TOKEN, and
  MISE_GITHUB_TOKEN (standards review).
- consumers: currency prints parse-changelog as held and exits 0 when a held pin is all that is
  behind.

- consumers: redirected at BRIEF (round 6): the consumers must show the layers shaping the app's
  design, not only the sheet identity.
- consumers: the installed pages and the Vite app both load the foundation's page.css (round 6,
  1).
- consumers: the Vite app imports page.css by package name, a plain import Vite's own CSS
  pipeline bundles; the local plugin stays for the components' CSS module scripts (round 6, 2).
- consumers: the check requires computed design values page.css gives (the document's background
  and font, a token resolving inside each shadow root, the @layer order), not a screenshot
  (round 6, 3).
- consumers: the fixtures' pagination sets a page size the size select offers; an unoffered size
  is the components' concern, left unchanged (round 6, 4).
- consumers: corrects round 6's PLAN facts, which held that the jsDelivr import-map page already
  linked page.css; it linked no stylesheet.
- consumers: the jsDelivr page also links page.css, from jsDelivr at the foundation's tag, and
  live's import-map row runs the design check; the offline check requires that link (decided by
  the session after round 6, matching the redirect's intent).
- consumers: the jsDelivr page's link carries `crossorigin="anonymous"`, so the page can read
  page.css's rules; its four imported sheets stay unreadable cross-origin, and page.css's own
  statement names all eight layers before them.
- consumers: the check reads the layer order as the cascade's tree, each name under its parent in
  first-named order, through each import's `layer()`, read depth first, since Vite's build
  minifier drops page.css's `@layer` statement; an unreadable sheet before every foundation layer
  is named makes the order unknown (standards review, d123ede).
- consumers: the shadow-root token check can fail only on a component overriding a token or an
  empty shadow root, since custom properties inherit across the boundary; judged and left.
- answer: the answer recommends the git tag as the release channel; GitHub Packages stays the
  measured alternative, its one gain a resolving peer range.
- answer: the layer repositories stay read-only; the Biome measure clones them into scratch. Their
  trailing eslint-plugin-boundaries 7.3.0, mise-action v5.2.3, and typescript-eslint 8.72.1 are
  left to whoever next touches them, or the intake.
- answer: Biome 2.6.3 is measured over each layer's violation and allowed trees beside ESLint,
  with its built-in rules plus GritQL plugins for the CSS-module-script and .d.ts cases; the
  table gives coverage, surface, and formatting rows, no timing or restore rows.
- answer: BUILD stops after the measure for the architect's ESLint-or-Biome pick.
- answer: the three layers' `[workspace.paths]` entries are removed at the sync;
  references.toml and references.local.toml locate them for the intake.
- answer: the three roadmap restatements (by-tag, registries, consumers) are dropped, since the
  sync deletes the goal's tables; the JSR edit to html-artifacts.md stays.
- answer: pnpm is the manager the answer recommends for a repository release at the git tag, no
  longer provisional; npm's consumer cost is allow-git=root.
- answer: the hand release flow is recommended; pnpm's change-intent flow is rejected (an
  unpublishable private tree, release notes carrying the changelog preamble, no bump across
  repositories).
- answer: the three public GitHub Packages versions stay published, as the measured alternative.
- answer: STANDARDS.md's Packages bullet is corrected to the peer form; download and funding
  figures are re-read and dated for the reweighing.
- answer: the lint pick stays ESLint+Prettier, now settled: Biome 2.6.3 matched every case with
  far less surface, but ESLint is the standard by use and judges a .d.ts import by the resolved
  file, where Biome's GritQL plugin relies on a naming convention and on version-bound node names.
  Biome is the measured alternative; a change in ESLint's or Prettier's stewardship reopens it.

## Pending edits

- coordinator · html-artifacts.md: in "Experiment: spike-html-packages", the Hosting item, replace
  "JSR emits JS and `.d.ts` from `.ts` and installs natively in pnpm 10.9+ and Yarn 4.9+, while npm
  needs `.npmrc` setup and Bun's support isn't documented." with:

  ```
  JSR emits JS and `.d.ts` only from TS entrypoints: tsc's `.js` without `@ts-self-types` gets no
  types in its npm-compatibility package. JSR refuses `.css` exports and CSS module script imports,
  so the components can't go on JSR as built. It installs natively in pnpm 10.9+ and Yarn 4.9+,
  while npm and Bun install it through npm.jsr.io as `@jsr/<scope>__<name>`, with `.npmrc` setup
  (jsr.io/docs/npm-compatibility).
  ```

- coordinator · html-artifacts.md: under "## Answers · experiment.html", after "### Answer ·
  experiment.html.spike-html-conventions", add:

  ```
  ### Answer · experiment.html.spike-html-packages

  **Question:** How are the foundation's lateral concerns, its JS/TS modules, and the components
  packaged and released by tag over spike-html-design v0.7.0: tag naming, release builds beside
  the sources, and one library or several packages? It also decides the hosting and repository
  layout, on which spike-html-conventions' pnpm pick depends, and the import extension the
  releases use.

  **Answer:** One repository per layer, each released by a plain `vX.Y.Z` git tag on a commit
  whose tree is its pack, tsc's `.js` and `.d.ts` with every `.css` beside them, from `.ts`
  sources with `.ts` specifiers; the components take the foundation as a peer; a release is cut
  by hand on a green check; pnpm, and ESLint + Prettier.

  1. Hosting: the git tag is the channel, installed by its tag under npm, pnpm, and bun, and
     loaded from jsDelivr /gh/ through an import map. Proven offline by the check's
     `test:consumers` tier, and from the network by `mise run live` ("Live, 2026-10-23" and
     "Live, 2026-10-26, components v0.2.0"), which adds the release assets' URLs. GitHub
     Packages is the measured alternative, published for real at the tags' versions: its one
     gain is that the peer range resolves there, so the components alone install their
     foundation, at the price of a registry setting and a token under every manager. Proven by
     `mise run live` ("Live, 2026-10-26, GitHub Packages at 0.0.1" and "Live, 2026-10-26,
     components v0.2.0"). JSR is recorded from deno 2.9.8's dry runs only, with no publish.
  2. Layout: one repository per layer, each one package, built on the layer below by its tag,
     each with its own check, CI, and release workflow. The architect's decision in the goal
     record; one package against workspace packages was measured in the README's Measures tables
     of 2026-10-22, now retired.
  3. Tag naming: one plain `vX.Y.Z` per repository. Proven by the check's `test:consumers` tier
     under npm, pnpm, and bun, and by `mise run live`'s tables, which add jsDelivr /gh/.
  4. The release build: tsc's `.js` and `.d.ts` with every `.css` copied beside them, named by
     `exports` and `files`, carried in the tag's tree on a pack commit parented on the merge
     commit, with the same pack as the release asset. Proven by the check's `test:consumers` tier
     and `mise run live`'s tables, every install its tag's tree file for file, and by `mise run
     release-flow`'s table of 2026-10-26, where the pack commit equals the tarball.
  5. The import extension: `.ts` relative specifiers, rewritten to `.js` by tsc
     (`rewriteRelativeImportExtensions`), by the goal record's decision on the Measures table of
     2026-10-22, now retired; the emit loads unbundled and through Vite in the check's
     `test:consumers` tier. The emitted `.d.ts` keep `.ts` specifiers, which typescript-go 7.0.2
     and typescript 6.0.3 accept; other `.d.ts` readers are unmeasured.
  6. Consumers: a page loading each install unbundled by an import map, and a Vite app with the
     local CSS module script plugin, built and on its dev server, each rendering the components on
     one foundation, a peer at `^0.1.0`, styled by its page.css. Proven offline by the check's
     `test:consumers` tier over the tags, and from the network by `mise run live` ("Live,
     2026-10-26, components v0.2.0") over the release assets and GitHub Packages. Only npm needs
     a guard, `allow-git=root` at the tags.
  7. The release flow: the hand flow, a version bump and a Keep a Changelog section, released by
     each layer's `release.yml` on a green check. pnpm's change-intent flow is rejected: its tree
     can't be published, its notes carry the changelog's preamble, and it bumps no dependent
     repository. Proven by `mise run release-flow`'s table of 2026-10-26 and the goal record's
     decision on it.
  8. The manager and the lint: pnpm, no longer provisional, on a consumer's git tag with no
     setting, phantom imports refused, and a minimum release age by default, against npm's
     standard by use and stewardship. ESLint + Prettier, settled, with Biome the measured
     alternative: Biome 2.6.3 matched every case with far less surface, but judges a declaration
     import by a naming convention. Proven by `mise run biome`'s table of 2026-10-26 and the goal
     record's decisions; the download and funding figures are sourced facts only, read
     2026-10-26.

  A change in ESLint's or Prettier's stewardship reopens the lint, with Biome the alternative. A
  registry release reopens npm against pnpm; GitHub Packages stays published as the measured
  alternative.

  [The answer](https://github.com/JaimeStill/spike-html-packages/blob/main/context/README.md#the-answer) · [spike-html-packages](https://github.com/JaimeStill/spike-html-packages)
  ```

- coordinator · roadmap: remove `[goals.experiment.html.spike-html-packages]` and its eight task
  tables, `layers` to `answer`, and remove `"experiment.html.spike-html-packages"` from `active`.
  In the header comment, replace "spike-html-design and spike-html-conventions have answered
  (html-artifacts.md, "Answers · experiment.html"), and spike-html-packages is active." with:

  ```
  spike-html-design, spike-html-conventions, and spike-html-packages have answered
  (html-artifacts.md, "Answers · experiment.html"), and spike-html-apps is next.
  ```

  Staging spike-html-apps is the sync's own step, not this edit; when the sync stages it, the
  clause reads "and spike-html-apps is active" instead.

- coordinator · references.toml: after `[repos.spike-html-conventions]`, add the entry below,
  committed as "catalog: list spike-html-packages, synced and awaiting intake", as
  spike-html-conventions was (29d2efe):

  ```
  [repos.spike-html-packages]
  remote = "https://github.com/JaimeStill/spike-html-packages.git"
  ```

- coordinator · .claude/marathon.toml: under `[workspace.paths]`, remove the three layer entries,
  `spike-html-packages-foundation`, `spike-html-packages-sdk`, and
  `spike-html-packages-components`; references.toml and references.local.toml locate them for the
  intake.
