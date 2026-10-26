#!/usr/bin/env bash
# Checks a consumer project's installed layers against the layers' tags: the comparison
# scripts/consumers.sh's offline installs and scripts/live.js's networked ones share. Every copy of
# each layer installed below node_modules is its tag's tree, file for file, and no layer's
# devDependency is installed, but for one the layer also names as a peer, which the consumer
# installs as its own. `tag`, the default, is an install of the layers from their tags,
# which must hold one foundation, the one the components resolve theirs to. `asset` is an install
# from the layers' release assets, whose components still declare the foundation by its tag: its
# foundations are printed, not held to one. `registry` is an install from GitHub Packages at 0.0.1,
# held to one foundation as `tag` is, whose manifests are the one exception to the tag's tree: each
# differs from its tag's only in its version, 0.0.1, and in the components' foundation dependency,
# which names the registry foundation at 0.0.1, as scripts/publish.sh published them.
#
# Prints a line per layer the consumer resolves, `release <dir>`: each layer it declares, and the
# foundation the components resolve theirs to when it declares none; then a line per distinct
# foundation installed, `foundation <dir>`, and the one the components resolve theirs to,
# `components-foundation <dir>`. Exits 1, naming the mismatch on stderr, if the install
# isn't its tags.
#
#   scripts/installed.sh <manager> <project> <tags> [tag|asset|registry]
#
# <tags> holds a bare repository per layer, <tags>/<layer>, with its tag fetched, and no other:
# each layer's tag is the one its repository holds, v0.2.0 for the components where
# scripts/consumers.sh fetches it, v0.1.0 for each layer where scripts/live.js does.
set -euo pipefail

manager=$1
project=$(realpath "$2")
tags=$3
mode=${4:-tag}
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

owner=JaimeStill
repository=spike-html-packages-
scope=@jaimestill/$repository
foundation=${scope}foundation
layers=(foundation sdk components)
version=0.0.1

fail() {
  echo "installed: $*" >&2
  exit 1
}

# Each layer's tag, its tree at the tag extracted into the scratch, its manifest kept apart for
# the registry's exception, and its tag object's hash.
declare -A tag tag_object
for layer in "${layers[@]}"; do
  tag[$layer]=$(git --git-dir="$tags/$layer" tag -l)
  [[ -n ${tag[$layer]} && ${tag[$layer]} != *$'\n'* ]] ||
    fail "$tags/$layer holds other than one tag"
  mkdir -p "$scratch/$layer"
  git --git-dir="$tags/$layer" archive "${tag[$layer]}" | tar -x -C "$scratch/$layer"
  cp "$scratch/$layer/package.json" "$scratch/$layer.package.json"
  tag_object[$layer]=$(git --git-dir="$tags/$layer" rev-parse "refs/tags/${tag[$layer]}")
done

# Fails unless the installed layer is its tag's tree, file for file, leaving out the
# dependencies a manager nests in its node_modules: the foundation and devDependency checks below
# hold those. bun 1.4.4 adds one file, .bun-tag, to each package it installs, left out of the
# comparison. From GitHub it names the repository and the annotated tag object's short hash, not
# the commit's, and must name this tag; from a release asset it is the tarball's sha512 integrity;
# from a registry it adds none.
matches_tag() {
  local layer=$1 installed=$2
  if [[ $manager == bun && $mode == registry ]]; then
    [[ ! -e $installed/.bun-tag ]] ||
      fail "$manager's install of $layer from the registry holds a .bun-tag"
  elif [[ $manager == bun ]]; then
    local expected=$owner-$repository$layer-${tag_object[$layer]:0:7} written=
    [[ -f $installed/.bun-tag ]] && written=$(<"$installed/.bun-tag")
    [[ $written == "$expected" || ($mode == asset && $written =~ ^sha512-[A-Za-z0-9+/]+=*$) ]] ||
      fail "$manager's install of $layer holds no .bun-tag naming ${tag[$layer]} ($expected)"
  fi
  if [[ $mode == registry ]]; then
    # The manifest held to its exception, then compared as the tag's: the rest is file for file.
    node -e '
      const assert = require("node:assert/strict");
      const { readFileSync } = require("node:fs");
      const [tagged, installed, version, foundation] = process.argv.slice(1);
      const expected = JSON.parse(readFileSync(tagged, "utf8"));
      expected.version = version;
      if (expected.dependencies?.[foundation] !== undefined) {
        expected.dependencies[foundation] = version;
      }
      assert.deepEqual(JSON.parse(readFileSync(installed, "utf8")), expected);
    ' "$scratch/$layer.package.json" "$installed/package.json" "$version" "$foundation" ||
      fail "$manager's install of $layer holds a manifest that differs from its ${tag[$layer]} tree's" \
        "other than in its version, $version, and the components' foundation dependency"
    cp "$installed/package.json" "$scratch/$layer/package.json"
  fi
  diff -r -x .bun-tag -x node_modules "$scratch/$layer" "$installed" >&2 ||
    fail "$manager's install of $layer differs from its ${tag[$layer]} tree"
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

# Every copy of every layer, each its tag's tree.
for layer in "${layers[@]}"; do
  while read -r installed; do
    [[ -z $installed ]] || matches_tag "$layer" "$installed"
  done <<<"$(installs_of "$project" "$scope$layer")"
done

# The layers the consumer declares.
names=$(node -p '
  Object.keys(require(process.argv[1]).dependencies)
    .filter((name) => name.startsWith(process.argv[2]))
    .join("\n")
' "$project/package.json" "$scope")
releases=()
while read -r name; do
  releases+=("$(realpath "$project/node_modules/$name")")
done <<<"$names"

found=$(installs_of "$project" "$foundation")
[[ -n $found ]] || fail "$manager installed no foundation"
components=$(realpath "$project/node_modules/${scope}components")
theirs=$(resolve_from "$components" "$foundation") ||
  fail "$manager's components resolve no foundation"
if [[ $mode != asset ]]; then
  # One foundation, the one the components resolve theirs to.
  [[ $(wc -l <<<"$found") == 1 ]] ||
    fail "$manager installed other than one foundation:"$'\n'"$found"
  [[ $theirs == "$found" ]] ||
    fail "$manager's components resolve to a foundation other than $found"
fi
# A foundation the consumer doesn't declare is the one the components resolve theirs to.
grep -qx "$foundation" <<<"$names" || releases+=("$theirs")

# No layer's devDependency, wherever a manager might put it, but for one it also names as a peer:
# the components' foundation from v0.2.0, its dev copy for their own build, installed here as the
# consumer's own.
devs=$(node -p '
  process.argv
    .slice(1)
    .map((dir) => require(dir + "/package.json"))
    .flatMap(({ devDependencies = {}, peerDependencies = {} }) =>
      Object.keys(devDependencies).filter((name) => !Object.hasOwn(peerDependencies, name)),
    )
    .join("\n")
' "${releases[@]}")
while read -r dev; do
  [[ -z $(installs_of "$project" "$dev") ]] || fail "$manager installed $dev, a devDependency"
done <<<"$(sort -u <<<"$devs")"

printf 'release %s\n' "${releases[@]}"
while read -r dir; do echo "foundation $dir"; done <<<"$found"
echo "components-foundation $theirs"
