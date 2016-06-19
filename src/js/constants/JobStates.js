const JobStates = {
  INITIAL: {
    stateTypes: ['active'],
    displayName: 'Starting'
  },
  STARTING: {
    stateTypes: ['active'],
    displayName: 'Starting'
  },
  ACTIVE: {
    stateTypes: ['active'],
    displayName: 'Running'
  },
  FAILED: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Failed'
  },
  SUCCESS: {
    stateTypes: ['success'],
    displayName: 'Success'
  }
};

module.exports = JobStates;
