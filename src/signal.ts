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
  previous: T | undefined;
  validator: (value: T) => boolean;
  subscribers = new Set<Effect | DelayedEffect<T>>();
  name: string;

  constructor(
    initialValue: T,
    validator: (value: T) => boolean,
    name = "Signal",
  ) {
    this.previous = undefined;
    this.validator = validator;
    this.name = name;
    this.validate(initialValue);
    this.value = initialValue;
  }

  validate = (newValue: T) => {
    function is_constructor<T>(f: (args: T) => boolean) {
      try {
        Reflect.construct(String, [], f);
      } catch (e) {
        return false;
      }
      return true;
    }
    // TODO: Just provide simple validators
    const isConstructor = is_constructor(this.validator);

    const isPrimitvive = ["String", "Number", "Boolean"].includes(
      this.validator.name,
    );
    const name = this.validator.name.toLowerCase();
    const type = typeof newValue;
    const isValid = isPrimitvive
      ? type === name
      : isConstructor
        ? newValue instanceof this.validator
        : this.validator(newValue);

    if (!isValid) {
      console.error(`${this.name} set to an invalid value: ${newValue}.
        Validator: ${this.validator.name || this.validator.toString()}`);
    }
  };

  get = () => {
    if (currentSubscriberEffect !== null) {
      this.subscribers.add(currentSubscriberEffect);
      currentSubscriberEffect.addSubscription(this as Signal<unknown>);
    }
    return this.value;
  };

  getPrevious = () => {
    return this.previous;
  };

  set = (newValue: T, options?: { force?: boolean; msg?: string }) => {
    DEBUG.value && console.info("set", { msg: options?.msg, newValue }, this);

    // const force = options?.force === true;
    // console.log({ force })

    if (newValue === this.value) return;
    // if (!force && (newValue === this.value)) {
    //   console.log({
    //     msg: options?.msg,
    //     force, e: newValue === this.value
    //   })
    //   return;
    // }

    this.validate(newValue);
    this.previous = this.value;
    this.value = newValue;
    for (const effect of this.subscribers.values()) {
      // batch
      effect.run();
    }
    return this.value;
  };

  valueOf = () => {
    const error = new Error();
    console.warn(`Directly using the value of a Signal is not recommended. Use .get() instead.

     ${error.stack?.split("\n")[2]}`);
    return this.value;
  };

  update = (
    fn: (prev: T) => T,
    options?: { force?: boolean; msg?: string },
  ) => {
    this.set(fn(this.value), { force: true, ...options });
    return this.value;
  };

  removeSubscriber = (effect: Effect) => {
    this.subscribers.delete(effect);
  };
}

/**
 * Will run the callback every time the signals used in the callback change
 * To attach to a signal, the signals need to be called on the inital call or psdded to the watch array
 * @param effect
 */
export class Effect {
  effect: () => void;
  sync: SyncType;
  msg: string;
  subscriptions: Set<Signal<unknown>> = new Set();

  constructor(
    effect: () => void,
    options?: {
      sync?: SyncType;
      msg?: string;
      watch?: Signal<any>[];
    },
  ) {
    this.effect = effect;
    this.sync = options?.sync ?? "pre";
    this.msg = options?.msg ?? "Effect";


    currentSubscriberEffect = this;
    if (options?.watch?.length) {
      for (const signal of options.watch) {
        signal.get();
      }
    } else {
      effect();
    }
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
  };

  destroy = () => {
    for (const signal of this.subscriptions) {
      signal.removeSubscriber(this);
    }
  };
}

class DelayedEffect<T> {
  effect: () => void;
  sync: SyncType;
  msg: string;
  subscriptions: Set<Signal<unknown>> = new Set();

  constructor(
    signal: Signal<T>,
    effect: () => void,
    sync: SyncType,
    msg: string,
  ) {
    this.effect = effect;
    this.sync = sync;
    this.msg = msg;
    signal.subscribers.add(this);
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
export const signal = <T>(
  initialValue: T,
  validator: (value: T) => boolean = () => true,
  name?: string,
) => {
  return new Signal<T>(initialValue, validator, name);
};

/**
 * Check if a value is a signal
 * @param maybeSignal
 * @returns
 */
export const isSignal = <T>(
  maybeSignal: T | Signal<T>,
): maybeSignal is Signal<T> => maybeSignal instanceof Signal;

/**
 * Returns a signal that will update before the dom is updated, when the signals used in the callback change
 * @param effect
 * @returns
 */
type ComputedOptions<T> = {
  watch?: [Signal<any>, ...Signal<any>[]];
  name?: string;
  validator?: (value: T) => boolean;
  immediate?: boolean;
  sync?: SyncType;
};
type ComputedOptionsImmediate<T> = ComputedOptions<T> & { immediate?: true };
type ComputedOptionsDelayed<T> = ComputedOptions<T> & {
  watch: [Signal<any>, ...Signal<any>[]];
  immediate: false;
};
export function computed<T>(
  cb: () => T,
  options?: ComputedOptionsDelayed<T>,
): Signal<T> //| undefined;
export function computed<T>(
  cb: () => T,
  options?: ComputedOptionsImmediate<T>,
): Signal<T>;

export function computed<T>(
  cb: () => T,
  options?: ComputedOptionsDelayed<T> | ComputedOptionsImmediate<T>,
) {
  const immediate = options?.immediate ?? true;
  const watchArr = options?.watch ?? [];

  if (!immediate && !watchArr.length) {
    console.error(
      "If immediate is set to false, watch must be set to an array of signals",
    );
  }

  if (!immediate && watchArr.length) {
    const newSignal = signal<T | undefined>(undefined);
    for (const signal of watchArr) {
      new DelayedEffect(
        signal,
        () => newSignal.set(cb()),
        "pre",
        options?.name ?? "computed",
      );
    }
    return newSignal;
  }
  const newSignal = signal(undefined as any, options?.validator, options?.name);
  new Effect(() => newSignal.set(cb()), { msg: "computed", ...options });
  return newSignal;
}

const query = signal("");
const test = computed(() => query.get(), {
  // immediate: true,
  // watch:[query]
});
// console.log(test);

const isName = signal(false);
const name = signal('J');
const age = signal(0);

const derived = computed(() => {
  // console.log('inside')
  if (isName.get()) {
    return name.get()
  } else {
    return age.get()
  }
})


// computed(() => {
//   console.log('derived', derived.get())
// })

name.set('JJ')
name.set('JJJ')
name.set('JJ')
name.set('JJJ')
name.set('JJ')
name.set('JJJ')
name.set('JJ')
name.set('JJJ')