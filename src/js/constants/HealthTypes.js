var HealthTypes = {
  UNHEALTHY: 0, // if tasksUnhealthy > 0
  HEALTHY: 1, // if tasksUnhealthy === 0 && tasksHealthy > 0
  IDLE: 2, // else tasksRunning === 0
  NA: 3 // healthChecks === 0
};

module.exports = HealthTypes;
