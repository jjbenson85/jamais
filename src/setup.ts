// import { evaluateExpression } from "./evaluateExpression";
import { DEBUG, createEffect } from "./signal";
import type { Directive } from "./types";
import { ifDirective } from "./directives/ifDirective";
import { textDirective } from "./directives/textDirective";
import { classDirective } from "./directives/classDirective";
import { modelDirective } from "./directives/modelDirective";
import { bindDirective } from "./directives/bindDirective";
import { eventDirective } from "./directives/eventDirective";
import { switchDirective } from "./directives/switchDirective";
import { evaluateExpression } from "./helpers/evaluateExpression";
import { forDirective } from "./directives/forDirective";
import { scopeDirective } from "./directives/scopeDirective";
import { keyDirective } from "./directives/keyDirective";

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

// const scopeMap = new WeakMap<HTMLElement, Record<string, unknown>>();
export const mergedScopeMap = new WeakMap<
  HTMLElement,
  Record<string, unknown>
>();

export function setup(
  data: Record<string, unknown>,
  options: {
    attach: string | HTMLElement;
    //   components?: Record<string, Component>;
    directives?: Directive[];
    debug?: boolean;
  },
  _document: Document = document,
) {
  if (options.debug) {
    DEBUG.value = true;
  }

  const directives = [
    ...(options.directives ?? []),
    scopeDirective,
    forDirective,
    eventDirective,
    ifDirective,
    switchDirective,
    textDirective,
    classDirective,
    modelDirective,
    keyDirective,
    bindDirective,
  ];
  const el =
    typeof options.attach === "string"
      ? _document.querySelector<HTMLElement>(options.attach)
      : options.attach;

  if (!el) throw new Error("No element found");

  const allElems = [el, ...el.querySelectorAll<HTMLElement>("*")].filter(
    (e) => e.attributes.length > 0,
  );
  // Create the scope map for all elements
  for (const el of allElems) {
    if (!document.contains(el)) {
      mergedScopeMap.delete(el);
      continue;
    }

    const parentWithScope = getClosestAncestorWithScope(el, ":data-scope");
    const parentScope =
      (parentWithScope && mergedScopeMap.get(parentWithScope)) ?? data;

    const scopeStr = el.getAttribute(":data-scope");
    const thisScope = scopeStr
      ? evaluateExpression(scopeStr, parentScope)
      : undefined;

    // Might not need to merge in data here
    const scope = Object.assign({}, data, parentScope, thisScope);
    if (typeof scope !== "object" || scope === null) {
      console.error(`Scope must be an object. 
      
      ${el.outerHTML}

      ${scopeStr} is of type ${typeof scope}`);
      continue;
    }
    if (scope === undefined) {
      continue;
    }
    mergedScopeMap.set(el, scope);
  }


  const destroyArr: (() => void)[] = [];

  for (const el of allElems) {
    // Element is removed in data-for directive
    // TODO: Try to reuse it, but there is an ordering issue
    if (!document.contains(el)) {
      mergedScopeMap.delete(el);
      continue;
    }
    
    const elementScope = mergedScopeMap.get(el) ?? {};
    for (const attr of el.attributes) {
      if (!el.parentElement) {
        mergedScopeMap.delete(el);
        el.remove();
        break;
      }
      // DIRECTIVES
      for (const directive of directives) {
        if (!directive.matcher(attr)) continue;
        const cb = directive.mounted(el, attr.name, attr.value, elementScope);
        if (cb) {
          const effect = createEffect(cb, directive.name);
          destroyArr.push(effect.destroy);
        }
        if (!document.contains(el)) {
          // If the directive removed the el
          mergedScopeMap.delete(el);
          // el.remove();
        }

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
