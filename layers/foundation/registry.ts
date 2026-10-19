// adapted from spike-html-design v0.7.0: modules/registry.js, typed: the code is v0.7.0's, with
// its store and facets named as types. The registration modules it names below
// (./register, ./register/full) stay in spike-html-design and are not copied here.
//
// registry: the page's one list of the profiles it can apply, per facet, for the theming menu
// and the stored preferences to read. It has no UI and loads nothing.
//
// The list lives in one store per page, a plain object at a well-known global key,
// globalThis[Symbol.for("spike-html-design.registry")]. Every copy of this module shares it,
// whatever URL or tag it was loaded from: the lean or full registration module, an extension
// pinned to another tag, and a second copy reached by another path all register into the same
// lists. The store's shape is public API, frozen with the tag that ships it:
//
//   { color: string[], space: string[], type: string[] }
//
// each facet's profile names, as its data-palette, data-space, or data-type value, in the order
// they were first registered. A copy that finds a store already there uses it as it is; a facet
// a newer copy adds gets its list on first use.
//
// The API over the store:
//
//   register(facet, name)  lists name under facet, one of FACETS. Registering a name twice is
//                          harmless: it keeps its first place. It throws on an unknown facet or
//                          an empty name.
//   profiles(facet)        returns a copy of facet's names, in registration order.
//   FACETS                 the facets: color, space, type. The scheme is not a facet.
//   DEFAULTS               each facet's default profile: flexoki, regular, mono. They are the
//                          profiles both CSS entries apply with no attribute, so they are
//                          constants, not whichever name registered first.
//
// Registering lists a name only. The page's CSS, an entry or a profile it imports, ships the
// profile; registering never loads CSS. A page imports the registration module that matches the
// entry it links (./register or ./register/full), and a page or extension that imports a
// profile beyond its entry registers that name itself, here.
//
// The types say what a caller passes; the checks stay, as v0.7.0's, for a caller the types never
// reach: a page's plain script, or a copy from another tag.

/** A facet a profile belongs to. */
export type Facet = "color" | "space" | "type";

/** The store: each facet's names. A store an older copy made may lack a facet a newer one adds. */
export type Store = Partial<Record<Facet, string[]>>;

const KEY = Symbol.for("spike-html-design.registry");

export const FACETS: readonly Facet[] = Object.freeze(["color", "space", "type"] as const);

export const DEFAULTS: Readonly<Record<Facet, string>> = Object.freeze({
  color: "flexoki",
  space: "regular",
  type: "mono",
});

// The global object, read by the store's symbol key.
const scope = globalThis as typeof globalThis & Record<symbol, Store | undefined>;
scope[KEY] ??= { color: [], space: [], type: [] };
const store: Store = scope[KEY];

// facetOf returns facet when it is one of FACETS, and throws otherwise.
function facetOf(facet: string): Facet {
  if (!(FACETS as readonly string[]).includes(facet)) {
    throw new TypeError(`registry: unknown facet ${facet}; expected one of ${FACETS.join(", ")}`);
  }
  return facet as Facet;
}

// register lists name under facet, once.
export function register(facet: Facet, name: string): void {
  facetOf(facet);
  if (typeof name !== "string" || name === "") {
    throw new TypeError(`registry: a ${facet} profile's name must be a non-empty string`);
  }
  store[facet] ??= [];
  if (!store[facet].includes(name)) store[facet].push(name);
}

// profiles returns a copy of facet's names, so a caller never changes the store.
export function profiles(facet: Facet): string[] {
  return [...(store[facetOf(facet)] ?? [])];
}
