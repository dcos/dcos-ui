import {simpleParser} from '../../../../../src/js/utils/ParserUtil';

import {JSONParser as environmentVariables} from './serviceForm/EnvironmentVariables';
import {JSONParser as labels} from './serviceForm/Labels';

module.exports = [
  simpleParser(['id']),
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['instances']),
  simpleParser(['cmd']),
  environmentVariables,
  labels
];
