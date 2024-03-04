import { createDirective } from "../bindDirectives";

const classArrFromStr = (str: unknown) =>
  str ? String(str).trim().split(" ").filter(Boolean) : [];

function applyClasses(el: Element, curr: unknown, prev?: unknown) {
  classArrFromStr(prev).forEach((cls) => el.classList.remove(cls));
  classArrFromStr(curr).forEach((cls) => el.classList.add(cls));
}

export const classDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { effect, get, getPrevious } = attr;
    const cb = () => applyClasses(el, get(), getPrevious());
    effect(cb);
    cb();
  }
});
