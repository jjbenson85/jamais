
export function bindEvents({
  data,
  el: parentEl,
}: {
  data: Record<string, unknown>;
  el: HTMLElement;
}) {
  const eventName = [
    "click",
    "input",
    "change",
    "keyup",
    "keydown",
    "submit",
    "focus",
    "blur",
    "mouseover",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "mousedown",
    "mouseup",
    "touchstart",
    "touchend",
    "touchmove",
    "touchcancel",
    "scroll",
    "resize",
    "contextmenu",
    "dblclick",
    "wheel",
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
  ];

  for (const event of eventName) {
    const test = parentEl.querySelectorAll<HTMLElement>(`[\\@${event}]`);
    for (const el of test) {
      const attrs = el.attributes;
      for (const attr of attrs) {
        const callback = data[attr.value] as (e: Event) => void;
        if (typeof callback !== "function") {
          console.error(`No function found for ${attr.value} on ${el}`);
          return;
        }
        el.addEventListener(event, callback);
      }
    }
  }
}
