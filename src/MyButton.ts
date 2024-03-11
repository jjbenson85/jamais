import { defineComponent } from "./defineComponent";

export const MyButton = defineComponent({
  template: `
    <button 
        @click="click" 
        data-text="{{text}}" 
        data-class="{{$class}}" 
        class="px-4 py-2 m-2 rounded transition-colors"
    >
        <slot></slot>
    </button>`,
  props: ["click", "text"],
  emits: ["click"],
});