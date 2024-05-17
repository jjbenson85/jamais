import "./styles.css";

import { DEBUG } from "./signal";
import { bindDirectives } from "./bindDirectives";
import { ComponentConstrucor } from "./defineComponent";

export type GlobalContext = {
  components: Record<string, ComponentConstrucor>;
};

export function setup(
  data: Record<string, unknown>,
  options: {
    attach: string | HTMLElement;
    components?: Record<string, ComponentConstrucor>;
    debug?: boolean;
  },
  _document: Document = document,
) {
  if (options.debug) {
    DEBUG.value = true;
  }

  const el =
    typeof options.attach === "string"
      ? _document.querySelector<HTMLElement>(options.attach)
      : options.attach;

  if (!el) throw new Error("No element found");

  bindDirectives(el, data, options.components ?? {});
}
