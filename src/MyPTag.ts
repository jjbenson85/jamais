import { defineComponent } from "./JComponent";
import { Signal } from "./signal";

export const MyPTag = defineComponent({
  name: "MyPTag",
  extends: ["p", HTMLParagraphElement],
  template: '<p :data-text="message">My P Tag</p>',
  style: "p { color: red; }",
  props: { message: Signal },
});
