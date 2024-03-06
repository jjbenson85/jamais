export const displayElement = (el: HTMLElement) => {
  if (!el) return () => {};
  const display = el.style.display;
  return (isVisible: boolean) =>
    (el.style.display = isVisible ? display : "none");
};
