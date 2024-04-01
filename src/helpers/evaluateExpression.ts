import { computed, createEffect, createSyncEffect, signal } from "../signal";

export function evaluateExpression(
  expression: string,
  data: Record<string, unknown>,
  msg = "Error evaluating expression",
): unknown {
  const keys = Object.keys(data);
  // keys.push("signal");
  // keys.push("computed");
  // keys.push("createEffect");
  // keys.push("createSyncEffect");
  const values = Object.values(data);
  // values.push(signal);
  // values.push(computed);
  // values.push(createEffect);
  // values.push(createSyncEffect);
  try {
    return new Function(...keys, `return ${expression}`)(...values);
  } catch (err) {
    const message = msg ? `\n\n${msg}` : "";
    console.error(
      `Error evaluating expression: ${expression}${message}\n\n`,
      err,
    );
    return undefined;
  }
}
