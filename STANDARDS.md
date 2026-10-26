# Standards

The judgement calls the check can't enforce, one line each, for the standards-reviewer. What
`mise run check` enforces is never restated here. The tasks write the packaging conventions here;
they stay in this spike until experiment.html's intake.

The architecture pages that apply, in the architecture repository:

- `principles/minimal-footprint.md`
- `principles/rolling-currency.md`
- `principles/independent-releases.md`
- `principles/validation-first.md`

## Releases

- Each layer repository releases at 0.y.z, one annotated `vX.Y.Z` tag per version, cut by its
  `release.yml` on the merge to main that bumps `package.json`'s version; no hand or repository
  script cuts one. This repository releases nothing.
- A release commit holds only the pack (`package.json`, `README.md`, `LICENSE`, and `dist/`),
  parented on the merge commit and on no branch; main stays source-only.
- A release is never changed or re-cut.

## Packages

- A layer is a repository of its own, JaimeStill/spike-html-packages-<layer>, releasing
  `@jaimestill/spike-html-packages-<layer>`, one per row of the lint's layer table; the tool
  sheets stay in the foundation.
- A layer repository resolves the layer below only through its declared dependency on that
  layer's release tag, as a consumer does: no local link, source condition, project references, or
  `paths` aliases.
- A layer takes the one below it as a peer at a caret range, `^X.Y.Z` in `peerDependencies`,
  which the consumer declares, so every hosting installs one copy, and in `devDependencies` by
  its exact release tag, `github:JaimeStill/spike-html-packages-<layer>#vX.Y.Z`, never a
  `#semver:` range: bun fails every `#semver:` git spec and its overrides never reach a nested
  `github:` spec.
- This repository's root is private and declares no runtime dependency.

## Code

The layer repositories' code, which each one's `STANDARDS.md` restates for its layer:

- Code meets the bar of spike-html-conventions' `layers/` code at a88828a: a 2–4 line header, a
  one-line doc comment per export, and comments only for a non-obvious why.
- A copied file names its source repository and commit in a provenance line, which reads
  `From|Adapted from <repo> (<commit>): <path>`.
- Sources use `.ts` relative specifiers, which tsc rewrites; handwritten `.d.ts` keep `.js`.
- A lazy load uses a literal `import()`.
- A browser tier tests its repository's `dist/`, and no server transforms what it serves.
- A mise task runs one script or one command, and `check` is a depends list.
