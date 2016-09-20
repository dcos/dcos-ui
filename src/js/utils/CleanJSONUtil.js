
import JobConfig from '../constants/JobConfig';
import ServiceConfig from '../../../plugins/services/src/js/constants/ServiceConfig';

export function cleanJobJSON(jsonSpec) {
  return cleanJSON(jsonSpec, JobConfig);
}

export function cleanServiceJSON(jsonDefinition) {
  return cleanJSON(jsonDefinition, ServiceConfig);
}

function cleanJSON(json, config) {
  return Object.keys(json).filter(function (key) {
    return !config.BLACKLIST.includes(key);
  }).reduce(function (memo, key) {
    memo[key] = json[key];

    return memo;
  }, {});
}
