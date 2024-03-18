import { describe, it, expect, vi } from "vitest";
import { ProcessQueue } from "./processQueue";
import { wait } from "./test/utils";

describe("ProcessQueue", () => {
  it("should create a ProcessQueue", () => {
    const queue = new ProcessQueue();
    expect(queue).toBeDefined();
  });

  it("should add to the queue", async () => {
    const queue = new ProcessQueue();
    const fn = vi.fn();
    queue.add(fn);
    await wait(0);
    expect(fn).toHaveBeenCalled();
  });
  it("should add to the post queue", async () => {
    const queue = new ProcessQueue();
    const fn = vi.fn();
    queue.addPost(fn);

    await wait(0);
    expect(fn).toHaveBeenCalled();
  });

  it("should process the queue before the post queue", async () => {
    const queue = new ProcessQueue();
    const postFn = vi.fn();
    const preFn = vi.fn();
    let count = 0;
    queue.addPost(() => postFn(count));
    queue.add(() => preFn(count++));

    await wait(0);
    expect(preFn).toHaveBeenCalledWith(0);
    expect(postFn).toHaveBeenCalledWith(1);
  });
});
