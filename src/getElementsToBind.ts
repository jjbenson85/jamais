import { getPropertyFromPath } from "./helpers";
import { SetupBits } from "./setup";

export type BindType = "text" | "class" | "model";
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

    const value = data[attrValue.split(".")[0]];
    const getDeepValue = () => getPropertyFromPath(data, attrValue);

    const obj = { el: element, value, getDeepValue };
    acc.push(obj);
    return acc;
  }, [] as { el: Element; value: SetupBits; getDeepValue: () => unknown }[]);
};
