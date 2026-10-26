// The consumer pages' script: it renders the three components and sets window.report, a promise
// of what each shadow root adopted, or of the error that stopped it. Each page's import map says
// where its manager's install put the packages.
// Adapted from test/live/import-map.html: its module script.

window.report = (async () => {
  try {
    // The page imports the foundation's two baseline sheets by the same names the components do:
    // the module map holds one sheet per URL, so a root that adopted the foundation's reset and
    // elements adopted these objects, unless the components reached a second foundation.
    const [{ default: reset }, { default: elements }] = await Promise.all([
      import("@jaimestill/spike-html-packages-foundation/baseline/reset.css", {
        with: { type: "css" },
      }),
      import("@jaimestill/spike-html-packages-foundation/baseline/elements.css", {
        with: { type: "css" },
      }),
      import("@jaimestill/spike-html-packages-components/status-badge.js"),
      import("@jaimestill/spike-html-packages-components/entry-lit-shadow.js"),
      import("@jaimestill/spike-html-packages-components/pagination-lit-shadow.js"),
    ]);
    document.querySelector("sl-entry-lit-shadow").item = {
      id: "1",
      name: "notes",
      status: "ready",
      updated_at: "2026-10-19T00:00:00Z",
    };
    const roots = [];
    for (const tag of ["sl-status-badge", "sl-entry-lit-shadow", "sl-pagination-lit-shadow"]) {
      const element = document.querySelector(tag);
      await element.updateComplete;
      const sheets = element.shadowRoot?.adoptedStyleSheets ?? [];
      roots.push({
        tag,
        elements: element.shadowRoot?.childElementCount ?? 0,
        sheets: sheets.length,
        reset: sheets[0] === reset,
        baseline: sheets[1] === elements,
      });
    }
    return { roots };
  } catch (error) {
    return { error: error.message };
  }
})();
