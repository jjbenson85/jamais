import type { Ref } from "./ref";
import { Directive, bindDirectives } from "./bindDirectives";
import { switchDirective } from "./directives/switchDirective";
import { textDirective } from "./directives/textDirective";
import { eventDirective } from "./directives/eventDirective";
import { bindDirective } from "./directives/bindDirective";
import { classDirective } from "./directives/classDirective";
import { modelDirective } from "./directives/modelDirective";
import { ifDirective } from "./directives/ifDirective";
import { forDirective } from "./directives/forDirective";

type SetupMethods = ((...args: any[]) => string) | ((...args: any[]) => void);
export type SetupBits =
  | Ref<any>
  | SetupMethods
  | number
  | string
  | boolean
  | Record<string, unknown>
  | null
  | undefined;

export const builtInDirectives: Record<string, Directive> = {
  "data-switch": switchDirective,
  "data-text": textDirective,
  "data-event": eventDirective,
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
  _document: Document = document
) {
  const el = _document.querySelector<HTMLElement>(options.attach);
  if (!el) throw new Error("No element found");

  bindDirectives({ ...builtInDirectives, ...options.directives }, data, el);
}
