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
- Copied files name their source repository and commit.

## Packages

- A layer is a repository of its own, JaimeStill/spike-html-packages-<layer>, releasing
  `@jaimestill/spike-html-packages-<layer>`, one per row of the lint's layer table; the tool
  sheets stay in the foundation.
- A layer repository resolves the layer below only through its declared dependency on that
  layer's release tag, as a consumer does: no local link, source condition, project references, or
  `paths` aliases.
- This repository's root is private and declares no runtime dependency.

## Code

The layer repositories' code, which each one's `STANDARDS.md` restates for its layer:

- Code meets the bar of spike-html-conventions' `layers/` code at a88828a: a 2–4 line header, a
  one-line doc comment per export, and comments only for a non-obvious why.
- A provenance line reads `From|Adapted from <repo> (<commit>): <path>`.
- Sources use `.ts` relative specifiers, which tsc rewrites; handwritten `.d.ts` keep `.js`.
- A lazy load uses a literal `import()`.
- A browser tier tests its repository's `dist/`, and no server transforms what it serves.
- A mise task runs one script or one command, and `check` is a depends list.
