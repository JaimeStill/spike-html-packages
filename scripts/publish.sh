#!/usr/bin/env bash
# Publishes the three layers to GitHub Packages as @jaimestill/spike-html-packages-<layer>, each at
# its latest tag's version, in the order foundation, sdk, components, from the network, by hand: no
# check runs it. A layer's latest tag is the highest vX.Y.Z tag on its GitHub remote. Each publish
# is a scratch copy of that tag's tree, unchanged, which is already the pack: its package.json,
# README.md, LICENSE, and dist/. Nothing in the manifest is rewritten: the components name the
# foundation as a peer at a range the registry's foundation satisfies, and their github:
# devDependency is never installed by a consumer. A copy whose manifest version isn't its tag's
# fails before anything is published. A version GitHub Packages already holds is never published
# again: the layers it holds are named and skipped, so a rerun publishes nothing. It writes nothing
# to the repository: every fetch and copy is in a scratch directory it removes.
#
#   GITHUB_PACKAGES_TOKEN=$(gh auth token) scripts/publish.sh [dry-run]
#
# `dry-run` runs everything but the upload, with npm publish --dry-run: the checks below and the
# held check still read the network. Before it publishes anything, it fails naming what is
# missing: the token variable, the token's write:packages scope, or a layer's vX.Y.Z tag.
#
# The token is read from the environment and never written to a file. Each copy's .npmrc, the
# project config scripts/unconfigured.sh lets through, holds the literal reference
# ${GITHUB_PACKAGES_TOKEN}, which npm 12.2.1 expands as it reads the file; npm never packs an
# .npmrc.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
unconfigured=$root/scripts/unconfigured.sh

owner=JaimeStill
repository=spike-html-packages-
scope=@jaimestill/$repository
layers=(foundation sdk components)
registry=https://npm.pkg.github.com

fail() {
  echo "publish: $*" >&2
  exit 1
}

case ${1:-} in
"") dry_run=() ;;
dry-run) dry_run=(--dry-run) ;;
*) fail "unknown argument $1; the one argument is dry-run" ;;
esac

[[ -n ${GITHUB_PACKAGES_TOKEN:-} ]] ||
  fail "GITHUB_PACKAGES_TOKEN is unset; run GITHUB_PACKAGES_TOKEN=\$(gh auth token) mise run publish"

# GitHub names a token's granted scopes in the X-OAuth-Scopes header of any authenticated call.
# gh reads the token from GH_TOKEN, in its environment alone, and writes no config with it.
headers=$(GH_TOKEN=$GITHUB_PACKAGES_TOKEN gh api --include user 2>&1) ||
  fail "GitHub refused GITHUB_PACKAGES_TOKEN: $(head -n 1 <<<"$headers")"
scopes=$(grep -i '^x-oauth-scopes:' <<<"$headers" | cut -d: -f2- | tr -d ' \r') || true
[[ ,$scopes, == *,write:packages,* ]] ||
  fail "GITHUB_PACKAGES_TOKEN lacks the write:packages scope; it has: ${scopes:-none}"

scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
# git never prompts for credentials: a repository that isn't public fails.
export GIT_TERMINAL_PROMPT=0

# Each layer's version, from its latest tag: the tag without its v.
declare -A versions

# Each layer's tree at its latest tag, from a depth-1 fetch of the remote tag, copied into the
# scratch with the copy's .npmrc. Every tag is fetched and checked before anything is published.
for layer in "${layers[@]}"; do
  url=https://github.com/$owner/$repository$layer.git
  git=$scratch/tags/$layer
  copy=$scratch/$layer
  tags=$(git ls-remote --tags --refs "$url" 2>/dev/null) ||
    fail "can't list $owner/$repository$layer's tags"
  tag=$(sed -n 's|^[0-9a-f]*\trefs/tags/\(v[0-9]*\.[0-9]*\.[0-9]*\)$|\1|p' <<<"$tags" |
    sort -V | tail -n 1)
  [[ -n $tag ]] || fail "$owner/$repository$layer holds no vX.Y.Z tag to fetch"
  git init --quiet --bare "$git"
  git --git-dir="$git" fetch --quiet --depth 1 "$url" "refs/tags/$tag:refs/tags/$tag" 2>/dev/null ||
    fail "can't fetch $owner/$repository$layer's $tag tag"
  mkdir "$copy"
  git --git-dir="$git" archive "$tag" | tar -x -C "$copy"

  # The package is the tag's: its manifest names the tag's version, or nothing is published.
  version=$(node -p 'require(process.argv[1]).version' "$copy/package.json")
  [[ v$version == "$tag" ]] ||
    fail "$owner/$repository$layer's $tag manifest names version $version, not ${tag#v}"
  versions[$layer]=$version

  # Single quotes: the file holds the reference, never the token.
  # shellcheck disable=SC2016
  printf '%s\n' "@jaimestill:registry=$registry" \
    '//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}' >"$copy/.npmrc"
done

# Whether GitHub Packages holds the layer at the version: npm view prints the version when it
# does, and fails E404, or prints nothing, when it doesn't. Any other failure is fatal. Its
# warnings go to stderr, apart from the version it prints, so a warning can't read as not held.
held() {
  local layer=$1 version=${versions[$1]} output
  local errors=$scratch/$layer.view-errors
  if output=$(cd "$scratch/$layer" &&
    "$unconfigured" npm view "$scope$layer@$version" version 2>"$errors"); then
    [[ $output == "$version" ]]
  elif grep -q E404 "$errors"; then
    return 1
  else
    fail "can't ask GitHub Packages for $scope$layer@$version: $(<"$errors")"
  fi
}

publish=()
for layer in "${layers[@]}"; do
  if held "$layer"; then
    echo "publish: skipped $scope$layer@${versions[$layer]}: GitHub Packages already holds it"
  else
    publish+=("$layer")
  fi
done

for layer in "${publish[@]}"; do
  echo "publish: publishing $scope$layer@${versions[$layer]}${dry_run:+ (dry run)}"
  (cd "$scratch/$layer" && "$unconfigured" npm publish "${dry_run[@]}")
done
[[ ${#publish[@]} -gt 0 ]] || echo "publish: GitHub Packages holds every layer at its latest tag"
