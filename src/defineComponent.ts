import { setupBindDirectives } from "./directives/setupBindDirectives";
import { evaluateExpression } from "./helpers/evaluateExpression";
interface Constructable {
  new (...args: never[]): unknown;
}

type PType = { required: boolean; type: Constructable };
type Opts<
  PropNames extends string,
  Props extends Record<PropNames, any>,
  PropConstructor extends Record<PropNames, PType>,
> = {
  name: string;
  template: string;
  style?: string;
  props?: PropConstructor;
  setup?: (props: Props) => Record<string, unknown>;
  components?: Record<string, ComponentConstructor>;
  onMounted?: () => void;
};

export type ComponentConstructor = (
  el: HTMLElement,
  scope: Record<string, unknown>,
  components: Record<string, ComponentConstructor>,
) => HTMLElement;

export const defineComponent = <
  PropNames extends string,
  Props extends Record<PropNames, any>,
  PropConstructor extends Record<PropNames, PType>,
>(
  options: Opts<PropNames, Props, PropConstructor>,
): ComponentConstructor => {
  return (el, _scope, _components) => {
    el.innerHTML = options.template;
    const scopeFromProps = {} as Props;

    const ps = options.props;
    for (const _key in ps) {
      const key = _key as unknown as keyof PropConstructor & string;
      const prop = ps[key];
      const constr = "type" in prop ? prop.type : prop;
      const required = "required" in prop ? prop.required : false;
      const keyValue = el.attributes.getNamedItem(key)?.value;
      const bindKeyValue = el.attributes.getNamedItem(`:${key}`)?.value;
      if (keyValue) {
        const key = _key as unknown as keyof Props;
        if (constr.name !== "String") {
          console.warn(
            `Prop ${key as string} is not a string\n\n${el.outerHTML}`,
          );
        }

        scopeFromProps[key] = keyValue as Props[keyof Props];
      } else if (bindKeyValue) {
        const key = _key as unknown as keyof Props;
        const bindValue = evaluateExpression(bindKeyValue, _scope);
        if (!(bindValue instanceof constr)) {
          console.warn(
            `Prop ${key as string} is not a ${constr.name}\n\n${el.outerHTML}`,
          );
        }
        scopeFromProps[key] = bindValue as Props[keyof Props];
      } else if (required) {
        console.warn(`Prop ${key as string} is missing\n\n${el.outerHTML}`);
      }
    }

    const data = options.setup?.(scopeFromProps) ?? {};

    const child = el.firstElementChild as HTMLElement | null;
    if (child) {
      setupBindDirectives(child, data, {
        ..._components,
        ...options.components,
      });
    }

    options.onMounted?.();

    // if (options.style) {
    //   const style = document.createElement("style");
    //   style.textContent = options.style;
    //   el.appendChild(style);
    // }
    return el;
  };
};
// function assertType<T>(key: any): key is T { return key; }
