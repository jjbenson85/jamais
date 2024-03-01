import "./style.css";

import { ref, computed, setup, cls } from "./jamais";

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

computed(count, () => console.log("watch", count.value));
setup(() => ({
  formatDouble,
  count,
  double,
  countClass,
  specialClass,
  increment: () => count.value++,
  decrement: () => count.value--,
  log: (e: Event) => {
    const target = e.target as HTMLInputElement;
    count.value = parseInt(target.value);
  },
}));
