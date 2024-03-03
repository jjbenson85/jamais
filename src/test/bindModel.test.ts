import { bindModel } from "../bindModel";

import { describe, expect, it } from "vitest";
import { ref } from "../ref";
import { JSDOM } from "jsdom";
import { wait } from "./utils";
describe("bindModel", () => {
  it("should bind input to refs", () => {
    const document = new JSDOM('<input data-model="message"></div>').window
      .document;
    const message = ref("");

    bindModel({ message }, document.body);
    const inputEl = document.querySelector("input")!;
    inputEl.value = "c";

    var event = document.createEvent("Event");
    event.initEvent("input", true, false);
    inputEl.dispatchEvent(event);

    expect(message.value).toBe("c");
  });

  it.todo("should bind refs to inputs", async () => {
    const document = new JSDOM('<input data-model="message"></div>').window
      .document;
    const message = ref("c");

    bindModel({ message }, document.body);
    message.value = "d";
    await wait();
    const inputEl = document.querySelector("input")!;

    expect(inputEl.value).toBe("c");
  });
});
