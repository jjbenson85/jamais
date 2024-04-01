import { isSignal } from "../signal";

const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
  typeof v === "function";

export const getValue = (expr: unknown) => {
  if (isSignal(expr)) return expr.get();
  if (isFunction(expr)) return expr();
  return expr;
};