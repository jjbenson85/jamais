import type { SetupBits } from "./setup";

const isMethodEntry = (
  entry: [string, SetupBits]
): entry is [string, (() => string) | (() => void)] =>
  typeof entry[1] === "function";

export function setupMethods(
  dataEntries: [string, SetupBits][],
  _document: Element
) {
  const eventTypes = ["click"] as const;
  const methods = dataEntries.filter(isMethodEntry);

  for (const [methodName, method] of methods) {
    for (const eventType of eventTypes) {
      _document
        .querySelectorAll(`[data-${eventType}="${methodName}"]`)
        .forEach((el: Element) => el.addEventListener(eventType, method));
    }
  }
}
