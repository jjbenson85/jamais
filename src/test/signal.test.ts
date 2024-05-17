import { describe, it, expect } from "vitest";
import { createSyncEffect, signal } from "../signal";

describe("reactive", () => {
  it.each([
    ["number", 1],
    ["string", "hello"],
    ["object", { a: 1 }],
    ["array", [1, 2, 3]],
    ["null", null],
    ["undefined", undefined],
  ])("should create a reactive %s", (_id, expected) => {
    const r = signal(expected);
    expect(r.get()).toBe(expected);
  });

  it.each([
    ["number", 0, 1],
    ["string", "", "hello"],
    ["object", { a: 0 }, { a: 1 }],
    ["array", [], [1, 2, 3]],
    ["null", {}, null],
    ["undefined", true, undefined],
  ])("should update a reactive %s", (_id, start, expected) => {
    const r = signal(start as unknown);
    r.set(expected);
    expect(r.get()).toBe(expected);
  });

  it("should notify subscribers", () => {
    const r = signal(1);
    let count = 0;

    createSyncEffect(() => {
      count = r.get();
    });

    r.set(2);

    expect(count).toBe(2);
  });
});
