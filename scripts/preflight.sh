#!/usr/bin/env bash
# Fails naming mise run install when something a task needs is missing: the root's node_modules
# tooling, and for the consumer tier, each manager's cache and each layer's tag fetch in .cache/;
# with `live`, the live task's one need instead, the pinned chrome-headless-shell.
# Adapted from spike-html-packages-components (8cb64a8): scripts/preflight.sh, the caches and tags
# let in, and the browser half for the live task alone.
set -euo pipefail

fail() {
  echo "preflight: $1 is missing; run mise run install" >&2
  exit 1
}

if [[ "${1:-}" == live ]]; then
  shell=$(mise which chrome-headless-shell 2>/dev/null) || fail "chrome-headless-shell"
  # mise caches downloads by checksum: a version bumped without its sha256 installs the old build.
  pin=$(mise current http:chrome-headless-shell)
  if [[ "$("$shell" --version)" != *" $pin" ]]; then
    echo "preflight: $shell isn't chrome-headless-shell $pin; give the pin its own sha256" >&2
    exit 1
  fi
  exit 0
fi

[[ -x node_modules/.bin/prettier ]] || fail "prettier (devDependencies)"
for manager in npm pnpm bun; do
  [[ -n $(ls -A ".cache/consumers/$manager" 2>/dev/null) ]] || fail "$manager's cache"
done
# Each layer's tag fetch holds the tag scripts/consumers.sh names it by, and no other.
declare -A tag=([foundation]=v0.1.0 [sdk]=v0.1.0 [components]=v0.2.0)
for layer in foundation sdk components; do
  [[ $(git --git-dir=".cache/tags/$layer" tag -l 2>/dev/null) == "${tag[$layer]}" ]] ||
    fail "the $layer ${tag[$layer]} tag fetch"
done
