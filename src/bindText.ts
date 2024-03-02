import { getElementsToBind } from "./getElementsToBind";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export function bindText(
  data: Record<string, SetupBits>,
  el: Element,
  insideFor = false
) {
  getElementsToBind(el, "text", data, insideFor).forEach(
    ({ el, value, getDeepValue }) => {
      const setElementText = () => {
        el.textContent = String(getDeepValue());
        insideFor && console.log("setElementText", el.textContent);
      };

      //   Is not a ref if insideFor and using $VALUE in template
      if (isRef(value)) {
        value.addProcessQueueWatcher(setElementText);
      }

      if (typeof value === "function") {
        // TODO: Handle functions as values
        return;
      }
      setElementText();
    }
  );
}
