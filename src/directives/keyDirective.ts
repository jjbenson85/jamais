import { Directive } from "./types";

// This stops :data-key from getting to the bindDirective
export const keyDirective: Directive = {
  name: "keyDirective",
  matcher: (attr: Attr) => attr.name === ":data-key",
  mounted: () => undefined,
};
