import { createDirective } from "../bindDirectives";
import { Ref, isRef } from "../ref";

const toOriginalType = (value: Ref<unknown>, target: HTMLInputElement) => {
  return typeof value.value === "number" ? Number(target.value) : target.value;
};

export const modelDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { effect, get, value } = attr;
    if (!("value" in el)) {
      console.warn("Can only bind models to input elements");
      return;
    }

    if (!isRef(value)) {
      console.warn("Can only bind refs");
      return;
    }

    el.addEventListener("input", (e: Event) => {
      if (!e.target) return;
      value.value = toOriginalType(value, e.target as HTMLInputElement);
    });

    const cb = () => {
      el.value = String(get());
    };

    effect(cb);
    cb();
  }
});