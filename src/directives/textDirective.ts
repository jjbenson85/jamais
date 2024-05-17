import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "./types";
import { getValue } from "../helpers/getValueFromUnknown";

export const textDirective: Directive = {
  name: "textDirective",
  matcher: (attr: Attr) => attr.name === ":data-text",
  mounted: (el, _attrName, attrValue, data) => {
    return () => {
      const unknownValue = evaluateExpression(attrValue, data, el.outerHTML);
      el.textContent = String(getValue(unknownValue));
    };
  },
};
