import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { classDirective } from "../../directives/classDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

describe("classDirective", () => {
  it("should bind a class to an element", () => {
    const el = new JSDOM().window.document.createElement("div");
    const data = { testClass: "my-class" };

    const ctx: DirectiveContext = {
      data,
      el,
      attrs: [
        {
          value: "testClass",
          attrPrefix: "",
          attrValue: "testClass",
          attrModifiers: [],
          get: () => data.testClass,
          getPrevious: () => undefined,
          effect: () => {},
        },
      ],
      directives: {},
    };

    classDirective(ctx);
    expect(el.outerHTML).toBeHTML(`<div class="my-class"></div>`);
  });

  it("should merge exisitng classes with bound classes on an element", () => {
    const el = new JSDOM().window.document.createElement("div");
    el.className = "existing-class";
    const data = { testClass: "my-class" };

    const ctx: DirectiveContext = {
      data,
      el,
      attrs: [
        {
          value: "testClass",
          attrPrefix: "",
          attrValue: "testClass",
          attrModifiers: [],
          get: () => data.testClass,
          getPrevious: () => undefined,
          effect: () => {},
        },
      ],
      directives: {},
    };

    classDirective(ctx);
    expect(el.outerHTML).toBeHTML(
      `<div class="existing-class my-class"></div>`
    );
  });

  it("should remove classes that are no longer bound", () => {
    const el = new JSDOM().window.document.createElement("div");
    el.className = "existing-class my-old-class";
    const data = { testClass: "my-new-class" };

    const ctx: DirectiveContext = {
      data,
      el,
      attrs: [
        {
          value: "testClass",
          attrPrefix: "",
          attrValue: "testClass",
          attrModifiers: [],
          get: () => data.testClass,
          getPrevious: () => "my-old-class",
          effect: () => {},
        },
      ],
      directives: {},
    };

    classDirective(ctx);
    expect(el.outerHTML).toBeHTML(
      `<div class="existing-class my-new-class"></div>`
    );
  });
});
