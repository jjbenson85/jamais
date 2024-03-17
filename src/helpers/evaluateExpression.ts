import { computed, createEffect, createSyncEffect, signal } from "../signal";

export function evaluateExpression(
  expression: string,
  data: Record<string, unknown>,
) {
  const keys = Object.keys(data);
  keys.push("signal");
  keys.push("computed");
  keys.push("createEffect");
  keys.push("createSyncEffect");
  const values = Object.values(data);
  values.push(signal);
  values.push(computed);
  values.push(createEffect);
  values.push(createSyncEffect);
  try {
    const fn = new Function(...keys, `return ${expression}`);
    const v = fn(...values);
    return v;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
