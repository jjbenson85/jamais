import { defineComponent } from "../defineComponent";
import { Signal } from "../signal";
import { myButton } from "./MyButton";
import type { Todo } from "./main";

export const todoItem = defineComponent({
  name: "todoItem",
  template: `
  <li
      j-for="todo in todos.get()"
      class="flex mr-4 my-1 py-2 px-1 border border-black hover:border-white rounded transition-colors"
  >
      <button
          type="checkbox"
          @click="toggleComplete(todo)"
          class="w-[100%] text-left"
      >
          <span
              j-text="todo.message"
              class="mx-2 w-[100%]"
              :class="{'line-through':todo.isComplete.get()}"
          ></span>
      </button>
      <!-- <button @click="removeTodo(key)">Remove</button> -->
      <my-button
          text="Remove"
          :onClick="()=>removeTodo(todo)"
          class="ml-auto mr-2"
      ></my-button>
  </li>
  `,
  components: {
    "my-button": myButton,
  },
  props: {
    todos: { required: true, type: Signal },
  },
  setup(props: {
    todos: Signal<Todo[]>;
  }) {
    const removeTodo = (todo: Todo) => {
      props.todos.set(props.todos.get().filter((t) => t !== todo));
    };
    const toggleComplete = (todo: Todo) => todo.isComplete.update((e) => !e);
    return {
      ...props,
      removeTodo,
      toggleComplete,
    };
  },
});
