import { bind } from "./bind";
import type { Directive } from "./bindDirectives";
import type { Component } from "./defineComponent";

export const bindComponents = ({
  components,
  data,
  directives,
  el: parentEl,
}: {
  components: Record<string, Component>;
  data: Record<string, unknown>;
  directives: Record<string, Directive>;
  el: HTMLElement;
}) => {
  for (const [componentName, component] of Object.entries(components ?? {})) {
    const componentElems =
      parentEl.querySelectorAll<HTMLElement>(`${componentName}`) ?? [];
    for (const componentEl of componentElems) {
      if (!componentEl.parentElement) {
        console.error("No parent element for", componentEl);
        return;
      }

      const componentHTMLArr = component({
        componentName,
        componentEl,
        directives,
        components,
        data,
      });

      for (const componentHTML of componentHTMLArr) {
        componentEl.parentElement.insertBefore(componentHTML, componentEl);
      }

      // bind({ components, data, el: componentEl, directives });
      componentEl.remove();
    }
  }
};
