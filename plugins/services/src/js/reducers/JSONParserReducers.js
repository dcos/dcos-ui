import {simpleParser} from '../../../../../src/js/utils/ParserUtil';
import {JSONParser as environmentVariables} from './serviceForm/EnvironmentVariables';
import {JSONParser as labels} from './serviceForm/Labels';
import {JSONParser as healthChecks} from './serviceForm/HealthChecks';
import VolumeConstants from '../constants/VolumeConstants';

const {MESOS, DOCKER} = VolumeConstants.type;

module.exports = [
  simpleParser(['id']),
  simpleParser(['instances']),
  simpleParser(['container', 'type']),
  simpleParser(['container', DOCKER.toLowerCase(), 'image']),
  simpleParser(['container', MESOS.toLowerCase(), 'image']),
  simpleParser(['container', DOCKER.toLowerCase(), 'forcePullImage']),
  simpleParser(['container', MESOS.toLowerCase(), 'forcePullImage']),
  simpleParser(['container', DOCKER.toLowerCase(), 'privileged']),
  simpleParser(['container', MESOS.toLowerCase(), 'privileged']),
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['cmd']),
  environmentVariables,
  labels,
  healthChecks
];
