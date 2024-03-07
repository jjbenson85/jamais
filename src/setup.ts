import { Directive, bindDirectives } from "./bindDirectives";
import { bindDirective } from "./directives/bindDirective";
import { classDirective } from "./directives/classDirective";
import { onDirective } from "./directives/onDirective";
import { forDirective } from "./directives/forDirective";
import { ifDirective } from "./directives/ifDirective";
import { modelDirective } from "./directives/modelDirective";
import { switchDirective } from "./directives/switchDirective";
import { textDirective } from "./directives/textDirective";

export type SetupBits = unknown;


export const builtInDirectives: Record<string, Directive> = {
  "data-switch": switchDirective,
  "data-text": textDirective,
  "data-on": onDirective,
  "data-bind": bindDirective,
  "data-class": classDirective,
  "data-model": modelDirective,
  "data-if": ifDirective,
  "data-in": forDirective,
};

export function setup(
  data: Record<string, SetupBits>,
  options: {
    attach: string;
    directives?: Record<string, Directive>;
  },
  _document: Document = document,
) {
  const el = _document.querySelector<HTMLElement>(options.attach);
  if (!el) throw new Error("No element found");

  bindDirectives({ ...builtInDirectives, ...options.directives }, data, el);
}
