// The release's shape: its exports map walked by Node's rules, and the build checked against the
// sources, package.json's files, and exports. Shared by test/unit/release.test.js and
// test/consumers/consumers.js.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

// listFiles DIR: every file below DIR, relative to it with / separators, sorted.
export function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((path) => statSync(join(dir, path)).isFile())
    .map((path) => path.split(sep).join("/"))
    .sort();
}

// The conditions of an exports entry, as { condition: target }; a bare target is "default".
export function conditions(entry) {
  return typeof entry === "string" ? { default: entry } : { ...entry };
}

// A key's or target's parts around its one *, or undefined when it holds none.
function star(pattern) {
  const at = pattern.indexOf("*");
  return at < 0 ? undefined : { prefix: pattern.slice(0, at), suffix: pattern.slice(at + 1) };
}

// Node's PATTERN_KEY_COMPARE: the longer prefix before the * first, then the longer key.
function compareKeys(a, b) {
  const [pa, pb] = [a.indexOf("*"), b.indexOf("*")];
  return pb - pa || b.length - a.length;
}

// resolveExport(exports, subpath): the key a subpath ("./components/status-badge.js") matches
// and its entry's conditions, the * replaced, by Node's rules: an exact key first, then the
// best-matching pattern key. undefined when no key matches.
export function resolveExport(exports, subpath) {
  if (Object.hasOwn(exports, subpath) && !subpath.includes("*")) {
    return { key: subpath, targets: conditions(exports[subpath]) };
  }
  const [key] = Object.keys(exports)
    .filter((candidate) => {
      const parts = star(candidate);
      return (
        parts !== undefined &&
        subpath.length >= candidate.length &&
        subpath.startsWith(parts.prefix) &&
        subpath.endsWith(parts.suffix)
      );
    })
    .sort(compareKeys);
  if (key === undefined) return undefined;
  const parts = star(key);
  const value = subpath.slice(parts.prefix.length, subpath.length - parts.suffix.length);
  const targets = Object.entries(conditions(exports[key])).map(([condition, target]) => [
    condition,
    target.replace("*", value),
  ]);
  return { key, targets: Object.fromEntries(targets) };
}

// subpathsOf(exports, file): every subpath that resolves to file ("dist/foundation/dom.js")
// under some condition, as { subpath, key, condition }. A key whose target would name the file
// but which loses that subpath to an exact or better key doesn't count.
export function subpathsOf(exports, file) {
  const path = `./${file}`;
  const found = [];
  for (const [key, entry] of Object.entries(exports)) {
    for (const target of Object.values(conditions(entry))) {
      if (typeof target !== "string") continue;
      const parts = star(target);
      let subpath;
      if (parts === undefined) {
        if (target === path) subpath = key;
      } else if (
        path.length >= parts.prefix.length + parts.suffix.length &&
        path.startsWith(parts.prefix) &&
        path.endsWith(parts.suffix)
      ) {
        subpath = key.replace(
          "*",
          path.slice(parts.prefix.length, path.length - parts.suffix.length),
        );
      }
      if (subpath === undefined || found.some((f) => f.subpath === subpath)) continue;
      const resolved = resolveExport(exports, subpath);
      for (const [condition, resolvedPath] of Object.entries(resolved?.targets ?? {})) {
        if (resolvedPath === path) found.push({ subpath, key: resolved.key, condition });
      }
    }
  }
  return found;
}

// The dist/ path each source in layers/ ships as.
export function builtFrom(source) {
  if (source.endsWith(".d.ts") || source.endsWith(".css")) return [`dist/${source}`];
  if (source.endsWith(".ts")) {
    const base = source.slice(0, -".ts".length);
    return [`dist/${base}.js`, `dist/${base}.d.ts`];
  }
  return [];
}

// releaseProblems(root): what keeps root's build from being the release package.json declares,
// one line each; none when it is. root holds layers/, dist/ (the build), and package.json.
export function releaseProblems(root) {
  const problems = [];
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const { exports = {}, files = [] } = manifest;
  const built = listFiles(join(root, "dist")).map((path) => `dist/${path}`);
  const builtSet = new Set(built);

  // The build against the sources: each source's emit or copy is there, and nothing else is.
  const expected = new Set();
  for (const source of listFiles(join(root, "layers"))) {
    const outputs = builtFrom(source);
    if (outputs.length === 0) problems.push(`layers/${source} isn't a .ts, .d.ts, or .css source`);
    for (const output of outputs) {
      expected.add(output);
      if (!builtSet.has(output)) problems.push(`layers/${source} has no built ${output}`);
    }
  }
  for (const path of built) {
    if (!expected.has(path)) problems.push(`${path} is built from no source in layers/`);
  }

  // files ships the build: each built file lies under an entry of files.
  const shipped = (path) =>
    files.some(
      (entry) =>
        path === entry.replace(/\/$/, "") || path.startsWith(`${entry.replace(/\/$/, "")}/`),
    );
  for (const path of built) {
    if (!shipped(path)) problems.push(`${path} isn't under package.json's files`);
  }

  // exports: every entry well formed, every built file reachable, every pattern key reaching a
  // built file, and every target a reachable subpath or an exact key resolves to built.
  const subpaths = new Set();
  const used = new Set();
  for (const [key, entry] of Object.entries(exports)) {
    const targets = Object.values(conditions(entry));
    if (targets.length === 0 || targets.some((target) => typeof target !== "string")) {
      problems.push(`exports["${key}"] isn't a target or a flat object of condition targets`);
    } else if (!key.includes("*")) {
      subpaths.add(key);
    }
  }
  for (const path of built) {
    const reached = subpathsOf(exports, path);
    if (reached.length === 0) problems.push(`${path} is reachable through no export`);
    for (const { subpath, key } of reached) {
      subpaths.add(subpath);
      used.add(key);
    }
  }
  for (const key of Object.keys(exports)) {
    if (key.includes("*") && !used.has(key))
      problems.push(`exports["${key}"] reaches no built file`);
  }
  for (const subpath of subpaths) {
    for (const [condition, target] of Object.entries(
      resolveExport(exports, subpath)?.targets ?? {},
    )) {
      if (typeof target !== "string") continue;
      const path = target.replace(/^\.\//, "");
      if (!builtSet.has(path)) {
        problems.push(`exports["${subpath}"] ${condition} points at ${target}, which isn't built`);
      }
    }
  }
  return problems;
}
