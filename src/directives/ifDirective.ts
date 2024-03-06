import { createDirective } from "../bindDirectives";
import {
  getSiblingElementsToBind,
  getSiblingElsWithBindType,
} from "../getElementsToBind";
import { displayElement } from "../helpers/displayElement";
import { isRef } from "../ref";

export const ifDirective = createDirective((ctx) => {
  const { el, get, value, data } = ctx;

  const elses = getSiblingElementsToBind(el, "else-if", data);
  const elseEl = getSiblingElsWithBindType(el, "else").at(0);

  const els = [el, ...elses.map((e) => e.el), elseEl].filter(
    (e): e is HTMLElement => Boolean(e)
  );
  const elsDisplay = els.map(displayElement);

  const getValues = [get, ...elses.map((e) => e.get), () => !get()];
  const refs = [value, ...elses.map((e) => e.value), value];
  const cb = () => {
    //Hide all elements
    elsDisplay.forEach((toggleElement) => toggleElement(false));

    const displayIndex = els.findIndex((_, i) => getValues[i]());

    if (displayIndex === -1) return;

    //Show the correct element
    const elToDisplayFn = elsDisplay[displayIndex];

    elToDisplayFn(true);
  };

  refs.filter(isRef).forEach((ref) => ref.addProcessQueueWatcher(cb));

  cb();
});
