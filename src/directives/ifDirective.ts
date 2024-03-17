import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";
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
  const closestIf = el.parentElement?.querySelector("[\\:data-if]");
  const closestElseIf = [
    ...(el.parentElement?.querySelectorAll("[\\:data-else-if]") ?? []),
  ].at(-1);
  return closestElseIf || closestIf;
};

export const ifDirective: Directive = {
  name: "ifDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (attr: Attr) =>
    [":data-if", ":data-else-if", ":data-else"].includes(attr.name),

  mounted: (el, attrName, attrValue, data) => {
    // skip the else and else-if as they are handled by the if
    if (attrName === ":data-else" || attrName === ":data-else-if") {
      if (
        !(
          el.previousElementSibling?.hasAttribute(":data-if") ||
          el.previousElementSibling?.hasAttribute(":data-else-if")
        )
      ) {
        const str = `${attrName} must directly follow an element with data-if or data-else-if.`;
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
      console.error("data-if expects a value");
      return;
    }

    const siblings = getSiblings(el);
    const elses = siblings.filter((e) => e.hasAttribute(":data-else-if"));
    const elseEl = siblings.find((e) => e.hasAttribute(":data-else"));
    const els = [el, ...elses, elseEl].filter((e): e is HTMLElement =>
      Boolean(e),
    );

    const elseAttrs = elses.map((e) => e.getAttribute(":data-else-if"));

    // Called inside createEffect to register with the signals
    const effect = () => {
      const elValue = evaluateExpression(attrValue, data);
      const elseValues = elseAttrs.map((e) =>
        e ? evaluateExpression(e, data) : undefined,
      );
      const getValues = [elValue, ...elseValues, true];

      //TODO: IF a value is a signal creata a console.warning and suggest calling get
      if (getValues.some(isSignal)) {
        console.warn("Signals should be called with .get() in the template");
      }

      //Hide all elements
      for (const el of els) el.style.display = "none";

      //Display the first element that is true
      const elToDisplay = els.find((_, i) => getValues[i]);
      if (elToDisplay === undefined) return;
      elToDisplay.style.display = "unset";
    };

    return effect;
  },
};
