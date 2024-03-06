import { createDirective } from "../bindDirectives";
import { displayElement } from "../helpers/displayElement";

export const switchDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { get, effect } = attr;
    const caseEls = el.querySelectorAll<HTMLElement>("[data-case]");

    const cbs = [...caseEls].reduce((acc, caseEl) => {
      const caseValue = caseEl.getAttribute("data-case");
      if (!caseValue) return acc;

      const displayCaseEl = displayElement(caseEl);
      acc.push(() => displayCaseEl(get() === caseValue));

      return acc;
    }, [] as Array<() => string | void>);
    const cb = () => cbs.forEach((cb) => cb());
    effect(cb);
    cb();
  }
});
