import { ref } from "../ref";
import { setup } from "../setup";
import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("setup", () => {
  it("should create a setup", async () => {
    const message = ref("test");
    const document = new JSDOM(
      '<div id="app"><div data-text="message"></div></div>'
    ).window.document;
    setup({ message }, { attach: "#app" }, document);
    await wait();
    expect(document.body.querySelector("div")?.textContent).toBe("test");
  });

  it("should update dom when a ref value update", async () => {
    const message = ref("test");
    const document = new JSDOM(
      '<div id="app"><div data-text="message"></div></div>'
    ).window.document;

    setup({ message }, { attach: "#app" }, document);
    expect(document.querySelector("div")?.textContent).toBe("test");
    message.value = "new value";
    await wait();
    expect(document.querySelector("div")?.textContent).toBe("new value");
  });

  it.only("should update classes when a ref value updates", async () => {
    const document = new JSDOM(
      '<div id="app"><div data-class="message"></div></div>'
    ).window.document;
    const el = document.querySelector<HTMLElement>('[data-class="message"]')!;
    const message = ref("my-old-class");

    setup({ message }, { attach: "#app" }, document);

    expect(el.className).toBe("my-old-class");

    message.value = "my-new-class";
    await wait();

    expect(el.className).toBe("my-new-class");
  });

  it.todo("should call a click event when a click method is passed", () => {
    const handleClick = vi.fn();
    const document = new JSDOM(
      '<div id="app"><button data-click="handleClick"></button></div>'
    ).window.document;
    setup({ clickFn: handleClick }, { attach: "#app" }, document);
    const button = document.querySelector("button");
    button?.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
