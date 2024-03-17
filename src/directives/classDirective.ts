import { cls } from "../helpers/cls";
import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

export const classDirective: Directive = {
  name: "classDirective",
  matcher: (attr: Attr) => attr.name === ":class",
  mounted: (el, _attrName, attrValue, data) => {
    let prevClasses: string[] = [];
    return () => {
      const prev = prevClasses;
      const expr = evaluateExpression(attrValue, data);
      const curr = cls(expr).split(" ").filter(Boolean);
      prevClasses = curr;

      prev.length && el.classList.remove(...prev);
      curr.length && el.classList.add(...curr);
    };
  },
};