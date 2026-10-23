#!/usr/bin/env bash
# Installs each consumer fixture in test/consumers/<consumer>/<manager>/ under its manager, offline
# and frozen from its committed lockfile and the manager's cache in .cache/consumers/, in a scratch
# copy outside the repository, and checks the install against the layers' tags, fetched into
# .cache/tags/. `warm` instead fills the caches and fetches the tags from the network.
# Adapted from spike-html-packages (c2b4a19): scripts/consumers.sh, from packed tarballs to tags.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
mode=${1:-check}
fixtures=$root/test/consumers
caches=$root/.cache/consumers
tags=$root/.cache/tags
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

# The layers, each its own repository on GitHub, released by the one tag every fixture names.
owner=JaimeStill
repository=spike-html-packages-
scope=@jaimestill/$repository
foundation=${scope}foundation
layers=(foundation sdk components)
tag=v0.1.0
consumers=(three)
managers=(npm pnpm bun)
declare -A lockfile=([npm]=package-lock.json [pnpm]=pnpm-lock.yaml [bun]=bun.lock)

fail() {
  echo "consumers: $*" >&2
  exit 1
}

# Installs the project frozen from its lockfile, from the repo-local caches, run from the project
# so each manager reads the guard in the fixture's own config file. pnpm's metadata cache
# (cacheDir), which --offline resolves from, defaults to the home directory: it goes in
# .cache/consumers/pnpm/, beside the store.
install() {
  local manager=$1 project=$2
  shift 2
  case $manager in
    npm) (cd "$project" && npm ci --cache "$caches/npm" --no-audit --no-fund "$@") ;;
    pnpm)
      (cd "$project" && pnpm install --frozen-lockfile --store-dir "$caches/pnpm" \
        --config.cache-dir="$caches/pnpm" "$@")
      ;;
    bun) (cd "$project" && bun install --frozen-lockfile --cache-dir "$caches/bun" "$@") ;;
  esac
}

if [[ $mode == warm ]]; then
  for consumer in "${consumers[@]}"; do
    for manager in "${managers[@]}"; do
      cp -r "$fixtures/$consumer/$manager" "$scratch/$consumer-$manager"
      install "$manager" "$scratch/$consumer-$manager"
    done
  done
  # The tag alone, at depth 1: the tag object bun records and the tree the installs must equal.
  for layer in "${layers[@]}"; do
    git init -q --bare "$tags/$layer"
    git --git-dir="$tags/$layer" fetch -q --depth 1 \
      "https://github.com/$owner/$repository$layer.git" "+refs/tags/$tag:refs/tags/$tag"
  done
  exit 0
fi

# Each layer's tree at its tag, extracted into the scratch, and its tag object's hash.
declare -A tag_object
for layer in "${layers[@]}"; do
  mkdir -p "$scratch/tags/$layer"
  git --git-dir="$tags/$layer" archive "$tag" | tar -x -C "$scratch/tags/$layer"
  tag_object[$layer]=$(git --git-dir="$tags/$layer" rev-parse "refs/tags/$tag")
done

# Fails unless the installed layer is its tag's tree, file for file. bun 1.4.4 adds one file,
# .bun-tag, to each package it installs from GitHub, naming the repository and the annotated tag
# object's short hash, not the commit's; it must name this tag, and is left out of the comparison.
matches_tag() {
  local manager=$1 layer=$2 installed=$3
  if [[ $manager == bun ]]; then
    local expected=$owner-$repository$layer-${tag_object[$layer]:0:7}
    [[ -f $installed/.bun-tag && $(<"$installed/.bun-tag") == "$expected" ]] ||
      fail "$manager's install of $layer holds no .bun-tag naming $tag ($expected)"
  fi
  diff -r -x .bun-tag "$scratch/tags/$layer" "$installed" >&2 ||
    fail "$manager's install of $layer differs from its $tag tree"
}

# The directory node and bun resolve a package name to from a directory: the first node_modules
# holding it, from the directory up.
resolve_from() {
  local dir=$1 package=$2
  while [[ $dir != / ]]; do
    if [[ -d $dir/node_modules/$package ]]; then
      realpath "$dir/node_modules/$package"
      return
    fi
    dir=$(dirname "$dir")
  done
  return 1
}

# Each distinct directory the package is installed in, anywhere below the project's node_modules:
# pnpm's links into its virtual store resolve to the one directory they name.
installs_of() {
  find "$1/node_modules" -path "*/node_modules/$2" -prune -exec realpath {} + | sort -u
}

for consumer in "${consumers[@]}"; do
  for manager in "${managers[@]}"; do
    if [[ $manager == bun ]]; then runtime=bun; else runtime=node; fi
    fixture=$fixtures/$consumer/$manager
    project=$scratch/$consumer-$manager
    cp -r "$fixture" "$project"
    if ! install "$manager" "$project" --offline >"$project.log" 2>&1; then
      cat "$project.log" >&2
      fail "$manager can't install $consumer offline from ${lockfile[$manager]}; mise run install fills its cache"
    fi

    # Frozen means the install wrote nothing beside node_modules: the lockfile least of all.
    diff -r -x node_modules "$fixture" "$project" >&2 ||
      fail "$manager's install of $consumer changed the fixture"

    # The layers the consumer declares, each its tag's tree.
    names=$(node -p '
      Object.keys(require(process.argv[1]).dependencies)
        .filter((name) => name.startsWith(process.argv[2]))
        .join("\n")
    ' "$fixture/package.json" "$scope")
    releases=()
    while read -r name; do
      installed=$(realpath "$project/node_modules/$name")
      matches_tag "$manager" "${name#"$scope"}" "$installed"
      releases+=("$installed")
    done <<<"$names"

    # One foundation, the one the components resolve theirs to.
    found=$(installs_of "$project" "$foundation")
    [[ -n $found && $(wc -l <<<"$found") == 1 ]] ||
      fail "$manager installed other than one foundation:"$'\n'"$found"
    components=$(realpath "$project/node_modules/${scope}components")
    [[ $(resolve_from "$components" "$foundation") == "$found" ]] ||
      fail "$manager's components resolve to a foundation other than $found"

    # No layer's devDependency, wherever a manager might put it.
    devs=$(node -p '
      process.argv
        .slice(1)
        .flatMap((dir) => Object.keys(require(dir + "/package.json").devDependencies ?? {}))
        .join("\n")
    ' "${releases[@]}")
    while read -r dev; do
      [[ -z $(installs_of "$project" "$dev") ]] || fail "$manager installed $dev, a devDependency"
    done <<<"$(sort -u <<<"$devs")"

    "$runtime" "$fixtures/consumers.js" "$project" "${releases[@]}"
    cp "$fixtures/resolve.js" "$project"
    (cd "$project" && "$runtime" resolve.js)
    echo "consumers: $manager installed $consumer offline from ${lockfile[$manager]}, each layer" \
      "its $tag tree, one foundation, no devDependency; it resolves under $runtime"
  done
done
