export function tasksReducer(state) {
  const seed = {
    completed_tasks: [],
    tasks: [],
    pending_tasks: [],
    unreachable_tasks: []
  };
  const stateToChunk = {
    TASK_STAGING: "pending_tasks",
    TASK_RUNNING: "tasks",
    TASK_STARTING: "tasks",
    TASK_CREATED: "tasks",
    TASK_STARTED: "tasks",
    TASK_KILLING: "tasks",
    TASK_FINISHED: "completed_tasks",
    TASK_UNREACHABLE: "unreachable_tasks",
    TASK_KILLED: "completed_tasks",
    TASK_FAILED: "completed_tasks",
    TASK_LOST: "completed_tasks",
    TASK_ERROR: "completed_tasks",
    TASK_GONE: "completed_tasks",
    TASK_DROPPED: "completed_tasks",
    TASK_UNKNOWN: "completed_tasks",
    TASK_GONE_BY_OPERATOR: ""
  };

  const partitionedTasks = state.tasks.reduce(function(acc, task) {
    const chunkKey = stateToChunk[task.state];
    console.log(chunkKey, task.state);
    acc[chunkKey].push(task);

    return acc;
  }, seed);

  return Object.assign({}, state, partitionedTasks);
}

export function executorsReducer(state) {
  return state;
}
export function frameworksReducer(state) {
  return state;
}
export function agentsReducer(state) {
  return state;
}
