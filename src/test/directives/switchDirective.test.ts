import "@/test/extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { switchDirective } from "@/directives/switchDirective";
import { wait } from "@/test/utils";
import { createEffect, signal } from "@";

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
    const el = parent?.firstElementChild as HTMLElement;
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

    effect && createEffect(effect);

    await wait();

    expect(parent?.outerHTML).toBeHTML(
      `<div>
          <div j-switch="state" j-case="One" style="display: unset;">One</div>
          <div j-case="Two" style="display: none;">Two</div>
          <div j-case="Three" style="display: none;">Three</div>
      </div>`,
    );
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
    const el = parent?.firstElementChild as HTMLElement;
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

    effect && createEffect(effect);

    state.set("Two");

    await wait();

    expect(parent?.outerHTML).toBeHTML(
      `<div>
        <div j-switch="state" j-case="One" style="display: none;">One</div>
        <div j-case="Two" style="display: unset;">Two</div>
        <div j-case="Three" style="display: none;">Three</div>
      </div>`,
    );
  });
});
