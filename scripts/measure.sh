#!/usr/bin/env bash
# The measure task, outside the check: the import extension's rows (evidence 5), printed as one
# dated markdown report on stdout for the README. After spike-html-conventions a88828a:
# scripts/measure.sh, its report head and its rows, cut to this one comparison. It reads no
# network and writes nothing to the working tree: every copy, build, server, and page runs in a
# scratch directory, removed on exit. Progress goes to stderr.
#
# It builds the layers in two forms, each a scratch copy of layers/, tsconfig.json,
# tsconfig.build.json, package.json, and scripts/build.sh, node_modules linked in for lit's types:
#
#   js   the sources as they are, every relative specifier naming .js, emitted by tsc as the
#        release build does (scripts/build.sh)
#   ts   the same copy with every relative .js specifier rewritten to .ts
#        (scripts/measure-extension.js rewrite) and tsconfig.json given
#        allowImportingTsExtensions and rewriteRelativeImportExtensions, emitted by the same build,
#        so the emit carries .js specifiers
#
# For each form, a row each:
#
#   tsc            tsc --noEmit over the copy, and the build's exit; the relative .ts specifiers
#                  left in the emit's .js and .d.ts (the copied .d.ts sources among them); and a
#                  consumer's type check of every emitted and copied .d.ts, under the pinned tsc
#                  (typescript-go) and under typescript 6.0.3, the devDependency, each with the
#                  consumer fixtures' options: no allowImportingTsExtensions, skipLibCheck off
#   unbundled      the emit served as files are (scripts/measure-extension.js's static server),
#                  its probe page loading the foundation's modules and the three components, lit
#                  by an import map onto /deps/, rendering each component, and opening a keys help
#                  dialog, which keys.js fills by loading keys-help by its own URL; in the pinned
#                  chrome-headless-shell through the raw pipe
#   vite plugin    vite build of the probe page over the emit without scripts/css-sheets.js, so
#                  what Vite 8 makes of a CSS module script by itself
#   vite build     vite build of the same page with scripts/css-sheets.js, the built page served as
#                  files and probed in the same browser
#
# and, for the upside a .ts specifier claims, the sources themselves with no build:
#
#   node           node importing foundation/keys.ts, a foundation module with relative imports,
#                  by type stripping: whether node resolves and links them (keys.ts itself then
#                  needs a DOM, which node hasn't)
#   vite dev       the probe page on the sources under Vite's dev server with scripts/css-sheets.js
#
# Each row is dated and says yes or no with what was observed; a no is a finding, not a failure.
# The run exits nonzero only when a step it needs can't run (a missing tool, a scratch write).
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
helper="$root/scripts/measure-extension.js"
today=$(date -u +%F)

fail() {
  echo "measure: $*" >&2
  exit 1
}
[[ -d "$root/node_modules/lit" ]] || fail "lit isn't installed; run mise run install first"
[[ -f "$root/node_modules/typescript/bin/tsc" ]] ||
  fail "the devDependencies aren't installed; run mise run install first"
command -v vite >/dev/null || fail "vite (mise.toml's npm:vite pin) isn't installed; run mise run install first"
headless_shell=$(mise --cd "$root" which chrome-headless-shell 2>/dev/null) ||
  fail "chrome-headless-shell (mise.toml's pin) isn't installed; run mise run install first"
export BROWSER_EXECUTABLE="$headless_shell"
# Vite's errors and warnings as plain text, for the rows.
export NO_COLOR=1

scratch=$(mktemp -d "${TMPDIR:-/tmp}/spike-html-packages-measure.XXXXXX")
dev_server=""
# shellcheck disable=SC2329 # invoked by the trap below.
cleanup() {
  if [[ -n "$dev_server" ]]; then kill "$dev_server" 2>/dev/null || true; fi
  rm -rf "$scratch"
}
trap cleanup EXIT
cd "$scratch"

# helper ARGS...: scripts/measure-extension.js, without node's experimental-feature notices.
helper() {
  node --disable-warning=ExperimentalWarning "$helper" "$@"
}

rows=()
# row FORM NAME OK OBSERVED: one dated row, yes when OK is 1. The observed fact is one line, with
# any color code dropped (Vite's build errors carry them whatever NO_COLOR says) and any pipe
# escaped for the table.
row() {
  local observed
  observed=$(tr '\n' ' ' <<<"$4" |
    sed -e 's/\x1b\[[0-9;]*m//g' -e 's/  */ /g' -e 's/ *$//' -e 's/|/\\|/g')
  rows+=("| $today | $1 | $2 | $([[ "$3" == 1 ]] && echo yes || echo no) | $observed |")
}

# run LOG COMMAND...: runs the command with its output in LOG, echoing its exit status.
run() {
  local log=$1 status=0
  shift
  "$@" >"$log" 2>&1 || status=$?
  echo "$status"
}

# first_error LOG: LOG's first line naming an error by its code ([MISSING_EXPORT], TS2307,
# ERR_...), else its first line saying error, else its last line.
first_error() {
  grep -m1 -E '\[[A-Z_]+\]|error TS[0-9]+|ERR_[A-Z_]+' "$1" || grep -m1 -iE 'error' "$1" || tail -n1 "$1"
}

# url_warning LOG: Vite's warning that a new URL(..., import.meta.url) names no file at build time,
# or nothing.
url_warning() {
  grep -m1 "doesn't exist at build time" "$1" | sed 's/, it will remain.*/: left to resolve at runtime/' || true
}

# ---- The two forms.

for form in js ts; do
  dir="$scratch/$form"
  mkdir -p "$dir/scripts"
  cp -r "$root/layers" "$root/tsconfig.json" "$root/tsconfig.build.json" "$root/package.json" "$dir/"
  cp "$root/scripts/build.sh" "$dir/scripts/"
  ln -s "$root/node_modules" "$dir/node_modules"
done
rewritten=$(helper rewrite "$scratch/ts/layers")
helper tsconfig "$scratch/ts/tsconfig.json"

# A consumer's type check of a form's declarations, with the consumer fixtures' options.
consumer_tsconfig() {
  cat <<'EOF'
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024", "dom", "dom.iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": [],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false
  },
  "include": ["../dist/**/*.d.ts"]
}
EOF
}

# vite_config DIR OUT PLUGIN: a Vite config, DIR/vite-OUT.config.mjs, rooted at DIR, building
# DIR/vite.html into DIR/OUT unminified, or serving DIR on $port, with scripts/css-sheets.js when
# PLUGIN is 1. Its cache is in scratch, and it may read lit's real path under the repository's
# node_modules. The config is a plain object, so Vite loads it natively and writes nothing beside
# it.
vite_config() {
  local dir=$1 out=$2 plugin=$3 import="" plugins="[]"
  if [[ "$plugin" == 1 ]]; then
    import="import { cssSheets } from \"$root/scripts/css-sheets.js\";"
    plugins="[cssSheets()]"
  fi
  cat >"$dir/vite-$out.config.mjs" <<EOF
$import
export default {
  root: "$dir",
  plugins: $plugins,
  publicDir: false,
  logLevel: "warn",
  clearScreen: false,
  cacheDir: "$dir/vite-cache-$out",
  optimizeDeps: { include: ["lit"] },
  server: {
    host: "127.0.0.1",
    port: ${port:-0},
    strictPort: true,
    fs: { allow: ["$scratch", "$root"] },
  },
  build: {
    outDir: "$dir/$out",
    emptyOutDir: true,
    minify: false,
    rolldownOptions: { input: "$dir/vite.html" },
  },
};
EOF
  echo "$dir/vite-$out.config.mjs"
}

for form in js ts; do
  dir="$scratch/$form"
  echo "measure: the $form form" >&2

  # tsc: the type check, the build, the specifiers left, and a consumer's check.
  check=$(cd "$dir" && run "$scratch/$form-noemit.log" tsc --noEmit -p .)
  build=$(run "$scratch/$form-build.log" "$dir/scripts/build.sh")
  left=$(helper specifiers "$dir/dist")
  mkdir -p "$dir/consumer"
  consumer_tsconfig >"$dir/consumer/tsconfig.json"
  consumer=$(cd "$dir/consumer" && run "$scratch/$form-consumer.log" tsc -p .)
  consumer6=$(cd "$dir/consumer" &&
    run "$scratch/$form-consumer6.log" node "$root/node_modules/typescript/bin/tsc" -p .)
  ok=0
  if [[ "$check" == 0 && "$build" == 0 ]]; then ok=1; fi
  observed="tsc --noEmit exit $check; build exit $build"
  [[ "$check" == 0 ]] || observed+=" ($(first_error "$scratch/$form-noemit.log"))"
  [[ "$build" == 0 ]] || observed+=" ($(first_error "$scratch/$form-build.log"))"
  [[ "$form" == ts ]] && observed+="; $rewritten specifiers rewritten .js to .ts"
  row "$form" "tsc emits cleanly" "$ok" "$observed"
  ok=0
  if [[ -z "$left" && "$consumer" == 0 && "$consumer6" == 0 ]]; then ok=1; fi
  observed="relative .ts specifiers in dist: ${left:-none}"
  observed+="; a consumer's tsc over dist/**/*.d.ts (no allowImportingTsExtensions): typescript-go $(tsc --version | cut -d' ' -f2) exit $consumer"
  [[ "$consumer" == 0 ]] || observed+=" ($(first_error "$scratch/$form-consumer.log"))"
  observed+=", typescript 6.0.3 exit $consumer6"
  [[ "$consumer6" == 0 ]] || observed+=" ($(first_error "$scratch/$form-consumer6.log"))"
  row "$form" "the emit carries .js specifiers, the .d.ts among them" "$ok" "$observed"

  # unbundled: the emit as files, through the pipe.
  helper page "$dir" probe ./dist .js
  status=$(run "$scratch/$form-unbundled.log" helper load "$dir" probe.html)
  row "$form" "the emit loads unbundled in chrome-headless-shell" "$([[ $status == 0 ]] && echo 1)" \
    "$(tail -n1 "$scratch/$form-unbundled.log")"

  # vite build, without the plugin and with it.
  helper page "$dir" vite ./dist .js
  config=$(vite_config "$dir" vite-bare 0)
  status=$(run "$scratch/$form-vite-bare.log" vite build --configLoader native --config "$config")
  observed="vite build exit $status"
  warning=$(url_warning "$scratch/$form-vite-bare.log")
  [[ -z "$warning" ]] || observed+="; Vite warns: $warning"
  if [[ "$status" == 0 ]]; then
    load=$(run "$scratch/$form-vite-bare-load.log" helper load "$dir/vite-bare" vite.html)
    observed+="; built page: $(tail -n1 "$scratch/$form-vite-bare-load.log")"
  else
    observed+=": $(first_error "$scratch/$form-vite-bare.log")"
    load=1
  fi
  row "$form" "the emit builds through Vite 8 with no CSS plugin" \
    "$([[ $status == 0 && $load == 0 ]] && echo 1)" "$observed"

  config=$(vite_config "$dir" vite-out 1)
  status=$(run "$scratch/$form-vite.log" vite build --configLoader native --config "$config")
  observed="vite build exit $status"
  warning=$(url_warning "$scratch/$form-vite.log")
  [[ -z "$warning" ]] || observed+="; Vite warns: $warning"
  if [[ "$status" == 0 ]]; then
    load=$(run "$scratch/$form-vite-load.log" helper load "$dir/vite-out" vite.html)
    observed+="; built page: $(tail -n1 "$scratch/$form-vite-load.log")"
  else
    observed+=": $(first_error "$scratch/$form-vite.log")"
    load=1
  fi
  row "$form" "the emit builds through Vite with scripts/css-sheets.js and loads" \
    "$([[ $status == 0 && $load == 0 ]] && echo 1)" "$observed"

  # node links a module's whole graph, resolving every import, before it evaluates any, so an
  # error at evaluation (keys.ts reads document at its top level) means every import resolved.
  status=$(run "$scratch/$form-node.log" node --disable-warning=ExperimentalWarning \
    --input-type=module -e "await import('$dir/layers/foundation/keys.ts')")
  thrown=$(grep -m1 -E '^[A-Za-z]*Error|\[ERR_' "$scratch/$form-node.log" || tail -n1 "$scratch/$form-node.log")
  ok=0
  observed="exit $status"
  if [[ "$status" == 0 ]]; then ok=1; elif ! grep -q ERR_MODULE_NOT_FOUND <<<"$thrown"; then
    ok=1
    observed+=": $thrown, at evaluation: every import resolved and linked, the module itself needs a DOM"
  else
    observed+=": ${thrown//$dir\//}, at resolution"
  fi
  row "$form" "node resolves foundation/keys.ts's relative imports by type stripping" "$ok" "$observed"

  # vite dev: one dev server over the sources, the page loaded once to let Vite optimize lit,
  # then probed.
  port=$(node -e '
    const server = require("node:net").createServer();
    server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')
  helper page "$dir" dev ./layers ".$form" .ts
  config=$(vite_config "$dir" dev 1)
  vite --configLoader native --config "$config" >"$scratch/$form-dev.log" 2>&1 &
  dev_server=$!
  for ((i = 0; i < 300; i++)); do
    curl -fs -o /dev/null "http://127.0.0.1:$port/dev.html" && break
    sleep 0.1
  done
  curl -fs -o /dev/null "http://127.0.0.1:$port/dev.html" ||
    fail "Vite's dev server didn't answer on $port: $(tail -n3 "$scratch/$form-dev.log")"
  run "$scratch/$form-dev-warm.log" helper open "http://127.0.0.1:$port/dev.html" >/dev/null
  status=$(run "$scratch/$form-dev-load.log" helper open "http://127.0.0.1:$port/dev.html")
  kill "$dev_server" 2>/dev/null || true
  wait "$dev_server" 2>/dev/null || true
  dev_server=""
  row "$form" "the sources load under Vite's dev server with scripts/css-sheets.js" \
    "$([[ $status == 0 ]] && echo 1)" "$(tail -n1 "$scratch/$form-dev-load.log")"
  unset port
done

# ---- The report.

echo "## Measure, $(date -u +%Y-%m-%dT%H:%M:%SZ) (UTC)"
echo
echo "| tool | version |"
echo "| --- | --- |"
printf '| %s | %s |\n' node "$(node --version | tr -d v)"
printf '| %s | %s |\n' tsc "typescript-go $(tsc --version | cut -d' ' -f2)"
printf '| %s | %s |\n' typescript "$(node -p 'require(process.argv[1]).version' "$root/node_modules/typescript/package.json") (the consumer check's second tsc)"
printf '| %s | %s |\n' vite "$(vite --version | cut -d' ' -f1 | cut -d/ -f2)"
printf '| %s | %s |\n' chrome-headless-shell "$("$headless_shell" --version | awk '{print $NF}')"
printf '| %s | %s |\n' lit "$(node -p 'require(process.argv[1]).version' "$root/node_modules/lit/package.json")"
echo
echo "### The import extension (evidence 5)"
echo
echo "| date | form | measure | result | observed |"
echo "| --- | --- | --- | --- | --- |"
printf '%s\n' "${rows[@]}"
