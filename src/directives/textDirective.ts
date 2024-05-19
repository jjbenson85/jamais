import { evaluateExpression } from "../helpers/evaluateExpression";
import { getValue } from "../helpers/getValueFromUnknown";
import { Directive } from "./types";

export const textDirective: Directive = {
  name: "textDirective",
  matcher: (attr: Attr) => attr.name === "j-text",
  mounted: (el, _attrName, attrValue, data) => {
    if (el.innerHTML.trim()) {
      console.warn(`Elements will be removed when using j-text:
        ${el.innerHTML.trim()}
from
        ${el.outerHTML.trim()}`);
    }
    return () => {
      const unknownValue = evaluateExpression(attrValue, data, el.outerHTML);
      el.textContent = String(getValue(unknownValue));
    };
  },
};
