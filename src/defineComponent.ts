import { bind } from "./bind";
import { Directive, evaluateExpression } from "./bindDirectives";
import { computed } from "./computed";
import { toValue } from "./helpers";
import { isRef } from "./ref";

export type Component = (args: {
  componentName: string;
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
    emits?: string[];
    components?: Record<string, Component>;
  }): Component =>
  ({
    componentEl,
    directives,
    components: globalComponents,
    data,
    componentName,
  }) => {
    const scope = createNewScope(
      componentEl,
      componentName,
      data,
      expectedProps,
    );

    const el = document.createElement("div");
    el.innerHTML = template;

    scope.$class = getStaticOrDynamicClass(componentEl, data);

    const components = { ...globalComponents, ...localComponents };

    bind({ components, data: scope, el, directives });

    return el.children as unknown as HTMLElement[];
  };

function createNewScope(
  el: HTMLElement,
  componentName: string,
  data: Record<string, unknown>,
  expectedProps: string[] = [],
) {
  const [scope, missingProps] = expectedProps.reduce(
    ([scope, missingProps], prop) => {
      const attrValue = el.getAttribute(prop);
      const dataAttrValue = el.getAttribute(`\:${prop}`);

      if (!attrValue && !dataAttrValue) {
        missingProps.push(prop);
      } else if (dataAttrValue) {
        scope[prop] = evaluateExpression(dataAttrValue, data);
      } else if (attrValue) {
        scope[prop] = attrValue;
      }

      return [scope, missingProps];
    },
    [{}, []] as [{ [key: string]: unknown }, string[]],
  );

  if (missingProps.length) {
    const error = `Missing props: ${missingProps.join(", ")} in ${
      el.outerHTML
    } but required in <${componentName}>`;
    console.error(error);
  }

  return scope;
}

function getStaticOrDynamicClass(
  el: HTMLElement,
  data: Record<string, unknown>,
) {
  const keyOfScope = el.getAttribute(":class");
  let valueFromScope: unknown;

  if (keyOfScope) {
    valueFromScope = evaluateExpression(keyOfScope, data);
  }

  const str = el.getAttribute("class") ?? "";

  if (!isRef(valueFromScope)) `${str} ${valueFromScope}`.trim();

  return computed([valueFromScope], () =>
    `${str} ${toValue(valueFromScope)}`.trim(),
  );
}

