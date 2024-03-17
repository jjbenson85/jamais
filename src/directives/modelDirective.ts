import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";
import { isSignal } from "../signal";

export const modelDirective: Directive = {
  name: "modelDirective",
  matcher: (attr: Attr) => attr.name === ":data-model",
  mounted: (el, attrName, attrValue, data) => {
    const signal = evaluateExpression(attrValue, data);

    if (!isSignal(signal)) {
      let str = `Can only bind signals with ${attrName}.\n\n${el.outerHTML}`;
      const suffix = attrValue.match(/\..*\(.*\)/)?.at(0);
      if (suffix) {
        str += `\n\nTry removing ${suffix} on ${attrValue}\n\n`;
      } else {
        str += `\nn${attrValue} is not a signal\n`;
      }
      console.error(Error(str));
      return;
    }

    const toOriginalValue =
      signal.get() === "number"
        ? (value: string) => Number(value)
        : (value: string) => value;

    el.addEventListener("input", (e: Event) => {
      signal.set(toOriginalValue((e.target as HTMLInputElement).value));
    });

    return () => {
      (el as HTMLInputElement).value = String(signal.get());
    };
  },
};