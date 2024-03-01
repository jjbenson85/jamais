import { ref } from "../ref";
import { setup } from "../setup";
import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("setup", () => {
  it.only("should create a setup", async () => {
    const message = ref("test");
    const document = new JSDOM(
      '<div id="app"><div data-text="message"></div></div>'
    ).window.document;
    // .body;
    setup(() => ({ message }), document).attach("#app");
    await wait();
    expect(document.body.querySelector("div")?.textContent).toBe("test");
  });

  it("should update dom when a ref value update", async () => {
    const message = ref("test");
    const document = new JSDOM(
      '<div id="app"><div data-text="message"></div></div>'
    ).window.document;

    setup(() => ({ message }), document).attach("#app");
    expect(document.querySelector("div")?.textContent).toBe("test");
    message.value = "new value";
    expect(document.querySelector("div")?.textContent).toBe("new value");
  });

  it("should update classes when a ref value update", async () => {
    const message = ref("test");
    const document = new JSDOM(
      '<div id="app"><div data-text="message"></div></div>'
    ).window.document;

    setup(() => ({ message }), document).attach("#app");
    expect(document.querySelector("div")?.className).toBe("test");
    message.value = "new value";
    expect(document.querySelector("div")?.className).toBe("new value");
  });

  it("should call a click event when a click method is passed", () => {
    const handleClick = vi.fn();
    const document = new JSDOM(
      '<div id="app"><div data-click="handleClick"></div></div>'
    ).window.document;
    setup(() => ({ clickFn: handleClick }), document).attach("#app");
    const button = document.querySelector("button");
    button?.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
