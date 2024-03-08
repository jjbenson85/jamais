import { createDirective } from "../bindDirectives";
import { displayElement } from "../helpers/displayElement";

export const switchDirective = createDirective((ctx) => {
  const { el, get, effect } = ctx;

  const caseEls = el.querySelectorAll<HTMLElement>("[data-case]");

  const cbs = [...caseEls].reduce(
    (acc, caseEl) => {
      const caseValue = caseEl.getAttribute("data-case");
      if (!caseValue) return acc;

      const displayCaseEl = displayElement(caseEl);
      acc.push(() => displayCaseEl(get() === caseValue));

      return acc;
    },
    [] as Array<(() => string) | (() => void)>,
  );
  const cb = () => {
    for (const cb of cbs) {
      cb();
    }
  };
  effect?.(cb);
  cb();
});
