import { DEBUG } from "./signal";

export class ProcessQueue {
  // Use sets to remove duplicates
  private queue: Set<() => void> = new Set();
  private postQueue: Set<() => void> = new Set();
  timerId: NodeJS.Timeout | undefined;

  add(fn: () => void, msg?: string) {
    DEBUG.value && console.info("add: ", { msg });

    this.queue.add(fn);

    if (this.queue.size === 1) {
      queueMicrotask(this.processQueue);
    }
  }
  addPost(fn: () => void, msg?: string) {
    DEBUG.value && console.info("addPost: ", { msg });

    this.postQueue.add(fn);
    if (this.postQueue.size === 1) {
      setTimeout(() => {
        queueMicrotask(this.processPostQueue);
      }, 0);
    }
  }

  processQueue = () => {
    for (const member of this.queue.keys()) {
      member();
      this.queue.delete(member);
    }
  };

  processPostQueue = () => {
    for (const member of this.postQueue.keys()) {
      member();
      this.postQueue.delete(member);
    }
  };
}

export const globalQueue = new ProcessQueue();
