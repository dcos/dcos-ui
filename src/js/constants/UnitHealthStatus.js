const UnitHealthStatus = {
  HEALTHY: {
    title: "Healthy",
    value: 0,
    classNames: "text-success"
  },
  UNHEALTHY: {
    title: "Unhealthy",
    value: 1,
    classNames: "text-danger"
  },
  WARN: {
    title: "Warning",
    value: 2,
    classNames: "text-warning"
  },
  NA: {
    title: "N/A",
    value: 3,
    classNames: "text-mute"
  }
};

module.exports = UnitHealthStatus;
