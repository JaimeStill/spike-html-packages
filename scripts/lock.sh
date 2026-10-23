#!/usr/bin/env bash
# The one task that writes the consumer fixtures' lockfiles: resolves each fixture in
# test/consumers/<consumer>/<manager>/ anew under its manager, from the network, and copies the
# lockfile it writes back over the committed one. Each resolves in a scratch copy of its fixture,
# with no lockfile, no node_modules, and a cache of its own, so the manager reads the guard in the
# fixture's own config and nothing but the lockfile reaches the repository; run while the tags are
# unchanged, it leaves every lockfile as it is.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
fixtures=$root/test/consumers
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

consumers=(three components)
managers=(npm pnpm bun)
declare -A lockfile=([npm]=package-lock.json [pnpm]=pnpm-lock.yaml [bun]=bun.lock)

# Resolves the project and writes its lockfile alone, installing nothing.
resolve() {
  local manager=$1 project=$2 cache=$3
  case $manager in
    npm) (cd "$project" && npm install --package-lock-only --cache "$cache" --no-audit --no-fund) ;;
    pnpm)
      (cd "$project" && pnpm install --lockfile-only --store-dir "$cache" \
        --config.cache-dir="$cache")
      ;;
    bun) (cd "$project" && bun install --lockfile-only --cache-dir "$cache") ;;
  esac
}

for consumer in "${consumers[@]}"; do
  for manager in "${managers[@]}"; do
    fixture=$fixtures/$consumer/$manager
    project=$scratch/$consumer-$manager
    cp -r "$fixture" "$project"
    rm -rf "${project:?}/${lockfile[$manager]}" "$project/node_modules"
    resolve "$manager" "$project" "$scratch/cache-$consumer-$manager"
    cp "$project/${lockfile[$manager]}" "$fixture/${lockfile[$manager]}"
    echo "lock: $manager resolved $consumer anew into ${lockfile[$manager]}"
  done
done
