#!/usr/bin/env bash
# Packs the release, installs it offline into each consumer fixture, and checks what each
# installed; or warms the caches those installs read. After spike-html-conventions a88828a:
# scripts/consumers.sh, installing a locally packed tarball where conventions installed a git tag.
#
#   scripts/consumers.sh         the check's step: packs the build (dist/, which scripts/build.sh
#                                writes first) with pnpm pack, installs it into
#                                fixtures/consumer-pnpm with pnpm, fixtures/consumer-npm with npm,
#                                and fixtures/consumer-bun with bun, offline, and checks each
#   scripts/consumers.sh list    the same, then prints each install's file list (mise run installs)
#   scripts/consumers.sh warm    mise run install's step: installs lit with pnpm, npm, and bun,
#                                from the network, into the caches under .cache/consumers/
#
# Each fixture depends on the release as file:spike-html-packages.tgz; the check copies the fixture
# into a scratch directory and places the packed tarball beside its manifest there.
#
# Lit, the package's one dependency, comes from caches this repository keeps, gitignored, under
# .cache/consumers/: pnpm's store (pnpm 12 keeps the metadata --offline reads there too), npm's
# cache, and bun's cache, each holding lit and its dependencies alone, warmed by mise run install.
# Where conventions read the managers' global caches through scratch overlays, these are the
# check's own, so no install writes to a global cache: the check copies them into scratch, and
# each manager installs from its copy with --offline, behind proxies pointed at a closed port, so
# a cold cache fails the check with a message instead of reaching the network.
#
# npm is mise's npm pin, resolved through mise so neither node's bundled npm (11.20.0 in node
# 26.12.0) nor a global npm earlier on PATH runs instead; the check fails unless its version is
# the pin, and prints it.
#
# After each install the check asserts that the installed package's files are exactly the packed
# tarball's, and that the tarball's are exactly package.json and the files under package.json's
# files (dist/), byte for byte; bun installs a tarball whole, as pnpm and npm do, so all three are
# held to the whole pack. Then that none of this package's devDependencies, its lint tooling, is
# installed, since a consumer installs a dependency's dependencies only; that every installed file
# is reachable through the installed manifest's exports (scripts/consumers.js); that every subpath
# with a runtime target resolves to its installed file, and every types-only subpath resolves to
# nothing at runtime, under the column's runtime (the fixture's resolve.js); and that tsc
# type-checks the fixture's consumer.ts and every subpath with types against the installed
# declarations.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
mode=${1:-check}
name=spike-html-packages
cache="$root/.cache/consumers"
closed=http://127.0.0.1:9

scratch=$(mktemp -d "${TMPDIR:-/tmp}/spike-html-packages-consumers.XXXXXX")
trap 'rm -rf "$scratch"' EXIT

fail() {
  echo "consumers: $*" >&2
  exit 1
}

pnpm_flags=(--package-import-method copy --reporter append-only)

# npm, mise's pin for this project, by its path. The npm that runs must be the version mise.toml
# pins, the pin read from mise itself, so a stale install or a resolution to another npm fails
# here rather than installing with the wrong npm.
npm=$(mise --cd "$root" which npm)
npm_flags=(--no-audit --no-fund --no-update-notifier)
npm_pin=$(mise --cd "$root" ls --local --json npm |
  node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf8"))[0]?.requested_version ?? "")')
[[ -n "$npm_pin" ]] || fail "mise.toml pins no npm"
npm_version=$("$npm" --version --no-update-notifier)
[[ "$npm_version" == "$npm_pin" ]] ||
  fail "npm $npm_version runs at $npm, but mise.toml pins npm $npm_pin; run mise install"

if [[ "$mode" == warm ]]; then
  lit=$(node -p 'require(process.argv[1]).dependencies.lit' "$root/package.json")
  for manager in pnpm npm bun; do
    mkdir -p "$scratch/$manager"
    printf '{ "name": "warm", "private": true, "dependencies": { "lit": "%s" } }\n' "$lit" \
      >"$scratch/$manager/package.json"
  done
  mkdir -p "$cache"
  pnpm --dir "$scratch/pnpm" install "${pnpm_flags[@]}" --store-dir "$cache/pnpm-store"
  "$npm" install --prefix "$scratch/npm" --cache "$cache/npm" "${npm_flags[@]}"
  BUN_INSTALL_CACHE_DIR="$cache/bun" bun install --cwd "$scratch/bun" --cache-dir "$cache/bun"
  echo "consumers: .cache/consumers holds lit $lit for pnpm, npm, and bun"
  exit 0
fi
[[ "$mode" == check || "$mode" == list ]] || fail "unknown mode $mode; expected check, list, or warm"

for dir in pnpm-store npm bun; do
  [[ -d "$cache/$dir" ]] || fail ".cache/consumers/$dir is missing; run mise run install to warm it"
done
[[ -d "$root/dist" ]] || fail "no dist/; run mise run build first"

# The caches, copied, so the installs write only to scratch.
cp -r "$cache" "$scratch/cache"

# files lists a directory's files, relative and sorted.
files() {
  (cd "$1" && find . -type f | sed 's|^\./||' | LC_ALL=C sort)
}

# The pack: package.json and the files under each entry of package.json's files, which the
# tarball must hold exactly, byte for byte.
pnpm --dir "$root" pack --pack-destination "$scratch/pack" >/dev/null
tarball=$(echo "$scratch"/pack/"$name"-*.tgz)
[[ -f "$tarball" ]] || fail "pnpm pack wrote no $name tarball"
mkdir "$scratch/packed"
tar -xzf "$tarball" -C "$scratch/packed"
packed="$scratch/packed/package"
expected=$(
  cd "$root"
  {
    echo package.json
    node -e 'for (const f of require(process.argv[1]).files) console.log(f)' "$root/package.json" |
      while IFS= read -r entry; do find "$entry" -type f; done
  } | sed 's|^\./||' | LC_ALL=C sort
)
diff <(echo "$expected") <(files "$packed") >&2 ||
  fail "the tarball holds other files than package.json and files name (diff above)"
# pnpm pack writes package.json anew, without its final newline, so the manifest is compared as
# JSON and every other file byte for byte.
while IFS= read -r path; do
  if [[ "$path" == package.json ]]; then
    node -e '
      const { readFileSync } = require("node:fs");
      const [a, b] = process.argv.slice(1).map((p) => JSON.parse(readFileSync(p, "utf8")));
      require("node:assert/strict").deepEqual(b, a);
    ' "$root/package.json" "$packed/package.json" 2>/dev/null ||
      fail "the tarball's package.json differs from the working tree's"
  else
    cmp -s "$root/$path" "$packed/$path" || fail "the tarball's $path differs from the working tree's"
  fi
done < <(files "$packed")

# This package's devDependencies, by name, one per line.
dev_names=$(node -e '
  for (const name of Object.keys(require(process.argv[1]).devDependencies ?? {})) console.log(name);
' "$root/package.json")
[[ -n "$dev_names" ]] || fail "package.json names no devDependencies"

echo "consumers: npm $npm_version, mise's pin, at $npm"
for manager in pnpm npm bun; do
  project="$scratch/consumer-$manager"
  cp -r "$root/fixtures/consumer-$manager" "$project"
  cp "$tarball" "$project/$name.tgz"
  if [[ "$manager" == bun ]]; then runtime=bun; else runtime=node; fi

  log="$scratch/$manager.log"
  export HTTP_PROXY=$closed HTTPS_PROXY=$closed http_proxy=$closed https_proxy=$closed
  status=0
  if [[ "$manager" == pnpm ]]; then
    pnpm --dir "$project" install --offline "${pnpm_flags[@]}" \
      --store-dir "$scratch/cache/pnpm-store" \
      >"$log" 2>&1 || status=$?
    if ((status != 0)) && grep -q ERR_PNPM_NO_OFFLINE "$log"; then
      cat "$log" >&2
      fail "the pnpm store lacks lit; run mise run install to warm it"
    fi
  elif [[ "$manager" == npm ]]; then
    "$npm" install --prefix "$project" --offline --cache "$scratch/cache/npm" "${npm_flags[@]}" \
      >"$log" 2>&1 || status=$?
    if ((status != 0)) && grep -q ENOTCACHED "$log"; then
      cat "$log" >&2
      fail "the npm cache lacks lit; run mise run install to warm it"
    fi
  else
    # The variable as well as the flag, as conventions sets both.
    BUN_INSTALL_CACHE_DIR="$scratch/cache/bun" bun install --cwd "$project" --offline \
      --cache-dir "$scratch/cache/bun" >"$log" 2>&1 || status=$?
    if ((status != 0)) && grep -q -e '--offline: no cached' "$log"; then
      cat "$log" >&2
      fail "the bun cache lacks lit; run mise run install to warm it"
    fi
  fi
  unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
  if ((status != 0)); then
    cat "$log" >&2
    fail "$manager install of consumer-$manager failed"
  fi

  # The installed package is the whole pack, byte for byte.
  installed="$project/node_modules/$name"
  [[ -d "$installed" ]] || fail "$manager didn't install $name"
  diff <(files "$packed") <(files "$installed") >&2 ||
    fail "$manager installed other files of $name than the pack's (diff above)"
  while IFS= read -r path; do
    cmp -s "$packed/$path" "$installed/$path" || fail "$manager's $path differs from the pack's"
  done < <(files "$installed")

  # This package's devDependencies stay out of the consumer: none at the top of node_modules, nor
  # in pnpm's virtual store, where a package's directory is its name, / as +, then @.
  while read -r dev; do
    [[ -n "$dev" ]] || continue
    if [[ -e "$project/node_modules/$dev" ]] ||
      compgen -G "$project/node_modules/.pnpm/${dev//\//+}@*" >/dev/null; then
      fail "$manager installed $dev, a devDependency of $name"
    fi
  done <<<"$dev_names"

  "$runtime" "$root/scripts/consumers.js" subpaths "$installed" "$project"
  (cd "$project" && "$runtime" resolve.js)
  tsc -p "$project"
  echo "consumers: consumer-$manager installed $name offline, $(files "$installed" | wc -l)" \
    "files, the pack's byte for byte"
  if [[ "$mode" == list ]]; then
    echo "== consumer-$manager: node_modules/$name ($manager)"
    files "$installed"
  fi
done
