export const wait = async (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));


export const prettyHTML = (_str: string) => {
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
      formatted += "\n" + " ".repeat(indent-- * 2) + "<";
    } else {
      formatted += "\n" + " ".repeat(++indent * 2) + "<";
    }
  }
  return formatted.trim();
};