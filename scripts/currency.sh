#!/usr/bin/env bash
# The currency command, outside the check: reports every pin that trails its latest release, one
# line each, and exits nonzero when it reports any; with everything current it prints nothing and
# exits 0. It reads the network and writes nothing. Run it through `mise run currency`. After
# spike-html-conventions a88828a: scripts/currency.sh, cut to the two kinds of pin this repository
# holds, each line naming the file that holds it, as `FILE: NAME PIN -> LATEST`:
#
#   mise tools        mise.toml's [tools], against `mise outdated --bump --local`: the http:
#                     chrome-headless-shell pin against Chrome for Testing's Stable channel, read
#                     from the version_list_url mise.toml gives it.
#   package deps      package.json's dependencies and devDependencies, each pinned to a version,
#                     against the registry's latest dist-tag through `pnpm view`.
#
# A package another of them names as a peer (typescript, under typescript-eslint) is compared
# against the highest version in that peer range instead, the latest the tooling can take, so
# typescript held at 6.0.3 isn't reported while typescript-eslint caps it there. A pin trails only
# when its latest is strictly higher. A dependency in a form this script can't compare (a range, a
# tag, a git URL) is reported as such, so no pin is silently skipped.
#
# Each scan captures its command's output in a variable before reading it, so under set -e a
# lookup that fails fails currency instead of reporting nothing.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

stale=0
report() {
  echo "$1"
  stale=1
}

# behind A B: whether version A sorts strictly below version B, by version sort.
behind() {
  [[ "$1" != "$2" && "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n 1)" == "$1" ]]
}

# mise tools pinned below their latest version. JSON is read with node, a mise pin, not jq.
# Errors only: mise warns on every run that npm's GitHub release has no assets as it falls back to
# another source for npm's latest, which would break the silence of a current tree.
outdated=$(MISE_LOG_LEVEL=error mise outdated --bump --local --json)
lines=$(node -e '
  const out = JSON.parse(process.argv[1]);
  for (const [tool, v] of Object.entries(out)) console.log(tool + " " + v.requested + " -> " + v.bump);
' "$outdated")
while read -r line; do
  [[ -n "$line" ]] && report "mise.toml: $line"
done <<<"$lines"

# Every direct dependency of the package, dependencies then devDependencies, one `NAME<tab>SPEC`
# per line.
deps=$(node -e '
  const { dependencies = {}, devDependencies = {} } = require(process.argv[1]);
  for (const [name, spec] of Object.entries({ ...dependencies, ...devDependencies })) {
    console.log(name + "\t" + spec);
  }
' "$root/package.json")
names=()
declare -A pins=()
while IFS=$'\t' read -r name spec; do
  [[ -n "$name" ]] || continue
  if [[ "$spec" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    names+=("$name")
    pins[$name]=$spec
  else
    report "package.json: $name $spec -> can't compare this form of pin"
  fi
done <<<"$deps"

# Each package's peer ranges, at its pin, looked up once.
declare -A peers=()
for name in "${names[@]}"; do
  peers[$name]=$(pnpm view "$name@${pins[$name]}" peerDependencies --json)
done

# capped NAME: sets range and capped_by to the peer range another dependency, at its pin, gives
# NAME, and that dependency, or to nothing if none does.
capped() {
  local other
  range="" capped_by=""
  for other in "${names[@]}"; do
    if [[ "$other" == "$1" ]]; then continue; fi
    range=$(node -e 'console.log(JSON.parse(process.argv[1] || "{}")[process.argv[2]] ?? "")' \
      "${peers[$other]}" "$1")
    if [[ -n "$range" ]]; then
      capped_by=$other
      return
    fi
  done
}

# Each dependency against the registry's latest, or a capped one against the highest version in
# its peer range.
for name in "${names[@]}"; do
  pin=${pins[$name]}
  capped "$name"
  if [[ -n "$range" ]]; then
    versions=$(pnpm view "$name@$range" version --json)
    latest=$(node -e 'for (const v of [].concat(JSON.parse(process.argv[1]))) console.log(v)' \
      "$versions" | sort -V | tail -n 1)
  else
    latest=$(pnpm view "$name" version)
  fi
  if behind "$pin" "$latest"; then
    if [[ -n "$capped_by" ]]; then latest+=" (the highest in $capped_by's peer range $range)"; fi
    report "package.json: $name $pin -> $latest"
  fi
done

exit "$stale"
