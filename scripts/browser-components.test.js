// The components' browser cases under node:test, on one driver, after spike-html-conventions
// a88828a's scripts/browser.test.js: demo/probe.ts's cases and demo/restyle.ts's check in the
// shadow-root Lit version, the one this repository holds, and demo/contract.ts's cases, the status
// badge's contract and the sheets every component's root adopts, each on the components' page
// (test/fixtures/components.html) served from the working tree by scripts/browser-cases.js's
// server, lit mapped by the page's import map onto the installed packages. Conventions compared
// four versions' probe reports line for line; with one version here, the probe passes on its own
// verdict. The check runs it under node --test on the raw pipe and the pinned chrome-headless-shell
// (mise.toml's check task). It sits outside test/, so the unit tier never picks it up.
//
//   BROWSER_DRIVER    the driver, scripts/browser-<name>.js (default: pipe, the raw pipe, the
//                     check's); each driver reads its own variables, the browser's executable
//                     among them (scripts/browser-pipe.js)

import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { runCases, serve, settings } from "./browser-cases.js";

const driver = process.env.BROWSER_DRIVER ?? "pipe";
const { launch } = await import(`./browser-${driver}.js`);

/** The version every module runs in: demo/versions.ts's one. */
const version = "lit-shadow";

/**
 * How many cases each module holds, and the verdict it passes on: every case holding, and exactly
 * that many, so a module that lost or gained a case fails rather than passing on whatever number
 * it held. The probe's 27 are conventions' own.
 */
const counts = { probe: 27, contract: 9 };
const holds = (module) => `ok: all ${counts[module]} cases hold`;

describe(`components, ${driver} driver`, () => {
  let server;
  let browser;
  before(async () => {
    server = await serve();
    browser = await launch(settings);
  });
  after(async () => {
    await browser?.close();
    await server?.stop();
  });

  test(`probe, ${version}: all ${counts.probe} cases hold`, async () => {
    const { verdict, report } = await runCases(browser, server.origin, "probe", version);
    assert.equal(verdict, holds("probe"), report);
  });

  test(`restyle, ${version}: one edit repaints both buttons`, async () => {
    const { verdict } = await runCases(browser, server.origin, "restyle", version);
    assert.match(verdict, /^ok: /);
  });

  test(`contract: the badge and every root's sheets, all ${counts.contract} cases hold`, async () => {
    const { verdict, report } = await runCases(browser, server.origin, "contract");
    assert.equal(verdict, holds("contract"), report);
  });
});
