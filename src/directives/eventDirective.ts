import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

export const eventDirective: Directive = {
  name: "eventDirective",
  matcher: (attr: Attr) => attr.name.startsWith("@"),
  mounted: (el, attrName, attrValue, data) => {
    const eventName = attrName.slice(1);
    el.addEventListener(eventName, (event) => {
      const expr = evaluateExpression(
        attrValue,
        { ...data, $event: event },
        `@${eventName}`,
      );
      if (typeof expr === "function") {
        // call action if it hasn't already been called in expression
        expr();
      }
    });
    return undefined;
  },
};
