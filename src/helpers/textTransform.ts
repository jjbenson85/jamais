export const camelToKebab = (str: string) => {
  return str.replaceAll(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
};

export const kebabToCamel = (str: string) => {
  return str.replace(/-([a-z])/g, (m) => m[1].toUpperCase());
};
