import { createDirective, makeGetValue } from "../bindDirectives";

export const onDirective = createDirective((ctx) => {
  const { data, el, attrValue: _attrValue, effect, getPrevious } = ctx;
  if (!_attrValue) return;

  const attrValueArr = _attrValue.split(" ");

  for (const attr of attrValueArr) {
    const isPrefixed = attr.includes(":");

    if (!isPrefixed) {
      console.warn(`No event prefix found on 

      ${el.outerHTML}
    
      Events should be written  data-on="<event>:<function name>".
      e.g. "click:handleClick"`);
      return;
    }
    const [attrPrefix, attrValue] = attr.split(":");

    const get = makeGetValue(data, attrValue);

    const cb = () => {
      el.removeEventListener(attrPrefix, getPrevious?.() as () => void);
      el.addEventListener(attrPrefix, get() as () => void);
    };
    effect?.(cb);

    cb();
  }
});
