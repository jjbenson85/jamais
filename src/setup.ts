import "./styles.css";

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
import { isObject } from "./helpers/assert";

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
  const destroyArr: (() => void)[] = [];

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
      ? evaluateExpression(scopeStr, parentScope)
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
        const cb = directive.mounted(el, attr.name, attr.value, scope);
        if (cb) {
          createEffect(cb, directive.name);
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
