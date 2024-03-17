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
    const effect = () => {
      const children = new Map(
        Array.from(parentEl.children).map((el) => [el, el]),
      );
      const entries = Object.entries(getItems());

      for (const [index, item] of entries) {
        const keyValue =
          key === "index"
            ? index
            : evaluateExpression(key, { [indexName]: index, [itemName]: item });

        // Get the child that might have been made with this data
        const currentChildInPosition = children.values().next().value;

        // Remove from map of children that will be removed from parentEl
        children.delete(currentChildInPosition);

        // If the current child has the same key as the data, we don't need to do anything as it is still valid
        const currentChildKey =
          currentChildInPosition?.getAttribute("data-key");

        if (currentChildKey === keyValue) {
          continue;
        }

        // globalQueue.add(() => {
        const newEl = elCopy.cloneNode(true) as HTMLElement;
        parentEl.appendChild(newEl);

        // Set the actual value of the key on the element
        newEl.setAttribute("data-key", keyValue);

        const newScope = {
          ...data,
          [indexName]: index,
          [itemName]: item,
        };

        // Do we need to add to mergedScopeMap?
        // mergedScopeMap.set(newEl, newScope);

        setup(newScope, { attach: newEl });
      }

      // Remove any children that are left in the map
      for (const [el] of children) el.remove();
    };

    return effect;
  },
};