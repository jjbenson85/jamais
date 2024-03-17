import { globalQueue } from "./processQueue";

type SyncType = "sync" | "pre" | "post";

let currentListener: null | [cb: () => void, sync: SyncType, msg: string] =
  null;

export const DEBUG = {
  value: false,
  get: () => {
    return DEBUG.value;
  },
  set: (newValue: boolean) => {
    DEBUG.value = newValue;
  },
};

export class Signal<T> {
  value: T;
  previousValue: T | undefined = undefined;
  subscribers = new Map<() => void, [() => void, SyncType, string]>();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get = () => {
    if (currentListener !== null) {
      const [effect] = currentListener;
      this.subscribers.set(effect, currentListener);
    }
    return this.value;
  };

  set = (newValue: T, msg?: string) => {
    DEBUG.value &&
      console.info({ setter: msg, is_changed: newValue !== this.value });

    if (newValue === this.value) return;

    this.previousValue = this.value;
    this.value = newValue;

    // after setting the value, run any subscriber, aka effect, functions
    // add them to appropriate queues or run them immediately
    for (const [effect, sync, subMsg] of this.subscribers.values()) {
      switch (sync) {
        case "sync": {
          DEBUG.value && console.info("call", { sync, msg: subMsg });
          effect();
          continue;
        }
        case "pre": {
          globalQueue.add(effect, subMsg);
          continue;
        }
        case "post": {
          globalQueue.addPost(effect, subMsg);
          continue;
        }
      }
      sync satisfies never;
    }
  };
}

/**
 * Create a new signal
 * @param initialValue
 * @returns
 */
export const signal = <T>(initialValue: T) => new Signal<T>(initialValue);

/**
 * Check if a value is a signal
 * @param maybeSignal
 * @returns
 */
export const isSignal = <T>(
  maybeSignal: T | Signal<T>,
): maybeSignal is Signal<T> => maybeSignal instanceof Signal;

/**
 * Will run the callback every time the signals used in the callback change
 * To attach to a signal, the signals need to be called on the inital call
 * @param effect
 */
export function createEffect(effect: () => void, msg = "createEffect") {
  currentListener = [effect, "pre", msg];
  effect();
  currentListener = null;
}

/**
 * Will run the callback after all the createEffect callbacks have run
 * @param effect
 */
export function createPostEffect(effect: () => void, msg = "createPostEffect") {
  currentListener = [effect, "post", msg];
  effect();
  currentListener = null;
}

/**
 * Will run the callback immediately and then every time the signals used in the callback change
 * @param effect
 */
export function createSyncEffect(effect: () => void, msg = "createSyncEffect") {
  currentListener = [effect, "sync", msg];
  effect();
  currentListener = null;
}

/**
 * Returns a signal that will update before the dom is updated, when the signals used in the callback change
 * @param effect
 * @returns
 */
export function computed<T>(effect: () => T, msg = "computed") {
  const newSignal = signal(effect());
  createEffect(() => {
    newSignal.set(effect(), msg);
  }, msg);
  return newSignal;
}

/**
 * Returns a signal that will immediately update after the signals used in the callback change
 * @param effect
 * @param msg
 * @returns
 */
export function computedSync<T>(effect: () => T, msg = "computedSync") {
  const newSignal = signal(effect());
  createSyncEffect(() => {
    newSignal.set(effect(), msg);
  }, msg);
  return newSignal;
}
