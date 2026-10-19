// adapted from spike-html-design v0.7.0: test/keys.test.js, the keys runtime's and its help
// dialog's cases, their assertions kept and their harness this repository's browser tier: the
// fixtures (test/fixtures/keys*.html, adapted from v0.7.0's) served from the working tree by
// support/browser-cases.js's server, which answers layers/foundation/keys.js and keys-help.js with
// the .ts sources' JavaScript, in one browser on one driver (support/browser-<name>.js), under
// node:test, with node:assert/strict for bun:test's expect. A key press is a real one, sent by
// Input.dispatchKeyEvent through the page's cdp(), as v0.7.0's Bun.WebView harness sent it. The
// check runs it under node --test on the raw pipe and the pinned chrome-headless-shell (mise run
// test:browser).
//
// v0.7.0's other keys cases stay with the modules they exercise, none of which is copied here:
// T and the theme menu (theme-menu.js and preferences.js), the specimen (index.html and
// specimen.js), and a package consumer (its import map against package.json's exports, which this
// repository's release task writes).
//
//   BROWSER_DRIVER    the driver, support/browser-<name>.js (default: pipe, the raw pipe, the
//                     check's); each driver reads its own variables, the browser's executable
//                     among them (support/browser-pipe.js)

import assert from "node:assert/strict";
import { after, afterEach, before, describe, test } from "node:test";
import { isDeepStrictEqual } from "node:util";

import { serve, settings } from "./support/browser-cases.js";

const driver = process.env.BROWSER_DRIVER ?? "pipe";
const { launch } = await import(`./support/browser-${driver}.js`);

// The help module, by its path on the server: the failed-load case's server refuses it.
const HELP_MODULE = "/layers/foundation/keys-help.js";

// The working tree served, so a fixture imports the modules by relative URL; chromium runs no
// relative module script from file://. A second server refuses the help module, for the case
// whose load fails; v0.7.0 intercepted the request with a missing file instead.
let server;
let refusing;
let browser;
const fixture = (name, on = server) => `${on.origin}/test/fixtures/${name}`;
const pages = [];

before(async () => {
  server = await serve();
  refusing = await serve({ refuse: [HELP_MODULE] });
  browser = await launch(settings);
});
// Every fixture shares the server's origin, and so the reader's stored settings: each test
// clears them before its pages close.
afterEach(async () => {
  for (const page of pages.splice(0)) {
    await page.evaluate("localStorage.clear()");
    await page.close();
  }
});
after(async () => {
  await browser?.close();
  await server?.stop();
  await refusing?.stop();
});

const KEYS = "/layers/foundation/keys.js";
// WAIT is the sequence wait the tests set, short so a test waits it out quickly; the default,
// 1500 ms, is checked once.
const WAIT = 150;

// open opens a keys fixture with the wait set to WAIT and every keys-fire and keys-sequence
// detail recorded, in window.fired and window.sequences, and closes it after the test. on is the
// server it is served from.
async function open(name = "keys.html", on = server) {
  const page = await browser.open(fixture(name, on));
  pages.push(page);
  await page.evaluate(`(() => {
    window.defaultWait = globalThis[Symbol.for("spike-html-design.keys")].wait;
    globalThis[Symbol.for("spike-html-design.keys")].wait = ${WAIT};
    window.fired = [];
    window.sequences = [];
    document.addEventListener("keys-fire", (event) => window.fired.push(event.detail));
    document.addEventListener("keys-sequence", (event) => window.sequences.push(event.detail));
  })()`);
  return page;
}

// MODIFIERS are CDP's modifier bits.
const MODIFIERS = { alt: 1, ctrl: 2, meta: 4, shift: 8 };

// press sends a real key press through CDP: a keyDown of key, with code (a US layout's for an
// ASCII letter or digit unless given), the modifiers held, and repeat or keyCode when given,
// then its keyUp. A character typed with no Control or Meta carries its text, as typing would.
async function press(page, key, { code, repeat = false, keyCode, ...held } = {}) {
  const modifiers = Object.entries(held).reduce(
    (bits, [name, on]) => bits | (on ? MODIFIERS[name] : 0),
    0,
  );
  const letter = /^[a-z]$/i.test(key);
  const event = {
    key,
    code: code ?? (letter ? `Key${key.toUpperCase()}` : /^[0-9]$/.test(key) ? `Digit${key}` : ""),
    modifiers,
    autoRepeat: repeat,
    windowsVirtualKeyCode: keyCode ?? (letter ? key.toUpperCase().charCodeAt(0) : 0),
  };
  const text = [...key].length === 1 && !held.ctrl && !held.meta ? { text: key } : {};
  await page.cdp("Input.dispatchKeyEvent", { type: "keyDown", ...event, ...text });
  await page.cdp("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

// log resolves to the actions the fixture's bindings ran, in order.
const log = (page) => page.evaluate("window.log");

// sleep resolves after ms, as measured in the page.
const sleep = (page, ms) => page.evaluate(`new Promise((resolve) => setTimeout(resolve, ${ms}))`);

// call runs body with the keys module the page loaded, as keys, and resolves to its result.
const call = (page, body) =>
  page.evaluate(`import(${JSON.stringify(KEYS)}).then((keys) => ${body})`);

// filled resolves once the help dialog is open and filled, or rejects after 2 s.
const filled = (page) =>
  page.evaluate(`new Promise((resolve, reject) => {
    const end = performance.now() + 2000;
    const poll = () => {
      const dialog = document.getElementById("help");
      if (dialog.open && dialog.querySelector("[data-keys-list] [data-keys-table]")) resolve(true);
      else if (performance.now() > end) reject(new Error("help: not filled"));
      else setTimeout(poll, 10);
    };
    poll();
  })`);

// rows resolves to the help table's rows: each [keys, action], keys drawn with each kbd as
// [name] and an off row ending " off", action the row button's text, or, for the fixed Escape
// row, which has no button, the cell's text.
const rows = (page) =>
  page.evaluate(`[...document.querySelectorAll("#help [data-keys-table] tbody tr")].map((row) => {
    const [keys, action] = row.cells;
    const drawn = [...keys.childNodes].map((node) =>
      node.localName === "kbd" ? "[" + node.textContent + "]" : node.textContent).join("");
    return [drawn, (action.querySelector("button") ?? action).textContent];
  })`);

// ESCAPE is the help table's fixed last row, Escape releasing a field.
const ESCAPE = ["[Esc]", "Leave a field"];

describe("keys: element bindings", () => {
  test("T clicks its button, running the invoker command, and marks the press handled", async () => {
    const page = await open();
    await page.evaluate(`document.addEventListener("keydown", (event) => {
      window.handled = event.defaultPrevented;
    })`);
    await press(page, "t");
    assert.deepEqual(await log(page), ["command --theme"]);
    assert.equal(await page.evaluate("window.handled"), true);
    assert.deepEqual(await page.evaluate("window.fired"), [{ binding: "t", keys: ["t"] }]);
    // A single press that fires at once is no sequence.
    assert.deepEqual(await page.evaluate("window.sequences"), []);
  });

  test("on a layout such as Russian, the key on T's code runs the T binding", async () => {
    const page = await open();
    // Cyrillic е, not Latin e.
    await press(page, "\u0435", { code: "KeyT" });
    assert.deepEqual(await log(page), ["command --theme"]);
    assert.deepEqual(await page.evaluate("window.fired"), [{ binding: "t", keys: ["t"] }]);
  });

  test("a field's binding focuses it", async () => {
    const page = await open();
    await press(page, "/");
    assert.equal(await page.evaluate("document.activeElement.id"), "search");
  });

  test("keys reads the page at each press: an added element binds, a removed one unbinds", async () => {
    const page = await open();
    await page.evaluate(`(() => {
      const button = document.createElement("button");
      button.dataset.keys = "n";
      button.dataset.log = "n";
      document.body.append(button);
    })()`);
    await press(page, "n");
    await page.evaluate(`document.querySelector("[data-keys=t]").removeAttribute("data-keys")`);
    await press(page, "t");
    assert.deepEqual(await log(page), ["n"]);
  });

  test("a malformed data-keys binds nothing and warns once", async () => {
    const page = await open();
    await page.evaluate(`(() => {
      window.warnings = [];
      console.warn = (message) => window.warnings.push(message);
    })()`);
    await press(page, "x");
    await press(page, "y");
    assert.deepEqual(await log(page), []);
    const warnings = await page.evaluate("window.warnings");
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].startsWith("keys: data-keys binds nothing:"));
  });

  test("the first of two elements sharing keys wins, ahead of a register() binding", async () => {
    const page = await open();
    await call(page, `keys.register("f", "registered f", () => window.log.push("f registered"))`);
    await press(page, "f");
    assert.deepEqual(await log(page), ["f first"]);
    // With the elements gone, the register() binding is the first.
    await page.evaluate(`document.querySelectorAll("[data-keys=f]").forEach((el) => el.remove())`);
    await press(page, "f");
    assert.deepEqual(await log(page), ["f first", "f registered"]);
  });
});

describe("keys: register()", () => {
  test("fires its handler with the keys-fire event; its remover removes only that binding", async () => {
    const page = await open();
    await call(
      page,
      `{
        window.removeOne = keys.register("q", "one", (event) => window.log.push("one " + event.type));
        keys.register("q", "two", () => window.log.push("two"));
      }`,
    );
    await press(page, "q");
    assert.deepEqual(await log(page), ["one keys-fire"]);
    assert.deepEqual(await page.evaluate("window.fired"), [
      { binding: "q", keys: ["q"], label: "one" },
    ]);
    await page.evaluate("(window.removeOne(), window.removeOne())");
    await press(page, "q");
    assert.deepEqual(await log(page), ["one keys-fire", "two"]);
  });

  test("throws a TypeError on a malformed binding, label, or handler", async () => {
    const page = await open();
    const thrown = (args) =>
      call(
        page,
        `{ try { keys.register(${args}); return null; }
           catch (error) { return [error.constructor.name, error.message]; } }`,
      );
    const [name, message] = await thrown(`"Control+", "x", () => {}`);
    assert.equal(name, "TypeError");
    assert.ok(message.startsWith("keys: "));
    assert.equal((await thrown(`"x", 1, () => {}`))[0], "TypeError");
    assert.equal((await thrown(`"x", "x", null`))[0], "TypeError");
    assert.deepEqual(
      await page.evaluate(`globalThis[Symbol.for("spike-html-design.keys")].registered`),
      [],
    );
  });
});

describe("keys: sequences", () => {
  test("g c runs the longer and g, when the wait ends, the shorter", async () => {
    const page = await open();
    assert.equal(await page.evaluate("window.defaultWait"), 1500);
    await press(page, "g");
    await press(page, "c");
    assert.deepEqual(await log(page), ["g c"]);
    await press(page, "g");
    // Pending until the wait ends.
    assert.deepEqual(await log(page), ["g c"]);
    await sleep(page, WAIT + 100);
    assert.deepEqual(await log(page), ["g c", "g"]);
    assert.deepEqual(await page.evaluate("window.sequences"), [
      { state: "start", presses: ["g"] },
      { state: "end", presses: ["g", "c"], reason: "fired" },
      { state: "start", presses: ["g"] },
      { state: "end", presses: ["g"], reason: "fired" },
    ]);
    assert.deepEqual(
      (await page.evaluate("window.fired")).map(({ keys }) => keys),
      [["g", "c"], ["g"]],
    );
  });

  test("a press that doesn't continue the sequence ends it and is dropped, not retried", async () => {
    const page = await open();
    await press(page, "g");
    // t is bound, but as a new start, not as g's next press.
    await press(page, "t");
    await sleep(page, WAIT + 100);
    assert.deepEqual(await log(page), []);
    assert.deepEqual(await page.evaluate("window.sequences"), [
      { state: "start", presses: ["g"] },
      { state: "end", presses: ["g"], reason: "dropped" },
    ]);
  });

  test("a press after the wait finds the sequence timed out", async () => {
    const page = await open();
    await call(page, `keys.register("w e r", "wer", () => window.log.push("w e r"))`);
    await press(page, "w");
    await press(page, "e");
    await sleep(page, WAIT + 100);
    await press(page, "r");
    assert.deepEqual(await log(page), []);
    assert.deepEqual(await page.evaluate("window.sequences"), [
      { state: "start", presses: ["w"] },
      { state: "continue", presses: ["w", "e"] },
      { state: "end", presses: ["w", "e"], reason: "timeout" },
    ]);
    // Within the wait it runs.
    for (const key of ["w", "e", "r"]) await press(page, key);
    assert.deepEqual(await log(page), ["w e r"]);
  });

  test("the indicator, an outside module, shows the pending presses from keys-sequence alone", async () => {
    const page = await open();
    const shown = () => page.evaluate(`document.getElementById("indicator").textContent`);
    await call(page, `keys.register("w e r", "wer", () => {})`);
    await press(page, "w");
    assert.equal(await shown(), "w");
    await press(page, "e");
    assert.equal(await shown(), "w then e");
    await press(page, "r");
    assert.equal(await shown(), "");
  });
});

describe("keys: silence", () => {
  test("nothing fires in a field, even a combination", async () => {
    const page = await open();
    await call(page, `keys.register("Control+k", "k", () => window.log.push("Control+k"))`);
    for (const id of ["text", "notes", "pick", "editable", "search"]) {
      await page.evaluate(`document.getElementById(${JSON.stringify(id)}).focus()`);
      await press(page, "t");
      await press(page, "k", { ctrl: true });
    }
    assert.deepEqual(await log(page), []);
    // Out of the field, the combination fires.
    await page.evaluate("document.activeElement.blur()");
    await press(page, "k", { ctrl: true });
    assert.deepEqual(await log(page), ["Control+k"]);
  });

  test("with Control or Meta held, a bare binding doesn't match", async () => {
    const page = await open();
    await press(page, "t", { ctrl: true });
    await press(page, "t", { meta: true });
    assert.deepEqual(await log(page), []);
  });

  test("nothing fires on a repeat, while composing, on Dead or Process, or with AltGraph", async () => {
    const page = await open();
    await press(page, "t", { repeat: true });
    await press(page, "t", { keyCode: 229 });
    await press(page, "Dead");
    await press(page, "Process");
    await page.evaluate(`(() => {
      const send = (init) => document.dispatchEvent(new KeyboardEvent("keydown",
        { key: "t", code: "KeyT", bubbles: true, cancelable: true, ...init }));
      send({ isComposing: true });
      send({ modifierAltGraph: true });
    })()`);
    assert.deepEqual(await log(page), []);
    assert.deepEqual(await page.evaluate("window.fired"), []);
  });

  test("an event already handled is left alone", async () => {
    const page = await open();
    await page.evaluate(
      `document.body.addEventListener("keydown", (event) => event.preventDefault())`,
    );
    await press(page, "t");
    assert.deepEqual(await log(page), []);
  });

  test("a modifier pressed alone neither starts nor drops a sequence", async () => {
    const page = await open();
    await press(page, "g");
    await press(page, "Shift", { code: "ShiftLeft", shift: true });
    await press(page, "c");
    assert.deepEqual(await log(page), ["g c"]);
  });
});

describe("keys: scope", () => {
  test("a disabled, inert, or hidden element binds nothing", async () => {
    const page = await open();
    for (const key of ["d", "i", "h"]) await press(page, key);
    assert.deepEqual(await log(page), []);
    await page.evaluate(`document.querySelector("[data-keys=d]").disabled = false`);
    await press(page, "d");
    assert.deepEqual(await log(page), ["d"]);
  });

  test("under a modal only its own bindings are active and register() bindings pause", async () => {
    const page = await open();
    await call(page, `keys.register("r", "r", () => window.log.push("r"))`);
    await press(page, "o");
    assert.equal(await page.evaluate(`document.getElementById("modal").matches(":modal")`), true);
    for (const key of ["t", "r", "g"]) await press(page, key);
    await sleep(page, WAIT + 100);
    await press(page, "m");
    assert.deepEqual(await log(page), ["m"]);
    await press(page, "Escape");
    assert.equal(await page.evaluate(`document.getElementById("modal").open`), false);
    await press(page, "r");
    assert.deepEqual(await log(page), ["m", "r"]);
  });
});

// Behavior 18: Escape in a field, outside an open modal and unhandled, blurs the field, so the
// page's shortcuts work again.
describe("keys: Escape releases a field", () => {
  const FIELDS = ["text", "notes", "pick", "editable", "search"];
  const pressEscape = (page, init) =>
    press(page, "Escape", { code: "Escape", keyCode: 27, ...init });
  const active = (page) =>
    page.evaluate("document.activeElement.id || document.activeElement.localName");

  test("Escape in an input, textarea, select, or contenteditable blurs it, and j fires again", async () => {
    const page = await open();
    await call(page, `keys.register("j", "j", () => window.log.push("j"))`);
    for (const id of FIELDS) {
      await page.evaluate(`document.getElementById(${JSON.stringify(id)}).focus()`);
      await press(page, "j");
      assert.equal(await active(page), id);
      await pressEscape(page);
      assert.equal(await active(page), "body");
      await press(page, "j");
    }
    assert.deepEqual(
      await log(page),
      FIELDS.map(() => "j"),
    );
    // It is no binding: only the j presses fired keys-fire.
    assert.deepEqual(
      (await page.evaluate("window.fired")).map(({ binding }) => binding),
      FIELDS.map(() => "j"),
    );
  });

  test("a search input's native Escape still clears it as keys blurs it", async () => {
    const page = await open();
    await page.evaluate(`(() => {
      const search = document.getElementById("search");
      search.value = "query";
      search.focus();
    })()`);
    await pressEscape(page);
    assert.equal(await page.evaluate(`document.getElementById("search").value`), "");
    assert.equal(await active(page), "body");
  });

  test("the off switch doesn't cover it", async () => {
    const page = await open();
    await call(page, "keys.changeSettings({ enabled: false })");
    await page.evaluate(`document.getElementById("text").focus()`);
    await pressEscape(page);
    assert.equal(await active(page), "body");
  });

  test("a handled, repeated, or composing Escape blurs nothing", async () => {
    const page = await open();
    await page.evaluate(`document.getElementById("text").focus()`);
    await pressEscape(page, { repeat: true });
    await pressEscape(page, { keyCode: 229 });
    assert.equal(await active(page), "text");
    await page.evaluate(`document.getElementById("text").addEventListener("keydown",
      (event) => event.preventDefault())`);
    await pressEscape(page);
    assert.equal(await active(page), "text");
  });

  test("an Escape whose listener moved focus on blurs nothing", async () => {
    const page = await open();
    await page.evaluate(`(() => {
      const text = document.getElementById("text");
      text.addEventListener("keydown", () => document.getElementById("notes").focus());
      text.focus();
    })()`);
    await pressEscape(page);
    assert.equal(await active(page), "notes");
  });

  test("inside an open modal the dialog keeps Escape: keys blurs nothing and it closes", async () => {
    const page = await open();
    await page.evaluate(`(() => {
      const modal = document.getElementById("modal");
      const field = document.createElement("input");
      field.id = "inside";
      modal.append(field);
      modal.showModal();
      field.focus();
      // A document listener added after keys's sees where focus is once keys has run.
      document.addEventListener("keydown", () => (window.after = document.activeElement.id));
      // The page's own Escape binding inside the modal is removed, so the native close runs.
      modal.querySelector("[data-keys=Escape]").remove();
    })()`);
    await pressEscape(page);
    assert.equal(await page.evaluate("window.after"), "inside");
    assert.equal(await page.evaluate(`document.getElementById("modal").open`), false);
  });
});

describe("keys: extension and the store", () => {
  test("cancelling keys-fire stops the action", async () => {
    const page = await open();
    await call(page, `keys.register("q", "q", () => window.log.push("q"))`);
    await page.evaluate(
      `document.addEventListener("keys-fire", (event) => event.preventDefault())`,
    );
    await press(page, "t");
    await press(page, "q");
    assert.deepEqual(await log(page), []);
    assert.deepEqual(
      (await page.evaluate("window.fired")).map(({ binding }) => binding),
      ["t", "q"],
    );
  });

  test("keys-fire bubbles from the bound element", async () => {
    const page = await open();
    await page.evaluate(`document.querySelector("[data-keys=t]").addEventListener("keys-fire",
      (event) => { window.from = [event.target.dataset.keys, event.bubbles, event.cancelable]; })`);
    await press(page, "t");
    assert.deepEqual(await page.evaluate("window.from"), ["t", true, true]);
  });

  test("two copies from two URLs share one store and one listener, so a key fires once", async () => {
    const page = await open("keys-copies.html");
    assert.equal(await page.evaluate("window.copies"), true);
    for (const key of ["t", "a", "b"]) await press(page, key);
    assert.deepEqual(await log(page), ["t", "a", "b"]);
    const store = await page.evaluate(`(() => {
      const store = globalThis[Symbol.for("spike-html-design.keys")];
      return { keys: Object.keys(store), registered: store.registered.map(({ keys, label }) => [keys, label]) };
    })()`);
    assert.deepEqual(store, {
      keys: ["registered", "wait", "listening"],
      registered: [
        ["a", "from a"],
        ["b", "from b"],
      ],
    });
  });
});

// SETTINGS_FIXTURE is the settings fixture: a key, a symbol, a chord, two combinations, and a
// named key, each pressed as written.
const SETTINGS_FIXTURE = "keys-settings.html";

// declared resolves to each bound button's aria-keyshortcuts, by its data-log, null when absent.
const declared = (page) =>
  page.evaluate(`Object.fromEntries([...document.querySelectorAll("[data-log]")]
    .map((el) => [el.dataset.log, el.getAttribute("aria-keyshortcuts")]))`);

// store writes the reader's settings to storage as another tab would, value a string or an object
// written as JSON, and dispatches the storage event that tab's write sends here.
const store = (page, value) => {
  const json = typeof value === "string" ? value : JSON.stringify(value);
  return page.evaluate(`(() => {
    const oldValue = localStorage.getItem("spike-html-design.keys");
    localStorage.setItem("spike-html-design.keys", ${JSON.stringify(json)});
    dispatchEvent(new StorageEvent("storage", { key: "spike-html-design.keys", oldValue,
      newValue: ${JSON.stringify(json)}, storageArea: localStorage, url: location.href }));
  })()`);
};

// saved resolves to the reader's stored settings, parsed, or null when none are stored.
const saved = (page) => page.evaluate(`JSON.parse(localStorage.getItem("spike-html-design.keys"))`);

// pressAll presses each of the fixture's bindings as written: T, ?, g c, Alt+T (Option changes
// the character on macOS, so Alt matches a letter by event.code), Control+K, and Escape.
async function pressAll(page) {
  await press(page, "t");
  await press(page, "?", { code: "Slash", shift: true });
  await press(page, "g");
  await press(page, "c");
  await press(page, "†", { code: "KeyT", alt: true });
  await press(page, "k", { ctrl: true });
  await press(page, "Escape", { code: "Escape" });
}

const ALL = ["t", "?", "g c", "Alt+t", "Control+k", "Escape"];

// DECLARED is the fixture's aria-keyshortcuts with the off switch on.
const DECLARED = {
  t: "T",
  "?": "Shift+/",
  "g c": null,
  "Alt+t": "Alt+T",
  "Control+k": "Control+K",
  Escape: "Escape",
};

// OFF is the fixture's aria-keyshortcuts with the off switch off: character keys declare nothing.
const OFF = { ...DECLARED, t: null, "?": null };

describe("keys: bindings as written", () => {
  test("a key, a symbol, a written chord, written combinations, and a named key all fire", async () => {
    const page = await open(SETTINGS_FIXTURE);
    assert.deepEqual(await declared(page), DECLARED);
    await pressAll(page);
    assert.deepEqual(await log(page), ALL);
    assert.deepEqual(
      (await page.evaluate("window.fired")).map(({ keys }) => keys),
      [["t"], ["?"], ["g", "c"], ["Alt+t"], ["Control+k"], ["Escape"]],
    );
    // Modifiers are exact: k without Control, and Alt+Shift+T, fire nothing.
    await page.evaluate("window.log = []");
    await press(page, "k");
    await press(page, "†", { code: "KeyT", alt: true, shift: true });
    assert.deepEqual(await log(page), []);
  });
});

describe("keys: the reader's settings", () => {
  test("settings() is { enabled, wait }, the wait the store's by default", async () => {
    const page = await open(SETTINGS_FIXTURE);
    assert.deepEqual(await call(page, "keys.settings()"), { enabled: true, wait: WAIT });
  });

  test("the stored wait wins over the store's", async () => {
    const page = await open(SETTINGS_FIXTURE);
    await call(page, `keys.register("w e", "we", () => window.log.push("w e"))`);
    // The store's wait, WAIT, has passed.
    await press(page, "w");
    await sleep(page, WAIT + 250);
    await press(page, "e");
    assert.deepEqual(await log(page), []);
    await call(page, "keys.changeSettings({ wait: 1000 })");
    assert.equal(await call(page, "keys.settings().wait"), 1000);
    await press(page, "w");
    await sleep(page, WAIT + 250);
    await press(page, "e");
    assert.deepEqual(await log(page), ["w e"]);
  });

  test("invalid or unknown stored values read as defaults, and unparseable JSON as all defaults", async () => {
    const page = await open(SETTINGS_FIXTURE);
    const defaults = { enabled: true, wait: WAIT };
    // A name keys doesn't know is ignored.
    await store(page, { enabled: "no", foo: 1, wait: 20 });
    assert.deepEqual(await call(page, "keys.settings()"), defaults);
    await store(page, { foo: 1, wait: 3000 });
    assert.deepEqual(await call(page, "keys.settings()"), { ...defaults, wait: 3000 });
    for (const value of ["{", "[]", "null", '"foo"']) {
      await store(page, value);
      assert.deepEqual(await call(page, "keys.settings()"), defaults);
    }
    // keys still fires as written.
    await press(page, "t");
    assert.deepEqual(await log(page), ["t"]);
  });

  test("changeSettings() stores only changed settings; a default or null removes one", async () => {
    const page = await open(SETTINGS_FIXTURE);
    await call(page, `keys.changeSettings({ wait: 3000 })`);
    assert.deepEqual(await saved(page), { wait: 3000 });
    await call(page, `keys.changeSettings({ enabled: false })`);
    assert.deepEqual(await saved(page), { wait: 3000, enabled: false });
    await call(page, `keys.changeSettings({ wait: null, enabled: true })`);
    assert.equal(await saved(page), null);
    // Invalid values and unknown names already stored are dropped on the next change.
    await store(page, { enabled: 1, foo: 1 });
    await call(page, `keys.changeSettings({ wait: 5000 })`);
    assert.deepEqual(await saved(page), { wait: 5000 });
    const thrown = (change) =>
      call(
        page,
        `{ try { keys.changeSettings(${change}); return null; }
           catch (error) { return error.constructor.name; } }`,
      );
    for (const change of [`{ foo: 1 }`, `{ wait: 20 }`, `{ colour: "red" }`]) {
      assert.deepEqual([change, await thrown(change)], [change, "TypeError"]);
    }
    assert.deepEqual(await saved(page), { wait: 5000 });
  });

  test("the off switch turns off keys and chords of characters and leaves combinations on", async () => {
    const page = await open(SETTINGS_FIXTURE);
    await call(page, `keys.register("j", "j", () => window.log.push("j"))`);
    await call(page, `keys.register("Alt+j", "Alt+j", () => window.log.push("Alt+j"))`);
    await call(page, "keys.changeSettings({ enabled: false })");
    assert.deepEqual(await declared(page), OFF);
    await pressAll(page);
    await press(page, "j");
    await press(page, "∆", { code: "KeyJ", alt: true });
    assert.deepEqual(await log(page), ["Alt+t", "Control+k", "Escape", "Alt+j"]);
    // Turned back on, they all fire.
    await page.evaluate("window.log = []");
    await call(page, "keys.changeSettings({ enabled: true })");
    assert.deepEqual(await declared(page), DECLARED);
    await pressAll(page);
    assert.deepEqual(await log(page), ALL);
  });
});

describe("keys: aria-keyshortcuts", () => {
  test("another tab's change to the settings applies at once, to presses and the attribute", async () => {
    const page = await open(SETTINGS_FIXTURE);
    await store(page, { enabled: false });
    assert.deepEqual(await declared(page), OFF);
    await pressAll(page);
    assert.deepEqual(await log(page), ["Alt+t", "Control+k", "Escape"]);
    // Storage cleared in another tab: key null.
    await page.evaluate(`(localStorage.clear(),
      dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage })))`);
    assert.deepEqual(await declared(page), DECLARED);
  });

  test("two tabs on one origin: a change in one rewrites the other's attribute", async () => {
    const one = await open(SETTINGS_FIXTURE);
    const two = await open(SETTINGS_FIXTURE);
    await call(one, `keys.changeSettings({ enabled: false })`);
    // The other tab's storage event arrives as a task; wait for it.
    await sleep(two, 50);
    assert.deepEqual(await declared(two), OFF);
    await press(two, "t");
    await press(two, "k", { ctrl: true });
    assert.deepEqual(await log(two), ["Control+k"]);
  });

  test("stored settings apply on load", async () => {
    const page = await open(SETTINGS_FIXTURE);
    await page.evaluate(
      `localStorage.setItem("spike-html-design.keys", JSON.stringify({ enabled: false }))`,
    );
    await page.goto(fixture(SETTINGS_FIXTURE));
    assert.deepEqual(await declared(page), OFF);
  });

  test("follows added elements and data-keys changes, and leaves unbound elements alone", async () => {
    const page = await open(SETTINGS_FIXTURE);
    const shortcut = (id) =>
      page.evaluate(
        `document.getElementById(${JSON.stringify(id)}).getAttribute("aria-keyshortcuts")`,
      );
    await page.evaluate(`(() => {
      const button = document.createElement("button");
      button.id = "added";
      button.dataset.keys = "n";
      document.body.append(button);
    })()`);
    assert.equal(await shortcut("added"), "N");
    await page.evaluate(`document.getElementById("added").dataset.keys = "Alt+n, ?"`);
    assert.equal(await shortcut("added"), "Alt+N Shift+/");
    // A sequence declares nothing; nor does a malformed binding.
    await page.evaluate(`document.getElementById("added").dataset.keys = "n m"`);
    assert.equal(await shortcut("added"), null);
    await page.evaluate(`document.getElementById("added").dataset.keys = "Control+"`);
    assert.equal(await shortcut("added"), null);
    // data-keys removed: the attribute keys wrote goes with it.
    await page.evaluate(`document.getElementById("added").dataset.keys = "n"`);
    assert.equal(await shortcut("added"), "N");
    await page.evaluate(`document.getElementById("added").removeAttribute("data-keys")`);
    assert.equal(await shortcut("added"), null);
    // An element that never carried data-keys keeps its own.
    await call(page, `keys.changeSettings({ enabled: false })`);
    assert.equal(await shortcut("unbound"), "Alt+U");
  });
});

// The help dialog: keys-help.js, which keys loads the first time a dialog holding
// [data-keys-list] opens, fills it with the page's bindings, the reader's settings, and the
// screen-reader note.
describe("keys: the help dialog", () => {
  const HELP = "keys-help.html";

  // fetchedHelp resolves to whether the page has fetched keys-help.js.
  const fetchedHelp = (page) =>
    page.evaluate(`performance.getEntriesByType("resource")
      .some(({ name }) => name.endsWith("/layers/foundation/keys-help.js"))`);

  // openHelp opens the dialog from its Help button, a show-modal invoker, and waits for it.
  async function openHelp(page) {
    await page.evaluate(`document.querySelector("button[command=show-modal]").click()`);
    await filled(page);
  }

  // closeHelp closes the dialog from script.
  const closeHelp = (page) => page.evaluate(`document.getElementById("help").close()`);

  // choose sets one of the dialog's settings controls, as the reader would, and fires change.
  const choose = (page, name, value) =>
    page.evaluate(`(() => {
      const control = document.querySelector("#help [data-keys-settings] [name=${name}]");
      if (control.type === "checkbox") control.checked = ${JSON.stringify(value)};
      else control.value = ${JSON.stringify(String(value))};
      control.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);

  // ROWS is the fixture's rows, with j registered after the elements.
  const ROWS = [
    ["[?]", "Help"],
    ["[T]", "Theme"],
    ["[A]", "Archive the thread"],
    ["[F]", "First"],
    ["[G] then [C]", "Contents"],
    ["[Control]+[K]", "Command"],
    ["[/]", "Search"],
    ["[J]", "Next section"],
  ];

  // registerJ registers j, and a second f the first element's f shadows.
  const registerJ = (page) =>
    call(
      page,
      `(keys.register("j", "Next section", (event) => window.log.push("j " + JSON.stringify(event.detail))),
        keys.register("f", "Shadowed f", () => window.log.push("f registered")))`,
    );

  test("keys-help.js loads on the first open by the show-modal button, not before", async () => {
    const page = await open(HELP);
    await sleep(page, 100);
    assert.equal(await fetchedHelp(page), false);
    assert.equal(
      await page.evaluate(`document.querySelector("[data-keys-list]").childElementCount`),
      0,
    );
    await openHelp(page);
    assert.equal(await fetchedHelp(page), true);
    assert.equal(await page.evaluate(`document.getElementById("help").matches(":modal")`), true);
    assert.deepEqual(await rows(page), [...ROWS.slice(0, -1), ESCAPE]);
  });

  test("a failed load leaves the dialog usable, warns, and imports again at the next open", async () => {
    // The refusing server answers keys-help.js with a 404.
    const page = await open(HELP, refusing);
    await page.evaluate(`(() => {
      window.unhandled = [];
      window.warned = [];
      addEventListener("unhandledrejection", (event) => window.unhandled.push(String(event.reason)));
      const warn = console.warn;
      console.warn = (...args) => (window.warned.push(String(args[0])), warn(...args));
    })()`);
    // requests counts the fetches of keys-help.js the server answered.
    const requests = () => refusing.requests(HELP_MODULE);
    const attempt = async () => {
      await page.evaluate(`document.querySelector("button[command=show-modal]").click()`);
      await sleep(page, 200);
      assert.equal(await page.evaluate(`document.getElementById("help").matches(":modal")`), true);
      // The dialog shows as the page wrote it, and its own Close closes it.
      assert.equal(
        await page.evaluate(`document.querySelector("#help [data-keys-list]").childElementCount`),
        0,
      );
      await page.evaluate(`document.querySelector("#help [command=close]").click()`);
      assert.equal(await page.evaluate(`document.getElementById("help").open`), false);
    };
    await attempt();
    await attempt();
    // Each open imports keys-help.js again, and each failure warns. Chromium keeps a failed
    // module fetch in the document's module map, so the second import fails without a request;
    // a document loaded later fetches it afresh.
    assert.deepEqual(await page.evaluate("window.warned"), [
      "keys: the help module failed to load",
      "keys: the help module failed to load",
    ]);
    assert.equal(requests(), 1);
    assert.deepEqual(await page.evaluate("window.unhandled"), []);
    await page.goto(fixture(HELP, refusing));
    await attempt();
    assert.equal(requests(), 2);
  });

  test("showModal() from script, or the ? key, opens and fills it too", async () => {
    const page = await open(HELP);
    await page.evaluate(`document.getElementById("help").showModal()`);
    await filled(page);
    assert.equal(await fetchedHelp(page), true);
    // Its own Close carries ? inside the modal.
    await press(page, "?", { code: "Slash", shift: true });
    assert.equal(await page.evaluate(`document.getElementById("help").open`), false);
    await page.evaluate(`document.querySelector("[data-keys-list]").replaceChildren()`);
    await press(page, "?", { code: "Slash", shift: true });
    await filled(page);
    assert.deepEqual(await rows(page), [...ROWS.slice(0, -1), ESCAPE]);
  });

  test("lists each active binding once, as the one that fires, with its label by the rule", async () => {
    const page = await open(HELP);
    await registerJ(page);
    await openHelp(page);
    // Second F and the registered f lose to First; Disabled, Inert, Hidden, and the dialog's own
    // Close are left out; A's label is its aria-label, Search's its <label>'s text.
    assert.deepEqual(await rows(page), [...ROWS, ESCAPE]);
    // Each open lists the page as it is then.
    await closeHelp(page);
    await page.evaluate(`(document.querySelector("[data-keys=d]").disabled = false,
      document.querySelector("[data-log='f first']").remove())`);
    await openHelp(page);
    const listed = await rows(page);
    assert.ok(listed.some((item) => isDeepStrictEqual(item, ["[D]", "Disabled"])));
    assert.ok(listed.some((item) => isDeepStrictEqual(item, ["[F]", "Second"])));
  });

  test("a row button closes the dialog and runs its binding: click, focus, or the handler", async () => {
    const page = await open(HELP);
    await registerJ(page);
    const runRow = async (action) => {
      await openHelp(page);
      await page.evaluate(`[...document.querySelectorAll("#help [data-keys-table] button")]
        .find((button) => button.textContent === ${JSON.stringify(action)}).click()`);
      assert.equal(await page.evaluate(`document.getElementById("help").open`), false);
    };
    await runRow("Theme");
    await runRow("Next section");
    assert.deepEqual(await log(page), [
      "t",
      `j ${JSON.stringify({ binding: "j", keys: [], label: "Next section" })}`,
    ]);
    // Running a row is no key press: keys-fire is not dispatched.
    assert.deepEqual(await page.evaluate("window.fired"), []);
    await runRow("Search");
    assert.equal(await page.evaluate("document.activeElement.id"), "search");
  });

  test("the settings are stored through changeSettings and change what fires", async () => {
    const page = await open(HELP);
    await openHelp(page);
    const shown = await page.evaluate(`(() => {
      const fieldset = document.querySelector("#help [data-keys-settings]");
      return {
        legend: fieldset.querySelector("legend").textContent,
        controls: [...fieldset.querySelectorAll("input, select")].map((el) =>
          [el.name, el.type === "checkbox" ? el.checked : el.value,
           el.type === "checkbox" ? null : [...el.options].map((o) => o.value)]),
      };
    })()`);
    assert.deepEqual(shown, {
      legend: "Settings",
      controls: [
        ["enabled", true, null],
        // The tests' store wait, WAIT, is listed first, as the page's own.
        ["wait", "", ["", "1000", "1500", "3000", "5000"]],
      ],
    });
    await choose(page, "wait", 3000);
    assert.deepEqual(await saved(page), { wait: 3000 });
    assert.deepEqual(await call(page, "keys.settings()"), { enabled: true, wait: 3000 });
    // The page's own wait, the empty first option, removes the reader's from storage.
    await choose(page, "wait", "");
    assert.equal(await saved(page), null);
    await choose(page, "enabled", false);
    assert.deepEqual(await saved(page), { enabled: false });
    await closeHelp(page);
    await press(page, "t");
    await press(page, "k", { ctrl: true });
    assert.deepEqual(await log(page), ["Control+k"]);
  });

  test("the off switch marks character-key rows off while combinations still fire", async () => {
    const page = await open(HELP);
    await openHelp(page);
    await choose(page, "enabled", false);
    assert.deepEqual(await saved(page), { enabled: false });
    const offs =
      await page.evaluate(`[...document.querySelectorAll("#help [data-keys-table] tbody tr")]
      .map((row) => [row.cells[1].textContent, row.hasAttribute("data-keys-off")])`);
    assert.deepEqual(offs, [
      ["Help", true],
      ["Theme", true],
      ["Archive the thread", true],
      ["First", true],
      ["Contents", true],
      ["Command", false],
      ["Search", true],
      // The fixed Escape row is no binding: the off switch never covers it.
      ["Leave a field", false],
    ]);
    assert.deepEqual((await rows(page))[1], ["[T] off", "Theme"]);
    // An off row's button still runs its action: a click is no character-key shortcut.
    await page.evaluate(`[...document.querySelectorAll("#help [data-keys-table] button")]
      .find((button) => button.textContent === "Theme").click()`);
    assert.deepEqual(await log(page), ["t"]);
    await press(page, "t");
    await press(page, "g");
    await press(page, "c");
    await press(page, "k", { ctrl: true });
    assert.deepEqual(await log(page), ["t", "Control+k"]);
  });

  test("lists Escape's fixed row last, never off, and Escape on its controls closes it natively", async () => {
    const page = await open(HELP);
    await openHelp(page);
    await choose(page, "enabled", false);
    const fixed = await page.evaluate(`(() => {
      const row = document.querySelector("#help [data-keys-table] tbody tr:last-child");
      return [row.hasAttribute("data-keys-fixed"), row.hasAttribute("data-keys-off"),
        row.cells[0].innerHTML, row.cells[1].textContent, row.querySelector("button")];
    })()`);
    assert.deepEqual(fixed, [true, false, "<kbd>Esc</kbd>", "Leave a field", null]);
    await page.evaluate(`document.querySelector("#help [data-keys-settings] [name=wait]").focus()`);
    await press(page, "Escape", { code: "Escape", keyCode: 27 });
    assert.equal(await page.evaluate(`document.getElementById("help").open`), false);
  });

  test("carries the screen-reader note", async () => {
    const page = await open(HELP);
    await openHelp(page);
    const note = await page.evaluate(
      `document.querySelector("#help [data-keys-note]").textContent`,
    );
    for (const text of ["NVDA+F2", "JAWS+3", "Narrator+3", "VO+Tab"])
      assert.ok(note.includes(text));
  });

  test("another tab's change shows in the dialog on the next open, and changes what fires", async () => {
    const one = await open(HELP);
    const two = await open(HELP);
    await openHelp(two);
    await closeHelp(two);
    await openHelp(one);
    await choose(one, "wait", 5000);
    await choose(one, "enabled", false);
    await sleep(two, 50);
    await openHelp(two);
    assert.deepEqual((await rows(two))[1], ["[T] off", "Theme"]);
    assert.deepEqual(
      await two.evaluate(`[...document.querySelectorAll("#help [data-keys-settings] :is(input, select)")]
        .map((el) => el.type === "checkbox" ? el.checked : el.value)`),
      [false, "5000"],
    );
    await closeHelp(two);
    await press(two, "t");
    await press(two, "k", { ctrl: true });
    assert.deepEqual(await log(two), ["Control+k"]);
  });
});

// The demo, demo/keys.html (mise run demo): its bindings fire, and ? opens its help dialog,
// filled with them. Not one of v0.7.0's cases: it keeps the demo working.
describe("keys: the demo", () => {
  test("T and the register() binding fire, and ? opens the help dialog listing them", async () => {
    const page = await browser.open(`${server.origin}/demo/keys.html`);
    pages.push(page);
    await page.evaluate(`new Promise((resolve) => {
      const poll = () => globalThis[Symbol.for("spike-html-design.keys")]?.registered.length
        ? resolve() : setTimeout(poll, 10);
      poll();
    })`);
    await press(page, "t");
    await press(page, "j");
    assert.deepEqual(
      await page.evaluate(`[...document.querySelectorAll("#log li")].map((li) => li.textContent)`),
      ["j, from register()", "Theme"],
    );
    await press(page, "?", { code: "Slash", shift: true });
    await filled(page);
    assert.deepEqual(await rows(page), [
      ["[?]", "Help"],
      ["[T]", "Theme"],
      ["[G] then [C]", "Contents"],
      ["[G]", "Top"],
      ["[Control]+[K]", "Command"],
      ["[/]", "Search"],
      ["[J]", "Say j, a register() binding"],
      ESCAPE,
    ]);
  });
});
