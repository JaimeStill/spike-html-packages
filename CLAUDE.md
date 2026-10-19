# spike-html-packages

A spike for the Standards Lab reference architecture. It settles how the native web stack's
layers are packaged and released by tag: tag naming, release builds beside the sources, one
package or several, the hosting, and the import extension the releases use. The repository is
managed with the marathon workflow; start from `context/README.md`.

- **Standards:** `STANDARDS.md`, with pointers into the architecture repository.
- **Check:** `mise run check`: lint, types, build, and the unit, browser, and consumer tiers.
- **Currency:** `mise run currency`: every mise tool and package.json pin behind its latest.
- **Goals:** this spike's tasks live in the coordinator's roadmap,
  `standards-lab/context/roadmap.toml`, under `experiment.html.spike-html-packages`. Its goal
  record is `context/goals/experiment.html.spike-html-packages.md`.
- **Dependencies:** lit 3.3.3 at runtime; the lint tooling in devDependencies; tools pinned in mise.
- **References:** the repositories this spike reads are keys in the coordinator's
  `references.toml` and `references.local.toml`. The spike reads them and never writes to them.
