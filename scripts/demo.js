// mise run demo: serves the working tree on the loopback address through the browser tier's own
// server (scripts/browser-cases.js) and prints the demo pages' URLs, then runs until Ctrl-C. It
// reads no network and writes nothing.
//
//   demo/tools.html  every tool class of the foundation's three lateral-concern sheets on the
//                    default profiles; it also opens from file:// with no server at all.
//   demo/keys.html   the foundation's keys family: bindings by data-keys and register(), and the
//                    help dialog. Its modules are the .ts sources the server strips, so it runs
//                    served only.

import { page, serve } from "./browser-cases.js";

const server = await serve();
console.log(`${server.origin}${page}`);
console.log(`${server.origin}/demo/keys.html`);
process.once("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});
