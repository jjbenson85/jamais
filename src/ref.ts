import { globalQueue } from "./processQueue";

export class Ref<T> {
  private _previousValue: T | undefined;
  private _currentValue: T;
  private _watchers: Set<() => void>;
  constructor(value: T) {
    this._currentValue = value;
    this._previousValue = undefined;
    this._watchers = new Set();
  }
  get value() {
    return this._currentValue;
  }
  set value(value: T) {
    this._setInternalValue(value);
    this._callWatchers();
  }

  get previousValue() {
    return this._previousValue;
  }
  set previousValue(_value: T | undefined) {}

  get currentValue() {
    return this._currentValue;
  }
  set currentValue(_value: T) {}

  _setInternalValue = (value: T) => {
    this._previousValue = this._currentValue;
    this._currentValue = value;
  };

  _callWatchers = () => {
    if (this._previousValue !== this._currentValue) {
      this._watchers.forEach((fn) => fn());
    }
  };

  addWatcher = (fn: () => void) => {
    this._watchers.add(fn);
  };

  addProcessQueueWatcher = (fn: () => void) => {
    this.addWatcher(() => globalQueue.add(fn));
  };
}

export const ref = <T>(value: T) => new Ref<T>(value);

export const isRef = <T>(v: T | Ref<T>): v is Ref<T> => v instanceof Ref;
