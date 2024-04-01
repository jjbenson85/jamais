import "./styles.css";

import { DEBUG } from "./signal";
import type { Directive } from "./types";
import { ifDirective } from "./directives/ifDirective";
import { textDirective } from "./directives/textDirective";
import { classDirective } from "./directives/classDirective";
import { modelDirective } from "./directives/modelDirective";
import { bindDirective } from "./directives/bindDirective";
import { eventDirective } from "./directives/eventDirective";
import { switchDirective } from "./directives/switchDirective";
import { forDirective } from "./directives/forDirective";
import { scopeDirective } from "./directives/scopeDirective";
import { keyDirective } from "./directives/keyDirective";
import { bindDirectives } from "./bindDirectives";
import { defineComponent } from "./JComponent";
import { setupComponents } from "./setupComponents";

// declare globalThis directives
declare global {
  interface Window {
    $directives: Directive[];
  }
}

export function setup(
  data: Record<string, unknown>,
  options: {
    attach: string | HTMLElement;
    components?: Record<string, ReturnType<typeof defineComponent>>;
    directives?: Directive[];
    debug?: boolean;
  },
  _document: Document = document,
) {
  if (options.debug) {
    DEBUG.value = true;
  }

  const directives = [
    ...(options.directives ?? []),
    scopeDirective,
    forDirective,
    eventDirective,
    ifDirective,
    switchDirective,
    textDirective,
    classDirective,
    modelDirective,
    keyDirective,
    bindDirective,
  ];

  globalThis.window.$directives = directives;
  const el =
    typeof options.attach === "string"
      ? _document.querySelector<HTMLElement>(options.attach)
      : options.attach;

  if (!el) throw new Error("No element found");

  const destroyMap = new WeakMap<HTMLElement, () => void>();
  // const observer = new MutationObserver((mutations, observer) => {
  //   for (const mutation of mutations) {
  //     for (const node of mutation.addedNodes) {
  //       if (node instanceof HTMLElement) {
  //         const destroy = mount(node);
  //         destroyMap.set(node, destroy);
  //       }
  //     }
  //     for (const node of mutation.removedNodes) {
  //       if (node instanceof HTMLElement) {
  //         const destroy = destroyMap.get(node);
  //         if (destroy) {
  //           destroy();
  //           destroyMap.delete(node);
  //         }
  //       }
  //     }
  //   }
  // });

  // observer.observe(el, { childList: true, subtree: true });

  const components = options.components ?? {};
  setupComponents(components);
  const mount = (el: HTMLElement) => bindDirectives(el, data, directives);
  const destroy = mount(el);
  destroyMap.set(el, destroy);
}
