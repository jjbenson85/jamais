import { createDirective } from "../bindDirectives";

export const templateDirective = createDirective((ctx) => {
  const { el, attrValue } = ctx;
  const parentElement = el.parentElement;

  if (parentElement === null) {
    console.error("No parent element for", el);
    return;
  }

  const templateEl = global.document.querySelector<HTMLTemplateElement>(
    `template[name=${attrValue}]`,
  );

  if (!templateEl) {
    console.error(`No element found with name ${attrValue}`);
    return;
  }

  const clone = templateEl.content.cloneNode(true) as HTMLElement;

  parentElement.insertBefore(clone, el);
  el.remove();

  return [clone];
});