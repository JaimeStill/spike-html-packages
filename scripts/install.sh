#!/usr/bin/env bash
# The one task that reads the network: the mise pins, then node_modules from the lockfile, then the
# consumer caches the offline installs read. Each step needs the one before it.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

mise install
pnpm install --frozen-lockfile
scripts/consumers.sh warm
