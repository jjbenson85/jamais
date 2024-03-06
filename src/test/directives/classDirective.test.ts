import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { DirectiveContext } from "../../bindDirectives";
import { classDirective } from "../../directives/classDirective";
import { ref } from "../../ref";
import { wait } from "../utils";

describe("classDirective", () => {
  it("should bind a class to an element", () => {
    const el = new JSDOM().window.document.createElement("div");
    const data = { testClass: "my-class" };

    const ctx: DirectiveContext = {
      data,
      el,
      value: "testClass",
      attrValue: "testClass",
      get: () => data.testClass,
      getPrevious: () => undefined,
      effect: () => {},
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
      value: "testClass",
      attrValue: "testClass",
      get: () => data.testClass,
      getPrevious: () => undefined,
      effect: () => {},
      directives: {},
    };

    classDirective(ctx);
    expect(el.outerHTML).toBeHTML(`<div class="existing-class my-class"></div>`);
  });

  it("should remove classes that are no longer bound", async () => {
    const el = new JSDOM().window.document.createElement("div");
    el.className = "existing-class";
    const testClass = ref("my-old-class");
    const data = { testClass };

    const ctx: DirectiveContext = {
      data,
      el,
      value: "testClass",
      attrValue: "testClass",
      get: () => testClass.value,
      getPrevious: () => testClass.previousValue,
      effect: (fn) => testClass.addProcessQueueWatcher(fn),
      directives: {},
    };
    classDirective(ctx);

    expect(el.outerHTML).toBeHTML(
      `<div class="existing-class my-old-class"></div>`,
    );

    testClass.value = "my-new-class";

    await wait();
    expect(el.outerHTML).toBeHTML(
      `<div class="existing-class my-new-class"></div>`,
    );
  });
});
