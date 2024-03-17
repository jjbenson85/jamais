const handleClsObj = (classes: Record<string, boolean>): string[] =>
  Object.entries(classes)
    .filter(([_key, value]) => value)
    .map(([key]) => key);

const handleClsArr = (classes: Classes[]): string[] =>
  classes.flatMap((cls) => {
    if (!cls) return [];
    if (typeof cls === "string") return cls;
    if (Array.isArray(cls)) return handleClsArr(cls);
    return handleClsObj(cls);
  });

type Classes = Record<string, boolean> | string | Classes[] | undefined;
export const cls = (classes: Classes): string =>
  [...new Set(handleClsArr([classes]))].join(" ");
