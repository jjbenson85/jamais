import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { eventDirective } from "../../directives/eventDirective";
import { describe, it, expect, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("eventDirective", () => {
  it("should bind a click event to an element", () => {
    const el = new JSDOM().window.document.createElement("button");
    const data = { handleClick: vi.fn() };

    const ctx: DirectiveContext = {
      data,
      el,

      value: "handleClick",
      attrValue: "handleClick",
      get: () => data.handleClick,
      getPrevious: () => undefined,
      effect: () => {},

      directives: {},
    };

    eventDirective(ctx);
    el.click();
    expect(data.handleClick).toHaveBeenCalled();
  });
});
