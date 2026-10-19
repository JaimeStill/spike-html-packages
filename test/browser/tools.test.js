// The browser cases (support/browser-cases.js) under node:test, on one driver, after
// spike-html-conventions a88828a's scripts/browser.test.js: the foundation's tool classes compute
// as spike-html-design v0.7.0's under the default profiles, every declaration the lateral-concern
// sheets hold is one the comparison catches being dropped, and each sheet is one a shadow root
// adopts on its own. It is the check's browser tier, which runs it under node --test on the raw
// pipe and the pinned chrome-headless-shell (mise run test:browser).
//
//   BROWSER_DRIVER    the driver, support/browser-<name>.js (default: pipe, the raw pipe, the
//                     check's); each driver reads its own variables, the browser's executable
//                     among them (support/browser-pipe.js)

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import {
  adopt,
  classes,
  compare,
  entry,
  read,
  reference,
  root,
  serve,
  settings,
  used,
} from "./support/browser-cases.js";

const driver = process.env.BROWSER_DRIVER ?? "pipe";
const { launch } = await import(`./support/browser-${driver}.js`);

/** A file of the working tree, by its path on the server. */
const source = (path) => readFileSync(join(root, path), "utf8");

/** v0.7.0's tool classes, from its tools layer, the copy beside the reference entry. */
const upstream = classes(source("/test/fixtures/v0.7.0/layers/tools.css"));
/** The lateral-concern sheets, by concern, and the layer each wraps its rules in. */
const concerns = ["meta", "structure", "utilities"];

/** At most this many lines of a failure's list, so a broken stack fails readably. */
const head = (lines) => lines.slice(0, 40).join("\n") + (lines.length > 40 ? "\n…" : "");

describe(`foundation tools, ${driver} driver`, () => {
  let server;
  let browser;
  // v0.7.0's reading of the page, which every comparison is against, taken once.
  let upstreamReading;
  // The page entry's reading against it, with every declaration dropped in turn, taken once on
  // first use: the drops are most of the tier's time.
  let compared;
  const comparison = () => (compared ??= compare(browser, server.origin, upstreamReading.snapshot));
  before(async () => {
    server = await serve();
    browser = await launch(settings);
    upstreamReading = await read(browser, server.origin, reference);
  });
  after(async () => {
    await browser?.close();
    await server?.stop();
  });

  test("the sheets hold v0.7.0's tool classes, no fewer and no more", () => {
    assert.ok(upstream.length > 0, "v0.7.0's tools layer names no class");
    const ours = classes(concerns.map((c) => source(`/layers/foundation/${c}.css`)).join("\n"));
    assert.deepEqual(ours, upstream);
  });

  test("the demo page carries every tool class", () => {
    const carried = used(source("/demo/tools.html"));
    const missing = upstream.filter((name) => !carried.includes(name));
    assert.deepEqual(missing, [], `demo/tools.html carries no element of ${missing.join(", ")}`);
  });

  test("the page entry states the whole layer order in one statement, first", () => {
    const code = source(entry).replace(/\/\*[\s\S]*?\*\//g, "");
    const statements = [...code.matchAll(/@layer\s+([^;{]+);/g)].map((m) => m[1].split(/\s*,\s*/));
    assert.equal(statements.length, 1, "one @layer statement");
    assert.ok(code.trim().startsWith("@layer"), "the statement comes before every import");
    assert.deepEqual(statements[0].map((name) => name.trim()).slice(-3), [
      "foundation.meta",
      "foundation.structure",
      "foundation.utilities",
    ]);
  });

  test("every tool class computes as v0.7.0's, at rest and hovered", async () => {
    // A rewrite that matched nothing would leave the hovered reading the rest one, comparing no
    // hover rule: v0.7.0's tools and elements hold several.
    assert.ok(upstreamReading.hovered >= 3, `${upstreamReading.hovered} :hover rules rewritten`);
    const { differences } = await comparison();
    assert.deepEqual(differences, [], head(differences));
  });

  test("dropping any one declaration of the three sheets fails the comparison", async () => {
    const { differences, drops } = await comparison();
    // Against sheets that already differ, every drop differs too and proves nothing.
    assert.equal(differences.length, 0, "the sheets compute as v0.7.0's before any drop");
    // Every declaration the sheets' sources hold is tried, one at a time, no fewer: one per line
    // of the form `property: value;`, which is how each of the three writes them.
    const written = concerns
      .map((c) => source(`/layers/foundation/${c}.css`).replace(/\/\*[\s\S]*?\*\//g, ""))
      .join("\n")
      .match(/^\s*-*[a-z][\w-]*\s*:[^;{]*;/gm);
    assert.equal(drops.length, written.length, "every declaration written is tried");
    const missed = drops
      .filter(({ differs }) => differs === 0)
      .map(({ sheet, selector, declaration }) => `${sheet}: ${selector} { ${declaration} }`);
    assert.deepEqual(missed, [], `dropped unnoticed:\n${head(missed)}`);
  });

  test("each sheet is self-layered and @import-free, and a shadow root adopts it alone", async () => {
    const adopted = await adopt(browser, server.origin);
    for (const concern of concerns) {
      const sheet = adopted[concern];
      assert.equal(sheet.imports, 0, `${concern}.css holds an @import`);
      assert.deepEqual(sheet.rules, [`@layer foundation.${concern}`], concern);
    }
    // Each sheet styles its sample inside the shadow root, the page's tokens read through it: a
    // var() that found no token would leave a length 0px.
    assert.equal(adopted.meta.display, "inline-block");
    assert.notEqual(adopted.meta["padding-left"], "0px");
    assert.equal(adopted.structure.display, "grid");
    assert.notEqual(adopted.structure["row-gap"], "normal");
    assert.equal(adopted.utilities["overflow-y"], "auto");
    assert.notEqual(adopted.utilities["padding-right"], "0px");
  });
});
