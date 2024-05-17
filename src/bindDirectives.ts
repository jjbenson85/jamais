import { isObject } from "./helpers/assert";
import { evaluateExpression } from "./helpers/evaluateExpression";
import { createEffect } from "./signal";
import { Directive } from "./types";
import { ifDirective } from "./directives/ifDirective";
import { textDirective } from "./directives/textDirective";
import { classDirective } from "./directives/classDirective";
import { modelDirective } from "./directives/modelDirective";
// import { bindDirective } from "./directives/bindDirective";
import { eventDirective } from "./directives/eventDirective";
import { switchDirective } from "./directives/switchDirective";
import { forDirective } from "./directives/forDirective";
import { scopeDirective } from "./directives/scopeDirective";
import { keyDirective } from "./directives/keyDirective";
import { ComponentConstrucor } from "./defineComponent";

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

export function bindDirectives(
  el: HTMLElement,
  data: Record<string, unknown>,
  components: Record<string, ComponentConstrucor>,
) {
  // Don't process children of elements with :data-for
  // This is because the forDirective will handle the children
  const allElems = [
    el,
    ...(el.querySelectorAll<HTMLElement>("*:not([\\:data-for] *)") ?? []),
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
      "[\\:data-scope]",
    ) as HTMLElement;

    const parentScope =
      (parentWithScope && mergedScopeMap.get(parentWithScope)) ?? data;

    const scopeStr = el.getAttribute(":data-scope");
    const thisScope = scopeStr
      ? evaluateExpression(scopeStr, parentScope, ":data-scope")
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
