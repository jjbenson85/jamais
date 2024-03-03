import "./extendMatchers";
import { ref } from "../ref";
import { bindIf } from "../bindIf";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { wait } from "./utils";

describe("bindIf", () => {
  it("should apply the initial data-if", () => {
    const show = ref(true);
    const el = JSDOM.fragment('<div data-if="show"></div>')
      .firstChild as Element;

    bindIf({ show }, el);
    expect(el?.outerHTML).toBeInnerHTML('<div data-if="show"></div>');
  });

  it("should remove the element when the value is false", async () => {
    const show = ref(true);
    const el = JSDOM.fragment('<div data-if="show"></div>')
      .firstChild as Element;

    bindIf({ show }, el);
    show.value = false;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      '<div data-if="show" style="display: none;"></div>'
    );
  });

  it("should hide the else element when value is initialised as true", async () => {
    const show = ref(true);
    const el = JSDOM.fragment(
      `<div>
        <div data-if="show">If</div>
        <div data-else>Else</div>
      </div>`
    ).firstChild as Element;

    bindIf({ show }, el);
    show.value = true;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(`
    <div>
        <div data-if="show">If</div>
        <div data-else="" style="display: none;">Else</div>
    </div>`);
  });

  it("should show the else element when value is initialised as false", async () => {
    const show = ref(false);
    const el = JSDOM.fragment(
      `<div>
        <div data-if="show">If</div>
        <div data-else>Else</div>
      </div>`
    ).firstChild as Element;

    bindIf({ show }, el);

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
        <div data-if="show" style="display: none;">If</div>
        <div data-else="">Else</div>
      </div>`
    );
  });

  it("should show the else element when value is updated to false", async () => {
    const show = ref(true);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ show }, el);
    show.value = false;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="show" style="display: none;">If</div>
            <div data-else="" style="">Else</div>
        </div>`
    );
  });

  it("should hide the else element when value is updated to true", async () => {
    const show = ref(false);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="show">If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ show }, el);
    show.value = true;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="show" style="">If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`
    );
  });

  it("should show else-if on initialization", () => {
    const showIf = ref(false);
    const showElseIf = ref(true);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="showIf">If</div>
            <div data-else-if="showElseIf">Else If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ showIf, showElseIf }, el);
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="showIf" style="display: none;">If</div>
            <div data-else-if="showElseIf" style="">Else If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`
    );
  });

  it("should show else-if when value is updated to true", async () => {
    const showIf = ref(false);
    const showElseIf = ref(false);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="showIf">If</div>
            <div data-else-if="showElseIf">Else If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ showIf, showElseIf }, el);
    showElseIf.value = true;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="showIf" style="display: none;">If</div>
            <div data-else-if="showElseIf" style="">Else If</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`
    );
  });

  it("should hide else-if when value is updated to false", async () => {
    const showIf = ref(false);
    const showElseIf = ref(true);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="showIf">If</div>
            <div data-else-if="showElseIf">Else If</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ showIf, showElseIf }, el);
    showElseIf.value = false;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="showIf" style="display: none;">If</div>
            <div data-else-if="showElseIf" style="display: none;">Else If</div>
            <div data-else="" style="">Else</div>
        </div>`
    );
  });

  it("should handle multiple else-if", async () => {
    const showIf = ref(true);
    const showElseIf = ref(false);
    const showElseIf2 = ref(true);
    const el = JSDOM.fragment(
      `<div>
            <div data-if="showIf">If</div>
            <div data-else-if="showElseIf">Else If</div>
            <div data-else-if="showElseIf2">Else If 2</div>
            <div data-else>Else</div>
        </div>`
    ).firstChild as Element;

    bindIf({ showIf, showElseIf, showElseIf2 }, el);
    showIf.value = false;

    await wait();
    expect(el?.outerHTML).toBeInnerHTML(
      `<div>
            <div data-if="showIf" style="display: none;">If</div>
            <div data-else-if="showElseIf" style="display: none;">Else If</div>
            <div data-else-if="showElseIf2" style="">Else If 2</div>
            <div data-else="" style="display: none;">Else</div>
        </div>`
    );
  });
});
