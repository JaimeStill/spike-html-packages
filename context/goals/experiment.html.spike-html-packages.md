# goal · experiment.html.spike-html-packages

- **State:** building
- **Task:** layers
- **Branch:** layers

## Tasks

1. [ ] layers
2. [ ] layout
3. [ ] hosting
4. [ ] registries
5. [ ] consumers
6. [ ] answer

## Task brief · layers (revised)

```
Problem       Slices 1-5 deliver the layers, the release build, and the
              offline installs, but not in a form the workspace can build
              on. The copies keep their sources' essay prose, the harness
              rests on workarounds (a .js-to-.ts stripping server, :hover
              rewriting, a closed-port proxy, a 640-line measure), and
              mise.toml and scripts/ can't be read by a person. Every later
              task (layout, hosting, registries, consumers) inherits this
              code and this harness.
Behaviors     1-8. Unchanged from the first brief (7cddb86): the foundation port,
                 the three self-layered tool sheets at v0.7.0's computed
                 styles, the typed registry and keys family, the three Lit
                 shadow components on reset and elements, the type-only
                 SDK, the check's tools, the release build with exports
                 and files and its integrity test, and the offline installs
                 under npm, pnpm, and bun.
              9. The sources use .ts relative specifiers, emitted as .js by
                 tsc with rewriteRelativeImportExtensions. The emitted .js
                 carries only .js specifiers, the help module included.
                 node runs the sources by type stripping. The handwritten
                 .d.ts keep .js specifiers, since they ship as written. The
                 README records the measured facts in a short table,
                 including that tsc's emitted .d.ts keep .ts specifiers and
                 TypeScript 7.0.2 and 6.0.3 accept them.
              10. The help dialog loads lazily through a literal
                 import("./keys-help.ts"). Its behavior is unchanged
                 (first open loads it, a failed load retries, two copies at
                 two URLs each load their own), and it builds through Vite
                 with the local CSS plugin into its own chunk that loads.
              11. Every module under layers/ reads at the bar of
                 spike-html-conventions' layers/ code: a short header
                 naming the layer and the provenance (source repository and
                 commit), a one-line doc comment per export, and comments
                 only where the code can't say why. The behaviors live in
                 the tests and the README, not in comment essays.
              12. The browser tier tests the built dist/, the files that
                 ship, through the pinned chrome-headless-shell. No server
                 transforms what it serves. Hover is compared through
                 CSS.forcePseudoState, not by rewriting the sheets.
              13. The offline installs use each package manager's own
                 offline mode against caches that `mise run install` warms,
                 with no proxy.
              14. mise.toml is a list of small named tasks. Each has a
                 one-line description and runs one script or one command.
                 check is a depends list (lint, types, build, test:unit,
                 test:browser, test:consumers), and each runs on its own.
                 Prose about the layout lives in the README.
                 The repository is laid out by role:
                   layers/           the sources
                   scripts/          one entry script per task, nothing else
                   test/unit/        node --test, sources by type stripping
                   test/browser/     node --test on dist/, with support/
                                     holding the pipe driver and the static
                                     server
                   test/consumers/   the npm, pnpm, and bun fixtures
                   test/fixtures/    v0.7.0's pages and sheets, as copied
                   demo/             the demo pages only
Test seams    Unchanged: the packed release as a consumer installs and
              imports it, and the built dist/ as the browser tier loads it.
Slices        1. Structure: mise.toml split into named tasks with check as a
                 depends list; files moved to the layout in behavior 14;
                 the description paragraphs and inline scripts move out.
                 No behavior change. Demo: `mise tasks` and each test:*
                 task running alone.
              2. Sources: .ts specifiers with rewriteRelativeImportExtensions;
                 the copied modules (keys, keys-grammar, keys-help,
                 registry, components) rewritten to behavior 11's bar with
                 the literal lazy import. The existing unit and browser
                 cases hold the behavior. Demo: `node layers/foundation/
                 keys-grammar.ts` imports; dist/ has only .js specifiers.
              3. Browser tier on dist/: the static server without
                 transforms, forcePseudoState for hover, the test files cut
                 to the cases v0.7.0 and conventions proved and nothing
                 extra. Demo: the browser tier against a fresh build.
              4. Consumers, currency, and measure: offline installs by the
                 managers' own offline flags; currency.sh simplified; the
                 measure replaced by a short `mise run measure` for
                 behaviors 9 and 10 (Vite build of the help chunk
                 included); the README's Measures section rewritten to its
                 facts. Demo: `mise run measure` and the three installs.
Out of scope  Unchanged: any tag, push, or publish; one package against
              workspace packages; preferences, theme-menu, register, and
              conformance; the non-default profiles; the vanilla and
              light-DOM versions; apps, SDK implementations, consumer
              pages and apps; reweighing the lint and the manager.
Door          two-way: nothing leaves the spike repository.
```

## Progress

slices 1-5 committed (1f1a3c0..312fa18) · rework slices 4/4 · standards — · spec — · editor —

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

## Pending edits

(none)
