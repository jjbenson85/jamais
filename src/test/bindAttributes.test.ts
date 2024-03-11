import "./extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { bindAttributes } from "../bindAttributes";

describe("bindAttributes", () => {
  it("should bind a value to an element", () => {
    const doc = new JSDOM(`<div :aria-label="foo"></div>`).window.document;
    const el = doc.querySelector<HTMLElement>("div");
    if (!el) throw new Error("No element found");
    const data = { foo: "bar" };
    const ctx = {
      data,
      el: doc.body,
      directives: {},
      components: {},
    };
    bindAttributes(ctx);
    expect(el.outerHTML).toBeHTML(
      `<div :aria-label="foo" aria-label="bar"></div>`,
    );
  });

  it("should bind multiple values to an element", () => {
    const doc = new JSDOM(`<div :aria-label="foo" :aria-hidden="baz"></div>`)
      .window.document;
    const el = doc.querySelector<HTMLElement>("div");
    if (!el) throw new Error("No element found");

    bindAttributes({
      data: { foo: "bar", baz: "true" },
      el: doc.body,
      directives: {},
    });
    expect(el.outerHTML).toBeHTML(
      `<div :aria-label="foo" :aria-hidden="baz" aria-label="bar" aria-hidden="true"></div>`,
    );
  });

  it("should not bind a value to an element if it's a directive name", () => {
    const doc = new JSDOM(`<div :data-text="foo"></div>`).window.document;
    const el = doc.querySelector<HTMLElement>("div");
    if (!el) throw new Error("No element found");

    bindAttributes({
      data: { foo: "bar" },
      el: doc.body,
      directives: { "data-text": () => {} },
    });

    expect(el.outerHTML).toBeHTML(`<div :data-text="foo"></div>`);
  });
});
