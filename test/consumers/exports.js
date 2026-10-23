// An installed release's exports map, walked by Node's rules: the subpaths that reach a file, and
// the targets a subpath resolves to. consumers.js shares it.
// Adapted from spike-html-packages (c2b4a19): test/consumers/release.js, its exports walk alone.

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

/** Every file below `dir`, relative to it with / separators, sorted. */
export function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((path) => statSync(join(dir, path)).isFile())
    .map((path) => path.split(sep).join("/"))
    .sort();
}

/** The conditions of an exports entry, as { condition: target }; a bare target is "default", and
 * null, which excludes its subpath, has none. */
export function conditions(entry) {
  return typeof entry === "string" ? { default: entry } : { ...entry };
}

/** A key's or target's parts around its one *, or undefined when it holds none. */
function star(pattern) {
  const at = pattern.indexOf("*");
  return at < 0 ? undefined : { prefix: pattern.slice(0, at), suffix: pattern.slice(at + 1) };
}

/** Node's PATTERN_KEY_COMPARE: the longer prefix before the * first, then the longer key. */
function compareKeys(a, b) {
  const [pa, pb] = [a.indexOf("*"), b.indexOf("*")];
  return pb - pa || b.length - a.length;
}

/** The key a subpath matches and its conditions, the * replaced, by Node's rules, or undefined. */
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

/** Each { subpath, key, condition } resolving to the file, by a key that wins the subpath. */
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
