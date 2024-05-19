import { ComponentConstrucor } from "@";

type Cb = () => void;

export type HTMLElementWithParent<T extends HTMLElement = HTMLElement> = T & { parentElement: HTMLElement };
export type Directive = {
  name: string;
  matcher: (attr: Attr) => boolean;
  mounted: (
    el: HTMLElementWithParent,
    attrName: string,
    attrValue: string,
    data: Record<string, unknown>,
    components: Record<string, ComponentConstrucor>,
  ) => Cb | undefined;
  destroyed?: (el: HTMLElement) => void;
};
