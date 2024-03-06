import { createDirective } from "../bindDirectives";

export const textDirective = createDirective((ctx) => {
  const { el, effect, get } = ctx;
  const cb = () => {
    el.textContent = String(get());
  };
  effect(cb);
  cb();
});
