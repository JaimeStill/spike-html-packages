// The components from dist/ in the browser: conventions' 27 probe cases and its restyle check, on
// test/fixtures/components.html. Adapted from spike-html-conventions a88828a:
// scripts/browser.test.js.

import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { launch } from "./support/browser-pipe.js";
import { serve } from "./support/server.js";

describe("components", { timeout: 60_000 }, () => {
  let server;
  let browser;
  before(async () => {
    server = await serve();
    browser = await launch();
  });
  after(async () => {
    await browser?.close();
    await server?.stop();
  });

  /** Runs one case module on the components page, resolving to its verdict and report. */
  async function run(module) {
    const page = await browser.open(
      `${server.origin}/test/fixtures/components.html?module=${module}`,
    );
    try {
      return await page.evaluate(`window.verdict.then(() => ({
        verdict: document.getElementById("verdict").textContent,
        report: document.getElementById("report").textContent,
      }))`);
    } finally {
      await page.close();
    }
  }

  test("all 27 of conventions' probe cases hold", async () => {
    const { verdict, report } = await run("probe");
    assert.equal(verdict, "ok: all 27 cases hold", report);
  });

  test("one edit to the elements sheet repaints the buttons in both shadow roots", async () => {
    const { verdict } = await run("restyle");
    assert.match(verdict, /^ok: /);
  });
});
