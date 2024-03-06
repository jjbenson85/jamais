import { getPropertyFromPath, toValue } from "./helpers";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export type Directive = (ctx: DirectiveContext) => void;
export function createDirective(callback: Directive) {
  return callback;
}

export type DirectiveContext = {
  el: HTMLElement;
  attrValue: string | null;
  value: unknown;
  get: () => unknown;
  getPrevious: () => unknown;
  effect: (fn: () => void) => void;
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
  attrValue: string,
) {
  const [key, restKey] = attrValue.split(".", 2);
  const value = data[key];

  if (!isRef(value)) return () => undefined;
  if (!restKey) return () => value.previousValue;

  return () => getPropertyFromPath(value.previousValue, restKey);
}

export function bindDirectives(
  directives: Record<string, Directive>,
  data: Record<string, SetupBits>,
  parentEl: HTMLElement,
) {
  for (const [name, directive] of Object.entries(directives)) {
    const p: HTMLElement[] = parentEl.hasAttribute(name) ? [parentEl] : [];

    const items = [
      ...p,
      ...parentEl.querySelectorAll<HTMLElement>(`[${name}]`),
    ];

    for (const el of items) {
      const attrValue = el.getAttribute(`${name}`);
      const dataValue = attrValue ? data[attrValue] : undefined;

      const get = attrValue ? makeGetValue(data, attrValue) : () => undefined;

      const getPrevious = attrValue
        ? makeGetPreviousValue(data, attrValue)
        : () => undefined;

      const ctx: DirectiveContext = {
        el,
        attrValue,
        value: dataValue,
        get,
        getPrevious,
        effect: (fn) => {
          if (isRef(dataValue)) {
            dataValue.addProcessQueueWatcher(fn);
          }
        },
        data,
        directives,
      };
      directive(ctx);
    }
  }
}
