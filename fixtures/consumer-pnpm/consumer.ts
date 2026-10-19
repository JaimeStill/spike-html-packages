/// <reference types="spike-html-packages/css" />
// A consumer's typed use of the release, from the installed package by its exports: each layer's
// declarations as tsc emitted or the build copied them, and a stylesheet typed by the package's
// CSS module script declaration (spike-html-packages/css, a script, so referenced, not imported). The check type-checks this file, with
// skipLibCheck off so the shipped .d.ts files are checked too, after each offline install, beside
// subpaths.ts, which scripts/consumers.js writes with a type import of every subpath that has
// types.

import type {
  PaginationLitShadow,
  PageChangeDetail,
} from "spike-html-packages/components/pagination-lit-shadow.js";
import type { StatusBadge, tagName } from "spike-html-packages/components/status-badge.js";
import type { formatBytes } from "spike-html-packages/foundation/format.js";
import type { Binding, parse } from "spike-html-packages/foundation/keys-grammar.js";
import type { Facet, profiles } from "spike-html-packages/foundation/registry.js";
import type { Client, Result } from "spike-html-packages/sdk/api.js";
import type { Routes } from "spike-html-packages/sdk/router.js";

const badge: StatusBadge["label"] = "draft";
const tag: typeof tagName = "sl-status-badge";
const detail: PageChangeDetail = { page: 2 };
const pagination: Pick<PaginationLitShadow, "render"> | null = null;
const facet: Facet = "color";
const listed: ReturnType<typeof profiles> = ["flexoki"];
const binding: ReturnType<typeof parse> = null satisfies Binding | null;
const size: ReturnType<typeof formatBytes> = "1 kB";
// A type query, not an import: the check refuses a .css import without its CSS module script
// attribute, which a type-only import can't carry.
const sheet: typeof import("spike-html-packages/foundation/page.css").default | null = null;
const routes: Routes = { "": async () => "home" };
async function fetchJson(client: Client): Promise<Result<unknown>> {
  return client.get("/items");
}

export { badge, binding, detail, facet, fetchJson, listed, pagination, routes, sheet, size, tag };
