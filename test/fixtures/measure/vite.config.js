// The measure's Vite build: the CSS module scripts through scripts/css-sheets.js, and Vite's cache
// in the build's root, a scratch directory.

import { cssSheets } from "../../../scripts/css-sheets.js";

export default { plugins: [cssSheets()], cacheDir: ".vite", logLevel: "warn" };
