import { JSDOM } from "jsdom";

import { describe, it, expect } from "vitest";
import { createEffect } from "../../signal";
import { forDirective } from "../../directives/forDirective";

describe("forDirective", () => {
  it("should create a for directive", () => {
    const doc = new JSDOM(`<div :data-for="item in items">Test</div>`).window
      .document;

    // Make available for deep setup functions
    global.document = doc;
    const el = doc.querySelector("div");
    const parentEl = el?.parentElement;

    if (!parentEl) throw new Error("No element found");

    const data = { items: ["a", "b", "c"] };
    const effect = forDirective.mounted(el, ":class", "item in items", data);
    effect && createEffect(effect);

    expect(parentEl.textContent).toBe("TestTestTest");
  });
});
