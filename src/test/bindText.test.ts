import "./extendMatchers";

import { bindText } from "../bindText";

import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../ref";
import { wait } from "./utils";
describe("bindText", () => {
  it("should apply this initial data-text", () => {
    const message = ref("test");
    const el = JSDOM.fragment('<div data-text="message"></div>')
      .firstChild as Element;

    bindText(el, { message: message });
    expect(el?.textContent).toBe("test");
  });
  it("should update data-text when a ref value updates", async () => {
    const message = ref("test");
    const el = JSDOM.fragment('<div data-text="message"></div>')
      .firstChild as Element;

    bindText(el, { message: message });
    message.value = "new value";

    await wait();
    expect(el?.textContent).toBe("new value");
  });
  it("should apply the initial deep data-text", () => {
    const message = ref({ deep: "test" });
    const el = JSDOM.fragment('<div data-text="message.deep"></div>')
      .firstChild as Element;

    bindText(el, { message: message });
    expect(el?.textContent).toBe("test");
  });
  it("should update deep data-text when a ref value updates", async () => {
    const message = ref({ deep: "test" });
    const el = JSDOM.fragment('<div data-text="message.deep"></div>')
      .firstChild as Element;

    bindText(el, { message: message });
    message.value = { deep: "new value" };

    await wait();
    expect(el?.textContent).toBe("new value");
  });
});
