/**
 * The possible values of PodState enum, according to:
 * https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/podStatus.raml#L98
 */
module.exports = {
  DEGRADED: "degraded",
  STABLE: "stable",
  TERMINAL: "terminal"
};
