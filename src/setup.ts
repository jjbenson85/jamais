import "./styles.css";

import { ComponentConstrucor } from "./defineComponent";
import { setupBindDirectives } from "./directives/setupBindDirectives";
import { DEBUG } from "./signal";

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
  DEBUG.value = !!options.debug;

  const el =
    typeof options.attach === "string"
      ? _document.querySelector<HTMLElement>(options.attach)
      : options.attach;

  if (!el) throw new Error("No element found");

  setupBindDirectives(el, data, options.components ?? {});
}
