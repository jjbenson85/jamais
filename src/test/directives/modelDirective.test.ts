import "@/test/extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { modelDirective } from "@/directives/modelDirective";
import { spyConsoleError, wait } from "@/test/utils";
import { createEffect, signal } from "@/signal";

const spyConsole = spyConsoleError();

globalThis.window = new JSDOM("<!doctype html><html><body></body></html>")
  .window as unknown as Window & typeof globalThis;
globalThis.document = globalThis.window.document;
globalThis.navigator = globalThis.window.navigator;
globalThis.HTMLElement = globalThis.window.HTMLElement;

describe("modelDirective", () => {
  it("should match the data-model attribute", () => {
    const el = JSDOM.fragment('<input :data-model="message" />')
      .firstChild as HTMLElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    expect(modelDirective.matcher(attr)).toBe(true);
  });

  it("should bind input to refs", async () => {
    const el = JSDOM.fragment('<input :data-model="message" />')
      .firstChild as HTMLInputElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = signal("");
    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    });
    effect && createEffect(effect);

    el.value = "Test input";

    const event = document.createEvent("Event");
    event.initEvent("input", true, false);
    el.dispatchEvent(event);

    await wait();

    expect(message.value).toBe("Test input");
  });

  it("should bind refs to inputs", async () => {
    const el = JSDOM.fragment('<input :data-model="message" />')
      .firstChild as HTMLInputElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = signal("");

    message.value = "Test message";

    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    });
    effect && createEffect(effect);

    await wait();

    expect(el.value).toBe("Test message");
  });

  it("should warn when trying to bind a non-signal to a model", () => {
    const el = JSDOM.fragment('<input :data-model="message" />')
      .firstChild as HTMLInputElement;

    const attr = el?.attributes.item(0);

    if (!el || !attr) throw new Error("No element found");

    const message = "test";

    const effect = modelDirective.mounted(el, attr.name, attr.value, {
      message,
    });
    effect && createEffect(effect);

    expect(spyConsole).toBeCalledWith(
      "Can only bind signals with :data-model.\n\n" +
        '<input :data-model="message">\n' +
        "message is not a signal",
    );
  });
});
