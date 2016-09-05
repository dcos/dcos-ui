const POD_CONTAINER_STATUS = {
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
  NA: {
    dotClassName: 'dot inactive unknown',
    textClassName: '',
    displayName: 'N/A'
  }
};

module.exports = POD_CONTAINER_STATUS;
