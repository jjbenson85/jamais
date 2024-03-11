import "./extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { DirectiveContext } from "../bindDirectives";
import { bindAttributes } from "../bindAttributes";

describe.todo("bindDirective", () => {
  // it("should bind a value to an element", () => {
  //   const el = new JSDOM().window.document.createElement("div");
  //   const data = { foo: "bar" };
  //   const ctx: DirectiveContext = {
  //     data,
  //     el,
  //     dataValue: undefined,
  //     attrValue: "aria-label:foo",
  //     get: () => data.foo,
  //     getPrevious: () => data.foo,
  //     effect: () => {},
  //     directives: {},
  //     components: {},
  //   };
  //   bindDirective(ctx);
  //   expect(el.outerHTML).toBeHTML(`<div aria-label="bar"></div>`);
  // });
  // it("should bind multiple values to an element", () => {
  //   const el = new JSDOM().window.document.createElement("div");
  //   const data = { foo: "bar", baz: "qux" };
  //   const ctx: DirectiveContext = {
  //     data,
  //     el,
  //     dataValue: undefined,
  //     attrValue: "aria-label:foo label:baz",
  //     get: () => undefined,
  //     getPrevious: () => undefined,
  //     effect: () => {},
  //     directives: {},
  //     components: {},
  //   };
  //   bindDirective(ctx);
  //   expect(el.outerHTML).toBeHTML(`<div aria-label="bar" label="qux"></div>`);
  // });
});
