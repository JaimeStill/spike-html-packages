// The browser tier's static server: the repository root over plain http on the loopback address,
// every file sent as it is on disk. The pages load the built dist/, so nothing needs transforming.

import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";

/** The repository root, which the server serves. */
export const root = join(import.meta.dirname, "../../..");

/** The content type of each extension served; any other file is a 404. */
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

// Under pnpm, lit's own dependencies sit beside it, not in node_modules/, so the pages' import maps
// name lit and its dependencies under /deps/, this directory.
const deps = dirname(realpathSync(join(root, "node_modules/lit")));

/** The file a request's path names: under /deps/ one of lit's packages, otherwise the tree's. */
function file(pathname) {
  // normalize() of an absolute path never climbs above its root, so no request leaves the tree.
  const path = normalize(decodeURIComponent(pathname));
  return path.startsWith("/deps/") ? join(deps, path.slice("/deps/".length)) : join(root, path);
}

/** Serves the repository on a free loopback port, resolving to its origin and a stop(). */
export async function serve() {
  const server = createServer(async (request, response) => {
    const path = file(new URL(request.url, "http://localhost").pathname);
    const type = types[extname(path)];
    const body = type && (await readFile(path).catch(() => undefined));
    if (body === undefined) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" }).end(body);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
}
