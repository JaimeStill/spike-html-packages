# goal · experiment.html.spike-html-packages

- **State:** building
- **Task:** registries
- **Branch:** registries

## Tasks

1. [x] layers
2. [x] layout
3. [x] hosting
4. [x] components
5. [x] by-tag
6. [ ] registries
7. [ ] consumers
8. [ ] answer

## Task brief · registries

```
Problem       Evidence 1 has no registry yet. The three layers are released
              by tag at v0.1.0, but no consumer has installed them from a
              registry, so the spike can't yet say what a registry carries of
              the .css or what a consumer pays to install. GitHub Packages is
              the registry left: JSR's publishers all run Deno, whose runtime
              development ends (deno.com/blog/cloudflare, 2026-10-09). This
              task publishes the three layers to GitHub Packages for real at
              0.0.1 and measures the installs in the networked task's dated
              table. It records JSR from the dated dry runs of PLAN round 1.
Repositories  changes: spike-html-packages (its tasks, its live table, and its
              docs). Read-only: spike-html-packages-foundation, -sdk, and
              -components at their v0.1.0 tags (eslint-plugin-boundaries
              7.3.0 is theirs).
Behaviors     1. `mise run publish` is a networked task, run by hand and
                 outside the check. It publishes each layer to GitHub
                 Packages as @jaimestill/spike-html-packages-<layer> at
                 0.0.1, in the order foundation, sdk, components. Each publish
                 is a scratch copy of the layer's v0.1.0 tree. The copy's
                 manifest differs from the tag's only in its version, 0.0.1,
                 and, in the components, in the foundation dependency, which
                 names the registry foundation at exactly 0.0.1. The task
                 writes nothing to the repository and removes its scratch
                 directory.
              2. The task reads gh's token from an environment variable and
                 never writes it to a file, in the repository or in scratch.
                 Before it publishes anything, it fails naming what is
                 missing: the variable, the token's write:packages scope, or
                 a layer's v0.1.0 tag.
              3. A version GitHub Packages already holds is never published
                 again. The task publishes only the layers not yet at 0.0.1
                 and names each one it skips, so once all three are held, a
                 rerun publishes nothing.
              4. Each published package is linked to its layer's repository,
                 and is public once the architect has changed its visibility.
              5. The wrapper that runs every install with none of the user's
                 config still unsets every npm_config_*, pnpm_config_*, and
                 BUN_CONFIG_* variable, except the one pnpm reads for GitHub
                 Packages' token. It lets that one through only when the
                 networked task sets it. `mise run check`, `mise run
                 install`, and `mise run lock` need no token and read no
                 GitHub Packages.
              6. The networked task reads the same token variable, and fails
                 naming it when it is unset. Before it measures anything, it
                 also checks that each of the three packages is on GitHub
                 Packages at 0.0.1 and public, and fails naming any that
                 isn't.
              7. The networked task's table gains these rows:
                 e. Installs from GitHub Packages: the three together and the
                    components alone, under each manager (npm, pnpm, bun), in
                    a scratch project with no lockfile and a fresh cache,
                    each layer named at exactly 0.0.1. The settings are tried
                    least first: none, then the @jaimestill registry alone,
                    then the registry and the token. Each row names the least
                    setting that installs, the error each lesser setting
                    failed with, and whether pnpm's minimum release age fell
                    back, skipped a version with no publish time, or didn't
                    apply. Each row also names the git guard the install
                    needed, with each manager at its default.
                 f. Each install's trees: every installed layer equals its
                    tag's tree, file for file, except its manifest. The
                    manifest differs from the tag's only in its version, and
                    in the components' foundation dependency. Exactly one
                    foundation is installed, and the components resolve to
                    it. No layer's devDependency is installed. Every export
                    subpath resolves to the file its exports name: node for
                    the npm and pnpm installs, bun for bun's. The row names
                    the .css files installed for each layer, and that a .css
                    subpath resolves by package name.
                 The earlier rows are unchanged.
              8. Docs. The context README records the networked task's table
                 in a new section headed with its date. Hosting gains the
                 GitHub Packages findings: what each manager needed to
                 install (registry config, token, release age), whether gh's
                 OAuth token was accepted where the docs name a classic PAT,
                 what of the .css reaches a consumer, and that a public
                 package can't be made private again but its versions stay
                 deletable. A JSR section records round 1's deno 2.9.8 dry
                 runs of 2026-10-23: no .css export entries, so no .css
                 subpath for npm consumers; CSS module script imports refused,
                 and so the components; the foundation passing as TS sources
                 and its build passing without types for npm consumers; the
                 ./css ambient subpath failing slow types; the SDK passing
                 only with --no-check; and github: specs unresolved. It
                 names Deno's end as the reason no JSR package was
                 published. The Releases and Tags sections list the 0.0.1
                 publishes. The Tasks, Layout, and Path item 6 sections, the
                 CLAUDE.md lines, and the marathon config's comment name the
                 publish task. The goal record logs the decisions, marks the
                 setup decisions on JSR superseded, and adds pending edits:
                 the coordinator's registries roadmap entry restated (GitHub
                 Packages published; JSR recorded from dry runs), and
                 html-artifacts.md corrected (JSR emits JS and .d.ts only
                 from TS entrypoints, and the components can't go on JSR as
                 built). The code meets STANDARDS.md's Code.
Test seams    `mise run publish`, with the published packages it reports;
              the networked task's dated table; and `mise run check`,
              unchanged.
Slices        1. Publish. The publish task: the token from the environment,
                 the preflight, the scratch copies at 0.0.1, the components'
                 registry foundation, and the skip of a version already
                 held. BUILD stops before the first publish, so the architect
                 can run `gh auth refresh -s read:packages,write:packages`
                 and judge whether gh's OAuth token is accepted; a refusal is
                 an escalation. BUILD stops again after the publish, so the
                 architect can make the three packages public. Demo: the
                 three packages at 0.0.1, public and linked to their
                 repositories, and a rerun that publishes nothing and names
                 all three.
              2. The registry rows. The token passed through the wrapper for
                 pnpm alone, the networked task's package preflight, and rows
                 e and f. Demo: the full dated table prints, and `mise run
                 check` still passes in a network namespace with no token
                 set.
              3. Docs, as behavior 8 lists. Demo: `mise run check` passes,
                 and the README reads true against the table, GitHub
                 Packages, and the dry-run record.
Out of scope  JSR publishes and any Deno or jsr CLI; any change to a layer
              repository; new layer releases or tags; publishing from
              GitHub Actions; registry consumers in the offline check; the
              npm registry; deleting the published versions; private-package
              access; type-checking the installs; the page and Vite consumers
              and the release flow.
Door          two-way: everything. The GitHub Packages publishes are real and
              public, but each version and package stays deletable (5,000
              downloads or fewer, restorable within 30 days). Public can't be
              made private again. No tag is pushed. The coordinator's edits
              land as pending edits, applied by the session.
```

## Progress

slices 1/3 committed (e2e1322) · published 2026-10-26, private, unlinked · standards — · spec — · editor —

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
- by-tag: the consumers' lockfiles are committed per fixture; `mise run install` installs frozen
  from them, and a separate networked `mise run lock` re-locks (round 1, 1).
- by-tag: npm's guard is allow-git=root for the three together and allow-git=all for the
  components alone, both proven offline (round 1, 2).
- by-tag: pnpm's blockExoticSubdeps, which a frozen offline install skips, is proven at resolution
  in the networked task, guards tried least first (round 1, 3).
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
- registries: the publishes run from a networked `mise run publish` in this repository, from
  scratch copies of each layer's v0.1.0 tree at 0.0.1; the layer repositories stay read-only
  (round 1, 2).
- registries: the components' published manifest names the registry foundation at exactly 0.0.1,
  not the github: tag (round 1, 3).
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

## Pending edits

- coordinator · roadmap: restate `[goals.experiment.html.spike-html-packages.tasks.by-tag]`'s
  summary as:

  ```
  This repository's consumer check installing the three v0.1.0 tags under npm, pnpm, and bun, as
  the three together and as the components alone, offline in `mise run check` from caches and a
  lockfile per manager that `mise run install` fills, with each manager's guard in the fixture's
  config; and a networked task that prints a dated table of jsDelivr /gh/ and the import-map page
  over the three tags, in headless chrome, and of each manager's installs with no lockfile, at the
  tags and by the release assets' tarball URLs. Evidence 1, 3.
  ```
