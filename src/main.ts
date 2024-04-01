import { MyComponent } from "./MyComponent";
import { MyPTag } from "./MyPTag";
import { MyTable } from "./MyTable";
// import { TestComponent } from "./defineComponent";
import { setup, computed, signal } from "./jamais";
import { computedSync } from "./signal";

const count = signal(100);

// const increment = (amount = "1") =>
//   count.set(count.get() + parseInt(amount), "increment");
// const decrement = (amount = "1") =>
//   count.set(count.get() - parseInt(amount), "decrement");

// const specialClass = computed(() => ({
//   "bg-green-500": count.get() > 0,
//   "bg-red-500": count.get() < 0,
// }));

// const showIf = signal(true);
// const toggleShowIf = () => {
//   showIf.set(!showIf.get());
// };

// const showIfElse = signal(true);
// const toggleShowIfElse = () => {
//   showIfElse.set(!showIfElse.get());
// };

// const showIfElse2 = (value: number) => {
//   return value > 0;
// };

// const aFunction = (value: number) => {
//   return `this is a message: ${value}`;
// };

// const caseValue = computed(() => {
//   if (count.get() > 0) {
//     return "positive";
//   }
//   if (count.get() < 0) {
//     return "negative";
//   }
//   return "zero";
// });

const columns = ["name", "age", "shoeSize", "height", "weight"];
const allItems = Array.from({ length: 1000 }, (_, i) => ({
  name: `name${i}`,
  age: i,
  shoeSize: i,
  height: i,
  weight: i,
  class: [
    "bg-red-500/20",
    "bg-green-500/20",
    "bg-blue-500/20",
    "bg-orange-500/20",
  ][Math.round(Math.random() * 3)],
}));

const items = computedSync(() => {
  return allItems.slice(0, Math.abs(count.get()));
}, "items computedSync");

// const items = signal(allItems.slice(0, 20));

// function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number) {
//   if (toIndex < 0) return arr;
//   if (toIndex >= arr.length) return arr;

//   const copy = arr.slice();
//   const element = copy[fromIndex];
//   copy.splice(fromIndex, 1);
//   copy.splice(toIndex, 0, element);
//   return copy;
// }

// const raise = (i: string) => {
//   const index = parseInt(i);
//   const itms = items.get();
//   items.set(arrayMove(itms, index, index - 1));
// };

// const lower = (i: string) => {
//   const index = parseInt(i);
//   const itms = items.get();
//   const newItems = arrayMove(itms, index, index + 1);
//   items.set(newItems);
// };

// const specialColor = signal("green");
// const setColor = (str: string) => specialColor.set(str);

// const people = signal([
//   { name: "John", age: 20 },
//   { name: "Jane", age: 21 },
//   { name: "Joe", age: 22 },
// ]);

const specialMessage = signal("Hello World");
const deep = signal({ message: "TEST" });
console.time();
setup(
  {
    specialMessage,
    columns,
    items,
    deep,
    // raise,
    // lower,
    // // caseValue,
    // // aFunction,
    // showIf,
    // toggleShowIf,
    // showIfElse,
    // toggleShowIfElse,
    // showIfElse2,
    // // // message,
    count,
    // increment,
    // decrement,
    // specialColor,
    // setColor,
    // // specialClass,
    // // console,
    // // getResult,
    // people,
  },
  {
    attach: "#app",
    debug: false,
    components: {
      // 'my-component': () => new MyComponent() as any,
      // 'test-component': TestComponent,
      "my-table": MyTable,
      "my-component": MyComponent,
      // "my-p-tag": MyPTag,
    },
  },
);
console.timeEnd();
