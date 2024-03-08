import { createDirective, makeGetValue } from "../bindDirectives";

export const bindDirective = createDirective((ctx) => {
  const { data, el, attrValue: _attrValue, effect } = ctx;
  if (!_attrValue) return;

  const attrValueArr = _attrValue.split(" ");

  for (const attr of attrValueArr) {
    const isPrefixed = attr.includes(":");

    if (!isPrefixed) {
      console.warn(`No prefix found for the bind directive on
      
      ${el.outerHTML}

      Bind directives should be written data-bind="<attribute>:<value>".
      e.g. "aria-label:labelText"`);
      return;
    }

    const [attrPrefix, attrValue] = attr.split(":");
    const get = makeGetValue(data, attrValue);
    const cb = () => el.setAttribute(attrPrefix, String(get()));

    effect?.(cb);

    cb();
  }

});
