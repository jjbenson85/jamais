import { getPropertyFromPath, isObject, toPrevValue, toValue } from "./helpers";

export type BindType =
  | "text"
  | "class"
  | "model"
  | "in"
  | "if"
  | "else-if"
  | "else";

type ElementToBindItem = {
  el: HTMLElement;
  value: unknown;
  get: () => unknown;
  getPrevValue: () => unknown;
};

export const getSiblingElsWithBindType = (
  el: HTMLElement,
  bindType: BindType,
): HTMLElement[] => {
  const els = [];
  let nextEl = el.nextElementSibling as HTMLElement;
  while (nextEl) {
    const attr = nextEl.getAttribute(`data-${bindType}`);
    if (attr !== null) {
      els.push(nextEl);
    }
    nextEl = nextEl.nextElementSibling as HTMLElement;
  }
  return els;
};

const getElementsWithBindType = (
  el: HTMLElement,
  bindType: BindType,
): HTMLElement[] => {
  const els = el.querySelectorAll<HTMLElement>(`[data-${bindType}]`);
  return [el, ...els];
};

const attachWatchersToEls = (
  data: Record<string, unknown>,
  els: HTMLElement[],
  bindType: BindType,
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
      get: () => toValue(value),
      getPrevValue: () => toPrevValue(value),
    };

    if (restKey) {
      obj.get = () => getPropertyFromPath(toValue(value), restKey);
      obj.getPrevValue = () => {
        const prev = toPrevValue(value);
        return isObject(prev) ? getPropertyFromPath(prev, restKey) : undefined;
      };
    }

    acc.push(obj);
    return acc;
  }, [] as ElementToBindItem[]);
};

export const getElementsToBind = (
  el: HTMLElement,
  bindType: BindType,
  data: Record<string, unknown>,
) => {
  const elz = getElementsWithBindType(el, bindType);
  return attachWatchersToEls(data, elz, bindType);
};

export const getSiblingElementsToBind = (
  el: HTMLElement,
  bindType: BindType,
  data: Record<string, unknown>,
) => {
  const elz = getSiblingElsWithBindType(el, bindType);
  return attachWatchersToEls(data, elz, bindType);
};
