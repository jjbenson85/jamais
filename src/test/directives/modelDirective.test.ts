import "../extendMatchers";

import { modelDirective } from "../../directives/modelDirective";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { ref } from "../../ref";
import { wait } from "../utils";

describe("modelDirective", () => {
  it("should bind input to refs", async () => {
    const document = new JSDOM('<input data-model="message" />').window
      .document;
    const message = ref("");
    const el = document.body.querySelector<HTMLElement>("input")!;

    modelDirective({
      data: { message },
      el,
      attrs: [
        {
          value: message,
          attrPrefix: "",
          attrValue: "message",
          attrModifiers: [],
          get: () => message.value,
          getPrevious: () => message.previousValue,
          effect: (fn) => message.addProcessQueueWatcher(fn),
        },
      ],
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
    const message = ref("");
    const el = document.body.querySelector<HTMLElement>("input")!;

    modelDirective({
      data: { message },
      el,
      attrs: [
        {
          value: message,
          attrPrefix: "",
          attrValue: "message",
          attrModifiers: [],
          get: () => message.value,
          getPrevious: () => message.previousValue,
          effect: (fn) => message.addProcessQueueWatcher(fn),
        },
      ],
      directives: {},
    });

    message.value = "Test message";

    await wait();

    const inputEl = document.querySelector("input")!;

    expect(inputEl.value).toBe("Test message");
  });
});
