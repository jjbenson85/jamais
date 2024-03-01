import type { Ref } from "./ref";
import { setupRefs } from "./setupRefs";

type SetupMethods = ((...args: any[]) => string) | ((...args: any[]) => void);
export type SetupBits = Ref<any> | SetupMethods;

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
      setupRefs(dataEntries, _document);
      handleMethods(dataEntries, _document);
    },
  };
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
