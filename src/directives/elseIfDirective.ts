import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "./types";

export const elseIfDirective: Directive = {
  name: "elseIfDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) => attr.name === "j-else-if",

  mounted: (el, attrName, attrValue, data) => {
    if (!attrValue) {
      console.warn(`${attrName} must be supplied with a condition.

        Did you mean j-else?

          ${el.outerHTML}
      `);
      return;
    }

    const closestEls = Array.from(el.parentElement.children).filter(
      (child): child is HTMLElement => {
        return child.hasAttribute("j-else-if") || child.hasAttribute("j-if");
      },
    );

    const idx = closestEls.findIndex((child) => child === el);

    const previousEls = closestEls.slice(0, idx);

    const previousAttrValues = previousEls.map((el) => {
      const attrValue =
        el.getAttribute("j-if-else") ?? el.getAttribute("j-if") ?? "";
      return attrValue;
    });

    if (!closestEls.length) {
      console.error(`${attrName} must be inside an element with j-if or j-else-if.

          ${el.outerHTML}
      `);
      return;
    }

    const parentEl = el.parentElement;

    const effect = () => {
      const value = evaluateExpression(attrValue, data, el.outerHTML);
      const previousVals = previousAttrValues.map((attrValue) =>
        evaluateExpression(attrValue, data, el.outerHTML),
      );

      if (!previousVals.some(Boolean) && value) {
        parentEl.insertAdjacentElement("afterend", el);
      } else {
        el.remove();
      }
    };
    return effect;
  },
};
