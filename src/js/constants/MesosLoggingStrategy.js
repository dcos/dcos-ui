const MesosLoggingStrategy = {
  SYSTEM_LOGS: "journald",
  MESOS_LOGS: "logrotate",
  SYSTEM_AND_MESOS_LOGS: "journald+logrotate"
};

module.exports = MesosLoggingStrategy;
