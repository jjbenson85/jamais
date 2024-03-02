import { getPropertyFromPath, isObject, toPrevValue, toValue } from "./helpers";
import { SetupBits } from "./setup";

export type BindType = "text" | "class" | "model";

type ElementToBindItem = {
  el: Element;
  value: SetupBits;
  getDeepValue: () => unknown;
  getDeepPreviousValue: () => unknown;
};
export const getElementsToBind = (
  el: Element,
  bindType: BindType,
  data: Record<string, SetupBits>,
  insideFor: boolean
) => {
  const elz = [el, ...el.querySelectorAll(`[data-${bindType}]`)];
  return elz.reduce((acc, element) => {
    const _attrValue = element.getAttribute(`data-${bindType}`);
    if (!_attrValue) return acc;
    if (!insideFor && _attrValue.startsWith("$")) return acc;

    const attrValue = _attrValue.replace("$", "__data-for__");
    const [key, restKey] = attrValue.split(".", 2);
    const value = data[key];

    const obj: ElementToBindItem = {
      el: element,
      value,
      getDeepValue: () => toValue(value),
      getDeepPreviousValue: () => toPrevValue(value),
    };

    if (restKey) {
      obj.getDeepValue = () => getPropertyFromPath(toValue(value), restKey);
      obj.getDeepPreviousValue = () => {
        const prev = toPrevValue(value);
        return isObject(prev) ? getPropertyFromPath(prev, restKey) : undefined;
      };
    }

    acc.push(obj);
    return acc;
  }, [] as ElementToBindItem[]);
};
