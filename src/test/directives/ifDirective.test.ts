import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { ifDirective } from "../../directives/ifDirective";
import { createEffect, signal } from "../../signal";

globalThis.document = new JSDOM().window.document;
describe("ifDirective", () => {
  it("should match the data-if attribute", () => {
    globalThis.document.body.innerHTML = '<div :data-if="show"></div>';
    const el = document.querySelector<HTMLElement>("div");
    const attr = el?.attributes.item(0);
    if (!el || !attr) throw new Error("No element found");

    expect(ifDirective.matcher(attr)).toBe(true);
  });

  it("should apply the initial data-if", () => {
    globalThis.document.body.innerHTML =
      '<div :data-if="show.get()">Test</div>';
    const el = document.querySelector<HTMLElement>("div");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const data = { show: signal(true) };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb);

    expect(document.querySelector("[\\:data-if]"))
      .toBeTruthy();
  });

  it("should remove the element when the value is false", async () => {
    globalThis.document.body.innerHTML =
      '<div :data-if="show.get()">Test</div>';
    const el = document.querySelector<HTMLElement>("div");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    show.set(false);

    expect(document.querySelector('[\\:data-if]')).toBe(null);
  });

  it("should hide the else element when value is initialised as true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    expect(document.querySelector('[\\:data-else]')).toBeFalsy();
    expect(document.querySelector('[\\:data-if]')).toBeTruthy();
  });

  it("should show the else element when value is initialised as false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    expect(document.querySelector("[\\:data-if]")).toBeFalsy();
    expect(document.querySelector("[\\:data-else]")).toBeTruthy();
  });

  it("should show the else element when value is updated to false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    show.set(false);

    expect(document.querySelector("[\\:data-if]")).toBeFalsy();
    expect(document.querySelector("[\\:data-else]")).toBeTruthy();
  });

  it("should hide the else element when value is updated to true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    show.set(true);

    expect(document.querySelector("[\\:data-if]"))
      .toBeTruthy();
    expect(document.querySelector("[\\:data-else]"))
      .toBeFalsy();
  });

  it("should show else-if when value is updated to true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else-if="showElseIf.get()">Else If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);
    const showElseIf = signal(true);

    const data = { show, showElseIf };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    show.set(false);

    expect(document.querySelector("[\\:data-if]"))
      .toBeFalsy();
    expect(document.querySelector("[\\:data-else-if]"))
      .toBeTruthy();
    expect(document.querySelector("[\\:data-else]"))
      .toBeFalsy();

  });

  it("should hide else-if when value is updated to false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else-if="showElseIf.get()">Else If</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);
    const showElseIf = signal(true);

    const data = { show, showElseIf };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    showElseIf.set(false);

    expect(document.querySelector("[\\:data-if]"))
      .toBeFalsy();
    expect(document.querySelector("[\\:data-else-if]"))
      .toBeFalsy();
    expect(document.querySelector("[\\:data-else]"))
      .toBeTruthy();
  });

  it("should handle multiple else-if", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div :data-if="show.get()">If</div>
          <div :data-else-if="showElseIf.get()">Else If</div>
          <div :data-else-if="showElseIf2.get()">Else If 2</div>
          <div :data-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement>("[\\:data-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);
    const showElseIf = signal(false);
    const showElseIf2 = signal(true);

    const data = { show, showElseIf, showElseIf2 };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data,{});
    cb && createEffect(cb, "ifDirective");

    show.set(false);

    expect(document.querySelector("[\\:data-if]"))
      .toBeFalsy();
    expect(document.querySelector("[\\:data-else-if=\"showElseIf.get()\"]"))
      .toBeFalsy();
    expect(document.querySelector("[\\:data-else-if=\"showElseIf2.get()\"]"))
      .toBeTruthy();
    expect(document.querySelector("[\\:data-else]"))
      .toBeFalsy();

  });
});
