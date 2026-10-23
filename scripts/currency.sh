#!/usr/bin/env bash
# Prints `<where>: <item> <pin> -> <latest>` for each mise tool, package.json dependency, and
# consumer fixture's github: layer tag behind its latest, and exits 1 if any; prints nothing when
# all are current. Reads the network.
# Adapted from spike-html-conventions (a88828a): scripts/currency.sh.
# Adapted from spike-html-packages-components 8cb64a8: scripts/currency.sh, its github: tag against
# the layer repository's latest release, for each fixture's tags.
set -euo pipefail
cd "$(dirname "$0")/.."

# Every tool in mise.toml, an http: tool's version list among them. Errors only: mise warns on
# every run that a GitHub release has no assets.
outdated=$(MISE_LOG_LEVEL=error mise outdated --bump --local --json)
trailing=$(node -p '
  Object.entries(JSON.parse(process.argv[1]))
    .map(([tool, { requested, bump }]) => "mise.toml: " + [tool, requested, "->", bump].join(" "))
    .join("\n")
' "$outdated")

pins=$(node -p '
  const { dependencies, devDependencies } = require("./package.json");
  Object.entries({ ...dependencies, ...devDependencies })
    .map(([name, pin]) => name + " " + pin)
    .join("\n")
')
while read -r package pin; do
  latest=$(pnpm view "$package" version)
  if [[ $pin != "$latest" ]]; then
    trailing+=$'\n'"package.json: $package $pin -> $latest"
  fi
done <<<"$pins"

# Each fixture's github: dependencies, each pinned to its layer repository's release tag, which the
# registry doesn't hold: the tag against that repository's latest release, asked once a repository.
declare -A latest_release
for manifest in test/consumers/*/*/package.json; do
  specs=$(node -p '
    Object.values(require("./" + process.argv[1]).dependencies)
      .filter((pin) => pin.startsWith("github:"))
      .map((pin) => pin.slice("github:".length))
      .join("\n")
  ' "$manifest")
  while read -r spec; do
    repo=${spec%%#*}
    pinned=${spec#*#}
    if [[ -z ${latest_release[$repo]:-} ]]; then
      latest_release[$repo]=$(gh api "repos/$repo/releases/latest" --jq .tag_name)
    fi
    if [[ $pinned != "${latest_release[$repo]}" ]]; then
      trailing+=$'\n'"$(dirname "$manifest"): ${repo#*/} $pinned -> ${latest_release[$repo]}"
    fi
  done <<<"$specs"
done

if [[ -n ${trailing//$'\n'/} ]]; then
  sed '/^$/d' <<<"$trailing"
  exit 1
fi
