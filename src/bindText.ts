import { getElementsToBind } from "./getElementsToBind";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export function bindText(data: Record<string, SetupBits>, el: Element) {
  getElementsToBind(el, "text", data).forEach(({ el, value, getDeepValue }) => {
    const setElementText = () => {
      el.textContent = String(getDeepValue());
    };

    if (isRef(value)) {
      value.addProcessQueueWatcher(setElementText);
    }

    if (typeof value === "function") {
      // TODO: Handle functions as values
      return;
    }
    setElementText();
  });
}
