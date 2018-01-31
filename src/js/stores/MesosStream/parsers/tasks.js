import {
  GET_TASKS,
  TASK_ADDED,
  TASK_UPDATED
} from "../../../constants/MesosStreamMessageTypes";
import { scalar } from "./ProtobufUtil";

function convertResource(resource) {
  switch (resource.type) {
    case "SCALAR":
      return scalar(resource.scalar);
    case "RANGES":
      return resource.ranges.range;
    case "SET":
      return resource.set;
    default:
      return resource;
  }
}

function processTask(task) {
  task.id = scalar(task.task_id);
  task.slave_id = scalar(task.agent_id);
  task.framework_id = scalar(task.framework_id);
  if (task.executor_id) {
    task.executor_id = scalar(task.executor_id);
  }
  task.labels = task.labels && task.labels.labels;
  task.resources = task.resources.reduce(function(acc, resource) {
    acc[resource.name] = convertResource(resource);

    return acc;
  }, {});

  if (task.labels != null) {
    if (task.labels.some(({ key }) => key === "DCOS_COMMONS_API_VERSION")) {
      task.sdkTask = true;
    }
    if (task.labels.some(({ key }) => key === "DCOS_PACKAGE_FRAMEWORK_NAME")) {
      task.isSchedulerTask = true;
    }
  }

  return task;
}

function getMarathonId(frameworks = []) {
  const { id: marathonId } = frameworks.find(
    ({ name }) => name === "marathon"
  ) || {};

  return marathonId;
}

export function getTasksAction(state, message) {
  if (message.type !== GET_TASKS) {
    return state;
  }

  const marathonId = getMarathonId(state.frameworks);

  const tasks = Object.keys(message.get_tasks).reduce((acc, key) => {
    return acc.concat(
      message.get_tasks[key].map(task => {
        const processedTask = processTask(task);
        processedTask.isStartedByMarathon =
          marathonId === processedTask.framework_id;

        return processedTask;
      })
    );
  }, []);

  return Object.assign({}, state, { tasks });
}

export function taskAddedAction(state, message) {
  if (message.type !== TASK_ADDED) {
    return state;
  }

  const marathonId = getMarathonId(state.frameworks);
  const task = processTask(message.task_added.task);
  task.isStartedByMarathon = marathonId === task.framework_id;

  return Object.assign({}, state, { tasks: [...state.tasks, task] });
}

export function taskUpdatedAction(state, message) {
  if (message.type !== TASK_UPDATED) {
    return state;
  }

  const taskUpdate = message.task_updated;
  const task_id = scalar(taskUpdate.status.task_id);
  const tasks = state.tasks.map(function(task) {
    if (task.id === task_id) {
      const statuses = task.statuses || [];

      return Object.assign({}, task, {
        state: taskUpdate.state,
        statuses: [...statuses, taskUpdate.status]
      });
    }

    return task;
  });

  return Object.assign({}, state, { tasks });
}
