// The design check the consumer pages and the Vite apps share: the foundation's page.css, which
// each page links from the install and each app imports by package name, must shape the document.
// test/consumers/pages.js and test/consumers/vite.js evaluate measure() in each loaded page, once
// its report is in, and hold what it returns to the install's own page.css with failure().
//
// The values are computed, never hard-coded, so the check follows whatever the foundation's
// tokens define: the body's background and font family against the --bg and --font-body tokens as
// a property on the root resolves them, each token read inside every component's shadow root,
// where custom properties inherit across the boundary, and the document's layer order, each layer
// where it is first named, statement or block, in every sheet through each @import, against the
// order page.css's own statement fixes. The order is the cascade's, not the statement's text: a
// Vite build's minifier drops page.css's statement, as its blocks come in the same order.

import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The tokens the check reads: the color facet's base background and the type facet's body font,
 * each the value of the property of the same role that the elements layer's body rule reads. */
const tokens = { "--bg": "backgroundColor", "--font-body": "fontFamily" };

/** Runs in the page: what page.css gave the document, its shadow roots, and its layers. */
async function measure(tokens, tags) {
  if (document.readyState !== "complete") {
    await new Promise((resolve) => addEventListener("load", resolve, { once: true }));
  }
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  // Each token as a property resolves it on the root: a custom property's own computed value is
  // its declared text, light-dark() unresolved, so a probe beside the body reads it through var().
  const probe = document.createElement("div");
  for (const [token, property] of Object.entries(tokens)) probe.style[property] = `var(${token})`;
  document.documentElement.append(probe);
  const resolved = getComputedStyle(probe);
  const values = Object.entries(tokens).map(([token, property]) => ({
    token,
    property,
    declared: root.getPropertyValue(token).trim(),
    expected: resolved[property],
    body: body[property],
  }));
  probe.remove();

  // A token inherits into a shadow root as the host's value, read here on the root's first element.
  const shadows = tags.map((tag) => {
    const inner = document.querySelector(tag)?.shadowRoot?.firstElementChild;
    return {
      tag,
      element: inner?.localName ?? null,
      values: Object.keys(tokens).map((token) =>
        inner ? getComputedStyle(inner).getPropertyValue(token).trim() : "",
      ),
    };
  });

  // The document's layers in the cascade's order, the order each is first named in, by its full
  // name: a statement's names, a block's, nested under the block it is in, through each import.
  const layers = [];
  const named = (name) => layers.includes(name) || layers.push(name);
  const walk = (rules, prefix) => {
    for (const rule of rules) {
      if (rule instanceof CSSLayerStatementRule) {
        for (const name of rule.nameList) named(prefix + name);
      } else if (rule instanceof CSSLayerBlockRule) {
        // An anonymous block's layers are its own, which no name reaches.
        if (rule.name === "") continue;
        named(prefix + rule.name);
        walk(rule.cssRules, `${prefix}${rule.name}.`);
      } else if (rule instanceof CSSImportRule) {
        if (rule.styleSheet) walk(rule.styleSheet.cssRules, prefix);
      } else if (rule.cssRules) {
        walk(rule.cssRules, prefix);
      }
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules, "");
  return { values, shadows, layers };
}

/** The expression a page evaluates for the tags' shadow roots. */
export const measured = (tags) =>
  `(${measure})(${JSON.stringify(tokens)}, ${JSON.stringify(tags)})`;

/** The layer order the installed foundation's page.css fixes: its first layer statement. */
export function layerOrder(foundation) {
  const css = readFileSync(join(foundation, "dist/page.css"), "utf8").replace(/\/\*[^]*?\*\//g, "");
  const statement = /@layer\s+([^;{]+);/.exec(css);
  if (!statement) throw new Error(`${foundation}/dist/page.css states no layer order`);
  return statement[1].split(",").map((name) => name.trim());
}

/** What the measured design misses of the installed foundation's page.css, as a message; or
 * undefined when the document has it all. */
export function failure(design, foundation) {
  const missing = [];
  for (const { token, property, declared, expected, body } of design.values) {
    if (declared === "") missing.push(`the ${token} token on :root`);
    else if (body !== expected) {
      missing.push(`the body's ${property} from ${token} (${expected}): it computes ${body}`);
    }
  }
  const names = Object.keys(tokens);
  for (const { tag, element, values } of design.shadows) {
    values.forEach((value, at) => {
      const root = design.values[at].declared;
      if (element === null) missing.push(`an element in ${tag}'s shadow root`);
      else if (value === "" || value !== root) {
        missing.push(`${names[at]} in ${tag}'s shadow root, on its ${element}`);
      }
    });
  }
  // The foundation's layers, in the document's order, against page.css's: each present and in
  // its place, whatever layers the page adds around them.
  const order = layerOrder(foundation);
  const present = design.layers.filter((name) => order.includes(name));
  if (present.join(", ") !== order.join(", ")) {
    missing.push(
      `the foundation's layer order, ${order.join(", ")}: the document's is` +
        ` ${present.join(", ") || "none of them"}`,
    );
  }
  return missing.length > 0 ? `misses ${[...new Set(missing)].join("; ")}` : undefined;
}

/** The line a passing check adds: what the design came to. */
export function summary(design, foundation) {
  const [bg, font] = design.values;
  return (
    `page.css shapes it: the body's background ${bg.body} from ${bg.token} and its font from` +
    ` ${font.token}, both tokens resolving in every shadow root, and the foundation's` +
    ` ${layerOrder(foundation).length} layers in page.css's order`
  );
}
