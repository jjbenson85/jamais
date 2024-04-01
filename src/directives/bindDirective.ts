import { JComponent } from "../JComponent";
import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

const isNotAPropError = (el: HTMLElement, attrName: string) => {
  console.error(`Attribute ${attrName} is not a prop in ${el.outerHTML}`);
};

const propConstructorMismatchError = (el: HTMLElement, attrName: string) => {
  console.error(`Type mismatch for ${attrName} in ${el.outerHTML}`);
};

function checkForPropErrors(
  el: JComponent,
  attrName: string,
  attrValue: string,
  data: Record<string, unknown>,
) {
  const rawProps = el.rawProps;
  const propName = attrName.slice(1);
  const propConstructor = rawProps[propName];
  if (!propConstructor) {
    isNotAPropError(el, attrName);
    return true;
  }

  const unknownValue = evaluateExpression(attrValue, data, "propDirective");

  if (unknownValue?.constructor !== propConstructor) {
    propConstructorMismatchError(el, attrName);
    return true;
  }
}

export const bindDirective: Directive = {
  name: "bindDirective",
  matcher: (attr: Attr) => attr.name.startsWith(":"),
  mounted: (el, attrName, attrValue, data) => {
    if ("isComponent" in el) {
      const elm = el as unknown as JComponent;
      const isError = checkForPropErrors(elm, attrName, attrValue, data);

      if (isError) return;

      return () => {
        const unknownValue = evaluateExpression(
          attrValue,
          data,
          "propDirective",
        );
        elm.setProp(attrName.slice(1), unknownValue);
      };
    }

    return () => {
      const unknownValue = evaluateExpression(attrValue, data, ":data-bind");
      el.setAttribute(attrName.slice(1), String(unknownValue));
    };
  },
};
