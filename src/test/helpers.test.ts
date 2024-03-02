import { getPropertyFromPath } from "../helpers";

import { describe, it, expect } from "vitest";

describe("getPropertyFromPath", () => {
  it("should get the property from the path", () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getPropertyFromPath(obj, "a.b.c")).toBe(1);
  });

  it("should return undefined if the path does not exist", () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getPropertyFromPath(obj, "a.b.d")).toBeUndefined();
  });
});
