import { isObject } from "@/helpers/assert";
import { evaluateExpression } from "@/helpers/evaluateExpression";
import { ComponentConstructor, Effect } from "@jamais";
import { classDirective } from "./classDirective";
// import { elseDirective } from "./elseDirective";
// import { elseIfDirective } from "./elseIfDirective";
// import { bindDirective } from "./bindDirective";
import { eventDirective } from "./eventDirective";
import { forDirective } from "./forDirective";
import { ifDirective } from "./ifDirective";
// import { ifDirective2 } from "./ifDirective2";

import { effectDirective } from "./effectDirective";
// import { keyDirective } from "./keyDirective";
import { modelDirective } from "./modelDirective";
import { scopeDirective } from "./scopeDirective";
import { switchDirective } from "./switchDirective";
import { textDirective } from "./textDirective";
import { Directive } from "./types";

import { normaliseComponentNames } from "@/helpers/normalizeComponentNames";

const directives: Directive[] = [
  scopeDirective,
  forDirective,
  eventDirective,
  ifDirective,
  // elseIfDirective,
  // elseDirective,
  switchDirective,
  textDirective,
  classDirective,
  modelDirective,
  effectDirective,
  // keyDirective,
  // bindDirective,
] as const;

type Components = Record<string, ComponentConstructor>;
type Scope = Record<string, unknown>;

export const mergedScopeMap = new WeakMap<HTMLElement, Scope>();

const errMsgScopeIsNotObject = (
  el: HTMLElement,
  scopeStr: string | null,
  scope: Scope,
) => {
  console.error(`Scope must be an object.

                  ${el.outerHTML}

                  ${scopeStr} is of type ${typeof scope}`);
};

const getScope = (data: Scope) => (el: HTMLElement) => {
  const parentWithScope = el.parentElement?.closest("[j-scope]") as HTMLElement;

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
    return { el, scope: {} };
  }
  mergedScopeMap.set(el, scope);
  return { el, scope };
};

const isValidComponent =
  (components: Record<string, ComponentConstructor>) =>
  ({ el }: { el: HTMLElement }) => {
    const tagName = el.tagName.toLowerCase();
    if (!tagName.includes("-")) return true;
    if (!(tagName in components)) {
      console.warn(`No component found for ${tagName}.

      Components can be added globally by passing them to the app setup function.

      setup(state,{ attach: "#app", components: { myComponent }});

      or inside a parent component in the defineComponent function.

      defineComponent({
        name: "myParentComponent",
        components: { myChildComponent },
        template: \`<my-child-component></my-child-component>\`
      });`);

      return false;
    }
    return true;
  };

const getComponent =
  (components: Components) =>
  ({ el, scope }: { el: HTMLElement; scope: Scope }) => {
    const tagName = el.tagName.toLowerCase();
    return tagName in components
      ? {
          el: components[tagName](el, scope, components),
          scope,
        }
      : { el, scope };
  };

// let callBacks:({cb: () => void, directive: Directive})[] = []
const applyDirectives =
  (components: Components) =>
  ({ el, scope }: { el: HTMLElement; scope: Scope }) => {
    if (!el.parentElement) {
      console.log("el has no parent", el.outerHTML);
      return;
    }
    for (const attr of el.attributes) {
      for (const directive of directives) {
        if (!directive.matcher(attr)) continue;
        const cb = directive.mounted(
          el as HTMLElement & { parentElement: HTMLElement },
          attr.name,
          attr.value,
          scope,
          components,
        );
        if (cb) {
          // callBacks.push({cb, directive})
          new Effect(cb, { msg: directive.name });
        }
        break;
      }
      if (!el.parentElement) {
        // El may have been removed in directive
        mergedScopeMap.delete(el);
        break;
      }
    }
  };

export function setupBindDirectives(
  el: HTMLElement,
  data: Record<string, unknown>,
  _components: Record<string, ComponentConstructor> = {},
) {
  const components = normaliseComponentNames(_components);
  const elements = Array.from(
    el.querySelectorAll<HTMLElement>("*:not([j-for] *)"),
  );
  elements.unshift(el);
  elements
    .map(getScope(data))
    .filter(isValidComponent(components))
    .map(getComponent(components))
    .forEach(applyDirectives(components));

  // callBacks.forEach(({cb, directive})=>createEffect(cb, directive.name))
}
