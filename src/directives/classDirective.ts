import { createDirective } from "../bindDirectives";

const classArrFromStr = (str: unknown) =>
  str ? String(str).trim().split(" ").filter(Boolean) : [];

function applyClasses(el: Element, curr: unknown, prev?: unknown) {
  for (const cls of classArrFromStr(prev)) {
    el.classList.remove(cls);
  }
  for (const cls of classArrFromStr(curr)) {
    el.classList.add(cls);
  }
}

export const classDirective = createDirective((ctx) => {
  const { el, effect, get, getPrevious } = ctx;
  const cb = () => applyClasses(el, get(), getPrevious());
  effect(cb);
  cb();
});
