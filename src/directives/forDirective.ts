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
    const effect = () => {
      // const childrenMap = new Map<string, HTMLElement>();
      // const children = new Map(Array.from(parentEl.children).map((el) => [el, el]));
      // const children: HTMLElement[] = [];
      // const scopes: Map<HTMLElement, Record<string, unknown>> = new Map();
      const entries = Object.entries(getItems());
      let count = 0;
      for (const [index, item] of entries) {
        const keyValue =
          key === "index"
            ? index
            : evaluateExpression(key, { [indexName]: index, [itemName]: item });

        const currentItem = childrenArr[count];
        if (!currentItem || currentItem.keyValue !== keyValue) {
          const newEl = elCopy.cloneNode(true) as HTMLElement;
          childrenArr[count] = { el: newEl, keyValue };

          if (currentItem) {
            currentItem.el.replaceWith(newEl);
          } else {
            parentEl.appendChild(newEl);
          }

          setup(
            {
              ...data,
              [indexName]: parseInt(index),
              [itemName]: item,
            },
            { attach: newEl },
          );
        }

        count++;
      }

      for (let i = count; i < childrenArr.length; i++) {
        childrenArr.pop()?.el.remove();
      }
    
    };

    return effect;
  },
};