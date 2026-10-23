#!/usr/bin/env bash
# Checks a consumer project's installed layers against the layers' tags: the comparison
# scripts/consumers.sh's offline installs and scripts/live.js's networked ones share. Every copy of
# each layer installed below node_modules is its tag's tree, file for file, and no layer's
# devDependency is installed. `tag`, the default, is an install of the layers from their tags,
# which must hold one foundation, the one the components resolve theirs to. `asset` is an install
# from the layers' release assets, whose components still declare the foundation by its tag: its
# foundations are printed, not held to one.
#
# Prints a line per layer the consumer resolves, `release <dir>`: each layer it declares, and the
# foundation the components resolve theirs to when it declares none; then a line per distinct
# foundation installed, `foundation <dir>`, and the one the components resolve theirs to,
# `components-foundation <dir>`. Exits 1, naming the mismatch on stderr, if the install
# isn't its tags.
#
#   scripts/installed.sh <manager> <project> <tags> [tag|asset]
#
# <tags> holds a bare repository per layer, <tags>/<layer>, with the tag fetched.
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
tag=v0.1.0

fail() {
  echo "installed: $*" >&2
  exit 1
}

# Each layer's tree at its tag, extracted into the scratch, and its tag object's hash.
declare -A tag_object
for layer in "${layers[@]}"; do
  mkdir -p "$scratch/$layer"
  git --git-dir="$tags/$layer" archive "$tag" | tar -x -C "$scratch/$layer"
  tag_object[$layer]=$(git --git-dir="$tags/$layer" rev-parse "refs/tags/$tag")
done

# Fails unless the installed layer is its tag's tree, file for file, leaving out the
# dependencies a manager nests in its node_modules: the foundation and devDependency checks below
# hold those. bun 1.4.4 adds one file, .bun-tag, to each package it installs, left out of the
# comparison. From GitHub it names the repository and the annotated tag object's short hash, not
# the commit's, and must name this tag; from a release asset it is the tarball's sha512 integrity.
matches_tag() {
  local layer=$1 installed=$2
  if [[ $manager == bun ]]; then
    local expected=$owner-$repository$layer-${tag_object[$layer]:0:7} written=
    [[ -f $installed/.bun-tag ]] && written=$(<"$installed/.bun-tag")
    [[ $written == "$expected" || ($mode == asset && $written =~ ^sha512-[A-Za-z0-9+/]+=*$) ]] ||
      fail "$manager's install of $layer holds no .bun-tag naming $tag ($expected)"
  fi
  diff -r -x .bun-tag -x node_modules "$scratch/$layer" "$installed" >&2 ||
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
if [[ $mode == tag ]]; then
  # One foundation, the one the components resolve theirs to.
  [[ $(wc -l <<<"$found") == 1 ]] ||
    fail "$manager installed other than one foundation:"$'\n'"$found"
  [[ $theirs == "$found" ]] ||
    fail "$manager's components resolve to a foundation other than $found"
fi
# A foundation the consumer doesn't declare is the one the components resolve theirs to.
grep -qx "$foundation" <<<"$names" || releases+=("$theirs")

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

printf 'release %s\n' "${releases[@]}"
while read -r dir; do echo "foundation $dir"; done <<<"$found"
echo "components-foundation $theirs"
