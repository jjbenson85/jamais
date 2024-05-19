import { computed, signal } from "../signal";

export function evaluateExpression(
  expression: string,
  data: Record<string, unknown>,
  msg = "Error evaluating expression",
): unknown {
  return handler(`return ${expression}`, data, msg);
}

export function evaluateStatement(
  statement: string,
  data: Record<string, unknown>,
  msg = "Error evaluating statement",
): void {
  handler(statement, data, msg);
}

function handler(
  expression: string,
  data: Record<string, unknown>,
  msg = "Error evaluating expression",
) {
  const newData = { ...data, computed, signal };
  try {
    return new Function(...Object.keys(newData), expression)(
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
