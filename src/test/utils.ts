import { Mock, beforeEach, vi } from "vitest";

export const wait = async (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const prettyHTML = (_str: string) => {
  if (typeof _str !== "string") return Error("prettyHTML only accepts strings");

  const str = _str
    .trim()
    .replaceAll(/[\n\t]/g, "")
    .replaceAll(/>\s*</g, "><");

  let indent = -1;
  let formatted = "";

  for (let i = 0; i < str.length; i++) {
    if (str[i] !== "<") {
      formatted += str[i];
      continue;
    }
    if (str[i + 1] === "/") {
      formatted += `\n${" ".repeat(indent-- * 2)}<`;
    } else {
      formatted += `\n${" ".repeat(++indent * 2)}<`;
    }
  }
  return formatted.trim();
};

export const spyConsoleError = () => {
  beforeEach(() => {
    (console.error as Mock).mockClear();
  });
  return vi.spyOn(console, "error");
};
export const spyConsoleWarn = () => {
  beforeEach(() => {
    (console.warn as Mock).mockClear();
  });
  return vi.spyOn(console, "warn");
};

export const spyConsoleLog = () => {
  beforeEach(() => {
    (console.log as Mock).mockClear();
  });
  return vi.spyOn(console, "log");
};
