/// <reference types="@jaimestill/spike-html-packages-foundation/css" />
// A consumer's typed use of the three installed layer packages, which tsc checks with skipLibCheck
// off, so the shipped .d.ts are checked too, the components' imports of the foundation by name
// among them. The CSS declaration is a script, so it's referenced, not imported.

import type {
  PaginationLitShadow,
  PageChangeDetail,
} from "@jaimestill/spike-html-packages-components/pagination-lit-shadow.js";
import type {
  StatusBadge,
  tagName,
} from "@jaimestill/spike-html-packages-components/status-badge.js";
import type { formatBytes } from "@jaimestill/spike-html-packages-foundation/format.js";
import type { Binding, parse } from "@jaimestill/spike-html-packages-foundation/keys-grammar.js";
import type { Facet, profiles } from "@jaimestill/spike-html-packages-foundation/registry.js";
import type { Client, Result } from "@jaimestill/spike-html-packages-sdk/api.js";
import type { Routes } from "@jaimestill/spike-html-packages-sdk/router.js";

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
const sheet: typeof import("@jaimestill/spike-html-packages-foundation/page.css").default | null =
  null;
const routes: Routes = { "": async () => "home" };
async function fetchJson(client: Client): Promise<Result<unknown>> {
  return client.get("/items");
}

export { badge, binding, detail, facet, fetchJson, listed, pagination, routes, sheet, size, tag };
