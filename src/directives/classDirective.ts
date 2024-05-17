import { cls } from "@helpers/cls";
import { evaluateExpression } from "@helpers/evaluateExpression";
import { getValue } from "@helpers/getValueFromUnknown";
import { Directive } from "./types";

export const classDirective: Directive = {
  name: "classDirective",
  matcher: (attr: Attr) => attr.name === ":class",
  mounted: (el, _attrName, attrValue, data) => {
    let prevClasses: string[] = [];
    return () => {
      const prev = prevClasses;
      // TODO: Can we move this out of the CB?
      const expr = evaluateExpression(attrValue, data, ":class");
      const value = getValue(expr);
      if (value === null) {
        console.error(`${value} can not be assigned to as a class`);
        return;
      }
      if (
        typeof value === "object" ||
        typeof value === "string" ||
        value === undefined
      ) {
        // TODO: Improve type guards
        const curr = cls(value as string)
          .split(" ")
          .filter(Boolean);
        prevClasses = curr;

        prev.length && el.classList.remove(...prev);
        curr.length && el.classList.add(...curr);
      }
    };
  },
};
