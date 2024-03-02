import { getPropertyFromPath } from "./helpers";
import { globalQueue } from "./processQueue";
import { Ref, isRef } from "./ref";
import type { SetupBits } from "./setup";

const bindText = (value: Ref<any>) => {
  return (el: Element) => {
    const fn = () => (el.textContent = String(value.value));
    value.addWatcher(() => globalQueue.add(fn));
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

// function getMethodFromSetupObj(data: Record<string, SetupBits>, key: string){
//   const valueKey = key.match(/$\(.*\)/);
//   const value = data[key]
//   return value
// }

function geValueFromSetupObj(data: Record<string, SetupBits>, key: string) {
  const value = data[key];
  return value;
}

function getFromSetupObj(data: Record<string, SetupBits>, key: string) {
  const value = data[key];
  return value;
}

export function bindText2(
  el: Element,
  data: Record<string, SetupBits>,
  insideFor = false
) {
  [el, ...el.querySelectorAll(`[data-text]`)].forEach((el) => {
    const _attrValue = el.getAttribute("data-text") ?? "";
    const attrValue = _attrValue.replace("$", "__data-for__");

    if (!insideFor && attrValue.startsWith("__data-for__")) return;

    if (!attrValue) return;

    const value = data[attrValue.split(".")[0]];

    const fn = () => {
      const deepValue = getPropertyFromPath(data, attrValue);
      el.textContent = String(deepValue);
    };

    if (isRef(value)) {
      value.addWatcher(() => globalQueue.add(fn));
    }
    fn();
  });
}

export function setupRefs(dataEntries: [string, SetupBits][], el: Element) {
  const refs = dataEntries.filter(isRefEntry);

  bindText2(el, Object.fromEntries(dataEntries));

  for (const [key, value] of refs) {
    // el.querySelectorAll(`[data-text=${key}]`).forEach(bindText(value));

    el.querySelectorAll(`[data-model="${key}"]`).forEach(bindModels(value));

    el.querySelectorAll(`[data-class=${key}]`).forEach(bindClasses(value));
  }
}
