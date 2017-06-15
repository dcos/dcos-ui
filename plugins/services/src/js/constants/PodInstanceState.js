/**
 * The possible values of PodInstanceState enum, according to:
 * https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/podStatus.raml#L113
 */
module.exports = {
  PENDING: "pending",
  STAGING: "staging",
  STABLE: "stable",
  DEGRADED: "degraded",
  TERMINAL: "terminal"
};
