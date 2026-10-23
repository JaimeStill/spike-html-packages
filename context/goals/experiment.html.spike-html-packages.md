# goal · experiment.html.spike-html-packages

- **State:** brief ready
- **Task:** hosting
- **Branch:** hosting

## Tasks

1. [x] layers
2. [x] layout
3. [ ] hosting
4. [ ] components
5. [ ] registries
6. [ ] consumers
7. [ ] answer

## Task brief · hosting

```
Problem       The layers are proven to layer locally, as workspace packages
              in one repository. It is unproven that they layer as separate
              repositories, each released at a version and built on the one
              below by its tag, the way the Go workspace layers. The built
              branch only emulated that, with generated repositories, release
              scripts, and an install harness. This task makes the foundation
              and the SDK real repositories, each with its own check, CI, and
              release workflow, and releases each at v0.1.0. The later
              components task then builds on real tags.
Behaviors     1. Two public repositories, JaimeStill/spike-html-packages-
                 foundation and JaimeStill/spike-html-packages-sdk, each hold
                 the only copy of their layer's sources, with provenance
                 lines kept. Each package keeps its name
                 (@jaimestill/spike-html-packages-<layer>), its exports, and
                 its files, at version 0.1.0 with "license": "Apache-2.0".
                 Main holds sources only and never dist/.
              2. Each repository is a complete marathon project modeled on
                 the Go repositories. It has a CLAUDE.md of navigation
                 pointers; a working-context README; a STANDARDS.md; a
                 marathon config of kind code, with check `mise run check`,
                 currency `mise run currency`, and the Go repositories'
                 [remote] settings, where merge waits on `gh pr checks` and
                 ci waits on every push run of the merge commit; a Keep a
                 Changelog CHANGELOG.md with a dated v0.1.0 section; the
                 workspace repositories' Apache 2.0 LICENSE, byte for byte;
                 a README; and a mise.toml.
              3. Each repository's `mise run check` reads no network once
                 `mise run install` has run. It runs ESLint, Prettier,
                 typescript-go, the build into dist/, and the unit tier; the
                 foundation's check also runs the browser tier. It fails on
                 any failing tier.
              4. The lint covers one layer: the repository's own layer table,
                 the .d.ts rule (a declaration file is imported only by
                 `import type` or `export type`), the CSS module script rule,
                 and import-x's no-unresolved, no-extraneous-dependencies,
                 and no-relative-packages. Its test runs the lint over a
                 violation tree cut to the layer, and passes only when ESLint
                 flags exactly these: an import of any undeclared package,
                 lit or a sibling layer included; a value import of a .d.ts;
                 and a .css import without { type: 'css' }.
              5. The tests split by layer. The foundation's unit tier runs
                 the keys grammar, the registry, the formatter declarations,
                 and the release integrity test (a pack against its exports,
                 files, and license). Its browser tier runs the tools and
                 keys cases on its own dist/ in the pinned
                 chrome-headless-shell, against v0.7.0's fixtures, with the
                 pipe driver and the static server. `mise run demo` serves
                 the tools and keys pages. The SDK's unit tier runs the SDK
                 declarations and the release integrity test.
              6. `mise run currency` reports, and exits nonzero on, each mise
                 tool, package.json pin, and GitHub Actions pin
                 (actions/checkout, jdx/mise-action,
                 taiki-e/create-gh-release-action) behind its latest.
                 typescript is held to typescript-eslint's peer range.
              7. CI: a workflow installs the pinned tools with
                 jdx/mise-action, runs `mise run install`, and runs
                 `mise run check` on every pull request into main and every
                 push to main.
              8. Release: a workflow on push to main, in one job with
                 contents: write, reads the manifest's version. When the
                 remote already has tag v<version>, it ends green and changes
                 nothing. Otherwise it:
                 a. runs the check;
                 b. runs pnpm pack;
                 c. commits the pack's tree (package.json, README.md,
                    LICENSE, dist/), parented on the pushed commit, on no
                    branch;
                 d. tags that commit with an annotated tag
                    "<repository> v<version>";
                 e. pushes that tag alone;
                 f. creates the GitHub release from CHANGELOG.md's section
                    with taiki-e/create-gh-release-action;
                 g. attaches the tarball with `gh release upload`.
                 Git commands for the commit and the tag are inline in the
                 workflow; no repository script cuts a release. The tag's
                 tree equals, file for file, the attached tarball's
                 package/.
              9. Main has a ruleset as the Go repositories do: a pull request
                 is required, and deletion and force-push are refused. The
                 release workflow's tag push is unaffected.
              10. This repository loses packages/ and everything built on
                 it. The components layer's sources, browser cases, and demo
                 page leave too; the components task takes them from this
                 repository's history, naming the commit as provenance.
                 `mise run measure` retires, and its two dated tables stay in
                 the README. The check is Prettier alone, under kind code,
                 and mise pins node and pnpm only.
              11. The README restates the evidence, Layout, Tasks, Hosting,
                 and Tags for one repository per layer. Evidence 3 becomes a
                 plain vX.Y.Z per repository. STANDARDS.md's Releases states
                 the release workflow's form. The goal record logs the
                 re-plan's decisions and marks the built hosting decisions
                 superseded.
Test seams    Each layer repository's `mise run check`; and a release as a
              consumer reaches it: the v0.1.0 tag's tree, and the GitHub
              release's tarball.
Slices        1. Upgrade: carry the upgrade commit (bun 1.4.4, pnpm 12.15.0,
                 eslint-plugin-boundaries 7.2.1) onto the new branch. Done
                 when `mise run currency` reports only the held typescript
                 and `mise run check` passes.
              2. License and version: carry the license commit (Apache 2.0
                 at 0.1.0). Demo: `mise run check` passes; every package
                 holds its LICENSE.
              3. Foundation repository: its sources, lint, tests, demo
                 pages, check, currency, CI, release workflow, CHANGELOG,
                 README, and STANDARDS. Demo: its `mise run check` passes;
                 pnpm pack lists exactly package.json, README.md, LICENSE,
                 and dist/; CI is green on its pull request.
              4. SDK repository: the same scaffolding, for the declarations
                 alone. Demo: its `mise run check` passes; pnpm pack lists
                 the same four entries; CI is green on its pull request.
              5. This repository's shrink: packages/, its builds and tiers,
                 the components layer, the measure task, and the hosting
                 scripts leave; the check becomes Prettier alone. Demo:
                 `mise run check` passes; `mise run currency` is current.
              6. Docs: the README's sections, STANDARDS.md's Releases, and
                 each layer repository's README against its check. Demo:
                 the README read against the two layer repositories.
Out of scope  The components repository and its release; this repository's
              consumer check by tag under npm, pnpm, and bun; jsDelivr /gh/
              and the import-map page; GitHub Packages and JSR; the Vite app
              and the release flow with pnpm's versioning; a local link:
              bridge between repositories; installing a layer's pack under
              npm, pnpm, and bun inside its own repository; reweighing
              npm/pnpm and ESLint/Biome; a second version; browsers other
              than chrome-headless-shell.
Door          one-way: the two public repositories, from the moment they are
              created; deleting one needs gh's delete_repo scope. Also the
              foundation and SDK v0.1.0 tags and GitHub releases, once the
              release workflows push them: never re-cut, since jsDelivr
              caches an exact tag for good. two-way: everything on the
              hosting branches until SHIP, including removing packages/
              from this repository (its history keeps the sources), and the
              coordinator's edits.
Release       JaimeStill/spike-html-packages-foundation: v0.1.0.
              JaimeStill/spike-html-packages-sdk: v0.1.0.
              Each is cut by its own release workflow on its merge to main.
              SHIP pushes no tag. SHIP merges the foundation, runs ci (the
              check and release runs on the merge commit green, the tag and
              its release with the tarball present), then does the same for
              the SDK, then merges this repository, which releases nothing.
              A failed release is fixed forward on hosting-fix: delete the
              tag on the remote and any partial release, then merge the fix;
              the run on that merge cuts v0.1.0 again.
```

## Progress

slices 6/6 committed · standards ✓ · spec ✓ · editor ✓

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

## Pending edits

(none)
