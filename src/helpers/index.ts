import { Ref } from "../ref";

export const getPropertyFromPath = (obj: unknown, path: string) => {
  if (typeof obj !== "object" || obj === null) return undefined;
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    value = toValue(value?.[key as keyof typeof value]);
  }
  return value;
};

export function isRef(value: unknown): value is Ref<unknown> {
  return value instanceof Ref;
}
export function toValue(value: unknown) {
  return isRef(value) ? value.value : value;
}

export function toPrevValue(value: unknown) {
  return isRef(value) ? value.previousValue : undefined;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
