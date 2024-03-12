import { describe, expect, it } from "vitest";
import { bindDirectives } from "../bindDirectives";
import { JSDOM } from "jsdom";
import { ref } from "../ref";
import { wait } from "./utils";
import { textDirective } from "../directives/textDirective";
import { classDirective } from "../directives/classDirective";

describe("bindDirectives", () => {
  it("should bind a text directive to an element", async () => {
    const message = ref("test");
    const myClass = ref("my-class");
    const el = JSDOM.fragment(
      '<div :data-text="message" :class="myClass"></div>',
    ).firstChild as HTMLElement;

    bindDirectives({
      el,
      data: { message, myClass },
      directives: {
        "data-text": textDirective,
        class: classDirective,
      },
      components: {},
    });

    await wait();

    expect(el.textContent).toBe("test");
    expect(el.className).toBe("my-class");
  });
});
