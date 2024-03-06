import { createDirective } from "../bindDirectives";

export const eventDirective = createDirective((ctx) => {
  const { el, effect, get, getPrevious, attrValue } = ctx;
  const attrPrefix = attrValue?.split(":").at(0);
  if (!attrPrefix) {
    console.warn("No event prefix found");
    return;
  }
  const cb = () => {
    el.removeEventListener(attrPrefix, getPrevious() as () => void);
    el.addEventListener(attrPrefix, get() as () => void);
  };
  effect(cb);
  cb();
});
