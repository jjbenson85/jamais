import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { textDirective } from "../../directives/textDirective";
import { createEffect, signal } from "../../signal";
import { wait } from "../utils";

describe("textDirective", () => {
  it("should match the data-text attribute", () => {
    const el = JSDOM.fragment('<div :data-text="message"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    expect(textDirective.matcher(attr)).toBe(true);
  });
  it("should apply this initial data-text", async () => {
    const message = signal("test");
    const el = JSDOM.fragment('<div :data-text="message"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(el, attr?.name, attr?.value, {
      message,
    });
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });

  it("should update data-text when a ref value updates", async () => {
    const message = signal("test");
    const el = JSDOM.fragment('<div :data-text="message"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(el, attr?.name, attr?.value, {
      message,
    });
    effect && createEffect(effect);

    message.set("new value");

    await wait();

    expect(el?.textContent).toBe("new value");
  });

  it("should apply the initial deep data-text", () => {
    const message = signal({ deep: "test" });
    const el = JSDOM.fragment('<div :data-text="message.get().deep"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(el, attr?.name, attr?.value, {
      message,
    });
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });

  it("should update deep data-text when a ref value updates", async () => {
    const message = signal({ deep: "test" });
    const el = JSDOM.fragment('<div :data-text="message.get().deep"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(el, attr?.name, attr?.value, {
      message,
    });
    effect && createEffect(effect);

    message.set({ deep: "new value" });

    await wait();

    expect(el?.textContent).toBe("new value");
  });

  it("should work with other directives", () => {
    const message = signal("test");
    const el = JSDOM.fragment(
      '<div :data-text="message" :class="message"></div>',
    ).firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(el, attr?.name, attr?.value, {
      message,
    });
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });
});
