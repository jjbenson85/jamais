import { defineDirective } from "../bindDirectives";

export const textDirective = defineDirective((ctx) => {
  const { el, effect, get } = ctx;
  const cb = () => {
    el.textContent = String(get());
  };
  effect?.(cb);
  cb();
});
