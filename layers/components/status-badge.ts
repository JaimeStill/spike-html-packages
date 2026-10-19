// adapted from spike-html-conventions a88828a: layers/components/status-badge.ts, its root adopting
// the foundation's reset and elements sheets before its own, as the other shadow-root components
// do; conventions' adopted its own sheet alone, leaving its button the browser's default look.
//
// The components layer: the element tier, here a minimal Lit element on the foundation. Props in,
// events out; it holds no service, data, or app state. `static styles` adopts the foundation's
// reset and elements sheets, each a CSS module script, in cascade order, which give its bare
// button the look the page's baseline gives a light-DOM button, then status-badge.css, its host's
// box alone. The tokens reach the root from the page's entry.

import { html, LitElement, type PropertyDeclarations } from "lit";

import elements from "../foundation/baseline/elements.css" with { type: "css" };
import reset from "../foundation/baseline/reset.css" with { type: "css" };
import { define, emit } from "../foundation/dom.js";
import styles from "./status-badge.css" with { type: "css" };

/** The tag the element defines. */
export const tagName = "sl-status-badge";

/** Shows a label; a click dispatches `badge-select` with that label. */
export class StatusBadge extends LitElement {
  static styles = [reset, elements, styles];

  static properties = {
    label: { type: String },
  } satisfies PropertyDeclarations;

  declare label: string;

  constructor() {
    super();
    this.label = "";
  }

  render() {
    return html`<button type="button" @click=${this.#select}>${this.label}</button>`;
  }

  #select() {
    emit(this, "badge-select", { label: this.label });
  }
}

define(tagName, StatusBadge);
