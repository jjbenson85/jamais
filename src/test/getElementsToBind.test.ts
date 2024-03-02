import "./extendMatchers";

import { ref } from "../ref";
import { getElementsToBind } from "../getElementsToBind";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

describe("getElementsToBind", () => {
  it("should return an empty array if there are no elements to bind", () => {
    const el = JSDOM.fragment(`<div id="app"><div></div></div>`)
      .firstChild as Element;
    const elements = getElementsToBind(el, "text", {}, false);

    expect(elements).toHaveLength(0);
  });

  it.each(["text", "class"] as const)(
    "should get data-%s elements",
    (input) => {
      const message = ref("test");
      const el = new JSDOM(
        `<div id="app"><div data-${input}="message"></div></div>`
      ).window.document.body as Element;
      const elements = getElementsToBind(el, input, { message }, false);

      expect(elements).toHaveLength(1);
      expect(elements[0].value).toBe(message);
      expect(elements[0].getDeepValue()).toBe("test");
      expect(elements[0].el).toBe(el.querySelector(`[data-${input}]`));
    }
  );

  it.each(["text", "class"] as const)(
    "should get deep data-%s elements",
    (input) => {
      const message = ref({ deep: "test" });
      const el = JSDOM.fragment(
        `<div id="app"><div data-${input}="message.deep"></div></div>`
      ).firstChild as Element;
      const elements = getElementsToBind(el, input, { message }, false);

      expect(elements).toHaveLength(1);
      expect(elements[0].value).toBe(message);
      expect(elements[0].getDeepValue()).toBe("test");
      expect(elements[0].el).toBe(el.querySelector(`[data-${input}]`));
    }
  );

  it.each(["text", "class"] as const)(
    "should get nested data-%s elements",
    (input) => {
      const message = ref("test");
      const el = JSDOM.fragment(
        `<div id="app"><div><div data-${input}="message"></div></div></div>`
      ).firstChild as Element;
      const elements = getElementsToBind(el, input, { message }, false);

      expect(elements).toHaveLength(1);
      expect(elements[0].value).toBe(message);
      expect(elements[0].getDeepValue()).toBe("test");
      expect(elements[0].el).toBe(el.querySelector(`[data-${input}]`));
    }
  );

  it.each(["text", "class"] as const)(
    "should get multiple data-%s elements",
    (input) => {
      const message = ref("test");
      const el = JSDOM.fragment(
        `<div id="app"><div data-${input}="message"></div><div data-${input}="message"></div><div data-${input}="message"></div></div>`
      ).firstChild as Element;
      const elements = getElementsToBind(el, input, { message }, false);

      expect(elements).toHaveLength(3);
      Object.values(elements).forEach((item, i) => {
        expect(item.value).toBe(message);
        expect(item.getDeepValue()).toBe("test");
        expect(item.el).toBe(el.querySelectorAll(`[data-${input}]`)[i]);
      });
    }
  );
});
