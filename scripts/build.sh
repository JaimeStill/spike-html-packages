#!/usr/bin/env bash
# The release build: layers/ into dist/, the directory package.json's files and exports name, so
# the package ships the build and not the sources. After spike-html-conventions a88828a:
# scripts/build.sh, its tsc build alone, on layers/ instead of src/.
#
#   every .ts module    an unbundled, unminified ES module .js with its .d.ts, by tsc emit
#                       (tsconfig.build.json); lit stays a bare import and each specifier keeps
#                       the .js its source names
#   every .d.ts source  copied as written: tsc emits nothing for a declaration file, so the
#                       formatters (foundation/format.d.ts), the SDK (sdk/*.d.ts), and the CSS
#                       module script declaration (css.d.ts) ship as they are
#   every .css          copied beside its emitted module at its own relative path, so a component's
#                       CSS module script import (../foundation/baseline/reset.css) and an
#                       entry's @import (page.css, baseline.css) resolve in dist/ as in layers/
#
# dist/ is removed first, so a module or sheet deleted from layers/ leaves no stale copy, and is
# gitignored. The check runs this first, so test/release.test.js reads a fresh emit; it reads no
# network and writes only dist/.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/dist"

rm -rf "$out"
tsc -p "$root/tsconfig.build.json"
(
  cd "$root/layers"
  find . -type f \( -name '*.css' -o -name '*.d.ts' \) -print0 |
    xargs -0 -r cp --parents -t "$out"
)
