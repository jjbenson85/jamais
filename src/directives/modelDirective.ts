import { defineDirective } from "../bindDirectives";
import { Ref, isRef } from "../ref";

const toOriginalType = (value: Ref<unknown>, target: HTMLInputElement) => {
  return typeof value.value === "number" ? Number(target.value) : target.value;
};

export const modelDirective = defineDirective((ctx) => {
  const { el, effect, get, dataValue } = ctx;

  if (!("value" in el)) {
    console.warn("data-model: Can only bind models to input elements");
    return;
  }

  if (!isRef(dataValue)) {
    console.warn("data-model: Can only bind refs");
    return;
  }

  el.addEventListener("input", (e: Event) => {
    if (!e.target) return;
    dataValue.value = toOriginalType(dataValue, e.target as HTMLInputElement);
  });

  const cb = () => {
    el.value = String(get());
  };

  effect?.(cb);
  cb();
});
