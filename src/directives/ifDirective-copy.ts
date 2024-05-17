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
  matcher: (attr: Attr) =>
    ["j-if", "j-else-if", "j-else"].includes(attr.name),

  mounted: (el, attrName, attrValue, data) => {
    // skip the else and else-if as they are handled by the if
    if (attrName === "j-else" || attrName === "j-else-if") {
      if (
        !(
          el.previousElementSibling?.hasAttribute("j-if") ||
          el.previousElementSibling?.hasAttribute("j-else-if")
        )
      ) {
        const str = `${attrName} must directly follow an element with j-if or j-else-if.

        ${el.previousElementSibling?.outerHTML} is not a valid element to follow.`;
        console.error(str);

        const closest = getClosestIf(el);
        if (closest) {
          console.info(
            `Try moving \t\t${el.outerHTML}\n\nbelow\t\t${closest.outerHTML}`,
          );
        }
      }
      return;
    }

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

    const elseAttrs = elses.map((e) => e.getAttribute("j-else-if"));
    const parentEl = el.parentElement;
    //Hide all elements
    for (const el of els) {
      // el.remove();
    }

    let currentEl = el;
    // Called inside createEffect to register with the signals
    const effect = () => {
      const elValue = evaluateExpression(attrValue, data, attrName);
      const elseValues = elseAttrs.map((e) =>
        e ? evaluateExpression(e, data, attrName) : undefined,
      );
      const getValues = [elValue, ...elseValues, true];

      if (getValues.some(isSignal)) {
        //TODO: IF a value is a signal creata a console.warning and suggest calling get
        console.warn("Signals should be called with .get() in the template");
      }

      //Display the first element that is true
      const elToDisplay = els.find((_, i) => getValues[i]);
      const elsToHide = els.filter((el) => el !== elToDisplay);
      for (const el of elsToHide) {
        el.remove();
      }
      if (elToDisplay === undefined) {
        currentEl.remove();
        return;
      }

      currentEl.replaceWith(elToDisplay);
      currentEl = elToDisplay;
    };

    return effect;
  },
};
