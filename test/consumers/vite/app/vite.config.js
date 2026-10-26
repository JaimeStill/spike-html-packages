// The Vite app's config: the CSS module scripts through css-sheets.js, Vite having no import
// attributes of its own (vitejs/vite#17700). Vite's cache stays at its default,
// node_modules/.vite/ in the scratch install it runs from, and test/consumers/vite.js names the
// build's outDir beside it, so neither reaches the repository.
// Adapted from spike-html-packages (c2b4a19): test/fixtures/measure/vite.config.js, its cacheDir
// left at Vite's default.

import { cssSheets } from "./css-sheets.js";

export default { plugins: [cssSheets()], logLevel: "warn" };
