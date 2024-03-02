import type { SetupBits } from "./setup";
import { globalQueue } from "./processQueue";
import { Ref } from "./ref";
import { bindText } from "./bindText";

function isForEntry(entry: [string, SetupBits]): entry is [string, Ref<any[]>] {
  const value = entry[1];
  return value instanceof Ref && Array.isArray(value.value);
}

export function setupFors(dataEntries: [string, SetupBits][], el: Element) {
  const forEntries = dataEntries.filter(isForEntry);

  const allFors = el.querySelectorAll(`[data-for]`);
  for (const el of allFors) {
    const attrValue = el.attributes.getNamedItem("data-for")?.value;
    if (!attrValue) return;

    const [_key, value] = attrValue.split(" in ");
    const key = _key.replace("$", "__data-for__");
    const ref = forEntries.find((entry) => entry[0] === value);
    if (!ref) return;

    const refValue = ref[1];
    const parentEl = el.parentElement;
    const siblings = Array.from(parentEl?.children || []);
    const preSibling = siblings.slice(0, siblings.indexOf(el));
    const postSibling = siblings.slice(siblings.indexOf(el) + 1);
    if (!parentEl) return;

    const fn = () => {
      parentEl.innerHTML = "";
      parentEl.append(...preSibling);
      const newChildren = refValue.value.map((item: any) => {
        const newEl = el.cloneNode(true) as Element;
        newEl.removeAttribute("data-for");

        bindText(newEl, { [key]: item }, true);

        newEl.querySelectorAll(`[data-class=${key}]`).forEach((el) => {
          el.className = el.classList + " " + item;
        });

        setupFors([...dataEntries, [key, item]], newEl);

        return newEl;
      });
      parentEl.append(...newChildren);
      parentEl.append(...postSibling);
    };
    refValue.addWatcher(() => globalQueue.add(fn));
    fn();
  }
}
