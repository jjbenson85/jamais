import type { Ref } from "./ref";
import { setupFors } from "./setupFors";
import { setupMethods } from "./setupMethods";
import { bindClass } from "./bindClass";
import { bindModel } from "./bindModel";
import { bindText } from "./bindText";

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
      const el = _document.querySelector(attachStr);
      if (!el) throw new Error("No element found");
      setupFors(dataEntries, el);

      bindText(data, el);
      bindClass(data, el);
      bindModel(data, el);

      setupMethods(dataEntries, el);
    },
  };
}
