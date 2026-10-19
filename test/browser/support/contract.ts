// The components' cases that spike-html-conventions a88828a's probe (demo/probe.ts) has no
// counterpart for: the status badge's contract, which conventions exercised only through its apps,
// none of which is copied here; and the sheets every component's shadow root adopts, the
// foundation's reset and elements sheets before its own, in that order, each one CSSStyleSheet
// shared by every root. Like the probe, it writes one line per case into #report and a verdict
// into #verdict, and test/browser/components.test.js passes on every case holding, and exactly
// as many as it expects.

import { baselineLook, look } from "./probe.ts";

/** One case of the report: what the components did, and whether that holds. */
interface Case {
  name: string;
  actual: string;
  ok: boolean;
}

/** The badge's contract, as the cases reach it. */
interface BadgeElement extends HTMLElement {
  label: string;
}

/** Each component's tag and the module that defines it. */
const components = {
  "sl-pagination-lit-shadow": () => import("../../../layers/components/pagination-lit-shadow.ts"),
  "sl-entry-lit-shadow": () => import("../../../layers/components/entry-lit-shadow.ts"),
  "sl-status-badge": () => import("../../../layers/components/status-badge.ts"),
};

/** Lets pending updates land: Lit renders in a microtask queued when a property changes. */
const settle = () => Promise.resolve();

/** The badge's button, which its shadow root holds alone. */
function button(badge: Element): HTMLButtonElement {
  const found = badge.shadowRoot?.querySelectorAll("button") ?? [];
  if (found.length !== 1) throw new Error(`the badge rendered ${found.length} buttons, not 1`);
  return found[0];
}

/** The badge's cases: its label in, by property or attribute, and `badge-select` out. */
async function badgeCases(host: HTMLElement): Promise<Case[]> {
  const cases: Case[] = [];
  const equal = (name: string, actual: string, expected: string) =>
    cases.push({ name, actual, ok: actual === expected });

  // The label is set before the definition, as the probe sets the pagination's properties.
  const badge = document.createElement("sl-status-badge") as BadgeElement;
  badge.label = "Signed out";
  host.append(badge);
  await components["sl-status-badge"]();
  await settle();
  equal("badge label set before definition", button(badge).textContent ?? "", "Signed out");
  equal("badge host display", getComputedStyle(badge).display, "inline-block");

  badge.setAttribute("label", "Draft");
  await settle();
  equal(
    "badge label attribute to property",
    `${badge.label}, ${button(badge).textContent}`,
    "Draft, Draft",
  );

  const heard: string[] = [];
  const hear = (e: Event) =>
    heard.push(`${e.type} ${JSON.stringify((e as CustomEvent<unknown>).detail)}`);
  document.addEventListener("badge-select", hear);
  button(badge).click();
  document.removeEventListener("badge-select", hear);
  equal("badge event select", heard.join("; ") || "none", `badge-select {"label":"Draft"}`);

  // The button is bare: painted by the adopted reset and elements sheets alone, as the page's
  // baseline paints a bare button of the same kind.
  const control = button(badge);
  cases.push({
    name: "badge button painted by the baseline",
    actual: look(control),
    ok: look(control) === baselineLook(control),
  });
  return cases;
}

/**
 * A sheet as the cases name it: the foundation layer its rules sit in, when each sits in one
 * layer block, or "own" for a sheet with an unlayered rule, a component's own.
 */
function sheetName(sheet: CSSStyleSheet): string {
  const rules = Array.from(sheet.cssRules);
  const layers = new Set(rules.map((r) => (r instanceof CSSLayerBlockRule ? r.name : "own")));
  return layers.size === 1 ? [...layers][0] : [...layers].join("+");
}

/**
 * The sheets every component's root adopts: the reset, the elements, and its own, in that order,
 * and the reset and elements sheets the very same CSSStyleSheet in every root, the CSS module
 * scripts' one sheet per document.
 */
async function sheetCases(host: HTMLElement): Promise<Case[]> {
  const cases: Case[] = [];
  const adopted: CSSStyleSheet[][] = [];
  for (const [tag, load] of Object.entries(components)) {
    await load();
    const element = document.createElement(tag);
    host.append(element);
    await settle();
    const sheets = element.shadowRoot?.adoptedStyleSheets ?? [];
    adopted.push([...sheets]);
    const actual = sheets.map(sheetName).join(", ") || "none";
    cases.push({
      name: `sheets ${tag}`,
      actual,
      ok: actual === "foundation.reset, foundation.elements, own",
    });
  }
  const shared = (i: number) => adopted.every((sheets) => sheets[i] === adopted[0][i]);
  cases.push({
    name: "sheets shared by every root",
    actual: `reset ${shared(0) ? "shared" : "not shared"}, elements ${shared(1) ? "shared" : "not shared"}`,
    ok: shared(0) && shared(1),
  });
  return cases;
}

/** Runs every case in this page and writes the outcome, as the probe's run() does. */
export async function run(): Promise<void> {
  const verdict = document.getElementById("verdict");
  const report = document.getElementById("report");
  const host = document.querySelector("main");
  if (verdict === null || report === null || host === null) {
    throw new Error("the page needs a <main>, a #verdict, and a #report");
  }
  try {
    const cases = [...(await badgeCases(host)), ...(await sheetCases(host))];
    report.textContent = cases
      .map(({ name, actual, ok }) => `${ok ? "ok  " : "FAIL"} ${name}: ${actual}`)
      .join("\n");
    const failed = cases.filter((c) => !c.ok).map((c) => c.name);
    verdict.textContent = failed.length
      ? `FAIL: ${failed.join(", ")}`
      : `ok: all ${cases.length} cases hold`;
  } catch (error) {
    verdict.textContent = `FAIL: ${error instanceof Error ? error.message : String(error)}`;
  }
}
