# goal · experiment.html.spike-html-packages

- **State:** building
- **Task:** layout
- **Branch:** layout

## Tasks

1. [x] layers
2. [ ] layout
3. [ ] hosting
4. [ ] registries
5. [ ] consumers
6. [ ] answer

## Task brief · layout

```
Problem       The layers ship as one package, and the layer direction is held
              by the lint table alone. The hosting task's per-package tags, the
              registries' scoped publishes, and the answer task's reweigh of
              npm against pnpm and of ESLint against Biome all need the several-
              package layout to exist, with a measure of what declared
              dependencies enforce at install against what the lint catches
              alone.
Behaviors     1. A pnpm workspace of three packages:
                 @jaimestill/spike-html-packages-foundation (no dependencies),
                 -components (lit 3.3.3 and foundation, workspace:*), and -sdk
                 (no dependencies), each with exports and files naming exactly
                 its build. The root is private, declares no runtime
                 dependency, and holds only the lint and type devDependencies.
              2. Each package builds its .js and .d.ts with its .css and
                 handwritten .d.ts beside them, in dependency order; a sibling
                 resolves another only through its declared dependency and that
                 package's built output, as a consumer resolves it. No source
                 condition, no project references, no paths aliases.
              3. Foundation owns the ambient "*.css" declaration as its ./css
                 types subpath.
              4. @jaimestill/spike-html-packages is a fourth workspace member
                 put together from the three builds, with today's subpaths and
                 lit as its only dependency; its build rewrites every bare
                 sibling specifier to a relative one in .js and .d.ts. Every
                 package passes the release integrity test, and the one
                 package's test fails on any bare sibling specifier left.
              5. The lint keeps the boundaries table, matched by package, and
                 adds import-x's no-extraneous-dependencies and
                 no-relative-packages.
              6. The violation cases keep today's edges in four forms and add
                 the workspace's: an undeclared sibling, an undeclared external
                 (foundation→lit, sdk→lit), a relative path into a sibling, an
                 import of a root devDependency, and a self-import by name.
              7. `mise run measure` prints a dated table, one row per case,
                 naming what catches it: the boundaries table, the manifest
                 rules, and the install layout under pnpm, npm hoisted, npm
                 linked, and bun isolated (tsc, node, or Vite can't resolve
                 it). The npm copy records npm's lack of workspace:. No
                 network, nothing left behind.
              8. The consumer tier installs the one package as today, and the
                 three packages' local tarballs, offline under pnpm, npm, and
                 bun; it records how each manager meets components' packed
                 foundation spec, and whether a consumer's undeclared import of
                 foundation, reached only through components, resolves.
              9. The browser tier and the demo load the one package's build.
              10. The README's Layout and Measures and STANDARDS.md state the
                 layout's facts and its packaging conventions; the README's
                 evidence 2 and 3 name one repository per layer, which the
                 hosting task measures.
Test seams    The packed releases, one package and three, as a consumer
              installs and imports them; and the violation trees, as the lint
              and each install layout judge them.
Slices        1. Upgrade: typescript-eslint 8.71.2 -> 8.72.0; done when
                 `mise run currency` exits 0 and `mise run check` passes.
              2. Workspace: three packages and the private root, sources moved
                 one directory per package, sibling imports by package name,
                 the dependency-ordered build, and the one package assembled
                 with its rewrite and renamed. Existing tiers pass. Demo:
                 `mise run check`; the one package's install file list matches
                 today's apart from its name.
              3. Lint: the manifest rules beside the table, and the workspace
                 violation cases. Demo: the unit tier flags exactly the
                 violating files.
              4. Measure: the violation trees under the four install layouts,
                 the dated table, the README. Demo: `mise run measure`.
              5. Consumers: the three-tarball installs under pnpm, npm, bun.
                 Demo: `mise run installs` with both layouts' file lists.
Out of scope  Any tag, push, or publish; version and tag naming and delivery by
              git tag, tarball URL, or import map (hosting); one repository per
              layer (hosting); the registries; the Vite app and unbundled page
              consumers and the release flow (consumers); reweighing npm/pnpm
              and ESLint+Prettier/Biome (answer); a fourth layer package;
              Biome's noUndeclaredDependencies.
Door          two-way: nothing leaves the repository. The names become one-way
              only when the registries task publishes to JSR.
```

## Progress

slices 5/5 committed · standards — · spec — · editor —

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

## Pending edits

- coordinator · roadmap.toml: `[goals.experiment.html.spike-html-packages.tasks.hosting]`
  summary: add the layers as one repository per layer, three scratch repositories each depending
  on its siblings by tag, installed under npm, pnpm, and bun, against the workspace's per-package
  tags.
