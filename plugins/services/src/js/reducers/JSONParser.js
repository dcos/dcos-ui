import ContainerConstants from '../constants/ContainerConstants';
import {JSONParser as constraints} from './serviceForm/Constraints';
import {JSONParser as fetch} from './serviceForm/Artifacts';
import {JSONParser as environmentVariables} from './serviceForm/EnvironmentVariables';
import {JSONParser as externalVolumes} from './serviceForm/ExternalVolumes';
import {JSONParser as healthChecks} from './serviceForm/HealthChecks';
import {JSONParser as labels} from './serviceForm/Labels';
import {JSONParser as localVolumes} from './serviceForm/LocalVolumes';
import {JSONParser as portDefinitions} from './serviceForm/PortDefinitions';
import {JSONParser as portMappings} from './serviceForm/PortMappings';
import {JSONParser as residency} from './serviceForm/Residency';
import {JSONParser as network} from './serviceForm/Network';
import {simpleParser} from '../../../../../src/js/utils/ParserUtil';
import {JSONParser as containers} from './serviceForm/Containers';

const {DOCKER} = ContainerConstants.type;

module.exports = [
  simpleParser(['id']),
  simpleParser(['instances']),
  simpleParser(['container', 'type']),
  simpleParser(['container', DOCKER.toLowerCase(), 'image']),
  simpleParser(['container', DOCKER.toLowerCase(), 'forcePullImage']),
  simpleParser(['container', DOCKER.toLowerCase(), 'privileged']),
  network,
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['gpus']),
  simpleParser(['cmd']),
  containers,
  portDefinitions,
  // Note: must come after portDefinitions, as it uses its information!
  portMappings,
  environmentVariables,
  labels,
  healthChecks,
  localVolumes,
  externalVolumes,
  constraints,
  residency,
  fetch
];
