export class ProcessQueue {
  private queue: (() => void)[] = [];
  timerId: NodeJS.Timeout | undefined;

  add(fn: () => void) {
    this.queue.push(fn);
    this.debouceProcessQueue();
  }

  processQueue = () => {
    while (this.queue.length) {
      this.queue.shift()?.();
    }
  };

  debouceProcessQueue = () => {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.timerId = undefined;
      this.processQueue();
    }, 0);
  };
}

export const globalQueue = new ProcessQueue();
