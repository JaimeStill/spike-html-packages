#!/usr/bin/env bash
# Installs each consumer fixture in test/consumers/<consumer>/<manager>/, and each Vite app's in
# test/consumers/vite/<consumer>/<manager>/, under its manager, offline and frozen from its
# committed lockfile and the manager's cache in .cache/consumers/, in a scratch copy outside the
# repository, and checks the install against the layers' tags, fetched into .cache/tags/; then
# loads each install's page in the browser BROWSER_EXECUTABLE names (test/consumers/pages.js),
# builds and serves each Vite app and loads it there too (test/consumers/vite.js), and proves npm's
# guard by each consumer's install failing under it lowered. `warm` instead fills the caches and
# fetches the tags from the network.
# Adapted from spike-html-packages (c2b4a19): scripts/consumers.sh, from packed tarballs to tags.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
mode=${1:-check}
fixtures=$root/test/consumers
caches=$root/.cache/consumers
tags=$root/.cache/tags
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

# The layers, each its own repository on GitHub, released by the tag every fixture names it by;
# scripts/preflight.sh holds the cache to the same tags.
owner=JaimeStill
repository=spike-html-packages-
layers=(foundation sdk components)
declare -A tag=([foundation]=v0.1.0 [sdk]=v0.1.0 [components]=v0.2.0)
# The three together, and the components with the foundation, the peer they leave to the consumer.
consumers=(three components)
# The same two as Vite apps' fixtures: each Vite fixture's dependencies are its consumer's, with
# Vite in its devDependencies, and its app is test/consumers/vite/app/, copied in.
vites=(vite/three vite/components)
managers=(npm pnpm bun)
declare -A lockfile=([npm]=package-lock.json [pnpm]=pnpm-lock.yaml [bun]=bun.lock)
# Each consumer's npm guard is allow-git=root, every git dependency its own now the components name
# the foundation as a peer: lowered one step to none, it refuses even those, and the package the
# refusal names must be one the consumer declares. npm names one, not the first in its manifest:
# the sdk for the three, the foundation for the components.
lowered=none

fail() {
  echo "consumers: $*" >&2
  exit 1
}

# Installs the project frozen from its lockfile, from the repo-local caches, run from the project
# so each manager reads the guard in the fixture's own config file, and none of the user's own
# (scripts/unconfigured.sh). pnpm's metadata cache (cacheDir), which --offline resolves from,
# defaults to the home directory: it goes in .cache/consumers/pnpm/, beside the store.
install() {
  local manager=$1 project=$2
  shift 2
  local unconfigured=$root/scripts/unconfigured.sh
  case $manager in
    npm) (cd "$project" && "$unconfigured" npm ci --cache "$caches/npm" --no-audit --no-fund "$@") ;;
    pnpm)
      (cd "$project" && "$unconfigured" pnpm install --frozen-lockfile --store-dir "$caches/pnpm" \
        --config.cache-dir="$caches/pnpm" "$@")
      ;;
    bun) (cd "$project" && "$unconfigured" bun install --frozen-lockfile --cache-dir "$caches/bun" "$@") ;;
  esac
}

if [[ $mode == warm ]]; then
  for consumer in "${consumers[@]}" "${vites[@]}"; do
    for manager in "${managers[@]}"; do
      project=$scratch/${consumer//\//-}-$manager
      cp -r "$fixtures/$consumer/$manager" "$project"
      install "$manager" "$project"
    done
  done
  # The tag alone, at depth 1, in a repository made anew, so it holds no other tag: the tag object
  # bun records and the tree the installs must equal, the one scripts/installed.sh reads.
  for layer in "${layers[@]}"; do
    rm -rf "${tags:?}/$layer"
    git init -q --bare "$tags/$layer"
    git --git-dir="$tags/$layer" fetch -q --depth 1 \
      "https://github.com/$owner/$repository$layer.git" "+refs/tags/${tag[$layer]}:refs/tags/${tag[$layer]}"
  done
  exit 0
fi

# Installs the consumer's fixture under the manager into $project, offline and frozen, and checks
# it against the layers' tags, setting releases, the layers it resolves, and foundation, the one
# it holds.
install_checked() {
  local consumer=$1 manager=$2
  local fixture=$fixtures/$consumer/$manager
  project=$scratch/${consumer//\//-}-$manager
  cp -r "$fixture" "$project"
  if ! install "$manager" "$project" --offline >"$project.log" 2>&1; then
    cat "$project.log" >&2
    ! grep -q "^npm error code EALLOWGIT$" "$project.log" ||
      fail "npm's guard in $consumer's .npmrc refuses a git dependency it installs"
    fail "$manager can't install $consumer offline from ${lockfile[$manager]}; mise run install fills its cache"
  fi

  # Frozen means the install wrote nothing beside node_modules: the lockfile least of all.
  diff -r -x node_modules "$fixture" "$project" >&2 ||
    fail "$manager's install of $consumer changed the fixture"

  # Each layer its tag's tree, one foundation, the one the components resolve to, no
  # devDependency: the comparison live.js's networked installs share.
  local checked kind dir
  checked=$("$root/scripts/installed.sh" "$manager" "$project" "$tags")
  releases=()
  while read -r kind dir; do
    [[ $kind != release ]] || releases+=("$dir")
    [[ $kind != foundation ]] || foundation=$dir
  done <<<"$checked"
}

pages=()
for consumer in "${consumers[@]}"; do
  for manager in "${managers[@]}"; do
    if [[ $manager == bun ]]; then runtime=bun; else runtime=node; fi
    install_checked "$consumer" "$manager"
    "$runtime" "$fixtures/consumers.js" "$project" "${releases[@]}"
    cp "$fixtures/resolve.js" "$project"
    (cd "$project" && "$runtime" resolve.js)
    echo "consumers: $manager installed $consumer offline from ${lockfile[$manager]}, each layer" \
      "its tag's tree, one foundation, no devDependency; it resolves under $runtime"
    cp -r "$fixtures/pages" "$project"
    pages+=("$manager" "$consumer" "$project" "$foundation")
  done
done

# Each Vite fixture's install, Vite among its packages, with the app copied in.
apps=()
for consumer in "${vites[@]}"; do
  for manager in "${managers[@]}"; do
    install_checked "$consumer" "$manager"
    echo "consumers: $manager installed $consumer offline from ${lockfile[$manager]}, each layer" \
      "its tag's tree, one foundation, no devDependency, and Vite $(node -p \
        'require(process.argv[1]).version' "$project/node_modules/vite/package.json")"
    cp -r "$fixtures/vite/app/." "$project"
    apps+=("$manager" "${consumer#vite/}" "$project" "$foundation")
  done
done

# Each install's page, in one browser, then the jsDelivr page's pins.
node "$fixtures/pages.js" "$tags" "${pages[@]}"
# Each Vite app, built and served, then from Vite's dev server, in one browser.
node "$fixtures/vite.js" "${apps[@]}"

# npm's guard, proven both ways: the install that passes under each committed .npmrc fails under
# the guard lowered, in a scratch copy, refusing one of the consumer's own git dependencies. npm ci
# --offline enforces allow-git before it reads the cache, so the refusal is EALLOWGIT, and any
# other failure, such as ENOTCACHED, proves nothing; nor does a refusal of a package other than
# the one the lowered guard refuses.
for consumer in "${consumers[@]}"; do
  project=$scratch/$consumer-npm-lowered
  cp -r "$fixtures/$consumer/npm" "$project"
  echo "allow-git=$lowered" >"$project/.npmrc"
  if install npm "$project" --offline >"$project.log" 2>&1; then
    fail "npm installed $consumer under allow-git=$lowered"
  fi
  if ! grep -q "^npm error code EALLOWGIT$" "$project.log"; then
    cat "$project.log" >&2
    fail "npm's install of $consumer under allow-git=$lowered failed other than EALLOWGIT"
  fi
  refused=$(sed -n 's/^npm error Refusing to fetch "\(@[^@]*\)@.*/\1/p' "$project.log")
  if ! node -e '
    const [manifest, name] = process.argv.slice(1);
    process.exit(Object.hasOwn(require(manifest).dependencies, name) ? 0 : 1);
  ' "$project/package.json" "$refused"; then
    cat "$project.log" >&2
    fail "npm's install of $consumer under allow-git=$lowered refused other than a git" \
      "dependency $consumer declares"
  fi
  echo "consumers: npm refused $consumer's $refused under allow-git=$lowered (EALLOWGIT)," \
    "and installed it under the committed $(grep -v '^#' "$fixtures/$consumer/npm/.npmrc")"
done
