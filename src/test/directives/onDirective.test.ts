import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { DirectiveContext } from "../../bindDirectives";
import { onDirective } from "../../directives/onDirective";

describe("eventDirective", () => {
  it("should bind a click event to an element", () => {
    const el = new JSDOM().window.document.createElement("button");
    const data = { handleClick: vi.fn() };

    const ctx: DirectiveContext = {
      data,
      el,
      value: undefined,
      attrValue: "click:handleClick",
      get: () => data.handleClick,
      getPrevious: () => undefined,
      effect: () => {},
      directives: {},
      components: {},
    };

    onDirective(ctx);
    el.click();
    expect(data.handleClick).toHaveBeenCalled();
  });

  it.todo("should handle multiple events", () => {
    const el = new JSDOM().window.document.createElement("button");
    const data = { handleClick: vi.fn(), handleMouseOver: vi.fn() };

    const ctx: DirectiveContext = {
      data,
      el,
      value: undefined,
      attrValue: "click:handleClick mouseover:handleMouseOver",
      get: () => data.handleClick,
      getPrevious: () => undefined,
      effect: () => {},
      directives: {},
      components: {},
    };

    onDirective(ctx);
    el.click();
    expect(data.handleClick).toHaveBeenCalled();

    el.dispatchEvent(new MouseEvent("mouseover"));
    expect(data.handleMouseOver).toHaveBeenCalled();
  });
});
