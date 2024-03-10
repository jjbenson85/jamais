import { bindComponents } from "./bindComponents";
import { Directive, bindDirectives } from "./bindDirectives";
import { bindEvents } from "./bindEvents";
import { Component } from "./defineComponent";

export const bind = (args: {
  components: Record<string, Component>;
  data: Record<string, unknown>;
  directives: Record<string, Directive>;
  el: HTMLElement;
}) => {
  if (!args.el) throw new Error("No element found");
  bindDirectives(args);
  bindComponents(args);
  bindEvents(args);

};