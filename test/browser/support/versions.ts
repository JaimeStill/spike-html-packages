// adapted from spike-html-conventions a88828a: demo/versions.ts, cut to the one version this
// repository holds, Lit with a shadow root: conventions compared four, and the vanilla and
// light-DOM ones aren't copied here.
//
// The version of the composition the probe runs: it names its pair of tags and loads the modules
// that define them. The probe loads a version only after building its composition, so every
// property it sets is set before the elements are defined; each import() runs only when called.
// Beside it, the pagination's contract, as the probe sets it.

/** The contract the pagination keeps, as the probe reaches it. */
export interface PaginationElement extends HTMLElement {
  page: number | null;
  size: number | null;
  total: number | null;
  more: boolean;
  pageSizes: number[] | null;
  disabled: boolean;
}

/** One version of the composition: a pagination element and the entry element it holds. */
export interface Version {
  pagination: string;
  entry: string;
  load(): Promise<unknown>;
}

export const versions: Record<string, Version> = {
  "lit-shadow": {
    pagination: "sl-pagination-lit-shadow",
    entry: "sl-entry-lit-shadow",
    load: () =>
      Promise.all([
        import("../../../layers/components/pagination-lit-shadow.js"),
        import("../../../layers/components/entry-lit-shadow.js"),
      ]),
  },
};
