import { evaluateStatement } from "../helpers/evaluateExpression";
import { Directive } from "./types";

export const effectDirective: Directive = {
  name: "effectDirective",
  matcher: (attr: Attr) => attr.name === "j-effect",
  mounted: (el, _attrName, attrValue, data) => {
    return () => {
      evaluateStatement(
        attrValue,
        {
          ...data,
          $el: el,
        },
        el.outerHTML,
      );
    };
  },
};
