import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { forDirective } from "../../directives/forDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../../ref";

describe("forDirective", () => {
  it("should loop over the data-for elements", () => {
    const items = ref(["a", "b", "c"]);
    const document = new JSDOM(
      `<main>
        <div data-for="item" data-in="items">text</div>
      </main>`
    ).window.document;
    const parent = document.querySelector<HTMLElement>("main")!;
    const el = document.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { items },
      el,

      value: items,
      attrValue: "items",
      get: () => items.value,
      getPrevious: () => items.previousValue,
      effect: () => {},

      directives: {},
    };

    forDirective(ctx);

    expect(parent.innerHTML).toBeHTML(
      `<div>text</div>
      <div>text</div>
      <div>text</div>`
    );
  });
});
