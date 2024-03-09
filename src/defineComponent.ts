import { bind } from "./bind";
import { Directive, evaluateExpression } from "./bindDirectives";
import { computed } from "./computed";
import { toValue } from "./helpers";
import { isRef } from "./ref";

function getValue(attrValue: string, data: Record<string, unknown>) {
  let dataValue: unknown = attrValue.replace(/{{|}}/g, "");

  const isExpression = dataValue !== attrValue;
  if (isExpression) {
    dataValue = evaluateExpression(attrValue, data);
  }

  return dataValue;
}

export type Component = (args: {
  name: string;
  componentEl: HTMLElement;
  directives: Record<string, Directive>;
  components: Record<string, Component>;
  data: Record<string, unknown>;
}) => HTMLElement[];

export const defineComponent =
  ({
    template,
    props: expectedProps,
    components: localComponents,
  }: {
    template: string;
    props?: string[];
    components?: Record<string, Component>;
  }): Component =>
  ({ componentEl, directives, components: globalComponents, data, name }) => {
    const props = {} as Record<string, unknown>;

    for (const prop of expectedProps ?? []) {
      const attrValue = componentEl.getAttribute(prop);

      if (!attrValue) {
        console.error(
          `Missing prop: ${prop} in ${componentEl.outerHTML} is missing but expected in ${name}`,
        );
        continue;
      }

      props[prop] = getValue(attrValue, data);
    }

    const el = document.createElement("div");
    el.innerHTML = template;

    // Get class or data-class applied to component invocation
    // and pass to component template as $class
    const dataClassAttr = componentEl.getAttribute("data-class");
    const $class = componentEl.getAttribute("class") ?? "";
    const dataClassValue = getValue(dataClassAttr ?? "", data);

    if (isRef(dataClassValue)) {
      props.$class = computed([dataClassValue], () => {
        return `${$class} ${toValue(dataClassValue)}`;
      });
    } else {
      props.$class = `${$class} ${dataClassValue}`;
    }

    const components = { ...globalComponents, ...localComponents };

    bind({ components, data: props, el, directives });

    return el.children as unknown as HTMLElement[];
  };