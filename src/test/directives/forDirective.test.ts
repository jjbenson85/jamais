
import { JSDOM } from "jsdom";

import { describe, it, expect } from "vitest";
import { createEffect } from "../../signal";
import { forDirective } from "../../directives/forDirective";

describe("forDirective", () => {
  it("should create a for directive", () => {
    const doc = new JSDOM(`<div :data-for="item in items">Test</div>`).window
      .document;
    const el = doc.querySelector("div");
    if (!el) throw new Error("No element found");
    const data = { items: ["a", "b", "c"] };
    const effect = forDirective.mounted(el, ":class", "item in items", data);
    effect && createEffect(effect);

    expect(el.parentElement.textContent).toBe("TestTestTest");
  });
});