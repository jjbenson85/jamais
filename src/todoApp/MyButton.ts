import { defineComponent } from "../defineComponent";
import { Signal, signal } from "../signal";

export const myButton = defineComponent({
  name: "myButton",
  template: `
  <button
    j-text="text"
    class="hover:text-gray-800 hover:bg-white rounded border px-2 m-2 text-white bg-gray-800 transition-colors"
    :class="{
                'pointer-events-none text-gray-400 bg-gray-700':disabled.get(),
                'hover:text-gray-800 hover:bg-white':!disabled.get()
            }"
    @click="onClick"
  ></button>
  `,
  props: {
    text: { required: true, type: String },
    disabled: Signal<boolean>,
    onClick: Function,
  },
  setup(props) {
    return {
      disabled: signal(false),
      ...props,
    };
  },
});
