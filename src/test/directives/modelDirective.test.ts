import "@/test/extendMatchers";

import { modelDirective } from "@/directives/modelDirective";
import { HTMLElementWithParent } from "@/directives/types";
import { createEffect, signal } from "@/signal";
import { spyConsoleError, wait } from "@/test/utils";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const spyConsole = spyConsoleError();

globalThis.window = new JSDOM("<!doctype html><html><body></body></html>")
  .window as unknown as Window & typeof globalThis;
globalThis.document = globalThis.window.document;
globalThis.navigator = globalThis.window.navigator;
globalThis.HTMLElement = globalThis.window.HTMLElement;

describe("modelDirective", () => {
  it("should match the data-model attribute", () => {
    const el = JSDOM.fragment('<input j-model="message" />')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    expect(modelDirective.matcher(attr)).toBe(true);
  });

  it("should bind input to refs", async () => {
    const dom = new JSDOM(`<input j-model="message" />`);
    const el = dom.window.document.querySelector<HTMLElementWithParent<HTMLInputElement>>('input');

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = signal("");
    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    }, {});
    effect && createEffect(effect);

    el.value = "Test input";

    el.dispatchEvent(new dom.window.InputEvent('input'));

    await wait();

    expect(message.value).toBe("Test input");
  });

  it("should bind refs to inputs", async () => {
    const el = JSDOM.fragment('<input j-model="message" />')
      .firstChild as HTMLElementWithParent<HTMLInputElement>;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = signal("");

    message.value = "Test message";

    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    }, {});
    effect && createEffect(effect);

    await wait();

    expect(el.value).toBe("Test message");
  });

  it("should warn when trying to bind a non-signal to a model", () => {
    const el = JSDOM.fragment('<input j-model="message" />')
      .firstChild as HTMLElementWithParent<HTMLInputElement>;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = "test";

    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    }, {});
    effect && createEffect(effect);

    expect(spyConsole).toBeCalledWith(
      "Can only bind signals with j-model.\n\n" +
      '<input j-model="message">\n' +
      "message is not a signal",
    );
  });
});
