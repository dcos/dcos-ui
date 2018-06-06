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

const gqlAddTask = gql`
  mutation {
    addTask(value: $value) {
      id
      value
    }
  }
`;
const addTaskMutation = value => {
  return graphqlObservable(gqlAddTask, schema, { value });
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
addTaskHandler$.subscribe(addTaskMutation);

const removeTaskHandler$ = new Subject();
removeTaskHandler$.subscribe(removeTaskMutation);

const tasks$ = graphqlObservable(gqlGetTask, schema);

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
          onTaskRemove={id => removeTaskHandler$.next(id)}
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
