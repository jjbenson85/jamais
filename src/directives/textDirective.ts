import { createDirective } from "../bindDirectives";

export const textDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { effect, get } = attr;
    const cb = () => {
      el.textContent = String(get());
    };
    effect(cb);
    cb();
  }
});
