import type { Ref } from "./ref";
import { setupMethods } from "./setupMethods";
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
      setupMethods(dataEntries, _document);
    },
  };
}

