import type { Ref } from "./ref";
import { isRef } from "./ref";
import { ProcessQueue } from "./processQueue";
const processQueue = new ProcessQueue();

type SetupMethods = ((...args: any[]) => string) | ((...args: any[]) => void);
type SetupBits = Ref<any> | SetupMethods;

export function setup(
  setupFn: () => Record<string, SetupBits>,
  _document: Document = document
): {
  attach: (attachStr: string) => void;
} {
  const data = setupFn();
  const dataEntries = Object.entries(data);
  return {
    attach: (attachStr: string) => {
      const _document = document.querySelector(attachStr);
      if (!_document) throw new Error("No element found");
      handleRefs(dataEntries, _document);
      handleMethods(dataEntries, _document);
    },
  };
}

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
  const fn = () => {
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

function handleRefs(dataEntries: [string, SetupBits][], _document: Element) {
  const refs = dataEntries.filter(isRefEntry);

  for (const [key, value] of refs) {
    _document.querySelectorAll(`[data-text=${key}]`).forEach(bindText(value));

    _document
      .querySelectorAll(`[data-model="${key}"]`)
      .forEach(bindModels(value));

    _document
      .querySelectorAll(`[data-class=${key}]`)
      .forEach(bindClasses(value));
  }
}

const isMethodEntry = (
  entry: [string, SetupBits]
): entry is [string, (() => string) | (() => void)] =>
  typeof entry[1] === "function";

function handleMethods(dataEntries: [string, SetupBits][], _document: Element) {
  const eventTypes = ["click"] as const;
  const methods = dataEntries.filter(isMethodEntry);

  for (const [methodName, method] of methods) {
    for (const eventType of eventTypes) {
      _document
        .querySelectorAll(`[data-${eventType}="${methodName}"]`)
        .forEach((el: Element) => el.addEventListener(eventType, method));
    }
  }
}
