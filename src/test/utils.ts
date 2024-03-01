export const wait = async (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
