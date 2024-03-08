import { bind } from "./bind";
import { getPropertyFromPath, toValue } from "./helpers";
import { isRef } from "./ref";

export type Directive =
  | ((ctx: DirectiveContext) => void)
  | ((ctx: DirectiveContext) => HTMLElement[]);

export function createDirective(callback: Directive) {
  return callback;
}

export type DirectiveContext = {
  el: HTMLElement;
  attrValue: string | null;
  value: unknown;
  get: () => unknown;
  getPrevious?: () => unknown;
  effect?: (fn: () => void) => void;
  data: Record<string, unknown>;
  directives: Record<string, Directive>;
};

export function makeGetValue(
  data: Record<string, unknown>,
  attrValue: string | null,
) {
  if (!attrValue) return () => undefined;
  const [key, restKey] = attrValue.split(".", 2);
  if (restKey) {
    const value = data[key];
    return () => getPropertyFromPath(toValue(value), restKey);
  }
  return () => getPropertyFromPath(data, attrValue);
}

export function makeGetPreviousValue(
  data: Record<string, unknown>,
  attrValue: string | null,
): (() => unknown) | undefined {
  if (!attrValue) return undefined;

  const [key, restKey] = attrValue.split(".", 2);
  const value = data[key];

  if (!isRef(value)) return undefined;
  if (!restKey) return () => value.previousValue;

  return () => getPropertyFromPath(value.previousValue, restKey);
}

export function bindDirectives({
  data,
  directives,
  el: parentEl,
}: {
  data: Record<string, unknown>;
  directives: Record<string, Directive>;
  el: HTMLElement;
}) {
  const brandNewEls: HTMLElement[] = [];
  for (const [name, directive] of Object.entries(directives)) {
    const parentElWithAttr: HTMLElement[] = parentEl.hasAttribute?.(name)
      ? [parentEl]
      : [];

    const descendantsWithAttr = parentEl.querySelectorAll<HTMLElement>(
      `[${name}]`,
    );
    const elemsWithAttr = [...parentElWithAttr, ...descendantsWithAttr];

    for (const el of elemsWithAttr) {
      const attrValue = el.getAttribute(`${name}`);
      const dataValue = data[attrValue ?? ""];

      const newEls = directive({
        el,
        attrValue,
        value: dataValue,
        get: makeGetValue(data, attrValue),
        getPrevious: makeGetPreviousValue(data, attrValue),
        effect: isRef(dataValue)
          ? (fn) => dataValue.addProcessQueueWatcher(fn)
          : undefined,
        data,
        directives,
      });

      brandNewEls.push(...(newEls ?? []));
    }
  }
  if (brandNewEls.length) {
    bind({ components: {}, data, directives, el: parentEl });
  }
}
