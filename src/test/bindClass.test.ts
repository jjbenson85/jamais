import { ref } from "../ref";
import { bindClass } from "../bindClass";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("bindClass", () => {
  it("should update classes when a ref value update", async () => {
    const message = ref("test");
    const el = JSDOM.fragment('<div data-class="message"></div>')
      .firstChild as Element;

    bindClass({ message }, el);
    expect(el.className).toBe("test");

    message.value = "new value";
    await wait();
    expect(el.className).toBe("new value");
  });

  it("should apply the initial deep data-class", () => {
    const message = ref({ deep: "test" });
    const el = JSDOM.fragment('<div data-class="message.deep"></div>')
      .firstChild as Element;

    bindClass({ message }, el);
    expect(el.className).toBe("test");
  });
});
