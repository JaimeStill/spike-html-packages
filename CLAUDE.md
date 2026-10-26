# spike-html-packages

A spike for the Standards Lab reference architecture. It settles how the native web stack's
layers are packaged and released by tag: tag naming, release builds beside the sources, one
package or several, the hosting, and the import extension the releases use. The repository is
managed with the marathon workflow; start from `context/README.md`.

This repository holds the spike's record and docs; the layers live in repositories of their own.

- **Layers:** JaimeStill/spike-html-packages-foundation, JaimeStill/spike-html-packages-sdk, and
  JaimeStill/spike-html-packages-components, checked out beside this one in `~/experiments/`, each
  a marathon project released by tag.
- **Standards:** `STANDARDS.md`, with pointers into the architecture repository.
- **Check:** `mise run check`: Prettier, shellcheck over the scripts, and the consumer tier, which
  installs each fixture in `test/consumers/` offline from its lockfile and `.cache/`, filled by
  `mise run install`, then loads each install's page and each Vite app in chrome-headless-shell,
  held to the design check in `test/consumers/design.js`. `mise run live` measures the releases from
  the network, GitHub Packages among them, with a read:packages token in `GITHUB_PACKAGES_TOKEN`.
- **Release flow:** `mise run release-flow` compares the hand flow with pnpm's change-intent
  versioning on scratch clones of the foundation, from the network, and pushes nothing to GitHub.
- **Lint measure:** `mise run biome` lints each layer's lint tree with its ESLint and with Biome,
  and formats it with Biome at its Prettier options, on scratch clones of the layers' main, from
  the network, outside the check; it prints a dated table and pushes nothing.
- **Publish:** `mise run publish [dry-run]`, run by hand with
  `GITHUB_PACKAGES_TOKEN=$(gh auth token)`, publishes each layer's latest tag to GitHub Packages
  at the tag's version and skips each one already there.
- **Currency:** `mise run currency`: every mise tool, package.json pin, fixture tag, and Vite
  fixture's Vite pin behind its latest; parse-changelog is listed as held.
- **Goals:** this spike's tasks live in the coordinator's roadmap,
  `standards-lab/context/roadmap.toml`, under `experiment.html.spike-html-packages`. Its goal
  record is `context/goals/experiment.html.spike-html-packages.md`.
- **Dependencies:** none at runtime; Prettier in devDependencies; Vite in each Vite fixture's
  devDependencies; node, npm, pnpm, bun, shellcheck, chrome-headless-shell (for the check and the
  live task), the release-flow task's parse-changelog, and the biome task's Biome, and those two tasks' yq pinned in mise.
- **References:** the repositories this spike reads are keys in the coordinator's
  `references.toml` and `references.local.toml`. The spike reads them and never writes to them.
