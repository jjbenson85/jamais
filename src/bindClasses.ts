import { getElementsToBind } from "./getElementsToBind";
import { globalQueue } from "./processQueue";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export const bindClasses = (
  el: Element,
  data: Record<string, SetupBits>,
  insideFor = false
) => {
  getElementsToBind(el, "class", data, insideFor).forEach(
    ({ el, value, getDeepValue }) => {
      //   Is not a ref if insideFor and using $VALUE in template
      if (isRef(value)) {
        const fn = () => {
          const curr = String(value.value).trim();
          const prev = String(value.previousValue).trim();
          prev && prev.split(" ").forEach((cls) => el.classList.remove(cls));
          curr && curr.split(" ").forEach((cls) => el.classList.add(cls));
        };
        value.addWatcher(() => globalQueue.add(fn));

        fn();
      } else if (typeof value === "function") {
        // TODO: Handle functions as values
      } else {
        const curr = String(getDeepValue()).trim();
        curr && curr.split(" ").forEach((cls) => el.classList.add(cls));
      }
    }
  );
};
