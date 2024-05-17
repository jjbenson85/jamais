import { isObject } from "@/helpers/assert";
import { ComponentConstrucor, createEffect } from "@/jamais";
import { evaluateExpression } from "@helpers/evaluateExpression";
import { classDirective } from "./classDirective";
// import { bindDirective } from "./bindDirective";
import { eventDirective } from "./eventDirective";
import { forDirective } from "./forDirective";
import { ifDirective } from "./ifDirective";
import { keyDirective } from "./keyDirective";
import { modelDirective } from "./modelDirective";
import { scopeDirective } from "./scopeDirective";
import { switchDirective } from "./switchDirective";
import { textDirective } from "./textDirective";
import { Directive } from "./types";

const directives: Directive[] = [
  scopeDirective,
  forDirective,
  eventDirective,
  ifDirective,
  switchDirective,
  textDirective,
  classDirective,
  modelDirective,
  keyDirective,
  // bindDirective,
] as const;

export function setupBindDirectives(
  el: HTMLElement,
  data: Record<string, unknown>,
  components: Record<string, ComponentConstrucor>,
) {
  // Don't process children of elements with j-for
  // This is because the forDirective will handle the children
  const allElems = [
    el,
    ...(el.querySelectorAll<HTMLElement>("*:not([j-for] *)") ?? []),
  ].filter((e) => e.attributes.length > 0);

  const errMsgScopeIsNotObject = (
    el: HTMLElement,
    scopeStr: string | null,
    scope: unknown,
  ) => {
    console.error(`Scope must be an object.

                    ${el.outerHTML}

                    ${scopeStr} is of type ${typeof scope}`);
  };

  // Create the scope map for all elements
  for (let el of allElems) {
    const parentWithScope = el.parentElement?.closest(
      "[j-scope]",
    ) as HTMLElement;

    const parentScope =
      (parentWithScope && mergedScopeMap.get(parentWithScope)) ?? data;

    const scopeStr = el.getAttribute("j-scope");
    const thisScope = scopeStr
      ? evaluateExpression(scopeStr, parentScope, "j-scope")
      : undefined;

    // Might not need to merge in data here
    const scope = Object.assign({}, data, parentScope, thisScope);

    if (!isObject(scope)) {
      errMsgScopeIsNotObject(el, scopeStr, scope);
      continue;
    }
    mergedScopeMap.set(el, scope);

    const tagName = el.tagName.toLowerCase();
    if (tagName in components) {
      console.log({ tagName, el, scope, components });
      el = components[tagName](el, scope, components);
    }

    for (const attr of el.attributes) {
      for (const directive of directives) {
        if (!directive.matcher(attr)) continue;
        const cb = directive.mounted(
          el,
          attr.name,
          attr.value,
          scope,
          components,
        );
        if (cb) createEffect(cb, directive.name);
        break;
      }
      if (!el.parentElement) {
        // El may have been removed in directive
        mergedScopeMap.delete(el);
        break;
      }
    }
  }
}

export const mergedScopeMap = new WeakMap<
  HTMLElement,
  Record<string, unknown>
>();
