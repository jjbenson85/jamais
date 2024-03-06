import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { textDirective } from "../../directives/textDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../../ref";
import { wait } from "../utils";

describe("textDirective", () => {
  it("should apply this initial data-text", () => {
    const message = ref("test");
    const el = JSDOM.fragment('<div data-text="message"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { message },
      el,

      value: message,

      attrValue: "message",

      get: () => message.value,
      getPrevious: () => message.previousValue,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    };

    textDirective(ctx);
    expect(el?.textContent).toBe("test");
  });
  it("should update data-text when a ref value updates", async () => {
    const message = ref("test");
    const el = JSDOM.fragment('<div data-text="message"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { message },
      el,

      value: message,

      attrValue: "message",

      get: () => message.value,
      getPrevious: () => message.previousValue,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    };

    textDirective(ctx);
    message.value = "new value";

    await wait();
    expect(el?.textContent).toBe("new value");
  });
  it("should apply the initial deep data-text", () => {
    const message = ref({ deep: "test" });
    const el = JSDOM.fragment('<div data-text="message.deep"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { message },
      el,

      value: message,

      attrValue: "message.deep",

      get: () => message.value.deep,
      getPrevious: () => message.previousValue?.deep,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    };

    textDirective(ctx);
    expect(el?.textContent).toBe("test");
  });
  it("should update deep data-text when a ref value updates", async () => {
    const message = ref({ deep: "test" });
    const el = JSDOM.fragment('<div data-text="message.deep"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { message },
      el,

      value: message,
      attrValue: "message.deep",
      get: () => message.value.deep,
      getPrevious: () => message.previousValue?.deep,
      effect: (fn) => message.addProcessQueueWatcher(fn),

      directives: {},
    };

    textDirective(ctx);
    message.value = { deep: "new value" };

    await wait();
    expect(el?.textContent).toBe("new value");
  });
});
