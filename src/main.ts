import "./style.css";

import { cls, computed, ref, setup } from "./jamais";

const count = ref(0);
const double = computed(count, () => count.value * 2);
const formatDouble = computed(double, () => `Hello ${double.value}`);
const countClass = computed(count, () =>
  count.value > 0 ? "bg-green-500" : "bg-red-500",
);

const specialClass = computed(count, () =>
  cls([
    {
      "bg-green-500": count.value > 0,
      "bg-red-500": count.value < 0,
    },
    "james",
    ["james", "james-a"],
  ]),
);

// watch

const computedArray = computed(count, () =>
  Array.from({ length: Math.abs(count.value) }, () => {
    const value = Math.random() * 100;
    return cls({
      "bg-green-500": value > 50,
      "bg-red-500": value < 50,
    });
  }),
);

const columns = ref([
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "email", label: "Email" },
]);

const itemsRaw = [
  { name: "James", age: 33, email: "james@example.com", class: "bg-red-500" },
  { name: "John", age: 44, email: "john@example.com", class: "bg-green-500" },
  { name: "Jane", age: 55, email: "jane@example.com", class: "bg-blue-500" },
];

const items = ref(itemsRaw);

const mainItems = ref([
  { name: "A", arr: ["a", "b", "c"] },
  { name: "B", arr: ["d", "e", "f"] },
  { name: "C", arr: ["g", "h", "i"] },
]);

const arrrr = Array.from({ length: 1000 }, () => {
  return itemsRaw[Math.round(Math.random() * 2)];
});

const computedArray2 = computed(count, () =>
  arrrr.slice(0, Math.abs(count.value)),
);

const myObj = ref({ name: "James", age: 33, email: "james@example.com" });
const showIf = ref(true);
const showElseIf = ref(true);
const showElseIf2 = ref(true);
const toggleShowIf = () => {
  showIf.value = !showIf.value;
};
const toggleShowElseIf = () => {
  showElseIf.value = !showElseIf.value;
};
const toggleShowElseIf2 = () => {
  showElseIf2.value = !showElseIf2.value;
};

const state = ref("INIT");

setup(
  {
    mainItems,
    state,
    setStateToInit: () => {
      state.value = "INIT";
    },
    setStateToLoading: () => {
      state.value = "LOADING";
    },
    setStateToLoaded: () => {
      state.value = "LOADED";
    },
    setStateToError: () => {
      state.value = "ERROR";
    },

    staticString: "Hello World",
    staticNumber: 123,
    staticBoolean: true,
    staticObject: { name: "James", age: 33 },
    showIf,
    showElseIf,
    showElseIf2,
    toggleShowIf,
    toggleShowElseIf,
    toggleShowElseIf2,
    formatDouble,
    count,
    double,
    countClass,
    specialClass,
    items,
    columns,
    myObj,
    computedArray,
    computedArray2,
    increment: () => count.value++,
    decrement: () => count.value--,
    log: (e: Event) => {
      const target = e.target as HTMLInputElement;
      count.value = parseInt(target.value);
    },
  },
  {
    attach: "#app",
  },
);
