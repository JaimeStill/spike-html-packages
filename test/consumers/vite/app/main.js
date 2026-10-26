// The Vite app's script: it renders the three components and sets window.report, a promise of what
// each shadow root adopted. Its imports are static, the declarations css-sheets.js rewrites.
// Adapted from spike-html-packages (382e78e): test/consumers/pages/page.js, its imports static, so
// no error is caught.

// The app imports the foundation's two baseline sheets by the same names the components do: Vite
// builds one module per resolved file, so a root that adopted the foundation's reset and elements
// adopted these objects, unless the components reached a second foundation.
import reset from "@jaimestill/spike-html-packages-foundation/baseline/reset.css" with { type: "css" };
import elements from "@jaimestill/spike-html-packages-foundation/baseline/elements.css" with { type: "css" };
import "@jaimestill/spike-html-packages-components/status-badge.js";
import "@jaimestill/spike-html-packages-components/entry-lit-shadow.js";
import "@jaimestill/spike-html-packages-components/pagination-lit-shadow.js";

document.querySelector("sl-entry-lit-shadow").item = {
  id: "1",
  name: "notes",
  status: "ready",
  updated_at: "2026-10-19T00:00:00Z",
};

window.report = (async () => {
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
})();
