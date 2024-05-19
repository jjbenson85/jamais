import { computed, createApp, signal, defineComponent, Signal } from "../src";

const STORAGE_KEY = "todos-petite-vue";
const todoStorage = {
  fetch() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    todos.forEach((todo, index) => {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
};

const filters = {
  all(todos) {
    return todos;
  },
  active(todos) {
    return todos.filter((todo) => {
      return !todo.completed;
    });
  },
  completed(todos) {
    return todos.filter((todo) => todo.completed);
  },
};

const newTodo = signal("New Todo");

const visibility = signal("all");
const setupRouting = () => {
  const onHashChange = () => {
    console.log("has change");
    var _visibility = window.location.hash.replace(/#\/?/, "");
    if (filters[_visibility]) {
      visibility.set(_visibility);
    } else {
      window.location.hash = "";
      visibility.set("all");
    }
  };
  window.addEventListener("hashchange", onHashChange);
  onHashChange();
};

createApp(
  {
    todos: todoStorage.fetch(),
    newTodo,
    editedTodo: null,
    visibility: "all",

    get filteredTodos() {
      return filters[visibility.get()](todos.get());
    },

    get remaining() {
      return filters.active(todos.get()).length;
    },

    get allDone() {
      return this.remaining === 0;
    },

    set allDone(value) {
      todos.get().forEach((todo) => {
        todo.completed = value;
      });
    },

    save() {
      todoStorage.save(todos.get());
    },
    setupRouting,

    addTodo() {
      var value = newTodo.get() && newTodo.get().trim();
      if (!value) {
        return;
      }
      todos.update((e) =>
        e.push({
          id: todoStorage.uid++,
          title: value,
          completed: false,
        }),
      );
      newTodo.set("");
    },

    removeTodo(todo) {
      todos.get().splice(todos.get().indexOf(todo), 1);
    },

    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted() {
      todos.set(filters.active(todos.get()));
    },

    pluralize(n) {
      return n === 1 ? "item" : "items";
    },
  },
  {
    attach: "#app",
    onMounted() {
      setupRouting();
    },
  },
);
