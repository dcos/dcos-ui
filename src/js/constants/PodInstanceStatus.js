const POD_INSTANCE_STATUS = {
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
  STAGED: {
    dotClassName: 'dot staged',
    textClassName: 'task-status-staging',
    displayName: 'Staging'
  },
  KILLED: {
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

module.exports = POD_INSTANCE_STATUS;
