#!/usr/bin/env bash
# Publishes the three layers to GitHub Packages as @jaimestill/spike-html-packages-<layer> at
# 0.0.1, in the order foundation, sdk, components, from the network, by hand: no check runs it.
# Each publish is a scratch copy of the layer's v0.1.0 tree, which is already the pack: its
# package.json, README.md, LICENSE, and dist/. The copy's manifest differs from the tag's only in
# its version, and in the components' foundation dependency, which names the registry foundation
# at exactly 0.0.1 in place of its GitHub tag. A version GitHub Packages already holds is never
# published again: the layers it holds are named and skipped, so a rerun publishes nothing.
# It writes nothing to the repository: every fetch and copy is in a scratch directory it removes.
#
#   GITHUB_PACKAGES_TOKEN=$(gh auth token) scripts/publish.sh [dry-run]
#
# `dry-run` runs everything but the upload, with npm publish --dry-run: the checks below and the
# held check still read the network. Before it publishes anything, it fails naming what is
# missing: the token variable, the token's write:packages scope, or a layer's v0.1.0 tag.
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
tag=v0.1.0
version=0.0.1
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

# Each layer's tree at its tag, from a depth-1 fetch of the remote tag, copied into the scratch
# with the copy's manifest and .npmrc. Every tag is fetched before anything is published.
for layer in "${layers[@]}"; do
  git=$scratch/tags/$layer
  copy=$scratch/$layer
  git init --quiet --bare "$git"
  git --git-dir="$git" fetch --quiet --depth 1 "https://github.com/$owner/$repository$layer.git" \
    "refs/tags/$tag:refs/tags/$tag" 2>/dev/null ||
    fail "$owner/$repository$layer holds no $tag tag to fetch"
  mkdir "$copy"
  git --git-dir="$git" archive "$tag" | tar -x -C "$copy"

  # The tag's manifest, its version and the components' foundation dependency changed, its
  # format, key order, and final newline kept.
  node -e '
    const { readFileSync, writeFileSync } = require("node:fs");
    const [file, version, foundation] = process.argv.slice(1);
    const text = readFileSync(file, "utf8");
    const manifest = JSON.parse(text);
    manifest.version = version;
    if (manifest.dependencies?.[foundation] !== undefined) {
      manifest.dependencies[foundation] = version;
    }
    writeFileSync(file, JSON.stringify(manifest, null, 2) + (text.endsWith("\n") ? "\n" : ""));
  ' "$copy/package.json" "$version" "${scope}foundation"

  # Single quotes: the file holds the reference, never the token.
  # shellcheck disable=SC2016
  printf '%s\n' "@jaimestill:registry=$registry" \
    '//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}' >"$copy/.npmrc"
done

# Whether GitHub Packages holds the layer at the version: npm view prints the version when it
# does, and fails E404, or prints nothing, when it doesn't. Any other failure is fatal.
held() {
  local layer=$1 output
  if output=$(cd "$scratch/$layer" &&
    "$unconfigured" npm view "$scope$layer@$version" version 2>&1); then
    [[ $output == "$version" ]]
  elif [[ $output == *E404* ]]; then
    return 1
  else
    fail "can't ask GitHub Packages for $scope$layer@$version: $output"
  fi
}

publish=()
for layer in "${layers[@]}"; do
  if held "$layer"; then
    echo "publish: skipped $scope$layer@$version: GitHub Packages already holds it"
  else
    publish+=("$layer")
  fi
done

for layer in "${publish[@]}"; do
  echo "publish: publishing $scope$layer@$version${dry_run:+ (dry run)}"
  (cd "$scratch/$layer" && "$unconfigured" npm publish "${dry_run[@]}")
done
[[ ${#publish[@]} -gt 0 ]] || echo "publish: GitHub Packages holds every layer at $version"
