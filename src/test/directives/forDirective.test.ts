import "@/test/extendMatchers";

import { forDirective } from "@/directives/forDirective";
import { HTMLElementWithParent } from "@/directives/types";
import { Effect } from "@jamais";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

globalThis.document = new JSDOM().window.document;

describe("forDirective", () => {
  it("should match the j-for attribute", () => {
    globalThis.document.body.innerHTML = `<div j-for="item in items">text</div>`;
    const el = document.querySelector<HTMLElementWithParent>("div");

    if (!el) throw new Error("No element found");

    expect(forDirective.matcher(el.attributes[0])).toBe(true);
  });

  it("should loop over the j-for elements", () => {
    globalThis.document.body.innerHTML = `<main><div j-for="item in items">text</div></main>`;
    const parent = document.querySelector<HTMLElement>("main");
    const el = document.querySelector<HTMLElementWithParent>("div");

    if (!el) throw new Error("No element found");
    if (!parent) throw new Error("No parent found");

    const data = { items: ["a", "b", "c"] };
    const cb = forDirective.mounted(el, "j-for", "item in items", data, {});
    cb && new Effect(cb);

    const snapshot = `
<main>
  <div>
    text
  </div>
  <div>
    text
  </div>
  <div>
    text
  </div>
</main>`;

    expect(parent).toMatchInlineSnapshot(snapshot);
  });
});
