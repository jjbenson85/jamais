import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { switchDirective } from "../../directives/switchDirective";
import { ref } from "../../ref";
import { wait } from "../utils";

describe("switchDirective", () => {
  it("should show the inital value", async () => {
    const state = ref("One");
    const el = JSDOM.fragment(
      `<div data-switch="state">
        <div data-case="One">One</div>
        <div data-case="Two">Two</div>
        <div data-case="Three">Three</div>
    </div>
    `,
    ).firstChild as HTMLElement;

    switchDirective({
      data: { state },
      el,
      dataValue: state,
      attrValue: "show",
      get: () => state.value,
      getPrevious: () => state.previousValue,
      effect: (fn) => state.addProcessQueueWatcher(fn),

      directives: {},
      components: {},
    });

    await wait();

    expect(el?.outerHTML).toBeHTML(`
    <div data-switch="state">
        <div data-case="One">One</div>
        <div data-case="Two" style="display: none;">Two</div>
        <div data-case="Three" style="display: none;">Three</div>
    </div>`);
  });

  it("should update the value", async () => {
    const state = ref("One");
    const el = JSDOM.fragment(
      `<div data-switch="state">
        <div data-case="One">One</div>
        <div data-case="Two">Two</div>
        <div data-case="Three">Three</div>
    </div>
    `,
    ).firstChild as HTMLElement;

    switchDirective({
      data: { state },
      el,
      dataValue: state,
      attrValue: "show",
      get: () => state.value,
      getPrevious: () => state.previousValue,
      effect: (fn) => state.addProcessQueueWatcher(fn),
      directives: {},
      components: {},
    });

    state.value = "Two";

    await wait();

    expect(el?.outerHTML).toBeHTML(`
    <div data-switch="state">
        <div data-case="One" style="display: none;">One</div>
        <div data-case="Two" style="">Two</div>
        <div data-case="Three" style="display: none;">Three</div>
    </div>`);
  });
});
