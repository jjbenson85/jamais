import { setupMethods } from "../setupMethods";
import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("setupMethods", () => {
  it("should call a click event when a click method is passed", () => {
    const clickFn = vi.fn();
    const el = new JSDOM('<button data-click="handleClick"></button>').window
      .document.body;

    setupMethods([["handleClick", clickFn]], el);

    const button = el.querySelector("button");
    button?.click();
    expect(clickFn).toHaveBeenCalledOnce();
  });
});
