import { bind } from "./bind";
import { computed } from "./computed";
import { Component } from "./defineComponent";
import { toPrevValue, toValue } from "./helpers";
import { isRef } from "./ref";

export type Directive =
  | ((ctx: DirectiveContext) => void)
  | ((ctx: DirectiveContext) => HTMLElement[]);

export function defineDirective(callback: Directive) {
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
  components: Record<string, Component>;
};

// export function makeGetValue(
//   data: Record<string, unknown>,
//   attrValue: string | null,
// ) {
//   if (!attrValue) return () => undefined;
//   const [key, restKey] = attrValue.split(".", 2);
//   if (restKey) {
//     const value = data[key];
//     return () => getPropertyFromPath(toValue(value), restKey);
//   }
//   return () => getPropertyFromPath(data, attrValue);
// }

// export function makeGetPreviousValue(
//   data: Record<string, unknown>,
//   attrValue: string | null,
// ): (() => unknown) | undefined {
//   if (!attrValue) return undefined;

//   const [key, restKey] = attrValue.split(".", 2);
//   const value = data[key];

//   if (!isRef(value)) return undefined;
//   if (!restKey) return () => value.previousValue;

//   return () => getPropertyFromPath(value.previousValue, restKey);
// }

export function evaluateExpression(
  expression: string,
  data: Record<string, unknown>,
) {
  const keys = Object.keys(data);
  keys.push("computed");
  const values = Object.values(data);
  values.push(computed);

  try {
    const fn = new Function(...keys, `return ${expression}`);
    const v = fn(...values);
    return v;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export function bindDirectives({
  data,
  directives,
  components,
  el: parentEl,
}: {
  data: Record<string, unknown>;
  directives: Record<string, Directive>;
  components: Record<string, Component>;
  el: HTMLElement;
}) {
  const brandNewEls: HTMLElement[] = [];
  for (const [name, directive] of Object.entries(directives)) {
    const parentElWithAttr: HTMLElement[] = [
      ...(parentEl.hasAttribute?.(name) ? [parentEl] : []),
      ...(parentEl.hasAttribute?.(`\:${name}`) ? [parentEl] : []),
    ];

    const descendantsWithAttr = [
      ...parentEl.querySelectorAll<HTMLElement>(`[${name}]`),
      ...parentEl.querySelectorAll<HTMLElement>(`[\\:${name}]`),
    ];

    const elemsWithAttr = [...parentElWithAttr, ...descendantsWithAttr];

    for (const el of elemsWithAttr) {
      const filteredAttrs = [...el.attributes].filter(
        (e) => e.name === `:${name}` || e.name === name,
      );

      for (const attr of filteredAttrs) {
        const isExpression = attr.name.startsWith(":");
        const ctx: DirectiveContext = {
          el,
          attrValue: attr.value,
          value: attr.value,
          get: () => attr.value,
          getPrevious: undefined,
          effect: undefined,
          data,
          directives,
          components,
        };
        if (isExpression) {
          const getValue = () => evaluateExpression(attr.value, data);
          const dataValue = getValue();

          ctx.value = dataValue;
          ctx.get = () => toValue(getValue());
          ctx.getPrevious = () => toPrevValue(getValue());
          ctx.effect = isRef(dataValue)
            ? (fn) => dataValue.addProcessQueueWatcher(fn)
            : undefined;
        }
        const newEls = directive(ctx);
        brandNewEls.push(...(newEls ?? []));
      }
    }
  }

  if (brandNewEls.length) {
    bind({ components, data, directives, el: parentEl });
  }
}
