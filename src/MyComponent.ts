import { defineComponent } from "./JComponent";
import { Signal, computed } from "./signal";

export const MyComponent = defineComponent({
  name: "MyComponent",
  template: `<div>
    <p :data-text="message">My Component 2</p>
    <p :data-text="allCaps">My Component 2</p>
</div>`,
  props: {
    message: Signal,
  },
  setup(props) {
    const allCaps = computed(
      // TODO: Improve Prop typing
      // @ts-ignore
      () => props.message.get().toUpperCase(),
      "allCaps",
    );
    return {
      allCaps,
      ...props,
    };
  },
});
