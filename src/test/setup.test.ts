import { ref } from "../ref";
import { setup } from "../setup";
import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("setup", () => {
  it("should create a setup", () => {
    const message = ref("test");
    const { document } = new JSDOM('<div data-text="message"></div>').window;

    setup(() => ({ message }), document);
    expect(document.querySelector("div")?.textContent).toBe("test");
  });

  it("should update dom when a ref value update", () => {
    const message = ref("test");
    const { document } = new JSDOM('<div data-text="message"></div>').window;

    setup(() => ({ message }), document);
    expect(document.querySelector("div")?.textContent).toBe("test");
    message.value = "new value";
    expect(document.querySelector("div")?.textContent).toBe("new value");
  });

  it("should update classes when a ref value update", () => {
    const message = ref("test");
    const { document } = new JSDOM('<div data-class="message"></div>').window;

    setup(() => ({ message }), document);
    expect(document.querySelector("div")?.className).toBe("test");
    message.value = "new value";
    expect(document.querySelector("div")?.className).toBe("new value");
  });

  it("should call a click event when a click method is passed", () => {
    const clickFn = vi.fn();
    const { document } = new JSDOM('<button data-click="clickFn"></button>')
      .window;
    setup(() => ({ clickFn }), document);
    const button = document.querySelector("button");
    button?.click();
    expect(clickFn).toHaveBeenCalledOnce();
  });
});
