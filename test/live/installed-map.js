// The consumer pages' import maps, made to follow a networked install: scripts/live.js copies
// test/consumers/pages/ into each install it loads a page from, and this rewrites the manager's
// page there to the directories the install resolves each package to. The committed maps name the
// directories of the fixtures' lockfiles: pnpm's virtual store names each package's directory by
// how it was installed, by a git tag's codeload URL, a tarball's, or a registry version, with its
// peers, and an install with no lockfile may resolve lit's own dependencies to newer versions. Each
// entry keeps its file within the package; only the package's directory is resolved anew, as node
// resolves it from the scope's package, or from the project for the top-level imports.
//
// An npm or bun install that nests a second foundation in the components' node_modules gets a
// scope of its own for the components, mapping theirs, so the page loads both foundations as the
// install holds them and test/consumers/pages.js finds the second one, rather than the map
// hiding it.

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const foundation = "@jaimestill/spike-html-packages-foundation";
const components = "@jaimestill/spike-html-packages-components";

/** The package directory a map URL is in, as its last node_modules/<name>/, with the name and the
 * rest of the URL, the file or directory within the package. */
function packageIn(url) {
  const match = /^(.*\/node_modules\/((?:@[^/]+\/)?[^/]+))(\/.*)?$/.exec(url);
  if (!match) throw new Error(`the import map's ${url} is in no package`);
  return { dir: match[1], name: match[2], rest: match[3] ?? "" };
}

/** The real directory node resolves the package to from the directory: the first node_modules
 * holding it, from the directory up, as scripts/installed.sh's resolve_from. */
function resolveFrom(dir, name) {
  for (let at = dir; ; at = dirname(at)) {
    const candidate = join(at, "node_modules", name);
    if (existsSync(candidate)) return realpathSync(candidate);
    if (at === dirname(at)) throw new Error(`nothing resolves ${name} from ${dir}`);
  }
}

/** The package a scope is keyed by: pnpm keys each by its store directory's node_modules/,
 * node_modules/.pnpm/<name, its / a +>@<version and peers>/node_modules/, which holds the package
 * and links to the packages it depends on. */
function scopeOwner(key) {
  const name = /\/\.pnpm\/((?:@[^+/]+\+)?[^@/]+)@[^/]*\/node_modules\/$/.exec(key)?.[1];
  if (!name) throw new Error(`the import map's scope ${key} is no pnpm store directory`);
  return name.replace("+", "/");
}

/** Rewrites <project>/pages/<manager>.html's import map to the install's directories. */
export function followInstall(project, manager) {
  const page = join(project, "pages", `${manager}.html`);
  const html = readFileSync(page, "utf8");
  const mapPattern = /(<script type="importmap">)([^]*?)(<\/script>)/;
  const map = JSON.parse(mapPattern.exec(html)[2]);
  const real = realpathSync(project);
  const url = (dir) => `/${relative(real, dir)}`;

  // Each package's directory in the committed map, by the one the install resolves it to.
  const moved = new Map();
  const resolved = (context, target) => {
    const { dir, name, rest } = packageIn(target);
    const to = resolveFrom(context, name);
    moved.set(dir, to);
    return url(to) + rest;
  };
  const entries = (specifiers, context) =>
    Object.fromEntries(
      Object.entries(specifiers).map(([key, target]) => [key, resolved(context, target)]),
    );

  const imports = entries(map.imports, real);
  // A scope resolves from its package, once an entry before it has reached that package: the
  // components' scope names lit, and lit's scope lit-element.
  const scopes = {};
  const pending = Object.entries(map.scopes ?? {});
  while (pending.length > 0) {
    const at = pending.findIndex(([key]) => moved.has(key + scopeOwner(key)));
    if (at === -1) {
      throw new Error(`no entry reaches the package of ${pending.map(([key]) => key).join(", ")}`);
    }
    const [[key, specifiers]] = pending.splice(at, 1);
    const owner = moved.get(key + scopeOwner(key));
    scopes[url(owner).slice(0, -scopeOwner(key).length)] = entries(specifiers, owner);
  }

  // A second foundation the hoisted map can't see, as the install nests it.
  const theirs = resolveFrom(resolveFrom(real, components), foundation);
  const top = resolveFrom(real, foundation);
  if (map.scopes === undefined && theirs !== top) {
    scopes[`${url(resolveFrom(real, components))}/`] = {
      [`${foundation}/`]: `${url(theirs)}/dist/`,
    };
  }

  const rewritten = { imports, ...(Object.keys(scopes).length > 0 ? { scopes } : {}) };
  const json = JSON.stringify(rewritten, null, 2);
  writeFileSync(
    page,
    html.replace(mapPattern, (_, open, __, close) => `${open}\n${json}\n${close}`),
  );
}
