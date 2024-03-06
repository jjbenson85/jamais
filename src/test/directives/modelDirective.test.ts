import "../extendMatchers";

import { modelDirective } from "../../directives/modelDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../../ref";
import { wait, spyConsoleWarn } from "../utils";

const consoleWarn = spyConsoleWarn();

describe("modelDirective", () => {
  it("should bind input to refs", async () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input")!;
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

    const inputEl = document.querySelector("input")!;
    inputEl.value = "Test input";

    var event = document.createEvent("Event");
    event.initEvent("input", true, false);
    inputEl.dispatchEvent(event);

    await wait();

    expect(message.value).toBe("Test input");
  });

  it("should bind refs to inputs", async () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input")!;
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

    const inputEl = document.querySelector("input")!;

    expect(inputEl.value).toBe("Test message");
  });

  it("should warn when trying to bind a model to a non-input element", () => {
    const document = new JSDOM('<div data-model="message"></div>').window
      .document;
    const el = document.body.querySelector<HTMLElement>("div")!;
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
      "data-model: Can only bind models to input elements"
    );
  });

  it("should warn when trying to bind a non-ref to a model", () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const el = document.body.querySelector<HTMLElement>("input")!;
    const message = "test";

    modelDirective({
      data: { message },
      el,

      value: message as any,

      attrValue: "message",

      get: () => message,
      getPrevious: () => undefined,
      effect: () => undefined,

      directives: {},
    });

    expect(consoleWarn).toBeCalledWith("data-model: Can only bind refs");
  });
});
