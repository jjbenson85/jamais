import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

export const bindDirective: Directive = {
  name: "bindDirective",
  matcher: (attr: Attr) => attr.name.startsWith(":"),
  mounted: (el, attrName, attrValue, data) => {
    return () => {
      const unknownValue = evaluateExpression(attrValue, data);
      el.setAttribute(attrName.slice(1), String(unknownValue));
    };
  },
};