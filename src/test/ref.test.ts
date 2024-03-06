import { ref } from "../ref";

import { describe, expect, it, vi } from "vitest";
describe("ref", () => {
  it("should create a ref", () => {
    const r = ref(1);
    expect(r.value).toBe(1);
  });

  it("should update the ref", () => {
    const r = ref(1);
    r.value = 2;
    expect(r.value).toBe(2);
  });

  it("should call watchers", () => {
    const r = ref(1);
    const cb = vi.fn();
    r.addWatcher(cb);
    r.value = 2;
    expect(cb).toHaveBeenCalledOnce();
  });

  it("should not call watchers if the value is the same", () => {
    const r = ref(1);
    const cb = vi.fn();
    r.addWatcher(cb);
    r.value = 1;
    expect(cb).not.toHaveBeenCalled();
  });
});
