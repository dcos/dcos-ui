import HealthTypes from "./HealthTypes";

const HealthStatus = {
  NA: {
    key: "NA",
    value: HealthTypes.NA,
    classNames: "text-mute"
  },
  HEALTHY: {
    key: "HEALTHY",
    value: HealthTypes.HEALTHY,
    classNames: "text-success"
  },
  UNHEALTHY: {
    key: "UNHEALTHY",
    value: HealthTypes.UNHEALTHY,
    classNames: "text-danger"
  },
  IDLE: {
    key: "IDLE",
    value: HealthTypes.IDLE,
    classNames: "text-warning"
  }
};

module.exports = HealthStatus;
