// mise run demo: serves the working tree on the loopback address through the browser tier's own
// server (scripts/browser-cases.js) and prints demo/tools.html's URL, every tool class of the
// foundation's three lateral-concern sheets on the default profiles, then runs until Ctrl-C. It
// reads no network and writes nothing. The page also opens from file:// with no server at all.

import { page, serve } from "./browser-cases.js";

const server = await serve();
console.log(`${server.origin}${page}`);
process.once("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});
