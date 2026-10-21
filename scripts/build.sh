#!/usr/bin/env bash
# The workspace's build: each package under packages/ into its own dist/, in pnpm's dependency
# order, so a package's build reads its siblings' finished builds through its node_modules. A
# package with a src/ is a layer: tsc emits each module's .js and .d.ts, and the .css and the
# handwritten .d.ts are copied beside them as written. The one package has no src/:
# scripts/assemble.js puts it together from its siblings' builds. Builds the workspace given, or
# the repository's.
# Adapted from spike-html-conventions (a88828a): scripts/build.sh.
set -euo pipefail

scripts=$(cd "$(dirname "$0")" && pwd)
workspace=${1:-$(dirname "$scripts")}

# pnpm -r runs a command in each package in dependency order; one at a time, pwd lists that order.
# The builds run here rather than under pnpm, whose PATH puts node_modules/.bin's typescript ahead
# of the check's tsc, mise.toml's TypeScript-Go pin.
mapfile -t packages < <(pnpm --dir "$workspace" -r --workspace-concurrency=1 --silent exec pwd)

for package in "${packages[@]}"; do
  rm -rf "$package/dist"
  if [[ -d $package/src ]]; then
    mkdir -p "$package/dist"
    tsc -p "$package"
    (
      cd "$package/src"
      find . -type f \( -name '*.css' -o -name '*.d.ts' \) -print0 |
        xargs -0 -r cp --parents -t "$package/dist"
    )
  else
    node "$scripts/assemble.js" "$package"
  fi
done
