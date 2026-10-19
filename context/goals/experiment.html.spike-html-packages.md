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

## Task brief · layers

```
Problem       The spike has nothing to package yet. spike-html-conventions'
              layers exist only on its untagged main (a88828a), and
              spike-html-design v0.7.0's tools and modules aren't in the
              self-layered, @import-free form a shadow root adopts. Every
              later task needs a release build of real layers (.js, .d.ts,
              and .css beside them), and the import extension is still
              open (evidence 4, 5).
Behaviors     1. The foundation carries spike-html-conventions' port (tokens
                 with Flexoki, regular, and mono; reset; elements), its DOM
                 helpers, and its formatter declarations. Each copied file
                 names its source repository and commit.
              2. v0.7.0's tools ship as three self-layered, @import-free
                 sheets: utilities (scroll, tables), structure (field
                 stacks), and meta (buttons and hue variants), each in its
                 own foundation.<concern> layer. The page entry states the
                 layer order and links them. Each class computes the same
                 styles as v0.7.0's under the default profiles.
              3. v0.7.0's registry and keys family (grammar, runtime, help)
                 are typed .ts foundation modules that keep v0.7.0's tested
                 behavior: DOM-free logic in the unit tier, the help dialog
                 in the browser tier.
              4. The Lit shadow-root pagination, entry, and status badge
                 adopt the foundation's reset and elements sheets before
                 their own layout-only sheet, and pass their contract cases
                 in the browser tier.
              5. The SDK declarations stay type-only, and the declaration
                 test holds them free of runtime code.
              6. The check is spike-html-conventions' check over these
                 layers: ESLint + Prettier with the layer-direction table,
                 tsc, shellcheck, the unit tier under node --test, and the
                 browser tier on the pinned chrome-headless-shell.
              7. The release build emits every .ts module as an unbundled,
                 unminified ES module .js with its .d.ts, and every .css
                 beside its emitted module. exports and files name the built
                 .js, its types, and every .css. The check fails when an
                 export points at a missing file or a source .css has no
                 built copy.
              8. A locally packed release installs offline under npm, pnpm,
                 and bun. Each install's files match files (bun's the whole
                 pack), and every export resolves. This runs in the check.
              9. A measure run builds the layers with .js specifiers and
                 with .ts specifiers rewritten by tsc. For each, it records
                 whether the emit loads unbundled in the pinned Chromium and
                 builds through Vite with the local CSS plugin. The sources
                 keep the form the architect picks at a review stop, and the
                 README records both results (evidence 5).
Test seams    The packed release as a consumer installs and imports it: its
              exports map, resolved by the fixtures and loaded by the browser
              tier.
Slices        1. Foundation CSS: the port, the three lateral-concern sheets,
                 and the page entry, checked against v0.7.0's computed
                 styles. Demo: a page of every tool class on the defaults.
              2. Foundation modules: DOM helpers, formatter declarations,
                 registry, and keys family, in the unit and browser tiers.
                 Demo: a page binding keys with the help dialog.
              3. Components and SDK declarations: the three Lit shadow
                 components on the baseline, with contract cases and the
                 declaration test. Demo: the components rendered on a page.
              4. Release build: tsc emit with .css beside it, exports and
                 files, the integrity test, and offline installs of the
                 packed tarball under npm, pnpm, and bun. Demo: the three
                 installs' file lists.
              5. Import extension: both specifier forms built, loaded
                 unbundled, and built through Vite, with the README's
                 results. Demo: the dated measure rows.
Out of scope  Any tag, push of a release, or registry publish (hosting,
              registries); one package against workspace packages (layout);
              preferences, theme-menu, register, and conformance; the five
              non-default profiles; the vanilla and light-DOM component
              versions; apps and SDK implementations; consumer pages and
              apps (consumers); reweighing the lint and the package manager
              (answer).
Door          two-way: nothing leaves the spike repository; no tag, no
              publish.
```

## Progress

slices 2/5 committed · standards — · spec — · editor —

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

## Pending edits

(none)
