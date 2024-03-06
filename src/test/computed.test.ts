import { computed } from "../computed";

import { describe, expect, it, vi } from "vitest";
import { ref } from "../ref";

const mockConsoleWarn = vi.spyOn(console, "warn");

describe("computed", () => {
  it("should create a computed", () => {
    const a = ref(1);
    const r = computed(a, () => a.value * 2);
    expect(r.value).toBe(2);
  });

  it("should throw error if set without a setFn", () => {
    const a = ref(1);
    const r = computed(a, () => a.value * 2);
    r.value = 2;
    expect(mockConsoleWarn).toHaveBeenCalledWith("Cannot set a computed value");
  });

  it("should update when a ref value update", () => {
    const a = ref(1);
    const r = computed(a, () => a.value * 2);
    expect(r.value).toBe(2);
    a.value = 2;
    expect(r.value).toBe(4);
    a.value = 3;
    expect(r.value).toBe(6);
  });

  it("should call its watcher when a ref value update", () => {
    const a = ref(1);
    const r = computed(a, () => a.value * 2);
    const cb = vi.fn();
    r.addWatcher(cb);
    a.value = 2;
    expect(cb).toHaveBeenCalledOnce();
  });

  it("should not call its watcher if the value is the same", () => {
    const a = ref(1);
    const r = computed(a, () => a.value * 2);
    const cb = vi.fn();
    r.addWatcher(cb);
    a.value = 1;
    expect(cb).not.toHaveBeenCalled();
  });

  it("should use a setFn if passed", () => {
    const a = ref(1);
    const r = computed(
      a,
      () => a.value * 2,
      (value) => {
        a.value = value;
      },
    );
    r.value = 2;
    expect(a.value).toBe(2);
  });
});
