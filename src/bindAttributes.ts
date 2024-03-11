import { Directive, evaluateExpression } from "./bindDirectives";
import { isRef } from "./helpers";

export const bindAttributes = ({
  data,
  el,
  directives,
}: {
  data: Record<string, unknown>;
  el: HTMLElement;
  directives: Record<string, Directive>;
}) => {
  const directiveKeys = Object.keys(directives);

  const els = el.querySelectorAll<HTMLElement>("*");
  for (const el of els) {
    for (const attr of el.attributes) {
      const attrName = attr.name;
      const staticAttrName = attrName.replace(":", "");

      if (
        directiveKeys.includes(attr.name) ||
        directiveKeys.includes(staticAttrName)
      ) {
        continue;
      }

      if (attr.name.startsWith(":")) {
        const attrName = attr.name.replace(":", "");
        const getValue = () => evaluateExpression(attr.value, data);
        const cb = () => el.setAttribute(attrName, String(getValue()));

        const dataValue = getValue();
        if (isRef(dataValue)) {
          dataValue.addProcessQueueWatcher(cb);
        }
        cb();
      }
    }
  }
};
