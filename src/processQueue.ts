import { DEBUG } from "./signal";

export class ProcessQueue {
  // Use sets to remove duplicates
  private queue: Set<() => void> = new Set();
  private postQueue: Set<() => void> = new Set();
  timerId: NodeJS.Timeout | undefined;

  add(fn: () => void, msg?: string) {
    DEBUG.value && console.info("add: ", { msg });

    this.queue.add(fn);
    this.debouceProcessQueue();
  }
  addPost(fn: () => void, msg?: string) {
    DEBUG.value && console.info("addPost: ", { msg });

    this.postQueue.add(fn);
    this.debouceProcessQueue();
  }

  processQueue = () => {
    for (const member of this.queue.keys()) {
      member();
      this.queue.delete(member);
    }

    for (const member of this.postQueue.keys()) {
      member();
      this.postQueue.delete(member);
    }
  };

  debouceProcessQueue = () => {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.timerId = undefined;
      DEBUG.value &&
        console.info({
          queue: this.queue.size,
          postQueue: this.postQueue.size,
        });
      this.processQueue();
    }, 0);
  };
}

export const globalQueue = new ProcessQueue();
