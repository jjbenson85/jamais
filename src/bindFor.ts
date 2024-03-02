import { bindClass } from "./bindClass";
import { bindText } from "./bindText";
import { getElementsToBind } from "./getElementsToBind";
import { toValue } from "./helpers";
import { SetupBits } from "./setup";

export function bindFor(
  data: Record<string, SetupBits>,
  el: Element,
  insideFor = false
) {
  insideFor && console.log({ data, el, insideFor });
  getElementsToBind(el, "in", data, insideFor).forEach(
    ({ el, value, getDeepValue }) => {
      // console.log("bindFors", el, value, getDeepValue);

      const forKey = el.getAttribute("data-for");
      if (!forKey) {
        console.warn("No data-for attribute found on data-in");
        return;
      }

      const parentEl = el.parentElement;
      const siblings = Array.from(parentEl?.children || []);
      const preSibling = siblings.slice(0, siblings.indexOf(el));
      const postSibling = siblings.slice(siblings.indexOf(el) + 1);
      if (!parentEl) return;

      if (typeof value === "function") {
        console.warn("Can only bind refs");
        return;
      }

      const fn = () => {
        parentEl.innerHTML = "";
        parentEl.append(...preSibling);
        const deepValue = getDeepValue();
        if (!Array.isArray(deepValue)) {
          console.warn("Can only bind arrays to data-in");
          return;
        }
        const entries = Object.entries(deepValue);
        const newChildren = entries.map(([key, item]: any) => {
          const newEl = el.cloneNode(true) as Element;
          newEl.removeAttribute("data-for");
          newEl.removeAttribute("data-in");

          bindText({ [forKey]: item }, newEl, true);
          bindClass({ [forKey]: item }, newEl, true);

          bindFor({ [forKey]: item }, newEl, true);

          return newEl;
        });

        parentEl.append(...newChildren);
        parentEl.append(...postSibling);
      };

      value.addProcessQueueWatcher(fn);
      fn();
    }
  );
}
