import { ref } from "../ref";
import { setupRefs } from "../setupRefs";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("setupRefs", () => {
  it("should apply this initial data-text", () => {
    const message = ref("test");
    const el = new JSDOM('<div data-text="message"></div>').window.document
      .body;

    setupRefs([["message", message]], el);
    expect(el.querySelector("div")?.textContent).toBe("test");
  });

  it("should update data-text when a ref value updates", async () => {
    const message = ref("test");
    const el = new JSDOM('<div data-text="message"></div>').window.document
      .body;

    setupRefs([["message", message]], el);
    message.value = "new value";

    await wait();
    expect(el?.textContent).toBe("new value");
  });

  it("should apply the initial data-class", () => {
    const message = ref("test");
    const el = new JSDOM('<div data-class="message"></div>').window.document
      .body;

    setupRefs([["message", message]], el);
    expect(el?.querySelector("div")?.className).toBe("test");
  });

  it("should update data-class when a ref value updates", async () => {
    const message = ref("test");
    const el = new JSDOM('<div data-class="message"></div>').window.document
      .body;

    setupRefs([["message", message]], el);
    message.value = "new value";

    await wait();
    expect(el?.querySelector("div")?.className).toBe("new value");
  });
});
