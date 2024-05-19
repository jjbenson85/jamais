import "@/test/extendMatchers";

import { textDirective } from "@/directives/textDirective";
import { HTMLElementWithParent } from "@/directives/types";
import { wait } from "@/test/utils";
import { createEffect, signal } from "@jamais";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

describe("textDirective", () => {
  it("should match the j-text attribute", () => {
    const el = JSDOM.fragment('<div j-text="message"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    expect(textDirective.matcher(attr)).toBe(true);
  });
  it("should apply this initial j-text", async () => {
    const message = signal("test");
    const el = JSDOM.fragment('<div j-text="message"></div>')
      .firstChild as HTMLElementWithParent;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(
      el,
      attr?.name,
      attr?.value,
      {
        message,
      },
      {},
    );
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });

  it("should update j-text when a ref value updates", async () => {
    const message = signal("test");
    const el = JSDOM.fragment('<div j-text="message"></div>')
      .firstChild as HTMLElementWithParent;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(
      el,
      attr?.name,
      attr?.value,
      {
        message,
      },
      {},
    );
    effect && createEffect(effect);

    message.set("new value");

    await wait();

    expect(el?.textContent).toBe("new value");
  });

  it("should apply the initial deep j-text", () => {
    const message = signal({ deep: "test" });
    const el = JSDOM.fragment('<div j-text="message.get().deep"></div>')
      .firstChild as HTMLElementWithParent;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(
      el,
      attr?.name,
      attr?.value,
      {
        message,
      },
      {},
    );
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });

  it("should update deep j-text when a ref value updates", async () => {
    const message = signal({ deep: "test" });
    const el = JSDOM.fragment('<div j-text="message.get().deep"></div>')
      .firstChild as HTMLElementWithParent;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(
      el,
      attr?.name,
      attr?.value,
      {
        message,
      },
      {},
    );
    effect && createEffect(effect);

    message.set({ deep: "new value" });

    await wait();

    expect(el?.textContent).toBe("new value");
  });

  it("should work with other directives", () => {
    const message = signal("test");
    const el = JSDOM.fragment('<div j-text="message" :class="message"></div>')
      .firstChild as HTMLElementWithParent;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = textDirective.mounted(
      el,
      attr?.name,
      attr?.value,
      {
        message,
      },
      {},
    );
    effect && createEffect(effect);

    expect(el?.textContent).toBe("test");
  });
});
