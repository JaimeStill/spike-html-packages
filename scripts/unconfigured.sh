#!/usr/bin/env bash
# Runs a package manager's command with none of the user's own config: every install
# scripts/consumers.sh, scripts/lock.sh, and scripts/live.js run goes through it, so a user-level
# setting such as allow-git or blockExoticSubdeps can't change what a guard row or proof reports.
# The project's own config, its .npmrc, pnpm-workspace.yaml, or bunfig.toml, still applies.
#
#   scripts/unconfigured.sh [--github-packages-token] <manager> <args>...
#
# What each manager reads beyond the project, found by tracing its install (npm 12.2.1, pnpm
# 12.15.0, bun 1.4.4), and how it is emptied here:
# - npm: the user's ~/.npmrc and the global $PREFIX/etc/npmrc, emptied by NPM_CONFIG_USERCONFIG and
#   NPM_CONFIG_GLOBALCONFIG. The npmrc inside npm's own install is the pin's, and stays.
# - pnpm: the user's ~/.npmrc, emptied as npm's is, and its global config.yaml and auth.ini in
#   $XDG_CONFIG_HOME/pnpm/, emptied by XDG_CONFIG_HOME.
# - bun: the user's ~/.npmrc and $XDG_CONFIG_HOME/.npmrc, emptied by NPM_CONFIG_USERCONFIG, and its
#   global .bunfig.toml in $XDG_CONFIG_HOME, or $HOME without it, emptied by XDG_CONFIG_HOME.
# Each also reads settings from the environment, npm_config_*, pnpm_config_*, and BUN_CONFIG_*,
# which are unset, read from env itself: bash lists no variable whose name it can't hold, such as
# pnpm's per-registry settings, and passes those through unlisted.
#
# --github-packages-token lets one through: pnpm's token for GitHub Packages, which scripts/live.js
# sets for its GitHub Packages installs. pnpm 12.15.0 expands no ${VAR} in a project .npmrc's
# //npm.pkg.github.com/:_authToken, warning that it ignores it, and refuses pnpm_config__auth as
# invalid: it takes the token from this variable alone.
set -euo pipefail

token=pnpm_config_//npm.pkg.github.com/:_authToken
keep=
if [[ ${1:-} == --github-packages-token ]]; then
  keep=$token
  shift
fi

empty=$(mktemp -d)
trap 'rm -rf "$empty"' EXIT
# Two files: npm refuses one config file loaded as both user and global.
: >"$empty/user-npmrc"
: >"$empty/global-npmrc"
mkdir "$empty/config"

configs='^(npm|pnpm)_config_|^bun_config_'
unset=()
while IFS= read -r -d '' entry; do
  name=${entry%%=*}
  if [[ ${name,,} =~ $configs && $name != "$keep" ]]; then unset+=(-u "$name"); fi
done < <(env -0)

env "${unset[@]}" NPM_CONFIG_USERCONFIG="$empty/user-npmrc" \
  NPM_CONFIG_GLOBALCONFIG="$empty/global-npmrc" \
  XDG_CONFIG_HOME="$empty/config" "$@"
