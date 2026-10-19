// adapted from spike-html-conventions a88828a: layers/css.d.ts, without its Vite plugin, which no
// server here needs.
//
// A CSS module script: `import sheet from "./x.css" with { type: "css" }` gives the file as one
// constructed CSSStyleSheet, the module's default export, shared by every importer in a document.
// Chromium loads it natively, from the browser tier's server as from any server that sends the
// file as text/css. The check refuses a .css import without the attribute and any import() of a
// .css file (eslint.config.js), so every .css import is this one.

declare module "*.css" {
  const sheet: CSSStyleSheet;
  export default sheet;
}
