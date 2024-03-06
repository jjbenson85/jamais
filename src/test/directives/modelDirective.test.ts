import "../extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { modelDirective } from "../../directives/modelDirective";
import { ref } from "../../ref";
import { spyConsoleWarn, wait } from "../utils";

const consoleWarn = spyConsoleWarn();

describe("modelDirective", () => {
  it("should bind input to refs", async () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input");
    if (!el) throw new Error("No element found");
    const message = ref("");

    modelDirective({
      data: { message },
      el,
      value: message,
      attrValue: "message",
      get: () => message.value,
      getPrevious: () => message.previousValue,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    });

    const inputEl = document.querySelector("input");
    if (!inputEl) throw new Error("No element found");
    inputEl.value = "Test input";

    const event = document.createEvent("Event");
    event.initEvent("input", true, false);
    inputEl.dispatchEvent(event);

    await wait();

    expect(message.value).toBe("Test input");
  });

  it("should bind refs to inputs", async () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input");
    if (!el) throw new Error("No element found");
    const message = ref("");

    modelDirective({
      data: { message },
      el,
      value: message,
      attrValue: "message",
      get: () => message.value,
      getPrevious: () => message.previousValue,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    });

    message.value = "Test message";

    await wait();

    const inputEl = document.querySelector("input");
    if (!inputEl) throw new Error("No element found");

    expect(inputEl.value).toBe("Test message");
  });

  it("should warn when trying to bind a model to a non-input element", () => {
    const document = new JSDOM('<div data-model="message"></div>').window
      .document;
    const el = document.body.querySelector<HTMLElement>("div");
    if (!el) throw new Error("No element found");
    const message = ref("");

    modelDirective({
      data: { message },
      el,
      value: message,
      attrValue: "message",
      get: () => message.value,
      getPrevious: () => message.previousValue,
      effect: (fn) => message.addProcessQueueWatcher(fn),
      directives: {},
    });

    expect(consoleWarn).toBeCalledWith(
      "data-model: Can only bind models to input elements",
    );
  });

  it("should warn when trying to bind a non-ref to a model", () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input");
    if (!el) throw new Error("No element found");

    const message = "test";

    modelDirective({
      data: { message },
      el,
      value: message,
      attrValue: "message",
      get: () => message,
      getPrevious: () => undefined,
      effect: () => undefined,
      directives: {},
    });

    expect(consoleWarn).toBeCalledWith("data-model: Can only bind refs");
  });
});
