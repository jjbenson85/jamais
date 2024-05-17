import { computed, setup, signal } from "../jamais";
import type { Signal } from "../jamais";
import { myButton } from "./MyButton";
import { todoItem } from "./TodoItem";

console.log(defineComponent2)
export type Todo = {
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

// const isNumber = (e: number) => typeof e === "number";
// const isString = (e: string) => typeof e === "string";
// const isBoolean = (e: boolean) => typeof e === "boolean";
// const isObject = (e: object) => typeof e === "object" && e !== null;

// const a = signal(1, isNumber);
// const b = signal(2, isString);

// a.set("5")
// console.log(a.get(), b.get())
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
      "my-button": myButton,
      "todo-item": todoItem,
    },
  },
);
