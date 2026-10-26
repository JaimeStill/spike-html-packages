// Each layer's lint under its pinned ESLint and under Biome, as one dated markdown table: the
// measure evidence 8's reweighing reads. Each layer repository's main is cloned into scratch and
// installed from its lockfile. The layer's own test/unit/layers-tree.js writes its tree of
// violations and allowed imports, and its lint() runs the layer's ESLint over it, as
// test/unit/layers.test.js does; Biome lints the same tree with a config built from the layer's
// own: noUndeclaredDependencies for the manifest, noRestrictedImports for the layer table, and a
// GritQL plugin each for the CSS module script and the declaration cases. The table names, for each
// case, how many files each side flags and which it misses, each side's false positives on the
// allowed tree, its config files, pins, and installed packages, and whether Biome, set to the
// layer's Prettier options, leaves the layer's code, JSON, and CSS as they are. It reads the
// network (the clones, their installs, and Biome's), reads no token, pushes nothing, writes nothing
// in the repository, and removes its scratch. It exits 1 when a layer can't be set up; a case a
// side misses is a measured fact, not a failure.
//
//   node scripts/biome.js

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const owner = "https://github.com/JaimeStill";
const repositories = ["foundation", "sdk", "components"].map(
  (layer) => `spike-html-packages-${layer}`,
);
const date = new Date().toISOString().slice(0, 10);

const scratch = mkdtempSync(join(tmpdir(), "biome."));
// No token reaches a clone, an install, or a lint: the variables are dropped, git never prompts and
// asks no credential helper, and pnpm reads an empty user config in place of ~/.npmrc.
const env = {
  ...process.env,
  GIT_TERMINAL_PROMPT: "0",
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "credential.helper",
  GIT_CONFIG_VALUE_0: "",
};
for (const variable of ["GH_TOKEN", "GITHUB_TOKEN", "GITHUB_PACKAGES_TOKEN", "MISE_GITHUB_TOKEN"]) {
  delete env[variable];
}
env.npm_config_userconfig = join(scratch, "npmrc");
writeFileSync(env.npm_config_userconfig, "");

/** Runs a command, returning its exit status and its output. */
function run(command, args, { cwd = scratch } = {}) {
  const { status, stdout, stderr, error } = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });
  return { status, stdout, output: (error?.message ?? `${stdout}${stderr}`).trim() };
}

/** run, failing with the command's output when it exits nonzero. */
function must(command, args, options) {
  const result = run(command, args, options);
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")}: ${result.output}`);
  return result.stdout.trim();
}

/** A YAML file as JSON, read by the pinned yq. */
const yaml = (file) => JSON.parse(must(yq, ["-o=json", ".", file]));

const lines = (file) => readFileSync(file, "utf8").trimEnd().split("\n").length;

// The pinned tools, by path, set before the layers: the clones' own mise.toml never runs.
let biome, pnpm, yq;

// The plugins, each with the message its diagnostics carry, which tells them apart in Biome's
// report, where each is category "plugin". Each message is the layer's ESLint message for the case.
const plugins = {
  "css-module.grit": {
    message: "A .css import is a CSS module script: import it statically with { type: 'css' }.",
    // A static import or export of a .css specifier without a type: "css" attribute, the key bare
    // or quoted; and any import() of a .css specifier, a string or a template ending in .css.
    // GritQL's regexes match the node's whole text, and a group in one is a variable, so they hold
    // none.
    pattern: (message) => `language js

or {
  or { JsImport(), JsExport() } as $import where {
    $import <: contains JsModuleSource() as $source,
    $source <: r".*\\.css[\\"']",
    $import <: not contains JsImportAssertionEntry() as $attribute where {
      $attribute <: r"[\\"']?type[\\"']?\\s*:\\s*[\\"']css[\\"']"
    }
  },
  JsImportCallExpression() as $import where {
    $import <: r"import\\(\\s*[\\"'\`][^,]*\\.css[\\"'\`][\\s\\S]*"
  }
} where {
  register_diagnostic(span=$import, message="${message}")
}
`,
  },
  "declaration.grit": {
    message:
      "A .d.ts file is a declaration with no runtime: import it with `import type` (or export from " +
      "it with `export type`), never as a value, a side effect, or an import().",
    // GritQL sees no file system, so it can't tell what a specifier resolves to, as the ESLint
    // resolver does. It flags what the layers' convention makes a declaration: a relative specifier
    // ending in .js, since a source imports another by its .ts name and a declaration has no .ts.
    // A value import, a re-export, a side-effect import, or an import() of one is flagged; an
    // `import type` or an `export type` passes.
    pattern: (message) => `language js

or {
  or { JsImport(), JsExport() } as $import where {
    $import <: contains JsModuleSource() as $source,
    $source <: r"[\\"']\\.[^\\"']*\\.js[\\"']",
    $import <: not r"import\\s+type\\s[\\s\\S]*",
    $import <: not r"export\\s+type\\s[\\s\\S]*"
  },
  JsImportCallExpression() as $import where {
    $import <: r"import\\(\\s*[\\"'\`]\\.[^\\"'\`]*\\.js[\\"'\`][\\s\\S]*"
  }
} where {
  register_diagnostic(span=$import, message="${message}")
}
`,
  },
};
const restricted = "lint/style/noRestrictedImports";
const undeclared = "lint/correctness/noUndeclaredDependencies";

/** Deep-merges plain objects. */
const merged = (into, from) => {
  for (const [key, value] of Object.entries(from)) {
    into[key] =
      typeof value === "object" && !Array.isArray(value) ? merged(into[key] ?? {}, value) : value;
  }
  return into;
};

// Each Prettier option's Biome setting, by the option's value; a value with no entry has no
// counterpart.
const quote = { false: "double", true: "single" };
const prettierOptions = {
  useTabs: (value) => ({ formatter: { indentStyle: { false: "space", true: "tab" }[value] } }),
  tabWidth: (value) => ({ formatter: { indentWidth: value } }),
  printWidth: (value) => ({ formatter: { lineWidth: value } }),
  endOfLine: (value) => ({
    formatter: { lineEnding: { lf: "lf", crlf: "crlf", cr: "cr" }[value] },
  }),
  bracketSpacing: (value) => ({ formatter: { bracketSpacing: value } }),
  bracketSameLine: (value) => ({ formatter: { bracketSameLine: value } }),
  objectWrap: (value) => ({
    formatter: { expand: { preserve: "auto", collapse: "never" }[value] },
  }),
  singleQuote: (value) => ({
    javascript: { formatter: { quoteStyle: quote[value] } },
    css: { formatter: { quoteStyle: quote[value] } },
  }),
  jsxSingleQuote: (value) => ({ javascript: { formatter: { jsxQuoteStyle: quote[value] } } }),
  quoteProps: (value) => ({
    javascript: {
      formatter: { quoteProperties: { "as-needed": "asNeeded", preserve: "preserve" }[value] },
    },
  }),
  trailingComma: (value) => ({
    javascript: { formatter: { trailingCommas: { all: "all", es5: "es5", none: "none" }[value] } },
  }),
  semi: (value) => ({
    javascript: { formatter: { semicolons: { true: "always", false: "asNeeded" }[value] } },
  }),
  arrowParens: (value) => ({
    javascript: { formatter: { arrowParentheses: { always: "always", avoid: "asNeeded" }[value] } },
  }),
  experimentalOperatorPosition: (value) => ({
    javascript: { formatter: { operatorLinebreak: { end: "after", start: "before" }[value] } },
  }),
  embeddedLanguageFormatting: (value) => ({
    javascript: { experimentalEmbeddedSnippetsEnabled: { off: false, auto: true }[value] },
  }),
};

/** The leaves of an object, for the one setting an option makes. */
const leaves = (object) =>
  Object.values(object).flatMap((value) =>
    typeof value === "object" && value !== null ? leaves(value) : [value],
  );

/** Biome's format settings from the layer's .prettierrc.json, and the options with no counterpart. */
function formatSettings(clone) {
  const options = JSON.parse(readFileSync(join(clone, ".prettierrc.json"), "utf8"));
  const settings = {};
  const unmapped = [];
  for (const [option, value] of Object.entries(options)) {
    const setting = prettierOptions[option]?.(value);
    if (!setting || leaves(setting).includes(undefined)) unmapped.push(`${option}: ${value}`);
    else merged(settings, setting);
  }
  return { settings, unmapped };
}

/** The files Biome formats, from the layer's .prettierignore: the code, JSON, and CSS it lets back
 * in, less each path it ignores, anchored when it holds a slash before its end, as in gitignore. */
function formatIncludes(clone) {
  const ignore = readFileSync(join(clone, ".prettierignore"), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const included = ignore
    .filter((line) => /^!\*\.\w+$/.test(line))
    .map((line) => `**/${line.slice(1)}`);
  const excluded = ignore
    .filter((line) => !line.startsWith("!") && line !== "*")
    .map((line) => line.replace(/\/$/, ""))
    .map((path) => (path.includes("/") ? `!${path}` : `!**/${path}`));
  return [...included, ...excluded];
}

/** The layer's Biome config: its format at the Prettier options, and in src/, as ESLint's import
 * rules are, the manifest rule, the layer table, and the declaration plugin; the CSS plugin, as
 * ESLint's no-restricted-syntax, everywhere. Written to `dir` with its plugins, formatted by Biome,
 * and returned with the names of the files it wrote. */
function configure(dir, { clone, table, css, vcs }) {
  const { settings } = formatSettings(clone);
  const [layer] = table;
  const packages = layer.may.filter((name) => name !== layer.name);
  // Every specifier is restricted but a relative one and the packages the table names, by name or
  // subpath; a relative path into node_modules/ is restricted again.
  const group = [
    "**",
    "!.",
    "!..",
    "!./**",
    "!../**",
    ...packages.flatMap((name) => [`!${name}`, `!${name}/**`]),
    "**/node_modules/**",
  ];
  const config = merged(
    {
      // Each layer's .gitignore names its build and node_modules/; the tree, outside the clone,
      // has neither and no repository, so its config reads no ignore file.
      ...(vcs && { vcs: { enabled: true, clientKind: "git", useIgnoreFile: true } }),
      files: { includes: formatIncludes(clone) },
      ...(css && { plugins: ["./css-module.grit"] }),
      overrides: [
        {
          includes: ["src/**"],
          plugins: ["./declaration.grit"],
          linter: {
            rules: {
              correctness: {
                // A devDependency ships nothing, so it declares nothing src/ may import.
                noUndeclaredDependencies: { level: "error", options: { devDependencies: false } },
              },
              style: {
                noRestrictedImports: {
                  level: "error",
                  options: {
                    patterns: [
                      {
                        group,
                        message: `The layer imports its own files${packages.length ? ` and ${packages.join(", ")}` : ""} alone.`,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      ],
    },
    settings,
  );
  const written = ["biome.json", ...(css ? ["css-module.grit"] : []), "declaration.grit"];
  writeFileSync(join(dir, "biome.json"), JSON.stringify(config));
  for (const name of written.slice(1)) {
    writeFileSync(join(dir, name), plugins[name].pattern(plugins[name].message));
  }
  must(biome, ["format", "--write", "biome.json"], { cwd: dir });
  return written;
}

/** Biome's JSON report of a command in `cwd`; its exit status is 1 when it finds anything. */
function biomeReport(args, cwd) {
  const result = run(biome, [...args, "--reporter=json", "--max-diagnostics=none"], { cwd });
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`biome ${args.join(" ")} exited ${result.status}: ${result.output}`);
  }
  return JSON.parse(result.stdout);
}

/** The names a Biome diagnostic is counted under: its rule, its plugin's file, or parse. */
function biomeRule(diagnostic) {
  if (diagnostic.category === "plugin") {
    return Object.keys(plugins).find((name) => plugins[name].message === diagnostic.message);
  }
  if ([restricted, undeclared].includes(diagnostic.category)) {
    return diagnostic.category.split("/").pop();
  }
  return diagnostic.category === "parse" ? "parse" : undefined;
}

/** Each package's identity in a pnpm lockfile key or version: name@version, less its peers. */
const identity = (key) => key.replace(/\(.*$/, "");

/** Whether this machine installs a lockfile package: its os, cpu, and libc, where it names them. */
function installs(entry = {}) {
  const libc = process.report.getReport().header.glibcVersionRuntime ? "glibc" : "musl";
  const holds = (list, value) =>
    !list ||
    (list.some((item) => !item.startsWith("!"))
      ? list.includes(value)
      : !list.includes(`!${value}`));
  return (
    holds(entry.os, process.platform) && holds(entry.cpu, process.arch) && holds(entry.libc, libc)
  );
}

/** The packages a frozen install of `dir`'s lockfile puts on this machine for the named
 * devDependencies and their dependencies, each name@version once. */
function installed(dir, roots) {
  const lock = yaml(join(dir, "pnpm-lock.yaml"));
  const direct = lock.importers["."].devDependencies;
  const seen = new Set();
  const queue = roots.map((name) => `${name}@${direct[name].version}`);
  while (queue.length > 0) {
    const key = queue.shift();
    const id = identity(key);
    if (seen.has(id) || !installs(lock.packages[id])) continue;
    seen.add(id);
    const snapshot = lock.snapshots[key] ?? {};
    for (const [name, version] of Object.entries({
      ...snapshot.dependencies,
      ...snapshot.optionalDependencies,
    })) {
      if (!version.startsWith("link:")) {
        // An alias's version names its package: name@version.
        queue.push(/^@?[^@(]+@/.test(version) ? version : `${name}@${version}`);
      }
    }
  }
  return seen.size;
}

const rows = [];
const cell = (text) => String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
const row = (measure, result) => rows.push(`| ${cell(measure)} | ${cell(result)} |`);

/** A case's name, by the rules the layer's tree says catch it. */
function caseName(rules, tree) {
  const key = [...rules].sort().join(" ");
  const names = {
    [[tree.table, tree.extraneous].sort().join(" ")]: "a package by name",
    [[tree.table, tree.relativePackages].sort().join(" ")]:
      "a package by a relative path into node_modules/",
    [tree.table]: "a value import of a declaration",
    [tree.cssModule]: "a .css import that isn't a static CSS module script",
  };
  return names[key] ?? key;
}

/** Each rule among files' rules, with how many it flags and, when not all, the files it doesn't:
 * "rule n, rule n (not a, b)". */
const tally = (found, files) => {
  const rules = [...new Set(files.flatMap((file) => found[file] ?? []))].sort();
  return rules
    .map((rule) => {
      const not = files.filter((file) => !found[file]?.includes(rule));
      return `${rule} ${files.length - not.length}${not.length ? ` (not ${not.join(", ")})` : ""}`;
    })
    .join(", ");
};

/** A side's flags on a case's files: how many it flags, by which rules, and the files it misses. */
function flagged(found, files) {
  const missed = files.filter((file) => !found[file]);
  const by = tally(found, files);
  return `${files.length - missed.length} of ${files.length}${by ? ` (${by})` : ""}${missed.length ? `; misses ${missed.join(", ")}` : ""}`;
}

/** A side's false positives: each file outside the violations it flags, with its rules. */
const falsePositives = (found, violations) => {
  const files = Object.keys(found).filter((file) => !(file in violations));
  return files.length
    ? `${files.length}: ${files.map((file) => `${file} (${found[file].join(", ")})`).join("; ")}`
    : "none";
};

/** Clones the layer's main and installs it from its lockfile; returns the clone and its commit. */
function setUp(repository) {
  const clone = join(scratch, repository);
  must("git", [
    "clone",
    "--quiet",
    "--depth",
    "1",
    "--branch",
    "main",
    `${owner}/${repository}.git`,
    clone,
  ]);
  must(pnpm, ["install", "--frozen-lockfile"], { cwd: clone });
  return { clone, sha: must("git", ["-C", clone, "rev-parse", "--short", "HEAD"]) };
}

/** Biome's own install, in scratch: the packages pnpm puts on this machine for it. */
function biomeInstall(version) {
  const dir = join(scratch, "biome-install");
  mkdirSync(dir);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ private: true, devDependencies: { "@biomejs/biome": version } }),
  );
  must(pnpm, ["install"], { cwd: dir });
  return installed(dir, ["@biomejs/biome"]);
}

async function measure(repository, biomeVersion, biomePackages) {
  const layer = repository.replace(/^spike-html-packages-/, "");
  const { clone, sha } = setUp(repository);
  const tree = await import(pathToFileURL(join(clone, "test/unit/layers-tree.js")));
  const { layers: table } = await import(pathToFileURL(join(clone, "eslint.config.js")));
  const manifest = tree.manifest;
  const eslintVersion = must(join(clone, "node_modules/.bin/eslint"), ["--version"]);
  const css = "cssModule" in tree;

  // The tree as the layer's test writes it, its violations and allowed imports together.
  const dir = join(scratch, `${layer}-tree`);
  mkdirSync(dir);
  const code = tree.writeTree(dir, { ...tree.sources(tree.violations), ...tree.allowed });

  const eslint = {};
  for (const file of tree.lint(dir)) {
    const rules = [...new Set(file.messages.map((message) => message.ruleId))]
      .filter((rule) => tree.watched.includes(rule))
      .sort();
    if (rules.length > 0) eslint[file.filePath.slice(dir.length + 1)] = rules;
  }

  const configFiles = configure(dir, { clone, table, css, vcs: false });
  const found = {};
  for (const diagnostic of biomeReport(["lint", "src"], dir).diagnostics) {
    const rule = biomeRule(diagnostic);
    if (rule)
      found[diagnostic.location.path] = [
        ...new Set([...(found[diagnostic.location.path] ?? []), rule]),
      ].sort();
  }

  row(
    `${layer}: the measure`,
    `main ${sha}, installed from pnpm-lock.yaml; ESLint ${eslintVersion.replace(/^v/, "")}, Biome ${biomeVersion}; the tree's ${Object.keys(tree.violations).length} violations and ${Object.keys(tree.allowed).length} allowed files, ${code.length} code files under src/`,
  );
  const cases = {};
  for (const [file, { rules }] of Object.entries(tree.violations)) {
    (cases[caseName(rules, tree)] ??= []).push(file);
  }
  for (const [name, files] of Object.entries(cases)) {
    row(
      `${layer}: ${name}, ${files.length} ${files.length === 1 ? "file" : "files"}`,
      `ESLint flags ${flagged(eslint, files)}; Biome flags ${flagged(found, files)}`,
    );
  }
  row(
    `${layer}: false positives, on the allowed imports and the files they import`,
    `ESLint: ${falsePositives(eslint, tree.violations)}; Biome: ${falsePositives(found, tree.violations)}`,
  );

  // The surface: each side's config files, its pins, and what its pins install here.
  const devDependencies = Object.keys(manifest.devDependencies);
  // ESLint's pins are every devDependency but Prettier and a layer below: typescript among them,
  // which typescript-eslint and the resolver load, since the check's tsc is mise's TypeScript-Go.
  const eslintPins = devDependencies.filter(
    (name) => name !== "prettier" && !name.startsWith("@jaimestill/"),
  );
  const pins = (names) =>
    names.map((name) => `${name} ${manifest.devDependencies[name]}`).join(", ");
  const sized = (dir, names) =>
    names.map((name) => `${name} (${lines(join(dir, name))} lines)`).join(", ");
  row(
    `${layer}: config files`,
    `ESLint: ${sized(clone, ["eslint.config.js"])}; Prettier: ${sized(clone, [".prettierrc.json", ".prettierignore"])}; Biome, for both: ${sized(dir, configFiles)}`,
  );
  row(
    `${layer}: pins to keep current`,
    `ESLint: ${eslintPins.length}, ${pins(eslintPins)}; Prettier: 1, ${pins(["prettier"])}; Biome, for both: 1, @biomejs/biome ${biomeVersion} (mise's biome here), whose GritQL node names the plugins hold`,
  );
  row(
    `${layer}: installed packages, on this machine`,
    `ESLint: ${installed(clone, eslintPins)}; Prettier: ${installed(clone, ["prettier"])}; Biome, for both: ${biomePackages}`,
  );

  // Biome's format of the clone, at the layer's Prettier options, over the files Prettier formats.
  const { unmapped } = formatSettings(clone);
  configure(clone, { clone, table, css, vcs: true });
  const format = biomeReport(["format", "."], clone);
  const changed = format.diagnostics
    .filter((diagnostic) => diagnostic.category === "format")
    .map((diagnostic) => diagnostic.location.path)
    .sort();
  const checked = format.summary.changed + format.summary.unchanged;
  row(
    `${layer}: Biome's format, at .prettierrc.json's options, leaves the code, JSON, and CSS unchanged`,
    `${changed.length ? "no" : "yes"}: of ${checked} files, its biome.json among them, it would change ${changed.length ? changed.join(", ") : "none"}${unmapped.length ? `; options with no Biome counterpart: ${unmapped.join(", ")}` : "; every option has a Biome counterpart"}`,
  );
}

const cleanup = () => rmSync(scratch, { recursive: true, force: true });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    cleanup();
    process.exit(1);
  });
}
try {
  biome = must("mise", ["which", "biome"], { cwd: process.cwd() });
  pnpm = must("mise", ["which", "pnpm"], { cwd: process.cwd() });
  yq = must("mise", ["which", "yq"], { cwd: process.cwd() });
  const biomeVersion = must(biome, ["--version"]).replace(/^Version:\s*/, "");
  const biomePackages = biomeInstall(biomeVersion);
  for (const repository of repositories) {
    try {
      await measure(repository, biomeVersion, biomePackages);
    } catch (error) {
      row(
        `${repository.replace(/^spike-html-packages-/, "")}: the measure`,
        `not set up: ${error.message}`,
      );
      process.exitCode = 1;
    }
  }
  console.log(
    `## ESLint and Biome, ${date}\n\n| measure | result |\n| --- | --- |\n${rows.join("\n")}`,
  );
} catch (error) {
  console.error(`biome: ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanup();
}
