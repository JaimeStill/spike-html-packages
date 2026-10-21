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

- Releases are 0.y.z annotated tags, pushed as evidence by the tasks that need them, and never
  changed or re-cut. Their form is the tag-naming evidence's to settle.
- Copied files name their source repository and commit.

## Packages

- A layer package is named `@jaimestill/spike-html-packages-<layer>`, one per row of the lint's
  layer table, and the tool sheets stay in the foundation package.
- A package resolves a sibling only through its declared dependency and the sibling's built
  `dist/`, as a consumer does: no source condition, project references, or `paths` aliases.
- The workspace root is private and declares no runtime dependency.
- The one package, `@jaimestill/spike-html-packages`, is assembled from the layer builds by
  `scripts/assemble.js`, never written by hand.

## Code

- Code meets the bar of spike-html-conventions' `layers/` code at a88828a: a 2–4 line header, a
  one-line doc comment per export, and comments only for a non-obvious why.
- A provenance line reads `From|Adapted from <repo> (<commit>): <path>`.
- Sources use `.ts` relative specifiers, which tsc rewrites; handwritten `.d.ts` keep `.js`.
- A lazy load uses a literal `import()`.
- The browser tier tests the one package's `dist/`, and no server transforms what it serves.
- A mise task runs one script or one command, and `check` is a depends list.
