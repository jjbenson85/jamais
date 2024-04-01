import { bindDirectives } from "../bindDirectives";
import { evaluateExpression } from "../helpers/evaluateExpression";
import { getValue } from "../helpers/getValueFromUnknown";

import { Directive } from "../types";

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
  matcher: (attr: Attr) => attr.name === ":data-for",
  mounted: (el, _attrName, attrValue, data) => {
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

    el.removeAttribute(":data-for");

    if (!el.parentElement) {
      console.error(
        `:data-for must be a child of an element\n\n${el.outerHTML}`,
      );
      return;
    }
    const getItems = () => {
      const unknownValue = evaluateExpression(itemsName, data, ":data-for");
      const value = getValue(unknownValue);

      if (typeof value === "number") {
        return Array.from({ length: value }, (_, i) => i);
      }

      if (typeof value !== "object") {
        console.error(`:data-for expects an object, array or a number or a function that returns an object, array or number\n\n${
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

    const cb = () => {
      const entries = Object.entries(getItems());

      const max = Math.max(entries.length, childrenArr.length);

      for (let i = 0; i < max; i++) {
        const entry = entries[i];

        if (!entry) {
          const oldEl = childrenArr.pop()?.el;
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
          // TODO: Does it have to be just a string? Why not any?
          if (typeof keyValue === "string") {
            childrenArr.push({ el: newEl, keyValue });
          } else {
            console.error(`Only strings can be used as keys in for loops. 
            
            ${key} has value of ${keyValue}, and is of type ${typeof keyValue}`);
          }
        } else {
          currentItem.el.replaceWith(newEl);
          removeEl(currentItem.el);
        }

        //  Handle destroying in setup?
        const destroy = bindDirectives(
          newEl,
          {
            ...data,
            $index: i,
            [indexName]: index,
            [itemName]: item,
          },
          globalThis.window.$directives,
        );
        addToDestroyMap(newEl, destroy);
      }
    };

    return cb;
  },
  // Tidy up directive where we handle the createEffect
  destroyed: (_el) => {
    // console.log("destroyed", el);
    // for (const cb of destroyedMap.get(el) ?? []) {
    //   cb();
    // }
  },
};
