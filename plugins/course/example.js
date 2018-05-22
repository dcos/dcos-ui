import React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Observable, Subject } from "rxjs";
import gql from "graphql-tag";


import { schema } from "./graphql";
import { Error, Loading, Tasks } from "./ui";

const gqlGetTask = gql`
  query {
    getTasks {
      id
      value
    }
  }
`;
const tasks$ = graphqlObservable(gqlGetTask, schema);

const gqlAddTask = gql`
  mutation {
    addTask(name: $name) {
      id
      value
    }
  }
`;
const addTaskMutation = name => {
  return graphqlObservable(gqlAddTask, schema, { name });
};

const gqlRemoveTask = gql`
  mutation {
    removeTask(id: $id) {
      id
      value
    }
  }
`;
const removeTaskMutation = id => {
  return graphqlObservable(gqlRemoveTask, schema, { id });
};

const addTaskHandler$ = new Subject();
const addTask$ = addTaskHandler$.switchMap(name => addTaskMutation(name));
addTask$.subscribe(console.log, console.log, console.log);

const removeTaskHandler$ = new Subject();
const removeTask$ = removeTaskHandler$.switchMap(id => removeTaskMutation(id));
removeTask$.subscribe(console.log, console.log, console.log);

const LiveTasks = componentFromStream(prop$ =>
  tasks$
    .combineLatest(prop$.delay(2000), ({ data }, props) => ({
      tasks: data.getTasks,
      props
    }))
    .map(({ tasks, props }) => {
      return (
        <Tasks
          tasks={tasks}
          placeholder={props.placeholder}
          onTaskAdd={val => addTaskHandler$.next(val)}
          onTaskDelete={id => removeTaskHandler$.next(id)}
        />
      );
    })
    .startWith(<Loading />)
    .catch(err => {
      console.log(err);

      return Observable.of(<Error error={err.message} />);
    })
);

export default LiveTasks;
