const TaskStates = {
  TASK_STAGING: {
    stateTypes: ['active', 'success'],
    displayName: 'Staging'
  },

  TASK_STARTING: {
    stateTypes: ['active', 'success'],
    displayName: 'Starting'
  },

  TASK_STARTED: {
    stateTypes: ['active', 'success'],
    displayName: 'Running'
  },

  TASK_RUNNING: {
    stateTypes: ['active', 'success'],
    displayName: 'Running'
  },

  TASK_KILLING: {
    stateTypes: ['active', 'failure'],
    displayName: 'Killing'
  },

  TASK_FINISHED: {
    stateTypes: ['completed', 'success'],
    displayName: 'Finished'
  },

  TASK_KILLED: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Killed'
  },

  TASK_FAILED: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Failed'
  },

  TASK_LOST: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Lost'
  },

  TASK_ERROR: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Error'
  }
};

module.exports = TaskStates;
