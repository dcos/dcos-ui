const JobStates = {
  active: {
    stateTypes: ['active'],
    displayName: 'Running'
  },
  failed: {
    stateTypes: ['completed', 'failure'],
    displayName: 'Failed'
  },
  success: {
    stateTypes: ['success'],
    displayName: 'Success'
  }
};

module.exports = JobStates;
