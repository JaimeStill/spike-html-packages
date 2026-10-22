#!/usr/bin/env bash
# Installs the packed releases under pnpm, npm, and bun, each offline from its cache in
# .cache/consumers/, and checks each install: the one package into test/consumers/one/, the three
# layer packages into test/consumers/layers/, and the components alone into
# test/consumers/components/, holding each manager to the measured facts below. `list` also prints
# the one package's and the three packages' installed files; `warm` fills the caches from the
# network.
# Adapted from spike-html-conventions (a88828a): scripts/consumers.sh.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
mode=${1:-check}
package=$root/packages/spike-html-packages
name=$(node -p 'require(process.argv[1]).name' "$package/package.json")
scope=${name}-
foundation=${scope}foundation
fixtures=$root/test/consumers
caches=$root/.cache/consumers
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

# The measured facts. components' packed manifest declares the foundation as 0.0.0, pnpm pack's
# rewrite of workspace:*. What each manager needs before that spec installs offline with the
# foundation's tarball beside the components': none, where it dedupes against the consumer's own
# foundation tarball; overrides, where it looks for 0.0.0 in a registry, its offline error below.
declare -A layers_need=([pnpm]=overrides [npm]=none [bun]=overrides)
# With the components alone the foundation is no dependency of the consumer's to dedupe against.
declare -A components_need=([pnpm]=overrides [npm]=overrides [bun]=overrides)
declare -A registry_miss=(
  [pnpm]=ERR_PNPM_NO_OFFLINE_META
  [npm]=ENOTCACHED
  [bun]="no cached manifest"
)
# Whether the components-only consumer's undeclared import of the foundation resolves: pnpm links
# only a project's declared dependencies into its node_modules; npm and bun (hoisted, its default
# outside a workspace) hoist the foundation there.
declare -A undeclared=([pnpm]=unresolved [npm]=resolves [bun]=resolves)

fail() {
  echo "consumers: $*" >&2
  exit 1
}

# Repo-local caches. pnpm's default store sits on the project's filesystem, here the scratch's, and
# its metadata cache (cacheDir), which --offline resolves from, in the home directory: both go in
# .cache/consumers/pnpm/.
install() {
  local manager=$1 project=$2
  shift 2
  case $manager in
    pnpm)
      pnpm install --dir "$project" --store-dir "$caches/pnpm" \
        --config.cache-dir="$caches/pnpm" "$@"
      ;;
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

# Installs the project offline, failing with the manager's log.
offline() {
  local manager=$1 project=$2
  if ! install "$manager" "$project" --offline >"$project.log" 2>&1; then
    cat "$project.log" >&2
    fail "$manager can't install $project offline; mise run install warms its cache"
  fi
}

# Points the foundation, wherever the project's graph names it, at its tarball, by the manager's
# own mechanism: pnpm's overrides in pnpm-workspace.yaml (pnpm 12 no longer reads package.json's
# pnpm field), npm's and bun's in package.json.
override() {
  local manager=$1 project=$2
  if [[ $manager == pnpm ]]; then
    printf 'overrides:\n  "%s": "file:foundation.tgz"\n' "$foundation" \
      >"$project/pnpm-workspace.yaml"
  else
    node -e '
      const { readFileSync, writeFileSync } = require("node:fs");
      const [path, name] = process.argv.slice(1);
      const manifest = JSON.parse(readFileSync(path, "utf8"));
      manifest.overrides = { [name]: "file:foundation.tgz" };
      writeFileSync(path, JSON.stringify(manifest, null, 2));
    ' "$project/package.json" "$foundation"
  fi
}

# Installs the project offline as the manager needs: with overrides, the install without them must
# fail on its registry miss, which can only be the foundation's, since the same install with them
# passes; with none, it installs as it is.
meet() {
  local manager=$1 project=$2 need=$3
  if [[ $need == overrides ]]; then
    cp -r "$project" "$project-plain"
    if install "$manager" "$project-plain" --offline >"$project-plain.log" 2>&1; then
      fail "$manager installed components' foundation spec without overrides"
    fi
    if ! grep -qF "${registry_miss[$manager]}" "$project-plain.log"; then
      cat "$project-plain.log" >&2
      fail "$manager failed without overrides, but not on ${registry_miss[$manager]}"
    fi
    override "$manager" "$project"
  fi
  offline "$manager" "$project"
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

# Fails if the manager installed any of the devDependencies, one per line, into the project.
no_dev_dependencies() {
  local manager=$1 project=$2 dev
  while read -r dev; do
    if [[ -e $project/node_modules/$dev ]] ||
      compgen -G "$project/node_modules/.pnpm/${dev//\//+}@*" >/dev/null; then
      fail "$manager installed $dev, a devDependency"
    fi
  done <<<"$3"
}

# The manifests' devDependencies, one per line.
dev_dependencies() {
  node -p '
    process.argv
      .slice(1)
      .flatMap((path) => Object.keys(require(path).devDependencies ?? {}))
      .join("\n")
  ' "$@"
}

# Fails unless the installed package is its pack, extracted beside its tarball in the scratch:
# the same files. bun 1.4.4 adds one, .bun-tag, to each package it installs from a tarball,
# holding the tarball's integrity; it must name this tarball, and is left out of the comparison.
matches_pack() {
  local manager=$1 pack=$2 installed=$3 what=$4 tarball integrity
  if [[ $manager == bun ]]; then
    tarball=$(echo "$pack"/*.tgz)
    integrity=$(node -p '
      const { createHash } = require("node:crypto");
      const tarball = require("node:fs").readFileSync(process.argv[1]);
      "sha512-" + createHash("sha512").update(tarball).digest("base64")
    ' "$tarball")
    [[ -f $installed/.bun-tag && $(<"$installed/.bun-tag") == "$integrity" ]] ||
      fail "$manager's install of $what holds no .bun-tag naming its tarball's integrity"
  fi
  diff -r -x .bun-tag "$pack/package" "$installed" >&2 ||
    fail "$manager's install of $what differs from its pack"
}

# Packs a package into its own directory in the scratch and extracts it there, into package/;
# prints the tarball's path.
pack() {
  local dest
  dest=$scratch/packs/$(basename "$1")
  mkdir -p "$dest"
  pnpm pack --dir "$1" --pack-destination "$dest" >/dev/null
  tar -xzf "$dest"/*.tgz -C "$dest"
  echo "$dest"/*.tgz
}

# The one package: the root's lint and type tooling and its siblings, a consumer installs none.
one_dev=$(dev_dependencies "$root/package.json" "$package/package.json")
tarball=$(pack "$package")

# The three layer packages: the root's tooling, and any devDependencies of their own.
layers=(foundation components sdk)
manifests=("$root/package.json")
for layer in "${layers[@]}"; do
  pack "$root/packages/$layer" >/dev/null
  manifests+=("$root/packages/$layer/package.json")
done
layers_dev=$(dev_dependencies "${manifests[@]}")

for manager in pnpm npm bun; do
  if [[ $manager == bun ]]; then runtime=bun; else runtime=node; fi

  project=$scratch/$manager
  cp -r "$fixtures/one" "$project"
  cp "$fixtures/resolve.js" "$fixtures/tsconfig.json" "$project"
  cp "$tarball" "$project/spike-html-packages.tgz"
  offline "$manager" "$project"

  installed=$project/node_modules/$name
  matches_pack "$manager" "$(dirname "$tarball")" "$installed" "the one package"
  no_dev_dependencies "$manager" "$project" "$one_dev"
  "$runtime" "$fixtures/consumers.js" "$project" "$installed"
  (cd "$project" && "$runtime" resolve.js)
  tsc -p "$project"
  echo "consumers: $manager installed the pack offline; it resolves under $runtime and checks under tsc"

  if [[ $mode == list ]]; then
    find "$installed/" -type f -printf '%P\n' | sort
  fi

  # The three layer packages, each a dependency of the consumer's by its tarball.
  project=$scratch/$manager-layers
  cp -r "$fixtures/layers" "$project"
  cp "$fixtures/resolve.js" "$fixtures/tsconfig.json" "$project"
  for layer in "${layers[@]}"; do
    cp "$scratch/packs/$layer"/*.tgz "$project/$layer.tgz"
  done
  meet "$manager" "$project" "${layers_need[$manager]}"

  releases=()
  for layer in "${layers[@]}"; do
    installed=$project/node_modules/$scope$layer
    matches_pack "$manager" "$scratch/packs/$layer" "$installed" "$layer"
    releases+=("$installed")
  done
  components=$(realpath "$project/node_modules/${scope}components")
  direct=$(realpath "$project/node_modules/$foundation")
  [[ $(resolve_from "$components" "$foundation") == "$direct" ]] ||
    fail "$manager installed a second foundation for the components"
  no_dev_dependencies "$manager" "$project" "$layers_dev"
  "$runtime" "$fixtures/consumers.js" "$project" "${releases[@]}"
  (cd "$project" && "$runtime" resolve.js)
  tsc -p "$project"
  echo "consumers: $manager installed the three packs offline, one foundation, with" \
    "${layers_need[$manager]} for its packed spec; they resolve under $runtime and check under tsc"

  if [[ $mode == list ]]; then
    for layer in "${layers[@]}"; do
      find "$project/node_modules/$scope$layer/" -type f -printf "$scope$layer/%P\n" | sort
    done
  fi

  # The components alone, the foundation's tarball beside them for the overrides to name.
  project=$scratch/$manager-components
  cp -r "$fixtures/components" "$project"
  cp "$scratch/packs/components"/*.tgz "$project/components.tgz"
  cp "$scratch/packs/foundation"/*.tgz "$project/foundation.tgz"
  meet "$manager" "$project" "${components_need[$manager]}"

  components=$(realpath "$project/node_modules/${scope}components")
  matches_pack "$manager" "$scratch/packs/components" "$components" components
  matches_pack "$manager" "$scratch/packs/foundation" \
    "$(resolve_from "$components" "$foundation")" "the components' foundation"
  no_dev_dependencies "$manager" "$project" "$layers_dev"
  resolved=$(cd "$project" && "$runtime" undeclared.js)
  [[ $resolved == "${undeclared[$manager]}" ]] ||
    fail "$manager: the undeclared foundation import $resolved, not ${undeclared[$manager]}"
  echo "consumers: $manager installed the components alone offline with" \
    "${components_need[$manager]}; the undeclared foundation import $resolved under $runtime"
done
