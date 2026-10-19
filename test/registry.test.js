// adapted from spike-html-design v0.7.0: test/registry.test.js, its assertions kept and its
// harness node's. The registry has no DOM, only its store at a global key, so it runs in the unit
// tier (node --test test/), on layers/foundation/registry.ts as node runs it, its types stripped.
//
// v0.7.0 opened a fresh page per case; here a case's page is a fresh copy of the module, imported
// by a URL no other case uses, after the store is removed from the global object, so each case
// starts from an empty store as a page would. v0.7.0's registration modules, register.js and
// register-full.js, stay in spike-html-design: where its fixture pages imported them, a case here
// registers the same names in the same order through registerLean() and registerFull(), copies of
// those modules' three and eight lines. Their own cases (the names each lists, and that
// registering loads no CSS) stay with them, as does the CDN case, which loaded copies by two tags'
// URLs from file://: two copies by two URLs, here, is the same store shared by two module
// instances.

import assert from "node:assert/strict";
import { describe, test } from "node:test";

const url = new URL("../layers/foundation/registry.ts", import.meta.url).href;
const KEY = Symbol.for("spike-html-design.registry");

// LEAN and FULL are the names each registration module lists, per facet, in registration order:
// the profiles its CSS entry ships.
const LEAN = { color: ["flexoki"], space: ["regular"], type: ["mono"] };
const FULL = {
  color: ["flexoki", "primer", "catppuccin", "everforest"],
  space: ["regular", "compact"],
  type: ["mono", "sans"],
};

// copy imports a copy of the registry by the URL with query, a module instance of its own.
const copy = (query) => import(`${url}?${query}`);

// page starts a page: the store removed, and a fresh copy of the registry imported, the one a
// page's registration module would import. It resolves to that copy and a copy() of the page's
// own, by a URL with the suffix given.
let pages = 0;
async function page() {
  delete globalThis[KEY];
  const name = `page=${++pages}`;
  return { registry: await copy(name), copy: (suffix) => copy(`${name}&${suffix}`) };
}

// registerLean and registerFull register what v0.7.0's modules/register.js and
// modules/register-full.js do, through the registry given.
function registerLean({ register }) {
  register("color", "flexoki");
  register("space", "regular");
  register("type", "mono");
}
function registerFull({ register }) {
  for (const name of ["flexoki", "primer", "catppuccin", "everforest"]) register("color", name);
  for (const name of ["regular", "compact"]) register("space", name);
  for (const name of ["mono", "sans"]) register("type", name);
}

// STORE reads the page's registry store at its well-known global key, as JSON.
const STORE = () => JSON.parse(JSON.stringify(globalThis[KEY]));

// listed is what a fixture page listed, per facet: each facet's names as the registry given reads
// them, as v0.7.0's test/fixtures/registrations.js rendered them.
const listed = ({ FACETS, profiles }) =>
  Object.fromEntries(FACETS.map((facet) => [facet, profiles(facet)]));

describe("registry", () => {
  test("two copies of the registry from two URLs share one store", async () => {
    // registry.html: copies a and b, the lean module run twice and the full module through the
    // page's copy, and an extension registering twice through a.
    const { registry, copy } = await page();
    const a = await copy("a");
    const b = await copy("b");
    registerLean(registry);
    registerLean(registry);
    registerFull(registry);
    a.register("color", "extension");
    a.register("color", "extension");
    assert.notEqual(a.register, b.register);
    // Copy b lists what the registration modules and copy a registered, each name once though
    // the lean module ran twice and the extension registered twice.
    const expected = { ...FULL, color: [...FULL.color, "extension"] };
    assert.deepEqual(listed(b), expected);
    assert.deepEqual(STORE(), expected);
  });

  test("the store is a plain object of the three facets' name lists", async () => {
    registerLean((await page()).registry);
    const store = globalThis[KEY];
    assert.deepEqual(
      [
        Object.getPrototypeOf(store) === Object.prototype,
        Object.keys(store),
        Object.values(store).every(Array.isArray),
      ],
      [true, ["color", "space", "type"], true],
    );
  });

  test("a copy that finds a store already there uses it, and adds a facet it lacks", async () => {
    // A store an older copy made, with no type facet: the new copy keeps it, and gives type its
    // list on first use.
    delete globalThis[KEY];
    const older = { color: ["flexoki"], space: [] };
    globalThis[KEY] = older;
    const registry = await copy(`page=${++pages}`);
    registry.register("type", "mono");
    assert.equal(globalThis[KEY], older);
    assert.deepEqual(STORE(), { color: ["flexoki"], space: [], type: ["mono"] });
  });

  test("names the facets and their defaults, and profiles() returns a copy", async () => {
    const { registry } = await page();
    registerLean(registry);
    registry.profiles("color").push("mutated");
    assert.deepEqual(
      [registry.FACETS, registry.DEFAULTS, registry.profiles("color")],
      [
        ["color", "space", "type"],
        { color: "flexoki", space: "regular", type: "mono" },
        ["flexoki"],
      ],
    );
  });

  test("register throws on an unknown facet or an empty name, and registers nothing", async () => {
    const { registry } = await page();
    registerLean(registry);
    const thrown = (call) => {
      try {
        call();
        return null;
      } catch (error) {
        return [error.name, error.message];
      }
    };
    assert.deepEqual(
      thrown(() => registry.register("scheme", "dark")),
      ["TypeError", "registry: unknown facet scheme; expected one of color, space, type"],
    );
    assert.deepEqual(
      thrown(() => registry.profiles("palette")),
      ["TypeError", "registry: unknown facet palette; expected one of color, space, type"],
    );
    assert.deepEqual(
      thrown(() => registry.register("color", "")),
      ["TypeError", "registry: a color profile's name must be a non-empty string"],
    );
    assert.deepEqual(STORE(), LEAN);
  });
});
