import React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Observable, Subject } from "rxjs";
import gql from "graphql-tag";

import { addTask, removeTask, getTasks } from "./support";
import { Error, Loading, Tasks } from "./ui";
import { schema } from "./graphql";

const getTasksQuery = gql`
  query {
    getTasks {
      id
      value
    }
  }
`;

const tasks$ = graphqlObservable(getTasksQuery, schema)
  .map(({data}) => data.getTasks)
  .do(console.log);

const addTasksMutation = gql`
  mutation {
    addTask(value: $value) {
      id
    }
  }
`;

const executeAddTask = (value) => {
  return graphqlObservable(addTasksMutation, schema, {value});
};

const removeTaskMutation = gql`
  mutation {
    removeTask(id: $id) {
      value
    }
  }
`;

const executeRemoveTask = (id) => {
  return graphqlObservable(removeTaskMutation, schema, {id});
};

// const addTask$ = new Subject();
// const removeTask$ = new Subject();

export default componentFromStream(prop$ => {
  prop$.subscribe(console.log);

  return tasks$.combineLatest(prop$, (tasks, {placeholder}) => {
    return {tasks, placeholder};
  }).map(({tasks, placeholder}) => (
    <Tasks
      tasks={tasks}
      placeholder={placeholder}
      onTaskAdd={executeAddTask}
      onTaskRemove={executeRemoveTask}
    />
  ))
    .startWith(<Loading />)
    .catch(err => {
      console.log(err);

      return Observable.of(<Error error={err.message} />);
    });
});

