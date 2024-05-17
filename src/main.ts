import { myButton } from "./MyButton";
// import { MyComponent } from "./MyComponent";
// import { MyPTag } from "./MyPTag";
// import { MyTable } from "./MyTable";
import { setup, computed, signal } from "./jamais";
import { Signal } from "./signal";

type Todo = {
  message: string;
  isComplete: Signal<boolean>;
};
const todos = signal<Todo[]>([
  {
    message: "Learn Jamais",
    isComplete: signal(false),
  },
  {
    message: "Build a project",
    isComplete: signal(false),
  },
  {
    message: "Profit",
    isComplete: signal(false),
  },
]);

computed(() => console.log("todos", todos.get()));

const newTodo = signal("This is a new todo");

const addTodo = () => {
  todos.update((prev) => [
    ...prev,
    {
      message: newTodo.get(),
      isComplete: signal(false),
    },
  ]);
  newTodo.set("");
};

const removeTodo = (_todo: Todo) =>
  todos.update((e) => e.filter((todo) => todo !== _todo));

const toggleComplete = (todo: Todo) => todo.isComplete.update((e) => !e);

const clearCompleted = () =>
  todos.update((e) => e.filter((todo) => !todo.isComplete.get()));

const disableAddBtn = computed(
  () => newTodo.get().length === 0,
  "disableAddBtn",
);

setup(
  {
    todos,
    newTodo,
    addTodo,
    removeTodo,
    toggleComplete,
    clearCompleted,
    disableAddBtn,
    log: console.log,
  },
  {
    attach: "#app",
    debug: false,
    components: {
      // "my-table": MyTable,
      // "my-component": MyComponent,
      "my-button": myButton,
    },
  },
);
