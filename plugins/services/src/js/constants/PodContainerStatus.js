const POD_CONTAINER_STATUS = {
  CREATED: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'Created'
  },
  STAGING: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'Staging'
  },
  STARTING: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'Starting'
  },
  STARTED: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'Started'
  },
  HEALTHY: {
    dotClassName: 'dot healthy',
    textClassName: 'task-status-running',
    displayName: 'Running'
  },
  UNHEALTHY: {
    dotClassName: 'dot unhealthy',
    textClassName: 'task-status-running',
    displayName: 'Unhealthy'
  },
  RUNNING: {
    dotClassName: 'dot running',
    textClassName: 'task-status-running',
    displayName: 'Running'
  },
  ERROR: {
    dotClassName: 'dot danger',
    textClassName: 'task-status-error',
    displayName: 'Error'
  },
  FAILED: {
    dotClassName: 'dot danger',
    textClassName: 'task-status-error',
    displayName: 'Failed'
  },
  KILLING: {
    dotClassName: 'dot danger',
    textClassName: '',
    displayName: 'Killing'
  },
  KILLED: {
    dotClassName: 'dot inactive danger',
    textClassName: '',
    displayName: 'Killed'
  },
  FINISHED: {
    dotClassName: 'dot inactive danger',
    textClassName: '',
    displayName: 'Killed'
  },
  LOST: {
    dotClassName: 'dot inactive danger',
    textClassName: '',
    displayName: 'Lost'
  },
  NA: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'N/A'
  }
};

module.exports = POD_CONTAINER_STATUS;
