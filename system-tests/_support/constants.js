const Timeouts = {
  /**
   * How long to wait until an service is fully deployed.
   *
   * This should include the time required for the service to download it's
   * resources, allocate volumes and start the containers.
   */
  SERVICE_DEPLOYMENT_TIMEOUT: 60000,

  /**
   * How long to wait until an job is fully deployed.
   *
   * This should include the time required for the job to download it's
   * resources, allocate volumes and start the containers.
   */
  JOB_DEPLOYMENT_TIMEOUT: 60000,
  ANIMATION_TIMEOUT: 1000
};

module.exports = {
  Timeouts
};
