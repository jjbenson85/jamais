import { createDirective } from "../bindDirectives";
import {
  getSiblingElementsToBind,
  getSiblingElsWithBindType,
} from "../getElementsToBind";
import { Ref, isRef } from "../ref";
import { SetupBits } from "../setup";

const displayElement = (el: HTMLElement | undefined) => {
  if (!el) return () => {};
  const display = el.style.display;
  return (isVisible: boolean) =>
    (el.style.display = isVisible ? display : "none");
};

export const ifDirective = createDirective((ctx) => {
  const { el, attrs, data } = ctx;
  for (const attr of attrs) {
    const { get, value } = attr;

    const ifEl = el as HTMLElement;
    const ifDisplay = displayElement(ifEl);
    const ifElGetDeepValue = get;
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

    const cb = () => {
      //Hide all elements
      ifDisplay(false);
      elseIfElsDisplay.forEach((toggleElement) => toggleElement(false));
      elseIfDisplay(false);

      if (ifElGetDeepValue()) {
        ifDisplay(true);
        return;
      }

      const getElseIfToDisplay = elseIfEls.findIndex((_, i) =>
        elseIfGetDeepValues[i]()
      );

      //Show the correct element
      if (getElseIfToDisplay > -1) {
        elseIfElsDisplay[getElseIfToDisplay](true);
        return;
      }

      elseIfDisplay(true);
    };

    [ifElRef, ...elseIfRefs]
      .filter((e): e is Ref<unknown> => isRef(e))
      .forEach((ref) => ref.addProcessQueueWatcher(cb));

    cb();
  }
});
