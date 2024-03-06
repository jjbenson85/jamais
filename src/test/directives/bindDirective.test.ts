import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { bindDirective } from "../../directives/bindDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

describe("bindDirective", () => {
  it("should bind a value to an element", () => {
    const el = new JSDOM().window.document.createElement("div");
    const data = { foo: "bar" };

    const ctx: DirectiveContext = {
      data,
      el,
      value: undefined,

      attrValue: "aria-label:foo",
      get: () => data.foo,
      getPrevious: () => data.foo,
      effect: () => {},

      directives: {},
    };

    bindDirective(ctx);
    expect(el.outerHTML).toBeHTML(`<div aria-label="bar"></div>`);
  });

  it("should bind multiple values to an element", () => {
    const el = new JSDOM().window.document.createElement("div");
    const data = { foo: "bar", baz: "qux" };

    const ctx: DirectiveContext = {
      data,
      el,
      // attrs: [
      //   {
      value: undefined,
      // attrPrefix: "aria-label",
      attrValue: "aria-label:foo label:baz",
      // attrModifiers: [],
      get: () => undefined,
      getPrevious: () => undefined,
      effect: () => {},
      // },
      // {
      // value: "baz",
      // attrPrefix: "label",
      // attrValue: "baz",
      // attrModifiers: [],
      // get: () => data.baz,
      // getPrevious: () => data.baz,
      // effect: () => {},
      // },
      // ],
      directives: {},
    };

    bindDirective(ctx);
    expect(el.outerHTML).toBeHTML(`<div aria-label="bar" label="qux"></div>`);
  });
});
