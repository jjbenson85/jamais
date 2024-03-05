import "../extendMatchers";

import { DirectiveContext } from "../../bindDirectives";
import { ifDirective } from "../../directives/ifDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../../ref";
import { wait } from "../utils";

describe("ifDirective", () => {
  it("should apply the initial data-if", () => {
    const show = ref(true);
    const el = JSDOM.fragment('<div data-if="show"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    expect(el?.outerHTML).toBeHTML('<div data-if="show" style=""></div>');
  });

  it("should remove the element when the value is false", async () => {
    const show = ref(true);
    const el = JSDOM.fragment('<div data-if="show"></div>')
      .firstChild as HTMLElement;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    show.value = false;

    await wait();
    expect(el?.outerHTML).toBeHTML(
      '<div data-if="show" style="display: none;"></div>'
    );
  });

  it("should hide the else element when value is initialised as true", async () => {
    const show = ref(true);
    const parent = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);

    expect(parent?.outerHTML).toBeHTML(`
        <div>
            <div data-if="show" style="">If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`);
  });

  it("should show the else element when value is initialised as false", async () => {
    const show = ref(false);
    const parent = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
        <div>
            <div data-if="show" style="display: none;">If</div>
            <div data-else="" style="">Else</div>
        </div>`);
  });
  it("should show the else element when value is updated to false", async () => {
    const show = ref(true);
    const parent = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    show.value = false;

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
        <div>
            <div data-if="show" style="display: none;">If</div>
            <div data-else="" style="">Else</div>
        </div>`);
  });
  it("should hide the else element when value is updated to true", async () => {
    const show = ref(false);
    const parent = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    show.value = true;

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
        <div>
            <div data-if="show" style="">If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`);
  });
  it("should show else-if when value is updated to true", async () => {
    const show = ref(true);
    const showElseIf = ref(true);
    const parent = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else-if="showElseIf">Else If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show, showElseIf },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    show.value = false;

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
        <div>
            <div data-if="show" style="display: none;">If</div>
            <div data-else-if="showElseIf" style="">Else If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`);
  });
  it("should hide else-if when value is updated to false", async () => {
    const show = ref(false);
    const showElseIf = ref(true);
    const parent = JSDOM.fragment(
      `<div>
                <div data-if="show">If</div>
                <div data-else-if="showElseIf">Else If</div>
                <div data-else>Else</div>
            </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show, showElseIf },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    showElseIf.value = false;

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
            <div>
                <div data-if="show" style="display: none;">If</div>
                <div data-else-if="showElseIf" style="display: none;">Else If</div>
                <div data-else="" style="">Else</div>
            </div>`);
  });
  it("should handle multiple else-if", async () => {
    const show = ref(false);
    const showElseIf = ref(false);
    const showElseIf2 = ref(true);
    const parent = JSDOM.fragment(
      `<div>
                <div data-if="show">If</div>
                <div data-else-if="showElseIf">Else If</div>
                <div data-else-if="showElseIf2">Else If 2</div>
                <div data-else>Else</div>
            </div>`
    ).firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("div")!;

    const ctx: DirectiveContext = {
      data: { show, showElseIf, showElseIf2 },
      el,
      attrs: [
        {
          value: show,
          attrPrefix: "",
          attrValue: "show",
          attrModifiers: [],
          get: () => show.value,
          getPrevious: () => show.previousValue,
          effect: () => {},
        },
      ],
      directives: {},
    };

    ifDirective(ctx);
    showElseIf2.value = false;
    show.value = true;

    await wait();
    expect(parent?.outerHTML).toBeHTML(`
            <div>
                <div data-if="show" style="">If</div>
                <div data-else-if="showElseIf" style="display: none;">Else If</div>
                <div data-else-if="showElseIf2" style="display: none;">Else If 2</div>
                <div data-else="" style="display: none;">Else</div>
            </div>`);
  });
});
