#!/usr/bin/env bash
# Fails naming mise run install when something a task needs is missing: the root's node_modules
# tooling, and for the consumer tier, each manager's cache and each layer's tag fetch in .cache/.
# Adapted from spike-html-packages-components (8cb64a8): scripts/preflight.sh, the browser half
# left out and the caches and tags let in.
set -euo pipefail

fail() {
  echo "preflight: $1 is missing; run mise run install" >&2
  exit 1
}

[[ -x node_modules/.bin/prettier ]] || fail "prettier (devDependencies)"
for manager in npm pnpm bun; do
  [[ -n $(ls -A ".cache/consumers/$manager" 2>/dev/null) ]] || fail "$manager's cache"
done
for layer in foundation sdk components; do
  git --git-dir=".cache/tags/$layer" rev-parse -q --verify refs/tags/v0.1.0 >/dev/null 2>&1 ||
    fail "the $layer tag fetch"
done
