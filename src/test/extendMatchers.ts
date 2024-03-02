import { expect } from "vitest";
import { prettyHTML } from "./utils";
expect.extend({
  toBeInnerHTML(received: unknown, expected: string) {
    //@ts-ignore
    const { utils } = this;
    const rFormatted =
      typeof received === "string" ? prettyHTML(received) : received;
    const eFormatted =
      typeof expected === "string" ? prettyHTML(expected) : expected;

    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: rFormatted === eFormatted,
      message: () => `${utils.diff(rFormatted, eFormatted)}`,
    };
  },
});
