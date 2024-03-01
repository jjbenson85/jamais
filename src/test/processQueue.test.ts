import { ProcessQueue } from "../processQueue";

import { describe, it, expect, vi } from "vitest";
import { wait } from "./utils";

describe("ProcessQueue", () => {
  it("should process the queue", () => {
    const queue = new ProcessQueue();
    const fn = vi.fn();
    queue.add(fn);
    queue.processQueue();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should debounce the process", async () => {
    const queue = new ProcessQueue();
    const fn = vi.fn();
    const fnA = () => fn("a");
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    queue.add(fnA);
    fn("b");

    await wait();

    expect(fn).toHaveBeenNthCalledWith(1, "b");
    expect(fn).toHaveBeenNthCalledWith(2, "a");
    expect(fn).toHaveBeenCalledTimes(12);
  });
});
