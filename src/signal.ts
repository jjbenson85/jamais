import { globalQueue } from "./processQueue";

type SyncType = "sync" | "pre" | "post";

let currentSubscriberEffect: null | Effect = null;

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
  subscribers = new Set<Effect>();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get = () => {
    if (currentSubscriberEffect !== null) {
      this.subscribers.add(currentSubscriberEffect);
      currentSubscriberEffect.addSubscription(this as Signal<unknown>);
    }
    return this.value;
  };

  set = (newValue: T, msg?: string) => {
    DEBUG.value && console.info("set", { msg, newValue }, this);

    if (newValue === this.value) return;

    this.value = newValue;

    for (const effect of this.subscribers.values()) {
      effect.run();
    }
  };

  removeSubscriber = (effect: Effect) => {
    this.subscribers.delete(effect);
  };
}

export class Effect {
  effect: () => void;
  sync: SyncType;
  msg: string;
  subscriptions: Set<Signal<unknown>> = new Set();

  constructor(effect: () => void, sync: SyncType, msg: string) {
    this.effect = effect;
    this.sync = sync;
    this.msg = msg;

    currentSubscriberEffect = this;
    effect();
    currentSubscriberEffect = null;
  }

  addSubscription = (signal: Signal<unknown>) => {
    this.subscriptions.add(signal);
  };

  run = () => {
    const { effect, sync, msg } = this;
    DEBUG.value && console.info("run", this);
    switch (sync) {
      case "sync": {
        effect();
        return;
      }
      case "pre": {
        globalQueue.add(effect, msg);
        return;
      }
      case "post": {
        globalQueue.addPost(effect, msg);
        return;
      }
    }
    sync satisfies never;
  };

  destroy = () => {
    for (const signal of this.subscriptions) {
      signal.removeSubscriber(this);
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
export const createEffect = (cb: () => void, msg = "createEffect") =>
  new Effect(cb, "sync", msg);

/**
 * Will run the callback after all the createEffect callbacks have run
 * @param effect
 */
export const createPostEffect = (cb: () => void, msg = "createPostEffect") =>
  new Effect(cb, "post", msg);


/**
 * Will run the callback immediately and then every time the signals used in the callback change
 * @param effect
 */
export const createSyncEffect = (cb: () => void, msg = "createSyncEffect") =>
  new Effect(cb, "sync", msg);

/**
 * Returns a signal that will update before the dom is updated, when the signals used in the callback change
 * @param effect
 * @returns
 */
export function computed<T>(cb: () => T, msg = "computed") {
  const newSignal = signal(cb());
  createEffect(() => {
    newSignal.set(cb(), msg);
  }, msg);
  return newSignal;
}

/**
 * Returns a signal that will immediately update after the signals used in the callback change
 * @param effect
 * @param msg
 * @returns
 */
export function computedSync<T>(cb: () => T, msg = "computedSync") {
  const newSignal = signal(cb());
  createSyncEffect(() => {
    newSignal.set(cb(), msg);
  }, msg);
  return newSignal;
}
