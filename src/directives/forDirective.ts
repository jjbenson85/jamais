import { getValue } from "@/helpers/getValueFromUnknown";
import { evaluateExpression } from "@helpers/evaluateExpression";
import { setupBindDirectives } from "./setupBindDirectives";

import { Directive } from "./types";

export const forDirective: Directive = {
  name: "forDirective",
  matcher: (attr: Attr) => attr.name === ":data-for",
  mounted: (el, _attrName, attrValue, data, components) => {
    if (!el.hasAttribute(":data-key")) {
      console.warn(
        `:data-for must have a :data-key attribute\n\n${el.outerHTML}`,
      );
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
        console.error(`:data-for expects an object, array or a number or a function that returns an object, array or number\n\n${el.outerHTML
          }

        ${itemsName} is of type ${typeof value}
        `);
        return [];
      }

      const output = value as Record<string, unknown>;
      return output;
    };

    const parentEl = el.parentElement;

    el.remove();

    return () => {
      parentEl.innerHTML = "";
      const items = getItems();
      for (const [index, item] of Object.entries(items)) {
        const newEl = el.cloneNode(true) as HTMLElement;
        parentEl.appendChild(newEl);

        setupBindDirectives(
          newEl,
          {
            ...data,
            [indexName]: index,
            [itemName]: item,
          },
          components,
        );
      }
    };
  },
};
