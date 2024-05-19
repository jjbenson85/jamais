import { evaluateExpression } from "../helpers/evaluateExpression";

import { Directive } from "./types";

export const elseDirective: Directive = {
  name: "elseDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) => attr.name === "j-else",

  mounted: (el, _attrName, attrValue, data) => {
    if (attrValue !== "") {
      console.error(`j-else does not take an argument.

        Did you mean j-else-if?

          ${el.outerHTML}
      `);
      return;
    }

    const previousEls = Array.from(el.parentElement.children).filter(
      (child): child is HTMLElement => {
        return child.hasAttribute("j-else-if") || child.hasAttribute("j-if");
      },
    );

    if (!previousEls.length) {
      console.error(`j-else must be directly after an element with j-if or j-else-if.

          ${el.outerHTML}
      `);
      return;
    }

    const previousAttrValues = previousEls
      .map((el) => {
        const val = el.getAttribute("j-else-if") ?? el.getAttribute("j-if");
        return val;
      })
      .filter((e): e is string => e !== null);

    const parentEl = el.parentElement;

    const effect = () => {
      const previousVals = previousAttrValues.map((attrValue) =>
        evaluateExpression(attrValue, data, el.outerHTML),
      );
      if (!previousVals.some(Boolean)) {
        parentEl.insertAdjacentElement("afterend", el);
      } else {
        el.remove();
      }
    };
    return effect;
  },
};
