import { evaluateExpression } from "../helpers/evaluateExpression";
import { isSignal } from "../signal";
import { Directive } from "./types";

// const getClosestIf = (el: HTMLElement) => {
//   const closestIf = el.parentElement?.querySelector("[\\j-if]");
//   const closestElseIf = [
//     ...(el.parentElement?.querySelectorAll("[j-else-if]") ?? []),
//   ].at(-1);
//   return closestElseIf || closestIf;
// };

const isValidSibling = (el: HTMLElement, attrName: string) => {
  const prevNode = el.previousSibling;
  const prevEl = el.previousElementSibling;
  if (
    !(
      prevNode?.textContent === "j-if" ||
      prevNode?.textContent === "j-else-if" ||
      prevEl?.hasAttribute?.("j-if") ||
      prevEl?.hasAttribute?.("j-else-if")
    )
  ) {
    console.error(`${attrName} must directly follow an element with j-if or j-else-if.

        ${el.outerHTML}
    `);
  }
};

const isValidAttrValue = (
  el: HTMLElement,
  attrName: string,
  attrValue: string,
) => {
  if (attrName === "j-else-if" && !attrValue) {
    console.warn(`j-else-if expects a value

          ${el.outerHTML}`);
  }
};

export const ifDirective: Directive = {
  name: "ifDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) => ["j-if", "j-else-if", "j-else"].includes(attr.name),

  mounted: (el, attrName, attrValue, data) => {
    if (["j-else-if", "j-else"].includes(attrName)) {
      isValidAttrValue(el, attrName, attrValue);
      isValidSibling(el, attrName);
      // skip the else and else-if as they are handled by the if
      return;
    }

    // LINTER
    if (!attrValue) {
      console.error("j-if expects a value");
      return;
    }

    const siblings = Array.from(el.parentElement?.children ?? []);

    const elseIfEls = siblings.filter((e) => e.hasAttribute("j-else-if"));
    const elseEl = siblings.find((e) => e.hasAttribute("j-else"));
    const els = [el, ...elseIfEls, elseEl].filter((e): e is HTMLElement =>
      Boolean(e),
    );
    const comments = [
      document.createComment("j-if"),
      ...elseIfEls.map(() => document.createComment("j-else-if")),
      document.createComment("j-else"),
    ];

    const elseAttrs = elseIfEls.map((e) => e.getAttribute("j-else-if"));

    // Checked in setupBindDirectives
    const parentEl = el.parentElement;

    // Called inside createEffect to register with the signals
    const effect = () => {
      const elValue = evaluateExpression(attrValue, data);
      const elseValues = elseAttrs.map((e) =>
        e ? evaluateExpression(e, data) : undefined,
      );
      const getValues = [elValue, ...elseValues, true];

      // TODO: LINTER
      //TODO: IF a value is a signal creata a console.warning and suggest calling get
      if (getValues.some(isSignal)) {
        console.warn("Signals should be called with .get() in the template");
      }

      //Display the first element that is true
      const elToDisplay = els.find((_, i) => getValues[i]);

      //Hide all elements
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const comment = comments[i];

        if (el === elToDisplay) {
          parentEl.appendChild(el);
          comment.remove();
          continue;
        }

        el.remove();
        parentEl.appendChild(comment);
      }
    };

    return effect;
  },
};
