const TaskStates = {
  TASK_STAGING: {
    stateTypes: ['active', 'success'],
    displayName: 'Staging'
  },

  TASK_STARTING: {
    stateTypes: ['active', 'success'],
    displayName: 'Starting'
  },

  TASK_RUNNING: {
    stateTypes: ['active', 'success'],
    displayName: 'Running'
  },

  TASK_FAILED: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Failed'
  },

  TASK_KILLED: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Killed'
  },

  TASK_LOST: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Lost'
  },

  TASK_ERROR: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Error'
  },

  TASK_FINISHED: {
    stateTypes: ['completed', 'success'],
    displayName: 'Finished'
  }
};

module.exports = TaskStates;
