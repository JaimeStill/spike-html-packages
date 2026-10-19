#!/usr/bin/env bash
# The release build: layers/ into dist/, or into the directory given. tsc emits each module's .js
# and .d.ts; the .css and the handwritten .d.ts are copied beside them as written.
# Adapted from spike-html-conventions (a88828a): scripts/build.sh.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:-$root/dist}

rm -rf "$out"
tsc -p "$root/tsconfig.build.json" --outDir "$out"
(
  cd "$root/layers"
  find . -type f \( -name '*.css' -o -name '*.d.ts' \) -print0 |
    xargs -0 -r cp --parents -t "$out"
)
