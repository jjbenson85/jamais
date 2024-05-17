import { setupBindDirectives } from "./directives/setupBindDirectives";
import { evaluateExpression } from "./helpers/evaluateExpression";

interface Constructable {
  new(...args: never[]): unknown;
}

type Opts<
  T extends HTMLElement = HTMLElement,
  Props extends Record<
    string,
    Constructable | { required: boolean; type: Constructable }
  > = Record<
    string,
    Constructable | { required: boolean; type: Constructable }
  >,
> = {
  name: string;
  extends?: [string, new () => T];
  template: string;
  setup?(props: Props): Record<string, unknown>;
  style?: string;
  props?: Props;
  components?: Record<string, ComponentConstrucor>;
  onMounted?: () => void;
  onUnmounted?: () => void;
};

export type ComponentConstrucor = (
  el: HTMLElement,
  scope: Record<string, unknown>,
  components: Record<string, ComponentConstrucor>,
) => HTMLElement;

export const defineComponent = (options: Opts): ComponentConstrucor => {
  return (el, _scope, _components) => {
    el.innerHTML = options.template;
    const props: Record<string, unknown> = {};

    for (const key in options.props) {
      const prop = options.props[key];
      const constr = "type" in prop ? prop.type : prop;
      const required = "required" in prop ? prop.required : false;
      const keyValue = el.attributes.getNamedItem(key)?.value;
      const bindKeyValue = el.attributes.getNamedItem(`:${key}`)?.value;
      if (keyValue) {
        if (constr.name !== "String") {
          console.warn(`Prop ${key} is not a string\n\n${el.outerHTML}`);
        }

        props[key] = keyValue;
      } else if (bindKeyValue) {
        const bindValue = evaluateExpression(bindKeyValue, _scope);
        if (!(bindValue instanceof constr)) {
          console.warn(
            `Prop ${key} is not a ${constr.name}\n\n${el.outerHTML}`,
          );
        }
        props[key] = bindValue;
      } else if (required) {
        console.warn(`Prop ${key} is missing\n\n${el.outerHTML}`);
      }
    }

    const data = options.setup?.(props) ?? {};

    const child = el.firstElementChild as HTMLElement | null;
    if (child) {
      setupBindDirectives(child, data, { ..._components, ...options.components });
    }

    // if (options.style) {
    //   const style = document.createElement("style");
    //   style.textContent = options.style;
    //   el.appendChild(style);
    // }
    return el;
  };
};
