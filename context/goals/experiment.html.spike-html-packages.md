# goal · experiment.html.spike-html-packages

- **State:** building
- **Task:** by-tag
- **Branch:** by-tag

## Tasks

1. [x] layers
2. [x] layout
3. [x] hosting
4. [x] components
5. [ ] by-tag
6. [ ] registries
7. [ ] consumers
8. [ ] answer

## Task brief · by-tag

```
Problem       The three layers are released by tag at v0.1.0, but no consumer
              installs them by tag yet. The guards each manager needs were
              measured on the foundation tag and the monorepo's releases, not
              on all three tags, and jsDelivr /gh/ and the import-map page
              haven't been proven against the layer repositories. Until they
              are, evidence 1 (hosting) and 3 (tag naming) rest on retired
              fixtures. This task adds this repository's consumer check by
              tag, offline in its check, and a networked task that prints the
              live facts as a dated table.
Repositories  changes: spike-html-packages (its check, its tasks, and its
              docs). Read-only: spike-html-packages-foundation, -sdk, and
              -components at their v0.1.0 tags and main (nothing owed).
Behaviors     1. Six consumer fixtures, one per manager (npm, pnpm, bun) for
                 each consumer: the three together, and the components alone.
                 Each manifest is private and names each layer by its exact
                 tag, github:JaimeStill/spike-html-packages-<layer>#v0.1.0.
                 The three-together fixture names all three layers; the
                 components-alone fixture names only the components. Each
                 fixture holds its manager's committed lockfile and its guard
                 in the manager's own config: npm allow-git=root for the
                 three together and allow-git=all for the components alone,
                 pnpm blockExoticSubdeps false for both, and nothing for bun.
              2. `mise run install` is still the one task that reads the
                 network. It installs the mise pins and the root's
                 node_modules from the lockfile. It runs each fixture's
                 install frozen from its lockfile, which fills one cache per
                 manager in the repository's gitignored cache directory. It
                 also keeps a depth-1 fetch of each layer's v0.1.0 tag there.
                 It changes no fixture or lockfile.
              3. `mise run lock` is a networked task, and the only one that
                 writes the fixtures' lockfiles. It resolves each fixture
                 anew under its manager and guard. Run while the tags are
                 unchanged, it leaves every lockfile as it is.
              4. `mise run check` reads no network once `mise run install`
                 has run, and writes nothing in the repository outside its
                 cache directory. It runs Prettier, shellcheck 0.11.0 over
                 the scripts, and the consumer tier, and fails on any failing
                 tier. When a cache or a tag fetch is missing, it fails and
                 names `mise run install`. It passes in a network namespace
                 that has only the loopback up.
              5. The consumer tier installs each fixture offline, from its
                 lockfile and its manager's cache, in a scratch copy outside
                 the repository, and fails unless all of these hold:
                 - The lockfile is unchanged after the install.
                 - Each installed layer package equals its tag's tree, file
                   for file, compared against the kept fetch of the tag.
                   bun's .bun-tag is left out of the comparison, and it must
                   name that tag.
                 - In the three together, exactly one foundation is
                   installed, and the components resolve to it. In the
                   components alone, the components' foundation is the
                   foundation tag's tree.
                 - No layer's devDependency is installed.
                 - The runtime resolves every export subpath of each
                   installed layer to the file its exports name: node for the
                   npm and pnpm installs, bun for the bun installs. A
                   types-only subpath resolves to nothing. The foundation's
                   keys grammar runs, imported by package name.
              6. The consumer tier proves npm's guards offline. With its
                 config at allow-git=none, the three-together install fails
                 with EALLOWGIT. With allow-git=root, the components-alone
                 install fails with EALLOWGIT. With its committed config,
                 each install passes.
              7. `mise run currency` reports, and exits nonzero on, each of
                 these behind its latest: every mise tool (bun, npm,
                 shellcheck, and chrome-headless-shell among them), every
                 package.json pin, and each fixture's github: tag against
                 its layer repository's latest GitHub release.
              8. A networked mise task, outside the check, runs in the pinned
                 chrome-headless-shell 156.0.8078.47. Before it measures
                 anything, it checks that the three v0.1.0 tags and their
                 three release assets are published, and fails naming any
                 that is missing. It writes nothing to the repository: every
                 install, cache, and fetch it makes is in a scratch directory
                 it removes. It prints one markdown table, headed with its
                 run date, with these rows:
                 a. jsDelivr /gh/ at @v0.1.0, one row per repository: each
                    file in the tag's tree is fetched and compared byte for
                    byte, with the .js and .css content types, cache-control,
                    x-jsd-version, and x-jsd-version-type.
                 b. The import-map page, loaded from jsDelivr. Its
                    hand-written map has three entries: lit to
                    /npm/lit@3.3.3/+esm, and the foundation's and the
                    components' package prefixes to each tag's dist/ on
                    /gh/. There is no SDK entry. The page renders the three
                    components, each shadow root adopting three sheets, with
                    the foundation's reset and elements sheets the same
                    objects in every root. The row names the origins the page
                    loaded from.
                 c. Installs with no lockfile: each consumer under each
                    manager, trying each guard setting least first (npm none,
                    root, all; pnpm its defaults, then blockExoticSubdeps
                    false; bun its defaults). Each row names the least
                    setting that passes and the error each lesser setting
                    failed with, and checks the installed trees against the
                    tags.
                 d. Installs by release-asset tarball URL: the three assets
                    together, and the components' asset alone, under each
                    manager, with the guard settings tried least first. Each
                    install equals its tag's tree.
                 The browser resolves only the loopback address and
                 cdn.jsdelivr.net.
              9. The browser driver (DevTools Protocol over a pipe, with no
                 package) and the static server are copied from
                 spike-html-packages-components 8cb64a8, each with a
                 provenance line. The driver gains a host allowlist, empty by
                 default. The import-map page and the networked script are
                 new. No provenance line names the deleted hosting-built
                 branch.
              10. Docs. The context README records the networked task's table
                 in a new section headed with its date. The Hosting section
                 is corrected: pnpm 12.15.0 refuses the three together by
                 default too (ERR_PNPM_EXOTIC_SUBDEP), not only the
                 components alone. A frozen install skips that check, and
                 npm's allow-git applies even to npm ci --offline. The README
                 gains each consumer's guard table and each lockfile's record
                 of the tags: npm a git+ssh commit, pnpm a codeload tarball
                 at the commit, bun the annotated tag object's hash. The
                 Tasks, Layout, and Path item 5 sections, the CLAUDE.md check
                 line, and the marathon config's comment name the new check
                 and tasks. The goal record logs the decisions, and its
                 pending edits restate by-tag's roadmap entry with the
                 tarball-URL installs. The code meets STANDARDS.md's Code.
Test seams    This repository's `mise run check` (its consumer tier); and
              the networked task's dated table.
Slices        1. The three together, offline. The three fixtures with their
                 lockfiles and guards, `mise run install` filling the caches
                 and the tag fetches, the consumer tier's tree, foundation,
                 devDependency, and resolution checks, shellcheck, and the
                 preflight. Demo: `mise run check` passes in a network
                 namespace, and a lockfile edited by hand fails it.
              2. The components alone, and npm's guards. The three
                 components-alone fixtures and the EALLOWGIT proofs. Demo:
                 `mise run check` passes offline, and lowering either npm
                 guard fails it with EALLOWGIT.
              3. Re-lock and currency. `mise run lock`, and the tags in
                 `mise run currency`. Demo: `mise run lock` leaves every
                 lockfile unchanged, and `mise run currency` exits 0.
              4. The networked task, from jsDelivr: the driver and the
                 server copied with provenance and the host allowlist, the
                 publish check, the /gh/ rows, and the import-map page. Demo:
                 the task prints a dated table with the jsDelivr and page
                 rows.
              5. The networked task's installs: the no-lockfile installs
                 with the guard settings tried least first, and the
                 tarball-URL installs. Demo: the full dated table prints.
              6. Docs, as behavior 10 lists. Demo: `mise run check` passes,
                 and the README reads true against the table and the three
                 layer repositories.
Out of scope  Any change to a layer repository (eslint-plugin-boundaries
              7.3.0 is theirs); a new version of any layer; #semver: ranges;
              type-checking the installs; ESLint at the root; CI for this
              repository; GitHub Packages and JSR; the page and Vite
              consumers and the release flow; npm linked and bun isolated
              layouts; browsers other than chrome-headless-shell.
Door          two-way: everything. No tag is pushed and nothing is
              published. The networked task only reads GitHub and jsDelivr.
              The coordinator's restated by-tag entry lands as a pending
              edit, applied by the session.
```

## Progress

slices 6/6 committed (4a71e4a, 38250ae, 4afa9ae, e2b8799, 7153c5b, 7b1799b) · standards done (379b81a, e7ab519) · spec — · editor —

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
- setup: registry trials publish for real to GitHub Packages and JSR, `@jaimestill` at 0.0.x; a
  JSR version can never be removed (a one-way door). How JSR is published (workstation or Actions
  OIDC) waits on the registries task's plan.
- setup: GitHub Packages uses gh's token, granted read:packages and write:packages by a one-time
  `gh auth refresh`, passed by environment variable and never written to a file.
- setup: consumers install under npm, pnpm, and bun; bun 1.4.3 is pinned as a consumer only.
- setup: kind code; `mise run check` = shellcheck, grown by the layers task to
  spike-html-conventions' check. `mise run currency` over conventions' pins. No gate, no
  `[remote] ci`. Public repository, since jsDelivr /gh/ serves public repositories only.
- setup: releases are 0.y.z annotated tags pushed as evidence and never changed; their form is
  the tag-naming evidence's. The layers task pushes no tag.
- setup: hosting splits into `hosting` (git tag, tarball, import map, tag naming) and
  `registries` (GitHub Packages, JSR), keeping the registries' one-way door apart.
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
- components: the release integrity test requires both dependencies exact (lit 3.3.3 and an
  exact github: tag).
- components: tooling copied from the foundation names foundation 5dd8a58 as provenance; the
  layer's sources name spike-html-packages c2b4a19.
- components: currency compares the github: tag against the foundation's latest GitHub release.
- components: the README's pnpm guard for the components alone is block-exotic-subdeps=false.
- components: the root check stays Prettier alone in this task.
- components: the setup plan created the components repository from init's commit adfc3aa: the
  foundation's four init files, with downward-dependencies added to STANDARDS.md's pointers, and
  the foundation's main ruleset (25731073) created at setup, so BUILD verifies it (setup round 1,
  1-3).
- components: marathon-architecture's "Targets: marathon 0.16" is a minimum version, so it applies
  under 0.18.0 (setup round 1, 4).
- components: the coordinator's edits landed at plan apply (standards-lab #97): the goal's repos,
  [workspace.paths], references.toml, the restated components task, and the new by-tag task.
- components: the release test requires lit and the foundation as exact pins in form (an exact
  x.y.z, an exact `#vX.Y.Z` github: tag), not the literal 3.3.3, so a currency bump doesn't edit
  the test.
- components: a "packed manifest carries no scripts" test guards behavior 9's rule.
- components: the lint doesn't catch a value import of the foundation's types-only subpath (such
  as `format.js`) by package name, as layout's declaration-policy decision records for siblings;
  node and Vite catch it.
- components: the violation tree also requires the combined `@jaimestill/spike-html-packages`,
  typescript (a devDependency), and the layer's own name to be flagged as undeclared.
- components: pnpm needs no setting for a top-level github: dependency; the lockfile records the
  foundation as a codeload tarball at 29d16c0.
- components: the README's pnpm guard is `--config.block-exotic-subdeps=false` on `pnpm add`, with
  `blockExoticSubdeps: false` in pnpm-workspace.yaml as the lasting form, measured with pnpm 12.15.0
  on a pack of this build.
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
- by-tag: the consumers' lockfiles are committed per fixture; `mise run install` installs frozen from them, and a separate networked `mise run lock` re-locks (round 1, 1).
- by-tag: npm's guard is allow-git=root for the three together and allow-git=all for the components alone, both proven offline (round 1, 2).
- by-tag: pnpm's blockExoticSubdeps, which a frozen offline install skips, is proven at resolution in the networked task, guards tried least first (round 1, 3).
- by-tag: the offline check compares each install against its tag's tree, from a depth-1 fetch kept in the cache directory (round 1, 4).
- by-tag: no type-check of the installs; file and resolution checks only (round 1, 5).
- by-tag: shellcheck 0.11.0 joins the root's check as lint:shell; no ESLint (round 1, 6).
- by-tag: `mise run currency` also reports each fixture's github: tag behind its layer's latest GitHub release (round 1, 7).
- by-tag: the networked task's dated table is recorded in a dated section of context/README.md (round 1, 8).
- by-tag: the browser driver and static server are copied from spike-html-packages-components 8cb64a8 with provenance; the import-map page and networked script are written new, and no provenance names the reflog-only 1605161, which gets no ref (round 1, 9).
- by-tag: the networked task adds release-asset tarball-URL installs; by-tag's roadmap entry is restated as a pending edit (round 1, 10).

## Pending edits

(none)
