import { Directive } from "./bindDirectives";
import { classDirective } from "./directives/classDirective";
import { forDirective } from "./directives/forDirective";
import { ifDirective } from "./directives/ifDirective";
import { modelDirective } from "./directives/modelDirective";
import { switchDirective } from "./directives/switchDirective";
import { textDirective } from "./directives/textDirective";
import { templateDirective } from "./directives/templateDirective";
import { Component } from "./defineComponent";
import { bind } from "./bind";

export const builtInDirectives: Record<string, Directive> = {
  "data-switch": switchDirective,
  "data-text": textDirective,
  "data-model": modelDirective,
  "data-if": ifDirective,
  "data-in": forDirective,
  "data-template": templateDirective,
  class: classDirective,
};

export function setup(
  data: Record<string, unknown>,
  options: {
    attach: string;
    components?: Record<string, Component>;
    directives?: Record<string, Directive>;
  },
  _document: Document = document,
) {
  const el = _document.querySelector<HTMLElement>(options.attach);
  if (!el) throw new Error("No element found");

  const directives = { ...builtInDirectives, ...options.directives };
  const components = { ...options.components };

  bind({ components, data, el, directives });
}
