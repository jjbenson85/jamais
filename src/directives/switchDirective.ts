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
  'eg:\n\n<div>\n\t<div :data-switch="greeting.get()" data-case="hello">Hello!</div>\n\t<div data-case="hi">Hi</div>\n\t<div :data-case="custom.get()" :data-text="custom.get()"></div>\n\t<div data-default>Howdy</div>\n</div>';

export const switchDirective: Directive = {
  name: "switchDirective",
  matcher: (attr: Attr) =>
    [":data-switch", "data-case", ":data-case", "data-default"].includes(
      attr.name,
    ),
  mounted: (el, attrName, attrValue, data) => {
    // skip theses as they are handled by the switch
    if (["data-case", ":data-case", "data-default"].includes(attrName)) {
      if (
        !(
          el.hasAttribute(":data-switch") ||
          el.previousElementSibling?.getAttribute(":data-switch") ||
          el.previousElementSibling?.getAttribute(":data-case") ||
          el.previousElementSibling?.getAttribute("data-case")
        )
      ) {
        console.error(
          `${attrName} must directly follow an element with :data-switch or :data-case.\n\nTry placing\n\n${el.outerHTML}\n\ndirectly after the :data-switch or :data-case.\n\n${exampleString}`,
        );
      }
      return;
    }

    if (!el.hasAttribute(":data-case") && !el.hasAttribute("data-case")) {
      console.error(
        `:data-switch expects a data-case attribute\n\n${el.outerHTML}\n\n${exampleString}`,
      );
      return;
    }
    const siblings = [el, ...getSiblings(el)];
    const staticCases = siblings.filter((e) => e.hasAttribute("data-case"));
    const dynmaicCases = siblings.filter((e) => e.hasAttribute(":data-case"));
    const defaultCase = siblings.find((e) => e.hasAttribute("data-default"));

    const cases = [...staticCases, ...dynmaicCases, defaultCase].filter(
      (e): e is Element => Boolean(e),
    );

    const effect = () => {
      const staticValues = staticCases.map((el) =>
        el.getAttribute("data-case"),
      );

      const dynamicValues = dynmaicCases.map((el) => {
        const attrValue = el.getAttribute(":data-case");
        if (!attrValue) return undefined;
        return evaluateExpression(attrValue, data, ":data-case");
      });

      const _unknownValue = evaluateExpression(attrValue, data, ":data-switch");
      const unknownValue = getValue(_unknownValue);
      const values = [...staticValues, ...dynamicValues, true];


      if (values.some(isSignal)) {
        values.forEach((_value, i) => {
          if (!isSignal(_value)) return;
          const el = cases[i];
          el && console.error(createErrStr(el, ":data-case"));
        });
      }

      for (const el of cases) (el as HTMLElement).style.display = "none";

      const elToDisplay = cases.find((_, i) => unknownValue === values[i]);
      (elToDisplay as HTMLElement).style.display = "unset";
    };

    return effect;
  },
};
