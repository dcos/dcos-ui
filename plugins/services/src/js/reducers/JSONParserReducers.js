import {simpleParser} from '../../../../../src/js/utils/ParserUtil';

import {JSONParser as environmentVariables} from './form/EnvironmentVariables';
import {JSONParser as labels} from './form/Labels';

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
