import { computed, createEffect, createSyncEffect, signal } from "../signal";

export function evaluateExpression(
  expression: string,
  data: Record<string, unknown>,
  msg = "Error evaluating expression",
): unknown {
  const newData = { ...data, computed, signal, createEffect, createSyncEffect };
  try {
    return new Function(...Object.keys(newData), `return ${expression}`)(
      ...Object.values(newData),
    );
  } catch (err) {
    const message = msg ? `\n\n${msg}` : "";
    console.error(
      `Error evaluating expression: ${expression}${message}\n\n`,
      err,
    );
    return undefined;
  }
}
