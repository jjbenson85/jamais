import { bindText } from "./bindText";
import { globalQueue } from "./processQueue";
import { Ref, isRef } from "./ref";
import type { SetupBits } from "./setup";

const toOriginalType = (value: Ref<unknown>, target: HTMLInputElement) => {
  return typeof value.value === "number" ? Number(target.value) : target.value;
};

const bindModels = (value: Ref<any>) => {
  return (el: Element) => {
    if (!(el instanceof HTMLInputElement)) return;
    el.addEventListener("input", (e: Event) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      value.value = toOriginalType(value, e.target);
    });
    const fn = () => (el.value = String(value.value));
    value.addWatcher(() => () => globalQueue.add(fn));
  };
};

const bindClasses = (value: Ref<unknown>) => (el: Element) => {
  const fn = () => {
    const curr = String(value.value).trim();
    const prev = String(value.previousValue).trim();
    prev && prev.split(" ").forEach((cls) => el.classList.remove(cls));
    curr && curr.split(" ").forEach((cls) => el.classList.add(cls));
  };
  value.addWatcher(() => globalQueue.add(fn));
  fn();
};

const isRefEntry = (
  entry: [string, SetupBits]
): entry is [string, Ref<unknown>] => isRef(entry[1]);

export function setupRefs(dataEntries: [string, SetupBits][], el: Element) {
  const refs = dataEntries.filter(isRefEntry);

  bindText(el, Object.fromEntries(dataEntries));

  for (const [key, value] of refs) {
    el.querySelectorAll(`[data-model="${key}"]`).forEach(bindModels(value));

    el.querySelectorAll(`[data-class=${key}]`).forEach(bindClasses(value));
  }
}
