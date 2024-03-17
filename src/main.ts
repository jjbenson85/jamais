import { setup, computed, signal } from "./jamais";
import { computedSync } from "./signal";

const count = signal(1);

const increment = (amount = 1) => count.set(count.get() + amount, "increment");
const decrement = (amount = 1) => count.set(count.get() - amount, "decrement");

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
}));
const items = computedSync(() => {
  return allItems.slice(0, Math.abs(count.get()));
}, "items computedSync");
console.time();
setup(
  {
    columns,
    items,
    // caseValue,
    // aFunction,
    // showIf,
    // toggleShowIf,
    // showIfElse,
    // toggleShowIfElse,
    // showIfElse2,
    // // message,
    count,
    increment,
    decrement,
    // specialClass,
    // console,
    // getResult,
  },
  {
    attach: "#app",
    debug: false,
  },
);
console.timeEnd();
