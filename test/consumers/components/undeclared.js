// Whether this consumer's import of the foundation, which it doesn't declare and the components
// do, resolves from the install: prints "resolves" or "unresolved". Run by node or bun.

try {
  await import("@jaimestill/spike-html-packages-foundation/keys-grammar.js");
  console.log("resolves");
} catch (error) {
  if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
  console.log("unresolved");
}
