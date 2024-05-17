import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

export const scopeDirective: Directive = {
  name: "scopeDirective",
  matcher: (attr: Attr) => attr.name === ":data-scope",
  mounted: (_el, _attrName, attrValue, data) => {
    return () => {
      // Add warning here
      Object.assign(data, evaluateExpression(attrValue, data));
    };
  },
};
