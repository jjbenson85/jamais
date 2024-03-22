import { evaluateExpression } from "../helpers/evaluateExpression";
import { setup } from "../setup";
import { Directive } from "../types";

const destroyMap = new WeakMap<HTMLElement, (() => void)[]>();

const addToDestroyMap = (el: HTMLElement, cb: () => void) => {
  const arr = destroyMap.get(el);
  if (!arr) {
    destroyMap.set(el, [cb]);
  } else {
    arr.push(cb);
  }
}

const removeEl = (el?: HTMLElement) => {
  if (!el) return;

  const arr = destroyMap.get(el) ?? []
  for (const cb of arr) {
    cb();
  }
  destroyMap.delete(el);
  el.remove();
}


export const forDirective: Directive = {
  name: "forDirective",
  matcher: (attr: Attr) => attr.name === ":data-for",
  mounted: (el, _attrName, attrValue, data) => {
    const [_itemName, itemsName] = attrValue.split(" in ").map((s) => s.trim());

    const [indexName, itemName] = _itemName
      .replaceAll(/[\[\]]/g, "")
      .split(",")
      .map((s) => s.trim());

    el.removeAttribute(":data-for");

    if (!el.parentElement) {
      console.error(
        `:data-for must be a child of an element\n\n${el.outerHTML}`,
      );
      return;
    }
    const getItems = () => evaluateExpression(itemsName, data);

    // Check type just on initial setup
    const items = getItems();
    if (typeof items !== "object") {
      console.error(`:data-for expects an object or array\n\n${el.outerHTML}`);
      return;
    }

    const elCopy = el.cloneNode(true) as HTMLElement;

    const parentEl = el.parentElement;

    el.remove();

    const key = el.getAttribute(":data-key") ?? "index";
    // Need to handle on destroyed?
    const childrenArr: { el: HTMLElement; keyValue: string }[] = [];

    const getKeyValue = (key: string, index: string, item: unknown) => {
      if (key === "index") return index;
      return evaluateExpression(key, {
        [indexName]: index,
        [itemName]: item,
      });
    };

    const cb = () => {

      const entries = Object.entries(getItems());

      const max = Math.max(entries.length, childrenArr.length);

      for (let i = 0; i < max; i++) {
        const entry = entries[i];

        if (!entry) {
          const oldEl = childrenArr.pop()?.el
          removeEl(oldEl);
          continue;
        }

        const [index, item] = entry;
        const keyValue = getKeyValue(key, index, item);
        const currentItem = childrenArr[i];
        if (currentItem && currentItem.keyValue === keyValue) continue;

        const newEl = elCopy.cloneNode(true) as HTMLElement;
        if (!currentItem) {
          parentEl.appendChild(newEl);
          childrenArr.push({ el: newEl, keyValue });
        } else {
          currentItem.el.replaceWith(newEl);
          removeEl(currentItem.el);
        }

        //  Handle destroying in setup?
        const destroy = setup(
          {
            ...data,
            $index: i,
            [indexName]: index,
            [itemName]: item,
          },
          { attach: newEl },
        );
        addToDestroyMap(newEl, destroy);
      }

    };

    return cb;
  },
  // Tidy up directive where we handle the createEffect
  destroyed: (el) => {
    console.log("destroyed", el);
    // for (const cb of destroyedMap.get(el) ?? []) {
    //   cb();
    // }
  },
};
