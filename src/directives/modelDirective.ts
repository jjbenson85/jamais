import { evaluateExpression } from "../helpers/evaluateExpression";
import { isSignal } from "../signal";
import { Directive } from "./types";

export const modelDirective: Directive = {
  name: "modelDirective",
  matcher: (attr: Attr) => attr.name === "j-model",
  mounted: (el, attrName, attrValue, data) => {
    const signal = evaluateExpression(attrValue, data, attrName);

    if (!isSignal(signal)) {
      let str = `Can only bind signals with ${attrName}.\n\n${el.outerHTML}`;
      const suffix = attrValue.match(/\..*\(.*\)/)?.at(0);
      if (suffix) {
        str += `\n\nTry removing ${suffix} on ${attrValue}\n\n`;
      } else {
        str += `\n${attrValue} is not a signal`;
      }
      console.error(str);
      return;
    }
    const toOriginalValue =
      typeof signal.get() === "number"
        ? (value: string) => Number(value)
        : (value: string) => value;

    el.addEventListener("input", (e) => {
      if (!(e.type === "input")) return;
      const target = e.target as HTMLInputElement;
      const isCheckbox = target.type === "checkbox";
      const value = isCheckbox ? target.checked : toOriginalValue(target.value);

      signal.set(value, { msg: "modelDirective" });
    });

    return () => {
      (el as HTMLInputElement).value = String(signal.get());
    };
  },
};
