import { Ref } from "./ref";

export class Computed<T> extends Ref<T> {
  _getFn: () => T;
  _setFn?: (value: T) => void;
  constructor(
    refsToWatch: Ref<unknown>[],
    getFn: () => T,
    setFn?: (value: T) => void,
  ) {
    const value = getFn();

    super(value);
    this._getFn = getFn;
    this._setFn = setFn;

    for (const ref of refsToWatch) {
      ref.addWatcher(() => {
        const value = getFn();
        this._setInternalValue(value);
        this._callWatchers();
      });
    }
  }
  set value(_value: T) {
    if (!this._setFn) {
      console.warn("Cannot set a computed value");
      return;
    }
    this._setFn(_value);
  }
  get value() {
    const value = this._getFn();
    this.currentValue = value;
    return value;
  }
}
export const computed = <T>(
  refsToWatch: unknown | unknown[],
  getFn: () => T,
  setFn?: (value: T) => void,
) => {
  const refsToWatch2 = [refsToWatch]
    .flat()
    .filter((ref): ref is Ref => ref instanceof Ref);
  return new Computed(refsToWatch2, getFn, setFn);
};
