import "./extendMatchers";

import { ref } from "../ref";
import { setup } from "../setup";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("setupFors", () => {
  it("should loop over the data-for elements", async () => {
    const items = ref(["a", "b", "c"]);
    const document = new JSDOM(
      `
      <div id="app">
        <div data-for="$item in items" data-text="$item"></div>
      </div>`,
      {}
    ).window.document;
    setup(() => ({ items }), document).attach("#app");
    await wait();
    expect(document.querySelector("#app")?.innerHTML).toBeInnerHTML(
      `
      <div data-text="$item">a</div>
      <div data-text="$item">b</div>
      <div data-text="$item">c</div>`
    );
  });
  it.todo("should handle nested loops", async () => {
    const items = ref([
      ["a.1", "a.2", "a.3"],
      ["b.1", "b.2", "b.3"],
    ]);
    const dom = `
    <div id="app">
        <div data-for="$item in items">
            <div data-for="$subItem in subItems" data-text="$subItem"></div>
        </div>
    </div>`;
    const document = new JSDOM(dom.replaceAll(/\n/g, "")).window.document;
    setup(() => ({ items }), document).attach("#app");
    await wait();
    const innerHTML = document.querySelector("#app")?.innerHTML;
    expect(innerHTML).toBeInnerHTML(
      `
      <div> 
        <div data-text="$subItem">a.1</div> 
        <div data-text="$subItem">a.2</div> 
        <div data-text="$subItem">a.3</div> 
      </div> 
      <div> 
        <div data-text="$subItem">b.1</div> 
        <div data-text="$subItem">b.2</div> 
        <div data-text="$subItem">c.3</div> 
      </div>`
    );
  });
});
