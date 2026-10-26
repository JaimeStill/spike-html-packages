// The consumer pages, run by scripts/consumers.sh with the layers' tag fetches, then each install
// as its manager, consumer, project, and the foundation scripts/installed.sh found in it. Each
// project, its pages/ copied in, is served from the loopback address, and its manager's page,
// pages/<manager>.html, loads lit and the layers unbundled from the install in the browser
// BROWSER_EXECUTABLE names. Every root must adopt the reset and elements sheets the page imports,
// every file must come from the loopback address, and each package from one directory, the
// foundation from the one installed.sh found. Then the jsDelivr page, test/live/import-map.html,
// must map lit at the version the components' tag pins and each layer at its tag.

import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { launch } from "../live/browser-pipe.js";
import { root, serve } from "../live/server.js";

const [tags, ...rest] = process.argv.slice(2);
const installs = [];
for (let at = 0; at < rest.length; at += 4) {
  const [manager, consumer, project, foundation] = rest.slice(at, at + 4);
  installs.push({ manager, consumer, project, foundation });
}

const scope = "@jaimestill/spike-html-packages-";

/** Fails the check with the message. */
function fail(message) {
  console.error(`pages: ${message}`);
  process.exit(1);
}

/** The package directory a served path is in, as its last node_modules/<name>/, with the name; or
 * undefined for a path in no package, as the pages' own. */
function packageOf(path) {
  const match = /^(.*\/node_modules\/((?:@[^/]+\/)?[^/]+))\//.exec(path);
  return match && { dir: match[1], name: match[2] };
}

/** Loads the install's page, failing unless it renders as one foundation's; resolves to a line. */
async function check(browser, { manager, consumer, project, foundation }) {
  const named = `${manager}'s ${consumer} page`;
  const { origin, stop } = await serve(project);
  // A blank page first, so the network events are on before the page's first request.
  const page = await browser.open("about:blank");
  try {
    const responses = [];
    await page.cdp("Network.enable");
    page.on("Network.responseReceived", ({ response }) => responses.push(response));
    await page.goto(`${origin}/pages/${manager}.html`);
    const { roots, error } = await page.evaluate("window.report");
    if (error) fail(`${named}: ${error}`);

    const foreign = responses.filter(({ url }) => !url.startsWith(`${origin}/`));
    if (foreign.length > 0) fail(`${named} loaded ${foreign.map(({ url }) => url).join(", ")}`);
    const missing = responses.filter(({ status }) => status !== 200);
    if (missing.length > 0) {
      fail(`${named} found no ${missing.map(({ url }) => new URL(url).pathname).join(", ")}`);
    }
    for (const root of roots) {
      if (root.elements === 0) fail(`${named}'s ${root.tag} rendered nothing`);
      if (root.sheets !== 3) fail(`${named}'s ${root.tag} adopted ${root.sheets} sheets, not 3`);
      if (!root.reset || !root.baseline) {
        fail(
          `${named}'s ${root.tag} adopted a reset or elements sheet other than the page's: a` +
            " second foundation",
        );
      }
    }

    // Each package from one directory: a second is a second copy, whose modules and sheets are
    // other objects, even where it links to the same files on disk.
    const dirs = new Map();
    for (const { url } of responses) {
      const found = packageOf(decodeURIComponent(new URL(url).pathname));
      if (found) dirs.set(found.name, new Set(dirs.get(found.name)).add(found.dir));
    }
    for (const [name, reached] of dirs) {
      if (reached.size > 1) fail(`${named} reached ${name} from ${[...reached].join(" and ")}`);
    }
    const [reached] = dirs.get(`${scope}foundation`) ?? [];
    if (reached === undefined) fail(`${named} reached no foundation`);
    if (realpathSync(join(project, reached)) !== foundation) {
      fail(`${named} reached the foundation at ${reached}, not the install's ${foundation}`);
    }
    return (
      `pages: ${named} renders ${roots.map(({ tag }) => tag).join(", ")} from` +
      ` ${responses.length} files on the loopback address, none from elsewhere; one foundation,` +
      ` ${reached}, whose reset and elements sheets every root adopts as the page imports them`
    );
  } finally {
    await page.close();
    await stop();
  }
}

const browser = await launch();
try {
  for (const install of installs) console.log(await check(browser, install));
} finally {
  await browser.close();
}

// The jsDelivr page: lit at the components' pin, from their tag's manifest, and each layer at
// its tag.
const git = (layer, ...args) => {
  const { stdout, status } = spawnSync("git", [`--git-dir=${join(tags, layer)}`, ...args], {
    encoding: "utf8",
  });
  if (status !== 0) fail(`git can't read ${join(tags, layer)}`);
  return stdout.trim();
};
const tag = Object.fromEntries(
  ["foundation", "components"].map((layer) => [layer, git(layer, "tag", "-l")]),
);
const manifest = JSON.parse(git("components", "show", `${tag.components}:package.json`));
const pinned = manifest.dependencies.lit;
const html = readFileSync(join(root, "test/live/import-map.html"), "utf8");
const { imports } = JSON.parse(/<script type="importmap">([^]*?)<\/script>/.exec(html)[1]);
const lit = /\/npm\/lit@([^/]+)\//.exec(imports.lit)?.[1];
if (lit !== pinned) {
  fail(`the jsDelivr page maps lit ${lit}; the components' ${tag.components} pin ${pinned}`);
}
for (const [layer, at] of Object.entries(tag)) {
  if (!imports[`${scope}${layer}/`]?.includes(`/spike-html-packages-${layer}@${at}/`)) {
    fail(`the jsDelivr page maps the ${layer} other than at ${at}`);
  }
}
console.log(
  `pages: the jsDelivr page maps lit ${lit}, the lit the components' ${tag.components} pin, the` +
    ` foundation at ${tag.foundation}, and the components at ${tag.components}`,
);
