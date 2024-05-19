import "@/test/extendMatchers";

import { switchDirective } from "@/directives/switchDirective";
import { HTMLElementWithParent } from "@/directives/types";
import { wait } from "@/test/utils";
import { Effect, signal } from "@jamais";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

globalThis.window = new JSDOM("<!doctype html><html><body></body></html>")
  .window as unknown as Window & typeof globalThis;
globalThis.document = globalThis.window.document;
globalThis.navigator = globalThis.window.navigator;
globalThis.HTMLElement = globalThis.window.HTMLElement;

describe("switchDirective", () => {
  it("should match the j-switch attribute", () => {
    const el = JSDOM.fragment('<div j-switch="state"></div>')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    expect(switchDirective.matcher(attr)).toBe(true);
  });

  it("should show the inital value", async () => {
    const state = signal("One");
    const parent = JSDOM.fragment(
      `<div>
        <div j-switch="state" j-case="One">One</div>
        <div j-case="Two">Two</div>
        <div j-case="Three">Three</div>
      </div>`,
    ).firstChild as HTMLElement;
    const el = parent?.firstElementChild as HTMLElementWithParent;
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = switchDirective.mounted(
      el,
      attr.name,
      attr.value,
      {
        state,
      },
      {},
    );

    effect && new Effect(effect);

    await wait();

    const elOne = parent.querySelector<HTMLElement>('[j-case="One"]');
    const elTwo = parent.querySelector<HTMLElement>('[j-case="Two"]');
    const elThree = parent.querySelector<HTMLElement>('[j-case="Three"]');

    expect(elOne?.style.display).toBe("unset");
    expect(elTwo?.style.display).toBe("none");
    expect(elThree?.style.display).toBe("none");
  });

  it("should update the value", async () => {
    const state = signal("One");
    const parent = JSDOM.fragment(
      `<div>
        <div j-switch="state" j-case="One">One</div>
        <div j-case="Two">Two</div>
        <div j-case="Three">Three</div>
    </div>
    `,
    ).firstChild as HTMLElement;
    const el = parent?.firstElementChild as HTMLElementWithParent;
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const effect = switchDirective.mounted(
      el,
      attr.name,
      attr.value,
      {
        state,
      },
      {},
    );

    effect && new Effect(effect);

    state.set("Two");

    await wait();

    const elOne = parent.querySelector<HTMLElement>('[j-case="One"]');
    const elTwo = parent.querySelector<HTMLElement>('[j-case="Two"]');
    const elThree = parent.querySelector<HTMLElement>('[j-case="Three"]');

    expect(elOne?.style.display).toBe("none");
    expect(elTwo?.style.display).toBe("unset");
    expect(elThree?.style.display).toBe("none");
  });
});
