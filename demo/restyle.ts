// adapted from spike-html-conventions a88828a: demo/restyle.ts, cut to the one version this
// repository holds, Lit with a shadow root, so its light-DOM source goes, and its elements sheet
// imported as the components import it, a CSS module script of the foundation's
// baseline/elements.css, in place of conventions' layers/foundation/baseline.ts.
//
// The button styles' single source, shown in the shadow-root version: a pagination holding one
// entry renders, then one edit to the sheet the version's roots take their button styles from
// repaints both elements' buttons. The source is the foundation's elements layer, the port of
// spike-html-design v0.7.0's, whose button rule reads --bg-2 and which no component's own sheet
// overrides for a button. It is one CSSStyleSheet per document, as a CSS module script: this
// module imports baseline/elements.css by the same URL the components do, so it holds the very
// sheet adopted into both roots, and the edit inserts a button rule at the end of its
// foundation.elements block. The rule follows the baseline's own in its layer, with the same zero
// specificity, so it wins.
//
// scripts/browser-components.test.js runs it; it passes when both buttons painted from the source
// before the edit, an opaque color, so the tokens loaded, and both take the edit after it.

import type { EntryItem } from "../layers/components/entry-lit-shadow.js";
import elements from "../layers/foundation/baseline/elements.css" with { type: "css" };
import { directories } from "./documents.js";
import { versions, type Version } from "./versions.js";

/** The background the edit gives every button: a color no source sets. */
const edited = "rgb(1, 2, 3)";

/** The background the baseline's button rule gives, as its elements layer writes it. */
const baselineBackground = "var(--bg-2)";

/** The rule each edit adds to the foundation.elements layer, after the baseline's button rule. */
const editRule = `:where(button) { background-color: ${edited}; }`;

/** The roots' source of button styles: its name, and the edit to it. */
const source = {
  name: "adopted foundation.elements :where(button)",
  edit() {
    const layer = Array.from(elements.cssRules).find(
      (r): r is CSSLayerBlockRule =>
        r instanceof CSSLayerBlockRule && r.name === "foundation.elements",
    );
    if (layer === undefined) throw new Error("the elements sheet has no foundation.elements block");
    layer.insertRule(editRule, layer.cssRules.length);
  },
};

/**
 * Whether a computed background is an opaque color. A computed color with an alpha of 1 serializes
 * as rgb(), any other as rgba(), and a var() the page has no token for computes to transparent,
 * rgba(0, 0, 0, 0): so a page whose tokens didn't load, its baseline unlinked, fails here rather
 * than matching a transparent expected value with transparent buttons.
 */
const opaque = (background: string): boolean => background.startsWith("rgb(");

/** A background as the page computes it, so a source's value compares with a button's. */
function computed(background: string): string {
  const swatch = document.createElement("div");
  swatch.style.setProperty("background", background);
  document.body.append(swatch);
  const value = getComputedStyle(swatch).backgroundColor;
  swatch.remove();
  return value;
}

/** The pagination's Next button and the entry's button, as each version renders them. */
function buttons(pagination: Element, entry: Element): HTMLButtonElement[] {
  const root = (element: Element): ParentNode => element.shadowRoot ?? element;
  const next = "Next page";
  const found = [
    root(pagination).querySelector<HTMLButtonElement>(`[aria-label="${next}"]`),
    root(entry).querySelector<HTMLButtonElement>("button"),
  ];
  if (found.some((button) => button === null)) throw new Error("a button didn't render");
  return found as HTMLButtonElement[];
}

/** Renders the version, edits its source, and says how both buttons' backgrounds went. */
async function restyle(
  version: Version,
  host: HTMLElement,
): Promise<{ ok: boolean; line: string }> {
  const pagination = document.createElement(version.pagination);
  const entry = document.createElement(version.entry) as HTMLElement & { item: EntryItem };
  Object.assign(pagination, { page: 2, size: 3, total: 8 });
  entry.item = directories.items[0];
  pagination.append(entry);
  host.append(pagination);
  await version.load();
  await Promise.resolve();

  const pair = buttons(pagination, entry);
  // Any transition a button's background runs is finished before the read: what is read is where
  // the edit lands, not a transition's first frame.
  const background = () =>
    pair.map((button) => {
      for (const animation of button.getAnimations()) animation.finish();
      return getComputedStyle(button).backgroundColor;
    });
  if (pagination.shadowRoot === null) throw new Error("the pagination rendered no shadow root");
  const expected = computed(baselineBackground);
  const before = background();
  source.edit();
  const after = background();

  const ok =
    before.every((value) => value === expected && opaque(value) && value !== edited) &&
    after.every((value) => value === edited);
  const line = `${source.name}: pagination ${before[0]} -> ${after[0]}, entry ${before[1]} -> ${after[1]}`;
  return { ok, line };
}

/** Runs the check against the named version in this page and writes its verdict in #verdict. */
export async function run(name: string): Promise<void> {
  const verdict = document.getElementById("verdict");
  const host = document.querySelector("main");
  if (verdict === null || host === null) throw new Error("the page needs a <main> and a #verdict");
  try {
    const version = versions[name];
    if (version === undefined) throw new Error(`no version ${name}`);
    const { ok, line } = await restyle(version, host);
    verdict.textContent = `${ok ? "ok" : "FAIL"}: ${line}`;
  } catch (error) {
    verdict.textContent = `FAIL: ${error instanceof Error ? error.message : String(error)}`;
  }
}
