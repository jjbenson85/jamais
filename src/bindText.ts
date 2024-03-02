import { getPropertyFromPath } from "./helpers";
import { globalQueue } from "./processQueue";
import { isRef } from "./ref";
import { SetupBits } from "./setup";

export function bindText(
  el: Element,
  data: Record<string, SetupBits>,
  insideFor = false
) {
  const els = [el, ...el.querySelectorAll(`[data-text]`)];
  console.log({ els });
  els.forEach((el) => {
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
