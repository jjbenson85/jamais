import { cls } from "../helpers/cls";

import { describe, expect, it } from "vitest";

describe("cls", () => {
  it("should create a class from a string", () => {
    const r = cls("a");
    expect(r).toBe("a");
  });

  it("should create a class from an array", () => {
    const r = cls(["a", "b"]);
    expect(r).toBe("a b");
  });

  it("should create a class from an object", () => {
    const r = cls({ a: true, b: false });
    expect(r).toBe("a");
  });

  it("should create a class from an array of objects and arrays", () => {
    const r = cls([{ a: true, b: false }, { c: true }, ["d"]]);
    expect(r).toBe("a c d");
  });

  it("should remove duplicates", () => {
    const r = cls(["a", "a"]);
    expect(r).toBe("a");
  });
});
