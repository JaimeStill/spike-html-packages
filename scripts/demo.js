// mise run demo: serves the repository through the browser tier's static server and prints the
// demo pages' URLs, which load dist/, until Ctrl-C.

import { serve } from "../test/browser/support/server.js";

const server = await serve();
for (const page of ["tools", "keys", "components"]) {
  console.log(`${server.origin}/demo/${page}.html`);
}
process.once("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});
