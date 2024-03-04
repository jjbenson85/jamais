import { createDirective } from "../bindDirectives";

export const bindDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { attrPrefix, effect, get } = attr;
    const cb = () => {
      el.setAttribute(attrPrefix, String(get()));
    };
    effect(cb);
    cb();
  }
});
