import { Ref } from "./ref";

export const getPropertyFromPath = (
  obj: Record<string, unknown>,
  path: string
) => {
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
