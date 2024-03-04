import type { Ref } from "./ref";
import { bindFor } from "./bindFor";
import { bindIf } from "./bindIf";
import { Directive, bindDirectives } from "./bindDirectives";
import { switchDirective } from "./directives/switchDirective";
import { textDirective } from "./directives/textDirective";
import { eventDirective } from "./directives/eventDirective";
import { bindDirective } from "./directives/bindDirective";
import { classDirective } from "./directives/classDirective";
import { modelDirective } from "./directives/modelDirective";
import { ifDirective } from "./directives/ifDirective";

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

export function setup(
  data: Record<string, SetupBits>,
  options: {
    attach: string;
    directives?: Record<string, (el: Element, value: any) => void>;
  },
  _document: Document = document
) {
  const el = _document.querySelector<HTMLElement>(options.attach);
  if (!el) throw new Error("No element found");

  bindFor(data, el);
  // bindIf(data, el);

  const directives: Record<string, Directive> = {
    "data-switch": switchDirective,
    "data-text": textDirective,
    "data-event": eventDirective,
    "data-bind": bindDirective,
    "data-class": classDirective,
    "data-model": modelDirective,
    "data-if": ifDirective,
  };
  bindDirectives(directives, data, el);
}
