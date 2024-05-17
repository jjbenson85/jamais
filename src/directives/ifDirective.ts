import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "./types";
import { isSignal } from "../signal";

const getSiblings = (el: HTMLElement): HTMLElement[] => {
  const els: HTMLElement[] = [];
  let nextEl = el.nextElementSibling as HTMLElement;
  while (nextEl) {
    els.push(nextEl);
    nextEl = nextEl.nextElementSibling as HTMLElement;
  }
  return els;
};

const getClosestIf = (el: HTMLElement) => {
  const closestIf = el.parentElement?.querySelector("[\\j-if]");
  const closestElseIf = [
    ...(el.parentElement?.querySelectorAll("[j-else-if]") ?? []),
  ].at(-1);
  return closestElseIf || closestIf;
};

export const ifDirective: Directive = {
  name: "ifDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) => ["j-if", "j-else-if", "j-else"].includes(attr.name),

  mounted: (el, attrName, attrValue, data) => {
    // skip the else and else-if as they are handled by the if
    if (attrName === "j-else" || attrName === "j-else-if") {
      // TODO: LINTER
      // if (
      //   !(
      //     el.previousSibling?.hasAttribute("j-if") ||
      //     el.previousSibling?.hasAttribute("j-else-if")
      //   )
      // ) {
      //   const str = `${attrName} must directly follow an element with j-if or j-else-if.`;
      //   console.error(str);

      //   const closest = getClosestIf(el);
      //   if (closest) {
      //     console.info(
      //       `Try moving \t\t${el.outerHTML}\n\nbelow\t\t${closest.outerHTML}`,
      //     );
      //   }
      // }
      return;
    }

    // LINTER
    if (!attrValue) {
      console.error("j-if expects a value");
      return;
    }

    const siblings = getSiblings(el);
    const elses = siblings.filter((e) => e.hasAttribute("j-else-if"));
    const elseEl = siblings.find((e) => e.hasAttribute("j-else"));
    const els = [el, ...elses, elseEl].filter((e): e is HTMLElement =>
      Boolean(e),
    );
    const comments = els.map((e) => document.createComment("j-if"));

    const elseAttrs = elses.map((e) => e.getAttribute("j-else-if"));

    const parentEl = el.parentElement;

    // Should always be true
    if (!parentEl) {
      console.warn("j-if must be a child of an element");
      return;
    }

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
