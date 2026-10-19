// The browser tier's in-page half: a module the tools cases (scripts/browser-cases.js) import into
// demo/tools.html, by its URL on the cases' server, to read every element's computed style. It runs
// in the browser, never on node: each export returns plain JSON, which the driver's evaluate hands
// back.
//
// :hover can't be set from a script, so hoverable() rewrites every rule's :hover as
// :is(:hover, [data-hover]), the same specificity, and snapshot() reads each element twice: at
// rest, and with data-hover on every element in the body. Both stacks of sheets get the same
// rewrite, so the hovered reading compares like with like.

/** The three lateral-concern sheets, by the file name each is served under. */
export const concerns = ["meta", "structure", "utilities"];

/** Every rule in the sheet, depth first: an @import's sheet's, a grouping rule's, a nested rule's. */
function* rules(list) {
  for (const rule of list) {
    yield rule;
    if (rule instanceof CSSImportRule) {
      if (rule.styleSheet) yield* rules(rule.styleSheet.cssRules);
    } else if (rule.cssRules) {
      yield* rules(rule.cssRules);
    }
  }
}

/** Every rule in every sheet the document has, its imported sheets' included. */
const allRules = () => [...document.styleSheets].flatMap((sheet) => [...rules(sheet.cssRules)]);

/**
 * Points the page's one stylesheet link at the URL given, and resolves once it has loaded with
 * every sheet it imports, failing when one of them didn't.
 */
export async function useSheets(href) {
  const link = document.querySelector('link[rel="stylesheet"]');
  const loaded = new Promise((resolve, reject) => {
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", () => reject(new Error(`${href} didn't load`)), { once: true });
  });
  link.href = href;
  await loaded;
  const missing = allRules().filter((rule) => rule instanceof CSSImportRule && !rule.styleSheet);
  if (missing.length > 0) throw new Error(`no sheet for ${missing.map((r) => r.href).join(", ")}`);
}

/**
 * Rewrites every :hover in every rule as :is(:hover, [data-hover]), and resolves to how many rules
 * it rewrote, failing on one the browser refused: a refused selectorText is left as it was.
 */
export function hoverable() {
  let count = 0;
  for (const rule of allRules()) {
    if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(":hover")) continue;
    const before = rule.selectorText;
    rule.selectorText = before.replaceAll(":hover", ":is(:hover, [data-hover])");
    if (rule.selectorText === before) throw new Error(`the browser refused ${before}`);
    count++;
  }
  return count;
}

/** Every element in the document, each named by its position, tag, and classes. */
function elements() {
  return [...document.querySelectorAll("*")].map((element, i) => ({
    element,
    name: `${i} ${element.localName}${[...element.classList].map((c) => `.${c}`).join("")}`,
  }));
}

/** Each element's every computed property, by its name. */
function read() {
  const out = {};
  for (const { element, name } of elements()) {
    const style = getComputedStyle(element);
    const values = {};
    for (const property of style) {
      const value = style.getPropertyValue(property);
      // A custom property's value keeps its source's whitespace, which is formatting, not style:
      // a token broken over two lines is the token on one.
      values[property] = property.startsWith("--") ? value.trim().replace(/\s+/g, " ") : value;
    }
    out[name] = values;
  }
  return out;
}

/**
 * Every element's computed style, at rest and with every element in the body hovered: an object
 * of the two readings, each an object of elements by name, each an object of properties.
 */
export function snapshot() {
  const rest = read();
  const body = [document.body, ...document.body.querySelectorAll("*")];
  for (const element of body) element.setAttribute("data-hover", "");
  try {
    return { rest, hover: read() };
  } finally {
    for (const element of body) element.removeAttribute("data-hover");
  }
}

/**
 * How two snapshots differ: one line per element, state, and property whose values differ, or
 * that one snapshot has and the other lacks.
 */
export function differences(a, b) {
  const lines = [];
  for (const state of ["rest", "hover"]) {
    const names = new Set([...Object.keys(a[state]), ...Object.keys(b[state])]);
    for (const name of names) {
      const x = a[state][name] ?? {};
      const y = b[state][name] ?? {};
      for (const property of new Set([...Object.keys(x), ...Object.keys(y)])) {
        if (x[property] !== y[property]) {
          lines.push(`${state} ${name} ${property}: ${x[property]} against ${y[property]}`);
        }
      }
    }
  }
  return lines;
}

/** One declaration list split into its declarations, at the semicolons outside parentheses. */
function declarations(cssText) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cssText.length; i++) {
    if (cssText[i] === "(") depth++;
    else if (cssText[i] === ")") depth--;
    else if (cssText[i] === ";" && depth === 0) {
      out.push(cssText.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (cssText.slice(start).trim()) out.push(cssText.slice(start).trim());
  return out;
}

/**
 * The tier's proof that its comparison can fail: drops each declaration of the three
 * lateral-concern sheets in turn, as the browser serializes the rule (a shorthand as one), takes a
 * snapshot, and restores it. Resolves to every declaration tried, each with how many differences
 * its absence makes against the reference snapshot given, v0.7.0's. A declaration whose absence
 * makes none is one the comparison couldn't catch being dropped.
 */
export function drops(reference) {
  const tried = [];
  const sheets = allRules()
    .filter((rule) => rule instanceof CSSImportRule && rule.styleSheet)
    .map((rule) => rule.styleSheet)
    .filter((sheet) => concerns.some((concern) => sheet.href.endsWith(`/${concern}.css`)));
  for (const sheet of sheets) {
    for (const rule of rules(sheet.cssRules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      const whole = rule.style.cssText;
      const list = declarations(whole);
      for (const [i, declaration] of list.entries()) {
        rule.style.cssText = list.filter((_, j) => j !== i).join("; ");
        try {
          const differs = differences(reference, snapshot()).length;
          tried.push({ sheet: sheet.href, selector: rule.selectorText, declaration, differs });
        } finally {
          rule.style.cssText = whole;
        }
      }
    }
  }
  return tried;
}

/**
 * Adopts each lateral-concern sheet, fetched from the URL its name gives under the base, as a
 * constructed stylesheet of its own into a shadow root, and reads what it holds and what it styles
 * there: its source's @import count, outside comments, its top-level rules' kinds and layer names, and one tool
 * class's computed property, with the page's tokens read through the shadow boundary.
 */
export async function adopt(base) {
  const samples = {
    meta: ['<span class="button">a</span>', "display", "padding-left"],
    structure: ['<div class="field">a</div>', "display", "row-gap"],
    utilities: ['<div class="scroll-y">a</div>', "overflow-y", "padding-right"],
  };
  const out = {};
  for (const concern of concerns) {
    const text = await (await fetch(`${base}/${concern}.css`)).text();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    const host = document.createElement("div");
    document.body.append(host);
    const root = host.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [sheet];
    const [markup, keyword, length] = samples[concern];
    root.innerHTML = markup;
    const style = getComputedStyle(root.firstElementChild);
    out[concern] = {
      imports: (text.replace(/\/\*[\s\S]*?\*\//g, "").match(/@import\b/g) ?? []).length,
      rules: [...sheet.cssRules].map((rule) =>
        rule instanceof CSSLayerBlockRule ? `@layer ${rule.name}` : rule.constructor.name,
      ),
      [keyword]: style.getPropertyValue(keyword),
      [length]: style.getPropertyValue(length),
    };
    host.remove();
  }
  return out;
}
