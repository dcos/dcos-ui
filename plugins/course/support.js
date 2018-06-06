import { Subject, Observable } from "rxjs";

let store = { data: {}, metadata: { index: 0 }};
const tasksApi$ = new Subject();
const tasks$ = tasksApi$
  .startWith({op: "add", value: "Awesome App"})
  .do(({op, value}) => {
    const data = store.data;
    const metadata = store.metadata;
    const index = metadata.index += 1;

    if (op === "add") {
      data[index] = value;

      metadata.index = index;
      metadata.lastAdded = {index, value};
    } else if (op === "rem") {
      delete data[value];

      metadata.lastRemoved = {index, value};
    }

    store = {data, metadata};
  }).map((_) => store).publishReplay(1).refCount();

const addTask = (value) => {
  tasksApi$.next({op: "add", value});

  if (Object.values(store.data).length >= 6) {
    return Observable.throw("Network Error");
  }

  return tasks$;
};

const removeTask = (id) => {
  tasksApi$.next({op: "rem", value: id});

  return tasks$;
};

const getTasks = () => {
  return tasks$;
};

export {addTask, removeTask, getTasks };
