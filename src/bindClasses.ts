import { getElementsToBind } from "./getElementsToBind";
import { globalQueue } from "./processQueue";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

const classArrFromStr = (str: unknown) =>
  str ? String(str).trim().split(" ").filter(Boolean) : [];

function applyClasses(el: Element, curr: unknown, prev?: unknown) {
  classArrFromStr(prev).forEach((cls) => el.classList.remove(cls));
  classArrFromStr(curr).forEach((cls) => el.classList.add(cls));
}

export const bindClasses = (
  data: Record<string, SetupBits>,
  el: Element,
  insideFor = false
) => {
  getElementsToBind(el, "class", data, insideFor).forEach(
    ({ el, value, getDeepValue, getDeepPreviousValue }) => {
      //   Is not a ref if insideFor and using $VALUE in template
      if (isRef(value)) {
        value.addProcessQueueWatcher(() =>
          applyClasses(el, getDeepValue(), getDeepPreviousValue())
        );
      } else if (typeof value === "function") {
        // TODO: Handle functions as values
        return;
      }

      applyClasses(el, getDeepValue());
    }
  );
};
