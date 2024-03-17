import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";
import { isSignal } from "../signal";

const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
  typeof v === "function";

const getValueFromUnknown = (expr: unknown) => {
  if (isSignal(expr)) return expr.get();
  if (isFunction(expr)) return expr();
  return expr;
};
export const textDirective: Directive = {
  name: "textDirective",
  matcher: (attr: Attr) => attr.name === ":data-text",
  mounted: (el, _attrName, attrValue, data) => {
    return () => {
      const unknownValue = evaluateExpression(attrValue, data);
      el.textContent = String(getValueFromUnknown(unknownValue));
    };
  },
};