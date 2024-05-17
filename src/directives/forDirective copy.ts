import { bindDirectives } from "../bindDirectives";
import { evaluateExpression } from "../helpers/evaluateExpression";
import { getValue } from "../helpers/getValueFromUnknown";

import { Directive } from "./types";

const destroyMap = new WeakMap<HTMLElement, (() => void)[]>();

const addToDestroyMap = (el: HTMLElement, cb: () => void) => {
  const arr = destroyMap.get(el);
  if (!arr) {
    destroyMap.set(el, [cb]);
  } else {
    arr.push(cb);
  }
};

const removeEl = (el?: HTMLElement) => {
  if (!el) return;

  const arr = destroyMap.get(el) ?? [];
  for (const cb of arr) {
    cb();
  }
  destroyMap.delete(el);
  el.remove();
};

export const forDirective: Directive = {
  name: "forDirective",
  matcher: (attr: Attr) => attr.name === "j-for",
  mounted: (el, _attrName, attrValue, data) => {
    if (!el.hasAttribute(":data-key")) {
      console.warn(`j-for must have a :data-key attribute\n\n${el.outerHTML}`);
    }

    const [_itemName, itemsName] = attrValue.split(" in ").map((s) => s.trim());

    const useEntries = _itemName.match(/^\[.*\]$/g)?.length;

    let indexName: string;
    let itemName: string;

    if (useEntries) {
      [indexName, itemName] = _itemName
        .replaceAll(/[\[\]]/g, "")
        .split(",")
        .map((s) => s.trim());
    } else {
      // Will overwrite $index meaning we don't need to handle case where useEntries is false differently
      indexName = "$index";
      itemName = _itemName;
    }

    el.removeAttribute("j-for");

    if (!el.parentElement) {
      console.error(`j-for must be a child of an element\n\n${el.outerHTML}`);
      return;
    }
    const getItems = () => {
      const unknownValue = evaluateExpression(itemsName, data, "j-for");
      const value = getValue(unknownValue);

      if (typeof value === "number") {
        return Array.from({ length: value }, (_, i) => i);
      }

      if (typeof value !== "object") {
        console.error(`j-for expects an object, array or a number or a function that returns an object, array or number\n\n${
          el.outerHTML
        }

        ${itemsName} is of type ${typeof value}
        `);
        return [];
      }

      const output = value as Record<string, unknown>;
      return output;
    };

    // Check type just on initial setup
    // const items = getItems();

    const elCopy = el.cloneNode(true) as HTMLElement;

    const parentEl = el.parentElement;

    el.remove();

    const key = el.getAttribute(":data-key") ?? "index";
    // Need to handle on destroyed?
    const childrenArr: { el: HTMLElement; keyValue: string }[] = [];

    const getKeyValue = (key: string, index: string, item: unknown) => {
      if (key === "index") return index;
      return evaluateExpression(
        key,
        {
          [indexName]: index,
          [itemName]: item,
        },
        "getKeyValue",
      );
    };

    const cb2 = () => {
      parentEl.innerHTML = "";
      const items = getItems();
      for (const [index, item] of Object.entries(items)) {
        const newEl = elCopy.cloneNode(true) as HTMLElement;
        parentEl.appendChild(newEl);
        const newData = {
          ...data,
          [indexName]: index,
          [itemName]: item,
        };

        bindDirectives(newEl, newData, globalThis.window.$directives);
      }
    };

    // const cb = () => {
    //   console.log("cb");
    //   const entries = Object.entries(getItems());
    //   const max = Math.max(entries.length, childrenArr.length);

    //   for (let i = 0; i < max; i++) {
    //     const entry = entries[i];
    //     if (!entry) {
    //       const oldEl = childrenArr.pop()?.el;
    //       removeEl(oldEl);
    //       continue;
    //     }

    //     const [index, item] = entry;
    //     const keyValue = getKeyValue(key, index, item);
    //     const currentItem = childrenArr[i];
    //     if (currentItem && currentItem.keyValue === keyValue) continue;

    //     const newEl = elCopy.cloneNode(true) as HTMLElement;
    //     if (!currentItem) {
    //       parentEl.appendChild(newEl);
    //       // TODO: Does it have to be just a string? Why not any?
    //       if (typeof keyValue === "string" || typeof keyValue === "number") {
    //         childrenArr.push({ el: newEl, keyValue: String(keyValue) });
    //       } else {
    //         console.error(`Only strings or numbers can be used as keys in for loops.

    //         ${key} has value of ${keyValue}, and is of type ${typeof keyValue}`);
    //       }
    //     } else {
    //       currentItem.el.replaceWith(newEl);
    //       removeEl(currentItem.el);
    //     }

    //     //  Handle destroying in setup?
    //     const newData = {
    //       ...data,
    //       $index: i,
    //       [indexName]: index,
    //       [itemName]: item,
    //     };
    //     const destroy = bindDirectives(
    //       newEl,
    //       newData,
    //       globalThis.window.$directives,
    //     );
    //     addToDestroyMap(newEl, destroy);
    //   }
    // };

    return cb2;
  },
  // Tidy up directive where we handle the createEffect
  destroyed: (_el) => {
    // console.log("destroyed", el);
    // for (const cb of destroyedMap.get(el) ?? []) {
    //   cb();
    // }
  },
};
