import { bindClass } from "./bindClass";
import { bindText } from "./bindText";
import { getElementsToBind } from "./getElementsToBind";
import { SetupBits } from "./setup";

export function bindFor(data: Record<string, SetupBits>, el: Element) {
  getElementsToBind(el, "in", data).forEach(({ el, value, getDeepValue }) => {
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

        // TODO: Do We need to remove these attributes?
        newEl.removeAttribute("data-for");
        newEl.removeAttribute("data-in");

        bindText({ ...data, [forKey]: item }, newEl);
        bindClass({ ...data, [forKey]: item }, newEl);
        bindFor({ ...data, [forKey]: item }, newEl);

        return newEl;
      });

      parentEl.append(...newChildren);
      parentEl.append(...postSibling);
    };

    value.addProcessQueueWatcher(fn);
    fn();
  });
}