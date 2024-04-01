type Cb = () => void;

export type Directive = {
  name: string;
  matcher: (attr: Attr) => boolean;
  mounted: (
    el: HTMLElement,
    attrName: string,
    attrValue: string,
    data: Record<string, unknown>,
    directives: Directive[],
  ) => Cb | undefined;
  destroyed?: (el: HTMLElement) => void;
};
