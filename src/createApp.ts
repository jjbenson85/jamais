import "./styles.css";

import { ComponentConstructor } from "./defineComponent";
import { setupBindDirectives } from "./directives/setupBindDirectives";
import { DEBUG } from "./signal";

export function createApp(
  data: Record<string, unknown>,
  options: {
    attach: string | HTMLElement;
    onMounted?: () => void;
    components?: Record<string, ComponentConstructor>;
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

  setupBindDirectives(el, data, options.components);

  options?.onMounted &&
    document.addEventListener("DOMContentLoaded", options.onMounted);
}
