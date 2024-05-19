import { ComponentConstructor } from "@";
import { camelToKebab } from "@/helpers/textTransform";

type Components = Record<string, ComponentConstructor>;

export const normaliseComponentNames = (components: Components = {}) => {
  const _comps: Components = {};
  for (const key in components) {
    const comp = components[key];
    _comps[key] = comp;
    _comps[camelToKebab(key)] = comp;
  }
  return _comps;
};
