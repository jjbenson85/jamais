import "./extendMatchers";

import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { setup } from "../setup";
import { wait } from "./utils";
import { signal } from "../signal";

globalThis.window = new JSDOM("<!doctype html><html><body></body></html>")
  .window as unknown as Window & typeof globalThis;
globalThis.document = globalThis.window.document;
globalThis.navigator = globalThis.window.navigator;
globalThis.HTMLElement = globalThis.window.HTMLElement;

describe("setup", () => {
  it("should create a setup", async () => {
    const message = signal("test");
    document.body.innerHTML =
      '<div id="app"><div :data-text="message.get()"></div></div>';

    setup({ message }, { attach: "#app" }, document);

    await wait();

    expect(document.body.querySelector("div")?.textContent).toBe("test");
  });

  it("should update dom when a ref value update", async () => {
    const message = signal("test");
    document.body.innerHTML =
      '<div id="app"><div :data-text="message.get()"></div></div>';

    setup({ message }, { attach: "#app" }, document);

    expect(document.querySelector("div")?.textContent).toBe("test");

    message.set("new value");

    await wait();

    expect(document.querySelector("div")?.textContent).toBe("new value");
  });

  it("should update classes when a ref value updates", async () => {
    document.body.innerHTML =
      '<div id="app"><div :class="message.get()"></div></div>';

    const el = document.querySelector<HTMLElement>(
      '[\\:class="message.get()"]',
    );
    if (!el) throw new Error("No element found");

    const message = signal("my-old-class");

    setup({ message }, { attach: "#app" }, document);

    expect(el.className).toBe("my-old-class");

    message.set("my-new-class");

    await wait();

    expect(el.className).toBe("my-new-class");
  });

  it("should call a click event when a click method is passed", () => {
    const handleClick = vi.fn();
    document.body.innerHTML =
      '<div id="app"><button @click="handleClick()"></button></div>';

    setup({ handleClick }, { attach: "#app" }, document);

    const button = document.querySelector("button");

    button?.click();

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("should bind a value to an attribute", async () => {
    document.body.innerHTML = `
    <div id="app">
      <div :a-random-attribute="testLabel"></div>
    </div>`;

    const el = document.querySelector<HTMLElement>(
      '[\\:a-random-attribute="testLabel"]',
    );

    setup({ testLabel: "This is a test label" }, { attach: "#app" }, document);

    await wait();

    expect(el?.getAttribute("a-random-attribute")).toBe("This is a test label");
  });

  it.skip("should use a template", async () => {
    global.document = new JSDOM().window.document;
    global.document.body.innerHTML = `
    <div id="app">
      <template name="my-template">
        <div :data-text="templateText"></div>
      </template>

      <div data-template="my-template"></div>
      <div data-template="my-template"></div>
      <div data-template="my-template"></div>
    </div>`;

    setup({ templateText: "I am a Template" }, { attach: "#app" }, document);

    await wait();

    expect(document.body.innerHTML).toBeHTML(`
    <div id="app">
      <template name="my-template">
        <div :data-text="templateText.get()"></div>  
      </template>
  
      <div :data-text="templateText">I am a Template</div>
      <div :data-text="templateText">I am a Template</div>
      <div :data-text="templateText">I am a Template</div>
    </div>`);
  });

  // it("should add a component", async () => {
  //   global.document = new JSDOM().window.document;
  //   global.document.body.innerHTML = `
  //   <div id="app">
  //     <MyComponent :message="messageText1"></MyComponent>
  //     <MyComponent :message="messageText2"></MyComponent>
  //     <MyComponent :message="messageText3"></MyComponent>
  //   </div>`;

  //   setup(
  //     {
  //       messageText1: "I am a Component 1",
  //       messageText2: "I am a Component 2",
  //       messageText3: "I am a Component 3",
  //     },
  //     {
  //       attach: "#app",
  //       components: {
  //         MyComponent: defineComponent({
  //           template: '<div :data-text="message"></div>',
  //           props: ["message"],
  //         }),
  //       },
  //     },
  //     document,
  //   );

  //   await wait();

  //   expect(document.body.innerHTML).toBeHTML(`
  //   <div id="app">
  //     <div :data-text="message">I am a Component 1</div>
  //     <div :data-text="message">I am a Component 2</div>
  //     <div :data-text="message">I am a Component 3</div>
  //   </div>`);
  // });

  // it.skip("should add a component with a data-for", async () => {
  //   global.document = new JSDOM().window.document;
  //   global.document.body.innerHTML = `
  //   <div id="app">
  //     <MyComponent data-for="item in items" item="item"></MyComponent>
  //   </div>`;

  //   setup(
  //     {
  //       items: ["item1", "item2", "item3"],
  //     },
  //     {
  //       attach: "#app",
  //       components: {
  //         MyComponent: defineComponent({
  //           template: '<div data-text="item"></div>',
  //           props: ["item"],
  //         }),
  //       },
  //     },
  //     document,
  //   );

  //   await wait();

  //   expect(document.body.innerHTML).toBeHTML(`
  //   <div id="app">
  //     <div data-text="item">item1</div>
  //     <div data-text="item">item2</div>
  //     <div data-text="item">item3</div>
  //   </div>`);
  // });
});
