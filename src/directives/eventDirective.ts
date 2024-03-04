import { createDirective } from "../bindDirectives";

export const eventDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { attrPrefix, effect, get, getPrevious } = attr;
    const cb = () => {
      el.removeEventListener(attrPrefix, getPrevious() as () => void);
      el.addEventListener(attrPrefix, get() as () => void);
    };
    effect(cb);
    cb();
  }
});
