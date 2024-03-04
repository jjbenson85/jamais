import { getPropertyFromPath, toValue } from "./helpers";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export type Directive = (ctx: DirectiveContext) => void;
export function createDirective(callback: Directive) {
  return callback;
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
export type DirectiveContext = {
  el: HTMLElement;
  attrs: AttrItem[];
  data: Record<string, SetupBits>;
};

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
  if (restKey) {
    const value = data[key];
    return () => getPropertyFromPath(toValue(value), restKey);
  }
  return () => getPropertyFromPath(data, attrValue);
}

export function bindDirectives(
  directives: Record<string, Directive>,
  data: Record<string, SetupBits>,
  el: HTMLElement
) {
  for (const [name, directive] of Object.entries(directives)) {
    console.log({ name, el });
    el.querySelectorAll<HTMLElement>(`[${name}]`).forEach((el) => {
      console.log({ el });
      const _attrValue = el.getAttribute(`${name}`);
      if (!_attrValue) return;
      const attrValueArr = _attrValue.split(" ");
      const attrs = attrValueArr.map((attr) => {
        const [_prefix, value] = attr.split(":");
        const [prefix, ...attrModifiers] = _prefix.split(".");
        const attrValue = value ? value : prefix;
        const attrPrefix = value ? prefix : "";
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
      const ctx: DirectiveContext = {
        el,
        attrs,
        data,
      };
      directive(ctx);
    }, [] as DirectiveContext[]);
  }
}
