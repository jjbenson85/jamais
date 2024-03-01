import { ProcessQueue } from "./processQueue";
import { Ref, isRef } from "./ref";
import type { SetupBits } from "./setup";

const processQueue = new ProcessQueue();

const bindText = (value: Ref<any>) => {
  return (el: Element) => {
    const fn = () => (el.textContent = String(value.value));
    value.addWatcher(() => processQueue.add(fn));
    fn();
  };
};

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
    value.addWatcher(() => () => processQueue.add(fn));
  };
};

const bindClasses = (value: Ref<unknown>) => (el: Element) => {
  console.log("bindClasses");
  const fn = () => {
    console.log("apply classes");
    const curr = String(value.value).trim();
    const prev = String(value.previousValue).trim();
    prev && prev.split(" ").forEach((cls) => el.classList.remove(cls));
    curr && curr.split(" ").forEach((cls) => el.classList.add(cls));
  };
  value.addWatcher(() => processQueue.add(fn));
  fn();
};

const isRefEntry = (
  entry: [string, SetupBits]
): entry is [string, Ref<unknown>] => isRef(entry[1]);

export function setupRefs(dataEntries: [string, SetupBits][], el: Element) {
  const refs = dataEntries.filter(isRefEntry);

  for (const [key, value] of refs) {
    el.querySelectorAll(`[data-text=${key}]`).forEach(bindText(value));

    el.querySelectorAll(`[data-model="${key}"]`).forEach(bindModels(value));

    el.querySelectorAll(`[data-class=${key}]`).forEach(bindClasses(value));
  }
}