#!/usr/bin/env bash
# Installs, from the network: the mise pins, chrome-headless-shell among them, then node_modules
# from the lockfile, then the caches in .cache/consumers/ that the check's offline installs read,
# filled by each fixture's frozen install from its lockfile, and the layers' tags, fetched into .cache/tags/. Each step
# needs the one before it. It changes no fixture or lockfile.
# Adapted from spike-html-packages (c2b4a19): scripts/install.sh.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

mise install
pnpm install --frozen-lockfile
scripts/consumers.sh warm
