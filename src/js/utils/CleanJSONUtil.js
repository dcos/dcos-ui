import JobConfig from '../constants/JobConfig';
import ServiceConfig from '../constants/ServiceConfig';

export function cleanJSONspec(jsonSpec) {
  return cleanJSON(jsonSpec, JobConfig);
}

export function cleanJSONdefinition(jsonDefinition) {
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
