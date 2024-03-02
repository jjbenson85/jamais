import { expect } from "vitest";
import { prettyHTML } from "./utils";
expect.extend({
  toBeInnerHTML(received: string, expected: string) {
    //@ts-ignore
    const { utils } = this;
    const rFormatted = prettyHTML(received);
    const eFormatted = prettyHTML(expected);
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: rFormatted === eFormatted,
      message: () => `${utils.diff(rFormatted, eFormatted)}`,
    };
  },
});
