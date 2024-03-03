import {
  getElementsToBind,
  getSiblingElsWithBindType,
  getSiblingElementsToBind,
} from "./getElementsToBind";
import { isRef } from "./helpers";
import { Ref } from "./ref";
import { SetupBits } from "./setup";

const displayElement = (el: HTMLElement | undefined) => {
  if (!el) return () => {};
  const display = el.style.display;
  return (isVisible: boolean) =>
    (el.style.display = isVisible ? display : "none");
};

export function bindIf(data: Record<string, SetupBits>, el: Element) {
  getElementsToBind(el, "if", data).forEach(({ el, value, getDeepValue }) => {
    const ifEl = el as HTMLElement;
    const ifElDisplay = displayElement(ifEl);
    const ifElGetDeepValue = getDeepValue;
    const ifElRef = value;

    const [elseIfEls, elseIfGetDeepValues, elseIfRefs] =
      getSiblingElementsToBind(el, "else-if", data).reduce(
        (acc, e) => {
          acc[0].push(e.el as HTMLElement);
          acc[1].push(e.getDeepValue);
          acc[2].push(e.value);
          return acc;
        },
        [[], [], []] as [HTMLElement[], (() => unknown)[], SetupBits[]]
      );
    const elseIfElsDisplay = elseIfEls.map(displayElement);

    const elseEl = getSiblingElsWithBindType(el, "else").at(0);
    const elseIfDisplay = displayElement(elseEl as HTMLElement);

    const fn = () => {
      if (ifElGetDeepValue()) {
        ifElDisplay(true);
        elseIfElsDisplay.forEach((toggleElement) => toggleElement(false));
        elseIfDisplay(false);
      } else if (elseIfGetDeepValues.some((getDeepValue) => getDeepValue())) {
        ifElDisplay(false);
        elseIfElsDisplay.forEach((toggleElement) => toggleElement(false));
        elseIfDisplay(false);
        const elseIfIndex = elseIfEls.findIndex((_, i) =>
          elseIfGetDeepValues[i]()
        );
        elseIfElsDisplay[elseIfIndex](true);
      } else {
        ifElDisplay(false);
        elseIfElsDisplay.forEach((toggleElement) => toggleElement(false));
        elseIfDisplay(true);
      }
    };

    fn();

    [ifElRef, ...elseIfRefs]
      .filter((e): e is Ref<unknown> => isRef(e))
      .forEach((ref) => ref.addProcessQueueWatcher(fn));

    //   Is not a ref if insideFor and using $VALUE in template
    if (typeof value === "function") {
      console.warn("TODO: Can only bind refs");
      return;
    }
  });
}
