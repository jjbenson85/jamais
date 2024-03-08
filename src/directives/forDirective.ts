import { bindDirectives, createDirective } from "../bindDirectives";
import { isObject } from "../helpers";

export const forDirective = createDirective((ctx) => {
  const { el, get, effect, data, directives } = ctx;

  const parentEl = el.parentElement;

  if (!parentEl) return;

  const siblings = Array.from(parentEl?.children || []);
  const preSibling = siblings.slice(0, siblings.indexOf(el));
  const postSibling = siblings.slice(siblings.indexOf(el) + 1);

  const forKey = el.getAttribute("data-for");

  if (!forKey) {
    console.warn("No data-for attribute found on data-in");
    return;
  }

  const fn = () => {
    parentEl.innerHTML = "";
    parentEl.append(...preSibling);

    const deepValue = get();

    const valueArray = Array.isArray(deepValue)
      ? deepValue
      : isObject(deepValue)
        ? Object.values(deepValue)
        : [];

    for (const item of valueArray) {
      const newEl = el.cloneNode(true) as HTMLElement;
      parentEl.append(newEl);
      newEl.removeAttribute("data-for");
      newEl.removeAttribute("data-in");

      bindDirectives(directives, { ...data, [forKey]: item }, newEl);
    }

    parentEl.append(...postSibling);
  };

  fn();

  effect?.(fn);
});
