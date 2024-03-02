import { getElementsToBind } from "./getElementsToBind";
import { globalQueue } from "./processQueue";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export function bindText(
  data: Record<string, SetupBits>,
  el: Element,
  insideFor = false
) {
  getElementsToBind(el, "text", data, insideFor).forEach(
    ({ el, value, getDeepValue }) => {
      const fn = () => {
        el.textContent = String(getDeepValue());
      };
      //   Is not a ref if insideFor and using $VALUE in template
      if (isRef(value)) {
        value.addWatcher(() => globalQueue.add(fn));
      }
      fn();

      if (typeof value === "function") {
        // TODO: Handle functions as values
      }
    }
  );
}
