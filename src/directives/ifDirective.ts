import { defineDirective } from "../bindDirectives";
import {
  getSiblingElementsToBind,
  getSiblingElsWithBindType,
} from "../getElementsToBind";
import { displayElement } from "../helpers/displayElement";
import { isRef } from "../ref";

export const ifDirective = defineDirective((ctx) => {
  const { el, get, dataValue, data } = ctx;

  const elses = getSiblingElementsToBind(el, "else-if", data);
  const elseEl = getSiblingElsWithBindType(el, "else").at(0);

  const els = [el, ...elses.map((e) => e.el), elseEl].filter(
    (e): e is HTMLElement => Boolean(e),
  );
  const elsDisplay = els.map(displayElement);

  const getValues = [get, ...elses.map((e) => e.get), () => !get()];
  const refs = [dataValue, ...elses.map((e) => e.value), dataValue];
  const cb = () => {
    //Hide all elements
    for (const toggleElement of elsDisplay) {
      toggleElement(false);
    }

    const displayIndex = els.findIndex((_, i) => getValues[i]());

    if (displayIndex === -1) return;

    //Show the correct element
    const elToDisplayFn = elsDisplay[displayIndex];

    elToDisplayFn(true);
  };

  for (const ref of refs.filter(isRef)) {
    ref.addProcessQueueWatcher(cb);
  }

  cb();
});
