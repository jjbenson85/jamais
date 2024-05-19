import { evaluateExpression } from "@/helpers/evaluateExpression";
import { Directive } from "./types";

export const eventDirective: Directive = {
  name: "eventDirective",
  matcher: (attr: Attr) => attr.name.startsWith("@"),
  mounted: (el, attrName, attrValue, data) => {
    const [eventName, eventArgs] = attrName.slice(1).split(".");

    const getValue = (event: Event) =>
      evaluateExpression(
        attrValue,
        { ...data, $event: event },
        `@${eventName}`,
      );
    const callFn = (event: Event) => {
      const value = getValue(event);
      if (typeof value === "function") {
        // call action if it hasn't already been called in expression
        value();
      }
    };

    if (eventArgs) {
      el.addEventListener(eventName, (event) => {
        if (
          event instanceof KeyboardEvent &&
          event.key.toLowerCase() === eventArgs
        ) {
          callFn(event);
        }
      });
    } else {
      el.addEventListener(eventName, callFn);
    }
    return undefined;
  },
};
