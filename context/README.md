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
2. Layout: the layers as one package with subpath exports against several workspace packages in
   one repository, with the layer direction enforced at install by declared dependencies measured
   against the lint rule alone.
3. Tag naming: one repo-wide `vX.Y.Z` against per-package `pkg/vX.Y.Z` and `pkg@X.Y.Z`, each
   resolved by npm, pnpm, bun, and jsDelivr.
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

Lit is the one runtime dependency. The fixtures install the releases under npm, pnpm, and bun.
Registry trials publish for real under `@jaimestill` at 0.0.x, to GitHub Packages and to JSR.

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
3. `hosting`: the release by git tag, tarball, and import map, with tag naming (evidence 1, 3).
4. `registries`: GitHub Packages and JSR (evidence 1).
5. `consumers`: the page and Vite app consumers, and the release flow (evidence 6, 7).
6. `answer`: the reweighed picks, the answer, and the answer section (evidence 8).

## Releases

0.y.z annotated tags, pushed as evidence by the tasks that need them and never changed or re-cut.
Their form is the tag-naming evidence's to settle. The `layers` task pushes none.

## References

The spike reads these repositories and never writes to them. Each is a key in the coordinator's
`references.toml`, with its local checkout in `references.local.toml`:

- `spike-html-design`, at v0.7.0: the tools and modules copied.
- `spike-html-conventions`, at main a88828a: the layers copied and the toolchain adopted.

## The answer

Pending: the `answer` task writes it.
