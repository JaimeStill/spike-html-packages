// The lint the check runs (eslint .): @eslint/js's recommended rules over the code, with the
// browser's globals everywhere and node's in the scripts, which run on node or in the page they
// serve. Adapted from spike-html-conventions a88828a: eslint.config.js, which adds
// typescript-eslint, the CSS module script rule, and the layer-direction table; they arrive with
// the first .ts module and the first import in layers/, which this repository has none of yet.

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";

const code = ["**/*.js", "**/*.ts"];

export default defineConfig([
  { files: code, extends: [js.configs.recommended] },
  { files: code, languageOptions: { globals: globals.browser } },
  { files: ["test/**", "scripts/**"], languageOptions: { globals: globals.node } },
]);
