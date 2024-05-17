import { Directive } from "./types";
import { evaluateExpression } from "../helpers/evaluateExpression";
import { isSignal } from "../signal";
import { getValue } from "../helpers/getValueFromUnknown";

const getSiblings = (el: Element): Element[] => {
  const els: Element[] = [];
  let nextEl = el.nextElementSibling;
  while (nextEl) {
    els.push(nextEl);
    nextEl = nextEl.nextElementSibling;
  }
  return els;
};

const createErrStr = (el: Element, attrName: string) => {
  return `${attrName} is trying to use a signal\n\n${
    el.outerHTML
  }\n\nTry calling ${el.getAttribute(attrName)} with .get()\n\n\n`;
};

const exampleString =
  'eg:\n\n<div>\n\t<div j-switch="greeting.get()" j-case="hello">Hello!</div>\n\t<div j-case="hi">Hi</div>\n\t<div :j-case="custom.get()" j-text="custom.get()"></div>\n\t<div j-default>Howdy</div>\n</div>';

export const switchDirective: Directive = {
  name: "switchDirective",
  matcher: (attr: Attr) =>
    ["j-switch", "j-case", ":j-case", "j-default"].includes(attr.name),
  mounted: (el, attrName, attrValue, data) => {
    // skip theses as they are handled by the switch
    if (["j-case", ":j-case", "j-default"].includes(attrName)) {
      if (
        !(
          el.hasAttribute("j-switch") ||
          el.previousElementSibling?.getAttribute("j-switch") ||
          el.previousElementSibling?.getAttribute(":j-case") ||
          el.previousElementSibling?.getAttribute("j-case")
        )
      ) {
        console.error(
          `${attrName} must directly follow an element with j-switch or :j-case.\n\nTry placing\n\n${el.outerHTML}\n\ndirectly after the j-switch or :j-case.\n\n${exampleString}`,
        );
      }
      return;
    }

    if (!el.hasAttribute(":j-case") && !el.hasAttribute("j-case")) {
      console.error(
        `j-switch expects a j-case attribute\n\n${el.outerHTML}\n\n${exampleString}`,
      );
      return;
    }
    const siblings = [el, ...getSiblings(el)];
    const staticCases = siblings.filter((e) => e.hasAttribute("j-case"));
    const dynmaicCases = siblings.filter((e) => e.hasAttribute(":j-case"));
    const defaultCase = siblings.find((e) => e.hasAttribute("j-default"));

    const cases = [...staticCases, ...dynmaicCases, defaultCase].filter(
      (e): e is Element => Boolean(e),
    );

    const effect = () => {
      const staticValues = staticCases.map((el) => el.getAttribute("j-case"));

      const dynamicValues = dynmaicCases.map((el) => {
        const attrValue = el.getAttribute(":j-case");
        if (!attrValue) return undefined;
        return evaluateExpression(attrValue, data, ":j-case");
      });

      const _unknownValue = evaluateExpression(attrValue, data, "j-switch");
      const unknownValue = getValue(_unknownValue);
      const values = [...staticValues, ...dynamicValues, true];

      if (values.some(isSignal)) {
        values.forEach((_value, i) => {
          if (!isSignal(_value)) return;
          const el = cases[i];
          el && console.error(createErrStr(el, ":j-case"));
        });
      }

      for (const el of cases) (el as HTMLElement).style.display = "none";

      const elToDisplay = cases.find((_, i) => unknownValue === values[i]);
      (elToDisplay as HTMLElement).style.display = "unset";
    };

    return effect;
  },
};
