import React from "react";
import { makeExecutableSchema } from "graphql-tools";
import { componentFromStream } from "data-service";
import { Observable, Subject } from "rxjs";

import { addTask, removeTask, getTasks } from "./support";
import { Error, Loading, Tasks } from "./ui";

// const typeDefs = `
//   type Task {
//     id: number!
//     name: String!
//   }
//
//   type Query {
//     getTasks(): [Tasks]!
//   }
//
//   type Mutation {
//     addTask(name: String!): [Tasks]!
//     removeTask(id: number!): [Tasks]!
//   }
// `;
//
// const resolvers = {
//   Query: {
//     getTasks: (parent, args, context) => {
//       return getTasks();
//     }
//   },
//   Mutation: {
//     addTask: (parent, args, context) => {
//       return addTask(args.name);
//     },
//     removeTask: (parent, args, context) => {
//       return removeTask(args.id);
//     }
//   }
// };
//
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers
// });

const addTaskHandler$ = new Subject();
const addTask$ = addTaskHandler$.switchMap(value => addTask(value));

const removeTaskHandler$ = new Subject();
const removeTask$ = removeTaskHandler$.switchMap(id => removeTask(id));

const anyRequest$ = getTasks().merge(addTask$).merge(removeTask$);

const processTasks = (tasks) => {
  return Object.entries(tasks.data).map((task) => ({id: task[0], value: task[1]}));
};

const LiveTasks = componentFromStream(prop$ => anyRequest$
  .combineLatest(prop$.delay(2000), (tasks, props) => ({ tasks, props }))
  .map(({tasks, props}) => ({ tasks: processTasks(tasks), props}))
  .map(({tasks, props}) => {
    return (<Tasks
      tasks={tasks}
      placeholder={props.placeholder}
      onTaskAdd={(val) => addTaskHandler$.next(val)}
      onTaskDelete={(id) => removeTaskHandler$.next(id)}
    />);
  })
  .startWith(<Loading />)
  .catch((err) => {
    return Observable.of(<Error error={err} />);
  })
);

export default LiveTasks;
