#!/usr/bin/env bash
# Installs the packed release, the one package, into test/consumers/consumer/ under pnpm, npm, and
# bun, each offline from its cache in .cache/consumers/, and checks each install. `list` also
# prints the installed files; `warm` fills the caches from the network.
# Adapted from spike-html-conventions (a88828a): scripts/consumers.sh.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
mode=${1:-check}
package=$root/packages/spike-html-packages
name=$(node -p 'require(process.argv[1]).name' "$package/package.json")
caches=$root/.cache/consumers
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

fail() {
  echo "consumers: $*" >&2
  exit 1
}

# Repo-local caches: pnpm's default store sits on the project's filesystem, here the scratch's.
install() {
  local manager=$1 project=$2
  shift 2
  case $manager in
    pnpm) pnpm install --dir "$project" --store-dir "$caches/pnpm" "$@" ;;
    npm) npm install --prefix "$project" --cache "$caches/npm" --no-audit --no-fund "$@" ;;
    bun) bun install --cwd "$project" --cache-dir "$caches/bun" "$@" ;;
  esac
}

if [[ $mode == warm ]]; then
  lit=$(node -p 'require(process.argv[1]).dependencies.lit' "$package/package.json")
  for manager in pnpm npm bun; do
    mkdir "$scratch/$manager"
    echo "{ \"dependencies\": { \"lit\": \"$lit\" } }" >"$scratch/$manager/package.json"
    install "$manager" "$scratch/$manager"
  done
  exit 0
fi

# The root's lint and type tooling and the one package's siblings: a consumer installs none.
dev_dependencies=$(node -p '
  process.argv.slice(1).flatMap((path) => Object.keys(require(path).devDependencies)).join("\n")
' "$root/package.json" "$package/package.json")
pnpm pack --dir "$package" --pack-destination "$scratch" >/dev/null
# pnpm names a scoped package's tarball for its scope and name: @scope/name as scope-name.
packed=${name#@}
tarball=$(echo "$scratch/${packed//\//-}"-*.tgz)
tar -xzf "$tarball" -C "$scratch"

for manager in pnpm npm bun; do
  project=$scratch/$manager
  cp -r "$root/test/consumers/consumer" "$project"
  cp "$tarball" "$project/spike-html-packages.tgz"
  if ! install "$manager" "$project" --offline >"$project.log" 2>&1; then
    cat "$project.log" >&2
    fail "$manager can't install offline; mise run install warms its cache"
  fi

  installed=$project/node_modules/$name
  diff -r "$scratch/package" "$installed" >&2 || fail "$manager's install differs from the pack"
  while read -r dev; do
    if [[ -e $project/node_modules/$dev ]] ||
      compgen -G "$project/node_modules/.pnpm/${dev//\//+}@*" >/dev/null; then
      fail "$manager installed $dev, a devDependency"
    fi
  done <<<"$dev_dependencies"

  if [[ $manager == bun ]]; then runtime=bun; else runtime=node; fi
  "$runtime" "$root/test/consumers/consumers.js" "$installed" "$project"
  (cd "$project" && "$runtime" resolve.js)
  tsc -p "$project"
  echo "consumers: $manager installed the pack offline; it resolves under $runtime and checks under tsc"

  if [[ $mode == list ]]; then
    find "$installed/" -type f -printf '%P\n' | sort
  fi
done
