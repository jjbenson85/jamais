import { getElementsToBind } from "./getElementsToBind";
import { globalQueue } from "./processQueue";
import { Ref, isRef } from "./ref";
import { SetupBits } from "./setup";

const toOriginalType = (value: Ref<unknown>, target: HTMLInputElement) => {
  return typeof value.value === "number" ? Number(target.value) : target.value;
};

export function bindModels(
  data: Record<string, SetupBits>,
  el: Element,
  insideFor = false
) {
  getElementsToBind(el, "model", data, insideFor).forEach(({ el, value }) => {
    if (!("value" in el)) {
      console.warn("Can only bind models to input elements");
      return;
    }

    //   Is not a ref if insideFor and using $VALUE in template
    if (!isRef(value)) {
      console.warn("Can only bind refs");
      return;
    }

    el.addEventListener("input", (e: Event) => {
      if (!e.target) return;
      value.value = toOriginalType(value, e.target as HTMLInputElement);
    });

    const setInputValue = () =>
      ((el as HTMLInputElement).value = String(value.value));

    value.addProcessQueueWatcher(setInputValue);

    setInputValue();
  });
}
