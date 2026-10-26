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
  `mise run install`. `mise run live` measures the releases from the network, GitHub Packages
  among them, with a read:packages token in `GITHUB_PACKAGES_TOKEN`.
- **Publish:** `mise run publish [dry-run]`, run by hand with
  `GITHUB_PACKAGES_TOKEN=$(gh auth token)`, publishes each layer's v0.1.0 tree to GitHub Packages
  at 0.0.1 and skips each one already there.
- **Currency:** `mise run currency`: every mise tool, package.json pin, and fixture tag behind its
  latest.
- **Goals:** this spike's tasks live in the coordinator's roadmap,
  `standards-lab/context/roadmap.toml`, under `experiment.html.spike-html-packages`. Its goal
  record is `context/goals/experiment.html.spike-html-packages.md`.
- **Dependencies:** none at runtime; Prettier in devDependencies; node, npm, pnpm, bun,
  shellcheck, and the live task's chrome-headless-shell pinned in mise.
- **References:** the repositories this spike reads are keys in the coordinator's
  `references.toml` and `references.local.toml`. The spike reads them and never writes to them.
