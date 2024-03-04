import { createDirective } from "../bindDirectives";

export const switchDirective = createDirective((ctx) => {
  const { el, attrs } = ctx;
  for (const attr of attrs) {
    const { get, effect } = attr;
    const originalDisplay = el.style.display;
    const caseEls = el.querySelectorAll<HTMLElement>("[data-case]");

    const cb = () => {
      caseEls.forEach((caseEl) => {
        const caseValue = caseEl.getAttribute("data-case");
        if (!caseValue) return;
        const value = get();
        caseEl.style.display = value === caseValue ? originalDisplay : "none";
      });
    };
    effect(cb);
    cb();
  }
});
