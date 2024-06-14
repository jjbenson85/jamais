import { ProcessQueue } from "./processQueue";

type Msg =
  | { tag: "watch"; object: any; listener: Listener }
  | { tag: "removeSubscriptions"; listener: Listener }
  | { tag: "updated"; object: any }
  | { tag: "replace"; object: any; newObject: any };

type Listener = () => void;

const objectToListeners: Map<object, Set<Listener>> = new Map();
const listenerToObjects: Map<Listener, Set<object>> = new Map();

const queue = new ProcessQueue();
const reducer = (msg: Msg) => {
  // console.log({ objectToListeners, listenerToObjects });
  switch (msg.tag) {
    case "updated": {
      console.log("updated", msg.object);
      const listeners = objectToListeners.get(msg.object);
      listeners?.forEach((listener) => {
        reducer({
          tag: "removeSubscriptions",
          listener,
        });
        // listener();
        queue.add(listener);
      });
      return;
    }
    case "replace": {
      console.log("replace", msg.object, msg.newObject);
      const listeners = objectToListeners.get(msg.object) ?? new Set();
      listeners?.forEach((listener) => {
        listenerToObjects.get(listener)?.delete(msg.object);
        listenerToObjects.get(listener)?.add(msg.newObject);
      });
      objectToListeners.delete(msg.object);
      objectToListeners.set(msg.newObject, listeners);
      reducer({ tag: "updated", object: msg.newObject });
      return;
    }
    case "watch": {
      const currListeners = objectToListeners.get(msg.object) ?? new Set();
      currListeners.add(msg.listener);
      objectToListeners.set(msg.object, currListeners);

      const currentObjects = listenerToObjects.get(msg.listener) ?? new Set();
      currentObjects?.add(msg.object);
      listenerToObjects.set(msg.listener, currentObjects);
      return;
    }
    case "removeSubscriptions": {
      // Not Working - watchObject function still references original object?
      const objects = listenerToObjects.get(msg.listener);
      objects?.forEach((object) =>
        objectToListeners.get(object)?.delete(msg.listener)
      );
      listenerToObjects.delete(msg.listener);
      return;
    }
  }

  msg satisfies never;
};

export const updateObject = <T>(
  object: T,
  updateFn: (oldValue: T) => T | void
) => {
  const newObject = updateFn(object);
  if (newObject && object !== newObject) {
    reducer({ tag: "replace", newObject, object });
  } else {
    reducer({ tag: "updated", object });
  }
};

const firstName = {
  value: "Jennifer",
};
const middleName = {
  value: "Bronwyn",
};
const lastName = {
  value: "Vidler",
};
const age = {
  value: 0,
};

type WatchObject = <R extends object>(obj: R) => R;
const derived = <T>(cb: (watch: WatchObject) => T) => {
  const output = {
    value: undefined as T,
    oldValue: undefined as T | undefined,
  };
  let listener: () => void;

  const watchObject = <R extends object>(object: R) => {
    console.log({ object });
    reducer({
      tag: "watch",
      object,
      listener,
    });
    return object;
  };

  listener = () => {
    const value = cb(watchObject);
    console.log({ value });
    if (value !== output.oldValue) {
      output.oldValue = output.value;
      updateObject(output, (e) => {
        e.value = value;
      });
    }
  };
  output.value = cb(watchObject);
  return output;
};

// const derivedTest = derived((watch) => {
//   const value = `${watch(firstName).value} ${watch(middleName).value} ${
//     watch(lastName).value
//   } is ${watch(age).value} years old.`;
//   return value;
// });

// updateObject(firstName, (e) => {
//   e.value = "James";
// });
// updateObject(middleName, (e) => {
//   e.value = "John";
// });
// updateObject(lastName, (e) => {
//   e.value = "Benson";
// });

const myArr = [0, 1, 2, 3, 4, 5];
const double = derived((w) => {
  const val = w(myArr).map((e) => e * 2);
  console.log({ val });
  return val;
});

derived((w) => {
  console.log("A WATCHING...", w(double).value);
});

updateObject(myArr, (arr) => [9, 8, 7, 6, 5, 4, 3, 2, 1]);
// derived((w) => {
//   console.log("B WATCHING...", w(derivedTest));
// });

// setInterval(
//   () =>
//     updateObject(age, (age) => {
//       age.value++;
//     }),
//   1000
// );
