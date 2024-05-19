import { HTMLElementWithParent } from "@/directives/types";
import "../extendMatchers";

import { ifDirective } from "@/directives/ifDirective";
import { createEffect, signal } from "@/signal";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

globalThis.document = new JSDOM().window.document;
describe("ifDirective", () => {
  it("should match the j-if attribute", () => {
    globalThis.document.body.innerHTML = '<div j-if="show"></div>';
    const el = document.querySelector<HTMLElementWithParent>("div");
    const attr = el?.attributes.item(0);
    if (!el || !attr) throw new Error("No element found");

    expect(ifDirective.matcher(attr)).toBe(true);
  });

  it("should apply the initial j-if", () => {
    globalThis.document.body.innerHTML = '<div j-if="show.get()">Test</div>';
    const el = document.querySelector<HTMLElementWithParent>("div");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const data = { show: signal(true) };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb);

    expect(document.querySelector("[j-if]")).toBeTruthy();
  });

  it("should remove the element when the value is false", async () => {
    globalThis.document.body.innerHTML = '<div j-if="show.get()">Test</div>';
    const el = document.querySelector<HTMLElementWithParent>("div");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    show.set(false);

    expect(document.querySelector("[j-if]")).toBe(null);
  });

  it("should hide the else element when value is initialised as true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    expect(document.querySelector("[j-else]")).toBeFalsy();
    expect(document.querySelector("[j-if]")).toBeTruthy();
  });

  it("should show the else element when value is initialised as false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    expect(document.querySelector("[j-if]")).toBeFalsy();
    expect(document.querySelector("[j-else]")).toBeTruthy();
  });

  it("should show the else element when value is updated to false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    show.set(false);

    expect(document.querySelector("[j-if]")).toBeFalsy();
    expect(document.querySelector("[j-else]")).toBeTruthy();
  });

  it("should hide the else element when value is updated to true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);

    const data = { show };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    show.set(true);

    expect(document.querySelector("[j-if]")).toBeTruthy();
    expect(document.querySelector("[j-else]")).toBeFalsy();
  });

  it("should show else-if when value is updated to true", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else-if="showElseIf.get()">Else If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);
    const showElseIf = signal(true);

    const data = { show, showElseIf };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    show.set(false);

    expect(document.querySelector("[j-if]")).toBeFalsy();
    expect(document.querySelector("[j-else-if]")).toBeTruthy();
    expect(document.querySelector("[j-else]")).toBeFalsy();
  });

  it("should hide else-if when value is updated to false", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else-if="showElseIf.get()">Else If</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(false);
    const showElseIf = signal(true);

    const data = { show, showElseIf };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    showElseIf.set(false);

    expect(document.querySelector("[j-if]")).toBeFalsy();
    expect(document.querySelector("[j-else-if]")).toBeFalsy();
    expect(document.querySelector("[j-else]")).toBeTruthy();
  });

  it("should handle multiple else-if", async () => {
    globalThis.document.body.innerHTML = `<div>
          <div j-if="show.get()">If</div>
          <div j-else-if="showElseIf.get()">Else If</div>
          <div j-else-if="showElseIf2.get()">Else If 2</div>
          <div j-else>Else</div>
      </div>`;
    const parent = document.body.firstChild as HTMLElement;
    const el = parent.querySelector<HTMLElement & { parentElement: HTMLElement }>("[j-if]");
    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const show = signal(true);
    const showElseIf = signal(false);
    const showElseIf2 = signal(true);

    const data = { show, showElseIf, showElseIf2 };
    const cb = ifDirective.mounted(el, attr.name, attr.value, data, {});
    cb && createEffect(cb, [], "ifDirective");

    show.set(false);

    expect(document.querySelector("[j-if]")).toBeFalsy();
    expect(
      document.querySelector('[j-else-if="showElseIf.get()"]'),
    ).toBeFalsy();
    expect(
      document.querySelector('[j-else-if="showElseIf2.get()"]'),
    ).toBeTruthy();
    expect(document.querySelector("[j-else]")).toBeFalsy();
  });
});
