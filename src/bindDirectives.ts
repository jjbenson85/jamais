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
  directives: Record<string, Directive>;
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
  parentEl: HTMLElement
) {
  for (const [name, directive] of Object.entries(directives)) {
    const p: HTMLElement[] = parentEl.hasAttribute(name) ? [parentEl] : [];

    [...p, ...parentEl.querySelectorAll<HTMLElement>(`[${name}]`)].forEach(
      (el) => {
        const _attrValue = el.getAttribute(`${name}`);
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
        const ctx: DirectiveContext = {
          el,
          attrs,
          data,
          directives,
        };
        directive(ctx);
      },
      [] as DirectiveContext[]
    );
  }
}
