import { createDirective } from "../bindDirectives";
import { getPropertyFromPath, toValue } from "../helpers";
import { isRef } from "../ref";
import { SetupBits } from "../setup";

function makeGetValue(data: Record<string, SetupBits>, attrValue: string) {
  const [key, restKey] = attrValue.split(".", 2);
  if (restKey) {
    const value = data[key];
    return () => getPropertyFromPath(toValue(value), restKey);
  }
  return () => getPropertyFromPath(data, attrValue);
}

function makeGetPreviousValue(
  data: Record<string, SetupBits>,
  attrValue: string
) {
  const [key, restKey] = attrValue.split(".", 2);
  const value = data[key];

  if (!isRef(value)) return () => undefined;
  if (!restKey) return () => value.previousValue;

  return () => getPropertyFromPath(value.previousValue, restKey);
}
type AttrItem = {
  attrPrefix: string;
  attrValue: string;
  attrModifiers: string[];
  value: unknown;
  get: () => unknown;
  getPrevious: () => unknown;
  effect: (fn: () => void) => void;
};
export const bindDirective = createDirective((ctx) => {
  const { data, el, attrValue: _attrValue, effect, get } = ctx;
  if (!_attrValue) return;

  const attrValueArr = _attrValue.split(" ");
  const attrs = attrValueArr.map((attr) => {
    let attrPrefix = "";
    let attrValue = "";
    let attrModifiers = [] as string[];

    const isPrefixed = attr.includes(":");
    if (isPrefixed) {
      [attrPrefix, attrValue] = attr.split(":");

      [attrPrefix, ...attrModifiers] = attrPrefix.split(".");
    } else {
      attrValue = attr;
    }
    const dataValue = data[attrValue];
    const get = makeGetValue(data, attrValue);
    const getPrevious = makeGetPreviousValue(data, attrValue);
    const attrItem: AttrItem = {
      value: dataValue,
      attrPrefix,
      attrValue,
      attrModifiers,
      get,
      getPrevious,
      effect: (fn) => {
        if (isRef(dataValue)) {
          dataValue.addProcessQueueWatcher(fn);
        }
      },
    };
    return attrItem;
  });

  for (const attr of attrs) {
    const { attrPrefix, effect, get } = attr;
    const cb = () => {
      el.setAttribute(attrPrefix, String(get()));
    };
    effect(cb);
    cb();
  }
});
