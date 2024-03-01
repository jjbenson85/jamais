import { computed } from "../computed";

import { describe, it, expect, vi } from "vitest";
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
});
