// The one package's build, run by scripts/build.sh with the package's directory: its siblings'
// builds, the packages its devDependencies name in the workspace's scope, put together in its own
// dist/, one directory per layer, and every bare sibling specifier in them rewritten to a relative
// one, so the package installs and loads with lit as its only dependency.
//
// A sibling exports each built file at its path below dist/ (./dom.js is ./dist/dom.js), so the
// sibling's subpath ./<path> is the one package's dist/<layer>/<path>. The exception is the
// foundation's ./css, the ambient "*.css" declaration, which the one package exports as its own
// ./css at dist/css.d.ts.

import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const scope = "@jaimestill/spike-html-packages-";
const [pkg] = process.argv.slice(2);
const dist = join(pkg, "dist");
const { devDependencies = {} } = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
const layers = Object.keys(devDependencies)
  .filter((name) => name.startsWith(scope))
  .map((name) => name.slice(scope.length));
const css = join(dist, "css.d.ts");

// Each sibling's build, read through the one package's node_modules as a consumer reads it.
for (const layer of layers) {
  const sibling = realpathSync(join(pkg, "node_modules", `${scope}${layer}`));
  cpSync(join(sibling, "dist"), join(dist, layer), { recursive: true });
}
renameSync(join(dist, "foundation", "css.d.ts"), css);

/** The file a sibling specifier names in dist/, by the subpath rule above, or throws. In a .d.ts
 * the path may name the .d.ts beside a .js, or a types-only module's declaration. */
function target(layer, path, declaration) {
  if (!layers.includes(layer)) throw new Error(`${scope}${layer} isn't a sibling`);
  const file = join(dist, layer, path);
  const types = file.replace(/\.js$/, ".d.ts");
  if (existsSync(file) || (declaration && existsSync(types))) return file;
  throw new Error(`${scope}${layer}/${path} names no file in ${dist}`);
}

/** The relative specifier from `from` to `to`, with / separators and a leading ./ or ../. */
function specifier(from, to) {
  const path = relative(dirname(from), to).split(sep).join("/");
  return path.startsWith(".") ? path : `./${path}`;
}

// A module specifier in import, export, and import(). The release test fails on any bare sibling
// specifier left in another form.
const bare = new RegExp(`(\\b(?:from|import)\\s*\\(?\\s*)"${scope}([a-z]+)/([^"]+)"`, "g");

for (const path of readdirSync(dist, { recursive: true })) {
  const file = join(dist, path);
  const declaration = file.endsWith(".d.ts");
  if (!declaration && !file.endsWith(".js")) continue;
  const source = readFileSync(file, "utf8");
  const rewritten = source.replace(
    bare,
    (_, lead, layer, sub) => `${lead}"${specifier(file, target(layer, sub, declaration))}"`,
  );
  if (rewritten !== source) writeFileSync(file, rewritten);
}
