import { isObject } from "./helpers/assert";
import { evaluateExpression } from "./helpers/evaluateExpression";
import { createEffect } from "./signal";
import { Directive } from "./types";

export function bindDirectives(
  el: HTMLElement,
  data: Record<string, unknown>,
  directives: Directive[],
) {
  const destroyArr: (() => void)[] = [];
  console.log({ el });
  const allElems = [
    el,
    ...(el.querySelectorAll<HTMLElement>("*") ?? []),
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
  for (const el of allElems) {
    const parentWithScope = getClosestAncestorWithScope(el, ":data-scope");
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
    for (const attr of el.attributes) {
      for (const directive of directives) {
        if (!directive.matcher(attr)) continue;
        const cb = directive.mounted(
          el,
          attr.name,
          attr.value,
          scope,
          directives,
        );
        if (cb) {
          const effect = createEffect(cb, directive.name);
          destroyArr.push(effect.destroy);
        }
        break;
      }
      if (!el.parentElement) {
        // El may have been removed in directive
        mergedScopeMap.delete(el);
        break;
      }
    }
  }

  return () => {
    for (const d of destroyArr) {
      d();
    }
  };
}

function getClosestAncestorWithScope(el: HTMLElement, selector: string) {
  let ancestor = el.parentElement;
  while (ancestor) {
    if (ancestor.hasAttribute(selector)) {
      return ancestor;
    }
    ancestor = ancestor.parentElement;
  }
  return undefined;
}

export const mergedScopeMap = new WeakMap<
  HTMLElement,
  Record<string, unknown>
>();
