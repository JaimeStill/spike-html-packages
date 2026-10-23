#!/usr/bin/env bash
# Prints `<where>: <item> <pin> -> <latest>` for each mise tool and package.json devDependency
# behind its latest, and exits 1 if any; prints nothing when all are current. Reads the network.
# Adapted from spike-html-conventions (a88828a): scripts/currency.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

outdated=$(MISE_LOG_LEVEL=error mise outdated --bump --local --json)
trailing=$(node -p '
  Object.entries(JSON.parse(process.argv[1]))
    .map(([tool, { requested, bump }]) => "mise.toml: " + [tool, requested, "->", bump].join(" "))
    .join("\n")
' "$outdated")

pins=$(node -p '
  Object.entries(require("./package.json").devDependencies)
    .map(([name, pin]) => name + " " + pin)
    .join("\n")
')
while read -r package pin; do
  latest=$(pnpm view "$package" version)
  if [[ $pin != "$latest" ]]; then
    trailing+=$'\n'"package.json: $package $pin -> $latest"
  fi
done <<<"$pins"

if [[ -n ${trailing//$'\n'/} ]]; then
  sed '/^$/d' <<<"$trailing"
  exit 1
fi
