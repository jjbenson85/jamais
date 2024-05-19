import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "./types";

export const ifDirective2: Directive = {
  name: "ifDirective2",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) => attr.name === "j-if",

  mounted: (el, _attrName, attrValue, data) => {
    const parentEl = el.parentElement;
    const effect = () => {
      const value = evaluateExpression(attrValue, data, el.outerHTML);
      if (value) {
        parentEl.insertAdjacentElement("afterend", el);
      } else {
        el.remove();
      }
    };
    return effect;
  },
};
