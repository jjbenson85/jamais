import { evaluateExpression } from "../helpers/evaluateExpression";
import { setup } from "../setup";
import { Directive } from "../types";

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
    // elCopy.removeAttribute(":data-for");

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

    const destroyMap = new WeakMap<HTMLElement, () => void>();
    const cb = () => {
      const entries = Object.entries(getItems());

      entries.forEach(([index, item], i) => {
        const keyValue = getKeyValue(key, index, item);
        const currentItem = childrenArr[i];

        if (!currentItem || currentItem.keyValue !== keyValue) {
          const newEl = elCopy.cloneNode(true) as HTMLElement;

          childrenArr[i] = { el: newEl, keyValue };

          if (currentItem) {
            currentItem.el.replaceWith(newEl);
          } else {
            parentEl.appendChild(newEl);
          }

          const destroy = setup(
            {
              ...data,
              $index: i,
              [indexName]: index,
              [itemName]: item,
            },
            { attach: newEl },
          );
          destroyMap.set(newEl, destroy);
        }
      });

      for (let i = entries.length; i < childrenArr.length; i++) {
        childrenArr.pop()?.el.remove();
      }
    };

    new MutationObserver((el) => {
      for (const node of el[0].removedNodes) {
        console.log({ destroying: node });
        destroyMap.get(node as HTMLElement)?.();
      }
    }).observe(parentEl, { childList: true });

    return cb;
  },
  destroyed: (el) => {
    console.log("destroyed", el);
  },
};
