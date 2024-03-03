import { getPropertyFromPath, isObject, toPrevValue, toValue } from "./helpers";
import { SetupBits } from "./setup";

export type BindType =
  | "text"
  | "class"
  | "model"
  | "in"
  | "if"
  | "else-if"
  | "else";

type ElementToBindItem = {
  el: Element;
  value: SetupBits;
  getDeepValue: () => unknown;
  getDeepPreviousValue: () => unknown;
};

export const getSiblingElsWithBindType = (
  el: Element,
  bindType: BindType
): Element[] => {
  const els = [];
  let nextEl = el.nextElementSibling;
  while (nextEl) {
    const attr = nextEl.getAttribute(`data-${bindType}`);
    if (attr !== null) {
      els.push(nextEl);
    }
    nextEl = nextEl.nextElementSibling;
  }
  return els;
};

const getElementsWithBindType = (
  el: Element,
  bindType: BindType
): Element[] => {
  const els = el.querySelectorAll(`[data-${bindType}]`);
  return [el, ...els];
};

const attachWatchersToEls = (
  data: Record<string, SetupBits>,
  els: Element[],
  bindType: BindType
) => {
  return els.reduce((acc, element) => {
    const attrValue = element.getAttribute(`data-${bindType}`);
    if (!attrValue) return acc;

    const [key, restKey] = attrValue.split(".", 2);

    if (!(key in data)) return acc;

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

export const getElementsToBind = (
  el: Element,
  bindType: BindType,
  data: Record<string, SetupBits>
) => {
  const elz = getElementsWithBindType(el, bindType);
  return attachWatchersToEls(data, elz, bindType);
};

export const getSiblingElementsToBind = (
  el: Element,
  bindType: BindType,
  data: Record<string, SetupBits>
) => {
  const elz = getSiblingElsWithBindType(el, bindType);
  return attachWatchersToEls(data, elz, bindType);
};

