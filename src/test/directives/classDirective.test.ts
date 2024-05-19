import { classDirective } from "@/directives/classDirective";
import { createEffect, signal } from "@jamais";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { wait } from "@/test/utils";
import { HTMLElementWithParent } from "./types";

describe("classDirective", () => {
  it.each([
    [
      "using a signal string",
      { testClass: signal("my-signal-string-class") },
      `<div :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-string-class",
    ],
    [
      "using a signal array",
      { testClass: signal(["my-signal-array-class"]) },
      `<div :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-array-class",
    ],
    [
      "using a signal object",
      { testClass: signal({ "my-signal-object-class": true }) },
      `<div :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-object-class",
    ],
    [
      "using a function",
      { testClass: () => "my-function-class" },
      `<div :class="testClass()"></div>`,
      "testClass()",
      "my-function-class",
    ],
    [
      "using a string",
      { testClass: "my-string-class" },
      `<div :class="testClass"></div>`,
      "testClass",
      "my-string-class",
    ],
    [
      "using an array",
      { testClass: ["my-array-class"] },
      `<div :class="testClass"></div>`,
      "testClass",
      "my-array-class",
    ],
    [
      "using an object",
      { testClass: { "my-object-class": true } },
      `<div :class="testClass"></div>`,
      "testClass",
      "my-object-class",
    ],
  ])(
    "should bind a class to an element %s",
    (_id, data, html, attrValue, expected) => {
      const doc = new JSDOM(html).window.document;
      const el = doc.querySelector<HTMLElementWithParent>("div");
      if (!el) throw new Error("No element found");

      const effect = classDirective.mounted(el, ":class", attrValue, data, {});
      effect && createEffect(effect);

      expect(el.classList).toContain(expected);
    },
  );

  it.each([
    [
      "using a signal string",
      { testClass: signal("my-signal-string-class") },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-string-class",
    ],
    [
      "using a signal array",
      { testClass: signal(["my-signal-array-class"]) },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-array-class",
    ],
    [
      "using a signal object",
      { testClass: signal({ "my-signal-object-class": true }) },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-object-class",
    ],
    [
      "using a function",
      { testClass: () => "my-function-class" },
      `<div class="existing-class" :class="testClass()"></div>`,
      "testClass()",
      "my-function-class",
    ],
    [
      "using a string",
      { testClass: "my-string-class" },
      `<div class="existing-class" :class="testClass"></div>`,
      "testClass",
      "my-string-class",
    ],
    [
      "using an array",
      { testClass: ["my-array-class"] },
      `<div class="existing-class" :class="testClass"></div>`,
      "testClass",
      "my-array-class",
    ],
    [
      "using an object",
      { testClass: { "my-object-class": true } },
      `<div class="existing-class" :class="testClass"></div>`,
      "testClass",
      "my-object-class",
    ],
  ])(
    "should merge existing classes with bound classes on an element %s",
    (_id, data, html, attrValue, _expected) => {
      const doc = new JSDOM(html).window.document;
      const el = doc.querySelector("div");
      if (!el) throw new Error("No element found");

      const effect = classDirective.mounted(el as HTMLElementWithParent, ":class", attrValue, data, {});
      effect && createEffect(effect);

      expect(el.classList).toContain("existing-class");
    },
  );

  it.each([
    [
      "using a signal string",
      { testClass: signal("my-signal-string-class") },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-string-class",
    ],
    [
      "using a signal array",
      { testClass: signal(["my-signal-array-class"]) },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-array-class",
    ],
    [
      "using a signal object",
      { testClass: signal({ "my-signal-object-class": true }) },
      `<div class="existing-class" :class="testClass.get()"></div>`,
      "testClass.get()",
      "my-signal-object-class",
    ],
  ])(
    "should remove classes that are no longer bound %s",
    async (_id, data, html, attrValue, expected) => {
      const doc = new JSDOM(html).window.document;
      const el = doc.querySelector("div");
      if (!el) throw new Error("No element found");

      const effect = classDirective.mounted(el, ":class", attrValue, data, {});
      effect && createEffect(effect);

      //@ts-ignore
      data.testClass.set(undefined);
      await wait();

      expect(el.classList).not.toContain(expected);
    },
  );
});
